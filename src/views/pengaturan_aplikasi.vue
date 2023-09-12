<script setup lang="ts">
import { MejaMain, Playstation } from "../../electron/@types/models";
import mejaMainCrudChannelNames from "../../electron/channel_names/meja-main-crud-channel-names";
import playstationsCrudChannelNames from "../../electron/channel_names/playstations-crud-channel-names";
import backendFetch from "../utils/backend-fetch";
import { formatRupiah } from "convert-rupiah";
import { useToast } from "vue-toast-notification";

const $toast = useToast({
  duration: 5000,
  dismissible: true,
});
const psData = ref<Playstation[]>();
const mejaData = ref<MejaMain[]>();
const versiPSForDelete = ref(0);
const nomorMejaForDelete = ref(0);
const psDataForUpdate = ref<{ versi: number; tarif_per_menit: number }>();
const whichConfirmForm = ref<"del-ps" | "del-meja">();
const whichForm = ref<"add-ps" | "add-meja" | "edit-tarif-ps">();
const showDialogConfirmFormWrapper = ref(false);
const showDialogFormWrapper = ref(false);

async function getMejaMainData(showNotif: boolean = false) {
  try {
    mejaData.value = await backendFetch(mejaMainCrudChannelNames.GET_ALL);
    if (showNotif) $toast.success("Berhasil memuat ulang data PS");
  } catch (error: any) {
    $toast.error(error.message);
  }
}

async function getPsData(showNotif: boolean = false) {
  try {
    psData.value = await backendFetch(playstationsCrudChannelNames.GET_ALL);
    if (showNotif) $toast.success("Berhasil memuat ulang data meja main");
  } catch (error: any) {
    $toast.error(error.message);
  }
}

async function ubahVersiPSMeja(nomorMeja: number, event: Event) {
  const versiPsTerpilih = (event!.target as HTMLSelectElement).value;
  try {
    await backendFetch(
      mejaMainCrudChannelNames.UPDATE_VERSI_PS,
      nomorMeja,
      versiPsTerpilih,
    );
    await getMejaMainData();

    $toast.success(`Berhasil mengubah versi PS pada meja ${nomorMeja}`);
  } catch (error: any) {
    $toast.error(error.message);
  }
}

async function deleteMeja() {
  try {
    await backendFetch(
      mejaMainCrudChannelNames.DELETE,
      nomorMejaForDelete.value,
    );
    await getMejaMainData();

    showDialogConfirmFormWrapper.value = false;
    $toast.success(`Berhasil hapus meja ${nomorMejaForDelete.value}`);
  } catch (error: any) {
    $toast.error(error.message);
  }
}
async function deletePS() {
  if (
    mejaData.value?.some((meja) => meja.versi_ps === versiPSForDelete.value)
  ) {
    $toast.error(
      `Tidak dapat hapus, ada meja yang pakai PS versi ${versiPSForDelete.value}`,
    );
    showDialogConfirmFormWrapper.value = false;
    return;
  }

  try {
    await backendFetch(
      playstationsCrudChannelNames.DELETE,
      versiPSForDelete.value,
    );
    await getPsData();

    showDialogConfirmFormWrapper.value = false;
    $toast.success(`Berhasil hapus PS ${versiPSForDelete.value}`);
  } catch (error: any) {
    $toast.error(error.message);
  }
}

onMounted(async () => {
  await getMejaMainData();
  await getPsData();
});
</script>

<template>
  <div id="pengaturan-aplikasi-page" class="pa-4">
    <!-- Confirm Dialogs -->
    <v-dialog v-model="showDialogConfirmFormWrapper" width="400px">
      <GeneralConfirmForm
        v-if="whichConfirmForm === 'del-ps'"
        :text="`Yakin ingin hapus ps ${versiPSForDelete} ?`"
        @cancel="showDialogConfirmFormWrapper = false"
        @submit="async () => await deletePS()"
      />
      <GeneralConfirmForm
        v-else-if="whichConfirmForm === 'del-meja'"
        :text="`Yakin ingin  hapus meja ${nomorMejaForDelete} ?`"
        @cancel="showDialogConfirmFormWrapper = false"
        @submit="async () => await deleteMeja()"
      />
    </v-dialog>

    <!-- Dialogs -->
    <v-dialog v-model="showDialogFormWrapper" width="350px">
      <FormTambahMeja
        v-if="whichForm === 'add-meja'"
        :exceptional-meja-main="mejaData?.map((meja) => meja.nomor_meja)"
        :versi-ps-tersedia="psData?.map((ps) => ps.versi)"
        @cancel="showDialogFormWrapper = false"
        @submit="
          async () => {
            await getMejaMainData();
            showDialogFormWrapper = false;
          }
        "
      />
      <FormTambahPS
        v-else-if="whichForm === 'add-ps'"
        :exceptional-versions="psData?.map((ps) => ps.versi)"
        @cancel="showDialogFormWrapper = false"
        @submit="
          async () => {
            await getPsData();
            showDialogFormWrapper = false;
          }
        "
      />
      <FormUbahTarifPS
        v-else-if="whichForm === 'edit-tarif-ps'"
        :data="psDataForUpdate!"
        @cancel="showDialogFormWrapper = false"
        @submit="
          async () => {
            await getPsData();
            showDialogFormWrapper = false;
          }
        "
      />
    </v-dialog>

    <!-- Pengaturan Playstation -->
    <div id="pengaturan-playstation">
      <div class="d-flex justify-space-between mb-2 align-center">
        <div class="font-weight-bold text-h6">Pengaturan PS</div>
        <div>
          <v-btn
            class="mr-2"
            color="info"
            size="small"
            icon="mdi-refresh"
            @click="async () => await getPsData(true)"
          ></v-btn>
          <v-btn
            color="success"
            @click="
              () => {
                whichForm = 'add-ps';
                showDialogFormWrapper = true;
              }
            "
            >Tambah PS</v-btn
          >
        </div>
      </div>
      <v-table>
        <thead>
          <tr>
            <th>Versi</th>
            <th>Tarif Per Menit</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ps in psData">
            <td>{{ ps.versi }}</td>
            <td>
              {{ formatRupiah(ps.tarif_per_menit) }}
            </td>
            <td>
              <v-tooltip
                content-class="bg-white"
                text="Ubah tarif"
                location="top"
              >
                <template v-slot:activator="{ props }">
                  <v-btn
                    class="ml-2"
                    v-bind="props"
                    size="small"
                    color="warning"
                    variant="tonal"
                    icon="mdi-rename-box"
                    @click="
                      () => {
                        psDataForUpdate = {
                          versi: ps.versi!,
                          tarif_per_menit: ps.tarif_per_menit,
                        };
                        whichForm = 'edit-tarif-ps';
                        showDialogFormWrapper = true;
                      }
                    "
                  ></v-btn>
                </template>
              </v-tooltip>
              <v-tooltip content-class="bg-white" text="Hapus" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    class="ml-2"
                    v-bind="props"
                    size="small"
                    color="error"
                    variant="tonal"
                    icon="mdi-delete"
                    @click="
                      () => {
                        whichConfirmForm = 'del-ps';
                        versiPSForDelete = ps.versi!;
                        showDialogConfirmFormWrapper = true;
                      }
                    "
                  ></v-btn>
                </template>
              </v-tooltip>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <!-- Pengaturan Meja Main -->
    <div id="pengaturan-meja-main" class="mt-10">
      <div class="d-flex justify-space-between mb-2 align-center">
        <div class="font-weight-bold text-h6">Pengaturan Meja Main</div>

        <div>
          <v-btn
            class="mr-2"
            color="info"
            size="small"
            icon="mdi-refresh"
            @click="async () => await getMejaMainData(true)"
          ></v-btn>
          <v-btn
            v-if="psData"
            color="success"
            @click="
              () => {
                whichForm = 'add-meja';
                showDialogFormWrapper = true;
              }
            "
            >Tambah Meja</v-btn
          >
        </div>
      </div>
      <v-table v-if="psData">
        <thead>
          <tr>
            <th>Nomor</th>
            <th>Versi PS</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="meja in mejaData">
            <td>{{ meja.nomor_meja }}</td>
            <td>
              <select
                class="custom-select-input"
                @change="ubahVersiPSMeja(meja.nomor_meja as number, $event)"
              >
                <option
                  v-for="ps in psData"
                  :value="ps.versi"
                  :selected="meja.versi_ps === ps.versi"
                >
                  {{ ps.versi }}
                </option>
              </select>
            </td>
            <td>
              <v-tooltip content-class="bg-white" text="Hapus" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    class="ml-2"
                    v-bind="props"
                    size="small"
                    color="error"
                    variant="tonal"
                    icon="mdi-delete"
                    @click="
                      () => {
                        whichConfirmForm = 'del-meja';
                        nomorMejaForDelete = meja.nomor_meja!;
                        showDialogConfirmFormWrapper = true;
                      }
                    "
                  ></v-btn>
                </template>
              </v-tooltip>
            </td>
          </tr>
        </tbody>
      </v-table>

      <div v-else class="text-center pt-6 text-grey">
        Mulai dengan menambahkan data PS dahulu sebelum menambahkan data meja
        main
      </div>
    </div>
  </div>
</template>

<style>
.custom-select-input {
  width: 70px;
  border-radius: 5px;
  height: 30px;
  padding: 0 10px;
  background-color: #303030;
  background-image: url('data:image/svg+xml,%3Csvg xmlns="http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg" width="48" height="48" viewBox="0 0 48 48"%3E%3Cmask id="ipSDownOne0"%3E%3Cpath fill="%23fff" stroke="%23fff" stroke-linejoin="round" stroke-width="4" d="M36 19L24 31L12 19h24Z"%2F%3E%3C%2Fmask%3E%3Cpath fill="%23fff" d="M0 0h48v48H0z" mask="url(%23ipSDownOne0)"%2F%3E%3C%2Fsvg%3E');
  background-size: 18px;
  background-position: 92% center;
}
.custom-select-input:focus {
  outline: none;
}
</style>
