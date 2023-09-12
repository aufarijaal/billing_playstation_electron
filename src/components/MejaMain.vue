<script setup lang="ts">
import dayjs from "dayjs";
import backendFetch from "../utils/backend-fetch";
import mejaMainCrudChannelNames from "../../electron/channel_names/meja-main-crud-channel-names";
import { DataMejaMainWithRelations } from "../@types/types";
import { formatRupiah } from "convert-rupiah";
import { useToast } from "vue-toast-notification";
import { countdown, stopwatch } from "../utils/timer-and-stopwatch";
import laporanBillingCrudChannelNames from "../../electron/channel_names/laporan-billing-crud-channel-names";
import useMainStore from "../store";

const props = defineProps<{
  dataMeja: { nomor_meja: number; versi_ps: number };
  dataKonsumsi: { nama_produk: string; harga: number }[] | undefined;
}>();

const jamUntukDipilih = Array.from({ length: 24 }, (_, index) => 0 + index);
const menitUntukDipilih = [0, 15, 30, 45];

const store = useMainStore();
const $toast = useToast();
const aktif = ref(false);
const tabKonsumsiOrInfoMain = ref<"info-main" | "konsumsi">("info-main");
const tabDiwaktuOrLos = ref<"diwaktu" | "los">("diwaktu");
const timerDisplay = ref("00:00:00");
const showPopoverPilihJenisMain = ref(false);
const jamTerpilih = ref(1);
const menitTerpilih = ref(0);
const state = ref<DataMejaMainWithRelations>();
const percentageUntukProgressBar = ref(0);
const timerIntervalData = ref();
const showDialogKelolaKonsumsi = ref(false);
const selectedKonsumsi = ref<{ nama_produk: string; harga: number }>();
const jumlahKonsumsiUntukDitambahkan = ref(1);
const disableKelolaKonsumsi = ref(false);
const terakhirKalikelipatanSatuMenitTerlalui = ref(0);

// Computed data
const jumlahKonsumsiTerpilihXHargaInRupiah = computed(() => {
  if (!selectedKonsumsi.value) return "Rp. 0";
  return formatRupiah(
    jumlahKonsumsiUntukDitambahkan.value * selectedKonsumsi.value?.harga,
  );
});

const konsumsiListParsed = computed(() => {
  return JSON.parse(state.value?.laporan_konsumsi ?? "[]");
});

const totalBayarSemuaInRupiah = computed(() => {
  return formatRupiah(state.value?.laporan_total_bayar_semua ?? 0);
});

const totalBayarKonsumsiInRupiah = computed(() => {
  return formatRupiah(state.value?.laporan_total_bayar_konsumsi ?? 0);
});

const totalBayarMainInRupiah = computed(() => {
  return formatRupiah(state.value?.laporan_total_bayar_main ?? 0);
});

const previewBayarMainDiwaktu = computed(() => {
  if (!state.value?.tarif_per_menit) return -1;
  return (
    (jamTerpilih.value * 60 + menitTerpilih.value) *
    state.value?.tarif_per_menit
  );
});

const previewBayarMainDiwaktuInRupiah = computed(() => {
  return formatRupiah(
    (jamTerpilih.value * 60 + menitTerpilih.value) *
      state.value?.tarif_per_menit!,
  );
});

const btnMainDiwaktuDisabled = computed(() => {
  return jamTerpilih.value === 0 && menitTerpilih.value === 0;
});

const warnaProgressBar = computed(() => {
  if (percentageUntukProgressBar.value === 0) {
    return undefined;
  } else if (
    percentageUntukProgressBar.value >= 1 &&
    percentageUntukProgressBar.value <= 25
  ) {
    return "error";
  } else if (
    percentageUntukProgressBar.value >= 26 &&
    percentageUntukProgressBar.value <= 50
  ) {
    return "warning";
  } else if (
    percentageUntukProgressBar.value >= 51 &&
    percentageUntukProgressBar.value <= 75
  ) {
    return "green";
  } else {
    return "info";
  }
});

const paketMainTerpilihFormatted = computed(() => {
  const teksJam = jamTerpilih.value > 0 ? `${jamTerpilih.value} Jam` : "";
  const teksMenit =
    menitTerpilih.value > 0 ? `${menitTerpilih.value} Menit` : "";

  if (teksJam && teksMenit) {
    return `${teksJam} ${teksMenit}`;
  } else {
    return teksJam || teksMenit;
  }
});

const totalMenitDariPaketMainTerpilih = computed(() => {
  const totalMenit = jamTerpilih.value * 60 + menitTerpilih.value;

  return totalMenit;
});

async function addKonsumsi() {
  try {
    if (state.value?.laporan_konsumsi && state.value?.hold_id) {
      const konsumsiListForUpdate = konsumsiListParsed.value;
      const namaProdukSamaIndex = konsumsiListForUpdate.findIndex(
        (konsumsi: any) =>
          konsumsi.nama_produk === selectedKonsumsi.value?.nama_produk,
      );
      const newBayar =
        jumlahKonsumsiUntukDitambahkan.value * selectedKonsumsi.value?.harga!;

      if (namaProdukSamaIndex !== -1) {
        konsumsiListForUpdate[namaProdukSamaIndex].jumlah +=
          jumlahKonsumsiUntukDitambahkan.value;
        konsumsiListForUpdate[namaProdukSamaIndex].bayar += newBayar;
      } else {
        konsumsiListForUpdate.push({
          nama_produk: selectedKonsumsi.value?.nama_produk!,
          jumlah: jumlahKonsumsiUntukDitambahkan.value,
          bayar: newBayar,
        });
      }

      const result = await backendFetch(
        laporanBillingCrudChannelNames.UPDATE_KONSUMSI,
        state.value?.hold_id,
        JSON.stringify(konsumsiListForUpdate),
        (state.value?.laporan_total_bayar_konsumsi ?? 0) + newBayar,
        (state.value?.laporan_total_bayar_semua ?? 0) + newBayar,
      );

      state.value.laporan_konsumsi = result.konsumsi;
      state.value.laporan_total_bayar_konsumsi = result.total_bayar_konsumsi;
      state.value.laporan_total_bayar_semua = result.total_bayar_semua;

      selectedKonsumsi.value = undefined;
      jumlahKonsumsiUntukDitambahkan.value = 1;
    } else {
      $toast.error("Gagal menambahkan konsumsi");
    }
  } catch (error: any) {
    $toast.error(error.message);
  }
}

async function deleteKonsumsi(namaProduk: string, bayar: number) {
  try {
    if (
      state.value?.laporan_konsumsi &&
      state.value?.hold_id &&
      konsumsiListParsed.value.length > 0
    ) {
      const konsumsiListForUpdate = konsumsiListParsed.value;
      const updated = konsumsiListForUpdate.filter(
        (konsumsi: any) => konsumsi.nama_produk !== namaProduk,
      );

      const result = await backendFetch(
        laporanBillingCrudChannelNames.UPDATE_KONSUMSI,
        state.value?.hold_id,
        JSON.stringify(updated),
        state.value?.laporan_total_bayar_konsumsi! - bayar,
        state.value?.laporan_total_bayar_semua! - bayar,
      );

      state.value.laporan_konsumsi = result.konsumsi;
      state.value.laporan_total_bayar_konsumsi = result.total_bayar_konsumsi;
      state.value.laporan_total_bayar_semua = result.total_bayar_semua;

      selectedKonsumsi.value = undefined;
      jumlahKonsumsiUntukDitambahkan.value = 1;
    } else {
      $toast.error("Gagal menghapus konsumsi");
    }
  } catch (error: any) {
    $toast.error(error.message);
  }
}

function mulaiKelolaKonsumsi() {
  tabKonsumsiOrInfoMain.value = "konsumsi";
  showDialogKelolaKonsumsi.value = true;
}

async function getState(_sentFromBtnMulaiMain: boolean) {
  try {
    const stateResult = await backendFetch(
      mejaMainCrudChannelNames.GET_ONE_WITH_RELATION,
      props.dataMeja.nomor_meja,
    );
    state.value = stateResult;

    // Jika ada status permainan
    if (state.value && state.value.hold_id) {
      // Jika ada status permainan + jenis main nya "diwaktu"
      if (state.value.laporan_jenis_main === "diwaktu") {
        // Jika ada status permainan + jenis main nya "diwaktu" + lama main nya SUDAH ada
        if (state.value.laporan_lama_main) {
          aktif.value = false;
          timerDisplay.value = "Sudah selesai";
        }

        // Jika ada status permainan + jenis main nya "diwaktu" + lama main nya BELUM ada
        else {
          let timer = countdown(
            state.value?.laporan_waktu_mulai!,
            state.value?.laporan_waktu_selesai!,
          );
          if (timer.percentage >= 100) {
            timerDisplay.value = "Sudah selesai";
            return;
          }
          aktif.value = true;
          timerIntervalData.value = setInterval(() => {
            const timer = countdown(
              state.value?.laporan_waktu_mulai!,
              state.value?.laporan_waktu_selesai!,
            );
            if (timer.percentage >= 100) {
              timerDisplay.value = "Sudah selesai";
              stopTimer(false);
              return;
            }
            timerDisplay.value = timer.timerDisplay;
            percentageUntukProgressBar.value = 100 - timer.percentage;
          }, 1000);
        }
      }
      // Jika ada status permainan + jenis main nya "los"
      else if (state.value.laporan_jenis_main === "los") {
        // Jika ada status permainan + jenis main nya "los" + lama main nya SUDAH ada
        if (state.value.laporan_lama_main) {
          aktif.value = false;
          timerDisplay.value = "Sudah selesai";
        }

        // Jika ada status permainan + jenis main nya "los" + lama main nya BELUM ada
        else {
          aktif.value = true;
          timerIntervalData.value = setInterval(() => {
            const timer = stopwatch(
              state.value?.laporan_waktu_mulai!,
              terakhirKalikelipatanSatuMenitTerlalui.value,
              async (elapsedMinutes) => {
                disableKelolaKonsumsi.value = true;
                setTimeout(() => {
                  disableKelolaKonsumsi.value = false;
                }, 3000);
                terakhirKalikelipatanSatuMenitTerlalui.value = elapsedMinutes;
                const updated = await backendFetch(
                  laporanBillingCrudChannelNames.UPDATE_TOTAL_BAYAR_MAIN_DAN_SEMUA,
                  state.value?.hold_id,
                  state.value?.laporan_total_bayar_main! +
                    state.value?.tarif_per_menit!,
                  state.value?.laporan_total_bayar_semua! +
                    state.value?.tarif_per_menit!,
                );
                state.value!.laporan_total_bayar_semua =
                  updated.total_bayar_semua;
                state.value!.laporan_total_bayar_main =
                  updated.total_bayar_main;
              },
            );
            timerDisplay.value = timer.displayText;
          }, 1000);
        }
      }
    }
    // Jika tidak ada status permainan
    else {
      timerDisplay.value = "Free";
      aktif.value = false;
    }
  } catch (error: any) {
    $toast.error(error.message);
  }
}

async function mulaiMain(jenisMain: "los" | "diwaktu") {
  try {
    const dataUtkDimasukkan = {
      op: store.session.username,
      nomor_meja: props.dataMeja.nomor_meja,
      versi_ps: props.dataMeja.versi_ps,
      jenis_main: jenisMain,
      paket_main:
        jenisMain === "diwaktu" ? paketMainTerpilihFormatted.value : null,
      waktu_mulai: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      waktu_selesai:
        jenisMain === "diwaktu"
          ? dayjs()
              .add(totalMenitDariPaketMainTerpilih.value, "minute")
              .format("YYYY-MM-DD HH:mm:ss")
          : null,
      lama_main: null,
      konsumsi: "[]",
      total_bayar_main:
        jenisMain === "diwaktu" ? previewBayarMainDiwaktu.value : 0,
      total_bayar_konsumsi: 0,
      total_bayar_semua:
        jenisMain === "diwaktu" ? previewBayarMainDiwaktu.value : 0,
    };

    await backendFetch(
      mejaMainCrudChannelNames.ASSIGN_STATE,
      props.dataMeja.nomor_meja,
      dataUtkDimasukkan,
    );
    await getState(true);

    showPopoverPilihJenisMain.value = false;

    // Jika jenis main === "diwaktu" maka itu menunjukkan operator telah memilih jam dan menit pada pemilihan paket main
    // Maka dari itu, reset kembali pilihan nya.
    if (jenisMain === "diwaktu") {
      jamTerpilih.value = 1;
      menitTerpilih.value = 0;
    }
  } catch (error: any) {
    $toast.error(error.message);
  }
}

async function stopTimer(callGetState: boolean = true) {
  try {
    if (state.value && state.value?.hold_id && aktif.value) {
      clearInterval(timerIntervalData.value);
      timerIntervalData.value = undefined;
      const waktuSelesai = dayjs().format("YYYY-MM-DD HH:mm:ss");

      const duration = dayjs(waktuSelesai).diff(
        state.value?.laporan_waktu_mulai,
        "second",
      );
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = duration % 60;

      const lamaMainString = `${hours} Jam ${minutes} Menit ${seconds} Detik`;
      const result = await backendFetch(
        laporanBillingCrudChannelNames.STOP_TIMER,
        state.value?.hold_id,
        lamaMainString,
        state.value?.laporan_jenis_main === "diwaktu"
          ? state.value?.laporan_waktu_selesai
          : waktuSelesai,
      );

      state.value!.laporan_lama_main = result.lama_main;
      state.value!.laporan_waktu_selesai = result.waktu_selesai;
      aktif.value = false;
      percentageUntukProgressBar.value = 0;

      if (callGetState) {
        await getState(false);
      }
    }
  } catch (error: any) {
    $toast.error(error.message);
  }
}

async function onSimpan() {
  try {
    await backendFetch(
      mejaMainCrudChannelNames.DETACH_HOLD_ID,
      props.dataMeja.nomor_meja,
    );
    await getState(false);
  } catch (error: any) {
    $toast.error(error.message);
  }
}

onMounted(async () => {
  await getState(false);
});
</script>

<template>
  <div class="meja-main-layout-container">
    <div class="meja-main-layout-first-section d-flex flex-column gap-4">
      <div
        class="d-flex gap-4 justify-center align-center"
        style="height: 35px"
      >
        <div
          class="text-center text-h5 font-weight-bold d-flex align-center gap-2"
        >
          <v-icon
            icon="mdi-desktop-classic"
            color="light-blue-lighten-2"
            size="28"
          ></v-icon>
          <div>MEJA {{ dataMeja.nomor_meja }}</div>
        </div>
        <v-divider vertical thickness="3"></v-divider>
        <div
          class="text-center text-h5 font-weight-bold d-flex align-center gap-2"
        >
          <v-icon
            icon="mdi-gamepad-left"
            color="red-accent-1"
            size="28"
          ></v-icon>
          <div>Ps {{ dataMeja.versi_ps }}</div>
        </div>
      </div>

      <div
        class="pa-2 rounded-lg d-flex flex-column align-center justify-center gap-4 elevation-5 border"
        style="width: 20rem; min-height: 150px"
      >
        <div class="text-h4 font-weight-bold">{{ timerDisplay }}</div>
        <div class="w-75">
          <v-progress-linear
            :model-value="percentageUntukProgressBar"
            :color="warnaProgressBar"
            height="15"
            :stream="percentageUntukProgressBar > 0"
            :indeterminate="state?.laporan_jenis_main === 'los' && aktif"
          ></v-progress-linear>
        </div>
        <v-btn
          v-if="aktif"
          text="Stop"
          prepend-icon="mdi-stop"
          color="error"
          variant="tonal"
          :disabled="showDialogKelolaKonsumsi"
          @click="stopTimer"
        ></v-btn>
        <v-btn
          v-else
          text="Pilih Jenis Main"
          prepend-icon="mdi-handshake"
          color="success"
          variant="tonal"
          :disabled="state?.hold_id !== null && !aktif"
          :id="`btn-pilih-jenis-main-meja-${dataMeja.nomor_meja}`"
        >
        </v-btn>

        <v-menu
          :close-on-content-click="false"
          persistent
          :activator="`#btn-pilih-jenis-main-meja-${dataMeja.nomor_meja}`"
          transition="slide-y-transition"
          v-model="showPopoverPilihJenisMain"
          location="bottom center"
          scrim="black"
        >
          <v-card width="300">
            <v-tabs
              v-model="tabDiwaktuOrLos"
              density="compact"
              fixed-tabs
              bg-color="green"
            >
              <v-tab value="diwaktu">Diwaktu</v-tab>
              <v-tab value="los">Los</v-tab>
            </v-tabs>
            <v-window v-model="tabDiwaktuOrLos">
              <v-window-item value="diwaktu">
                <v-card
                  title="Pilih Paket Main"
                  :subtitle="`MEJA ${dataMeja.nomor_meja} | Ps ${dataMeja.versi_ps}`"
                >
                  <div class="d-flex pa-2 gap-2">
                    <v-select
                      hide-details
                      variant="solo-filled"
                      density="compact"
                      v-model="jamTerpilih"
                      :items="jamUntukDipilih"
                      label="Jam"
                    ></v-select>
                    <v-select
                      hide-details
                      variant="solo-filled"
                      density="compact"
                      v-model="menitTerpilih"
                      :items="menitUntukDipilih"
                      label="Menit"
                    ></v-select>
                  </div>

                  <div class="text-subtitle-1 text-center">
                    {{ paketMainTerpilihFormatted }}
                  </div>

                  <div
                    class="text-center text-h6 font-weight-bold text-teal-lighten-2"
                  >
                    {{ previewBayarMainDiwaktuInRupiah }}
                  </div>

                  <v-card-actions>
                    <div class="w-100 d-flex justify-end">
                      <v-btn
                        style="flex-grow: 1"
                        text="Reset"
                        variant="tonal"
                        prepend-icon="mdi-backspace"
                        @click="
                          () => {
                            jamTerpilih = 1;
                            menitTerpilih = 0;
                          }
                        "
                      ></v-btn>
                      <v-btn
                        :disabled="btnMainDiwaktuDisabled"
                        style="flex-grow: 1"
                        text="Mulai"
                        prepend-icon="mdi-play"
                        variant="tonal"
                        color="success"
                        @click="mulaiMain('diwaktu')"
                      ></v-btn>
                    </div>
                  </v-card-actions>
                </v-card>
              </v-window-item>
              <v-window-item value="los">
                <div class="d-flex justify-center align-center pa-4">
                  <v-btn
                    text="Mulai"
                    prepend-icon="mdi-play"
                    variant="tonal"
                    color="success"
                    @click="mulaiMain('los')"
                  ></v-btn>
                </div>
              </v-window-item>
            </v-window>

            <v-card-actions>
              <v-btn
                text="Batalkan"
                variant="tonal"
                block
                @click="showPopoverPilihJenisMain = false"
              ></v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </div>

      <v-menu open-on-hover :open-delay="0" location="top center">
        <template #activator="{ props }">
          <div
            v-bind="props"
            class="label-total-bayar-semua text-h5 font-weight-bold text-teal-lighten-2 text-center"
          >
            {{ totalBayarSemuaInRupiah }}
          </div>
        </template>

        <v-card border>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <span>Bayar main:</span>
              <span class="font-weight-bold">{{ totalBayarMainInRupiah }}</span>
            </div>
            <div class="d-flex justify-space-between align-center">
              <span>Bayar konsumsi:</span>
              <span class="font-weight-bold">{{
                totalBayarKonsumsiInRupiah
              }}</span>
            </div>

            <div class="d-flex align-center gap-2">
              <v-divider></v-divider>
              <v-icon icon="mdi-plus" color="grey-darken-3"></v-icon>
            </div>

            <div class="d-flex justify-space-between align-center">
              <span>Total semua:</span>
              <span class="font-weight-bold text-teal-lighten-2">{{
                totalBayarSemuaInRupiah
              }}</span>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
    </div>

    <div class="meja-main-layout-second-section d-flex flex-column gap-4">
      <v-card min-width="350" max-width="450">
        <v-tabs
          v-model="tabKonsumsiOrInfoMain"
          fixed-tabs
          density="compact"
          bg-color="green-darken-3"
        >
          <v-tab value="info-main" :disabled="showDialogKelolaKonsumsi"
            >Info Main</v-tab
          >
          <v-tab value="konsumsi">Konsumsi</v-tab>
        </v-tabs>

        <v-window v-model="tabKonsumsiOrInfoMain">
          <v-window-item value="info-main">
            <v-card border elevation="5">
              <v-list-item
                prepend-icon="mdi-shape"
                title="Jenis Main:"
                :subtitle="state?.laporan_jenis_main ?? '??'"
              ></v-list-item>
              <v-divider></v-divider>
              <v-list-item
                prepend-icon="mdi-ray-start"
                title="Waktu Mulai:"
                :subtitle="state?.laporan_waktu_mulai ?? '??'"
              ></v-list-item>
              <v-divider></v-divider>
              <v-list-item
                prepend-icon="mdi-ray-end"
                title="Waktu Selesai:"
                :subtitle="state?.laporan_waktu_selesai ?? '??'"
              ></v-list-item>
              <v-divider></v-divider>
              <v-list-item
                prepend-icon="mdi-account"
                title="Operator:"
                :subtitle="state?.laporan_op ?? '??'"
              ></v-list-item>
            </v-card>
          </v-window-item>

          <v-window-item value="konsumsi">
            <v-card border elevation="5">
              <v-table density="compact" height="250" fixed-header>
                <thead>
                  <tr>
                    <th class="whitespace-nowrap">Nama Produk</th>
                    <th class="whitespace-nowrap">Jumlah</th>
                    <th class="whitespace-nowrap">Bayar</th>
                    <th
                      class="whitespace-nowrap"
                      v-if="showDialogKelolaKonsumsi"
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-if="state?.hold_id"
                    v-for="konsumsi in konsumsiListParsed"
                    :key="konsumsi.nama_produk"
                  >
                    <td
                      :title="konsumsi.nama_produk"
                      style="
                        max-width: 120px;
                        text-overflow: ellipsis;
                        overflow: hidden;
                        white-space: nowrap;
                      "
                    >
                      {{ konsumsi.nama_produk }}
                    </td>
                    <td>{{ konsumsi.jumlah }}</td>
                    <td>{{ formatRupiah(konsumsi.bayar) }}</td>
                    <td v-if="showDialogKelolaKonsumsi">
                      <v-btn
                        :disabled="disableKelolaKonsumsi"
                        variant="text"
                        color="error"
                        density="compact"
                        icon="mdi-delete"
                        @click="
                          deleteKonsumsi(konsumsi.nama_produk, konsumsi.bayar)
                        "
                      ></v-btn>
                    </td>
                  </tr>
                </tbody>

                <template #bottom>
                  <v-divider></v-divider>
                  <div
                    class="d-flex justify-space-between align-center px-4 py-2"
                  >
                    <div>Total:</div>
                    <div class="font-weight-bold">
                      {{ totalBayarKonsumsiInRupiah }}
                    </div>
                  </div>
                </template>
              </v-table>
            </v-card>
          </v-window-item>
        </v-window>
      </v-card>

      <v-card v-if="showDialogKelolaKonsumsi" border>
        <v-card-text>
          <v-select
            label="Pilih Konsumsi"
            density="compact"
            variant="solo-filled"
            v-model="selectedKonsumsi"
            return-object
            :items="dataKonsumsi"
            item-title="nama_produk"
            clearable
            @click:clear="jumlahKonsumsiUntukDitambahkan = 1"
          >
            <template #details>
              <div
                class="d-flex w-100 justify-space-between align-center"
                v-if="selectedKonsumsi"
              >
                <div>
                  <div>
                    {{ selectedKonsumsi?.nama_produk }} @{{
                      formatRupiah(selectedKonsumsi?.harga)
                    }}
                  </div>
                </div>

                <div class="d-flex align-center gap-2">
                  <v-btn
                    icon="mdi-minus"
                    density="compact"
                    color="error"
                    variant="tonal"
                    :disabled="jumlahKonsumsiUntukDitambahkan === 1"
                    @click="jumlahKonsumsiUntukDitambahkan--"
                  ></v-btn>
                  <div>{{ jumlahKonsumsiUntukDitambahkan }}</div>
                  <v-btn
                    icon="mdi-plus"
                    density="compact"
                    color="success"
                    variant="tonal"
                    @click="jumlahKonsumsiUntukDitambahkan++"
                  ></v-btn>
                </div>
              </div>
            </template>
          </v-select>

          <div
            class="my-2 text-center text-h6 font-weight-bold text-light-blue-lighten-3"
            v-if="selectedKonsumsi"
          >
            {{ jumlahKonsumsiTerpilihXHargaInRupiah }}
          </div>

          <v-btn
            :disabled="!selectedKonsumsi || disableKelolaKonsumsi"
            color="success"
            text="Tambah"
            block
            variant="tonal"
            @click="addKonsumsi"
          ></v-btn>
        </v-card-text>
        <v-divider></v-divider>

        <v-card-actions>
          <v-btn
            text="Selesai"
            block
            @click="
              () => {
                selectedKonsumsi = undefined;
                jumlahKonsumsiUntukDitambahkan = 1;
                showDialogKelolaKonsumsi = false;
              }
            "
          ></v-btn>
        </v-card-actions>
      </v-card>

      <div class="d-flex flex-column gap-2" v-else>
        <div
          class="gap-2"
          style="display: grid; grid-template-columns: 1fr 1fr"
        >
          <v-btn
            prepend-icon="mdi-floppy"
            variant="tonal"
            color="info"
            text="Simpan"
            :disabled="aktif || state?.hold_id === null"
            @click="onSimpan"
          ></v-btn>
          <v-btn
            prepend-icon="mdi-printer"
            variant="tonal"
            color="success"
            text="Cetak"
            :disabled="aktif || state?.hold_id === null"
          ></v-btn>
        </div>
        <v-btn
          @click="mulaiKelolaKonsumsi"
          prepend-icon="mdi-food"
          variant="tonal"
          color="orange-lighten-1"
          text="Kelola Konsumsi"
          :disabled="state?.hold_id === null"
        ></v-btn>
      </div>
    </div>
  </div>
</template>

<style>
.meja-main-layout-container {
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: auto;
  min-height: 100%;
  gap: 1rem;
}

@media (min-width: 640px) {
}
@media (min-width: 768px) {
  .meja-main-layout-container {
    flex-direction: row;
  }
}
@media (min-width: 1024px) {
}
@media (min-width: 1280px) {
}
@media (min-width: 1536px) {
}
</style>
