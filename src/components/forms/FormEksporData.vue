<script setup lang="ts">
import dayjs from "dayjs";
import generator from "../../utils/generator";
import { useToast } from "vue-toast-notification";
import backendFetch from "../../utils/backend-fetch";

const props = defineProps<{defaultFileName: string, channelToGetDataCount: string}>();
const emits = defineEmits(["cancel", "submit"]);

const bulan = [
  { nama: "Januari", nomor: "01" },
  { nama: "Februari", nomor: "02" },
  { nama: "Maret", nomor: "03" },
  { nama: "April", nomor: "04" },
  { nama: "Mei", nomor: "05" },
  { nama: "Juni", nomor: "06" },
  { nama: "Juli", nomor: "07" },
  { nama: "Agustus", nomor: "08" },
  { nama: "September", nomor: "09" },
  { nama: "Oktober", nomor: "10" },
  { nama: "November", nomor: "11" },
  { nama: "Desember", nomor: "12" },
];
const tanggal = generator.generateTanggal();
const tahun = generator.generateTahunUntukDipilih();

const $toast = useToast();
const jumlahData = ref(0);

const fromTanggal = ref();
const fromBulan = ref();
const fromTahun = ref();

const toTanggal = ref();
const toBulan = ref();
const toTahun = ref();

const eksporSemua = ref(true);
const exportPath = ref("");

const fromFormatted = computed(() => {
  return `${fromTahun.value}-${fromBulan.value}-${fromTanggal.value} 00:00:00`;
});

const toFormatted = computed(() => {
  return `${toTahun.value}-${toBulan.value}-${toTanggal.value} 23:59:59`;
});

const fromResultHuman = computed(() => {
  return `${fromTanggal.value} ${bulan.find(
    (item) => item.nomor === fromBulan.value,
  )?.nama} ${fromTahun.value}`;
});

const toResultHuman = computed(() => {
  return `${toTanggal.value} ${bulan.find(
    (item) => item.nomor === toBulan.value,
  )?.nama} ${toTahun.value}`;
});

async function onSubmit() {
  emits("submit", exportPath.value, eksporSemua.value ? dayjs().year(1970).month(1).day(1).format("YYYY-MM-DD HH:mm:ss") : fromFormatted.value, toFormatted.value);
}

async function selectExportPath() {
  exportPath.value = await backendFetch("/utils/select_folder", {
    title: "Simpan hasil ekspor ke",
    okButton: "Pilih",
    filename: props.defaultFileName,
  });
}

watch(
  [fromTanggal, fromBulan, fromTahun, toTanggal, toBulan, toTahun, eksporSemua],
  async () => {
    try {
      const format = "YYYY-MM-DD HH:mm:ss";
      jumlahData.value = await backendFetch(
        props.channelToGetDataCount,
        eksporSemua.value
          ? dayjs().year(1970).month(1).day(1).format(format)
          : fromFormatted.value,
        eksporSemua.value ? dayjs().format(format) : toFormatted.value,
      );
    } catch (error: any) {
      $toast.error(error.message);
    }
  },
  { immediate: true },
);

onMounted(() => {
  const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

  fromTanggal.value = now.split(" ")[0].split("-")[2];
  fromBulan.value = now.split(" ")[0].split("-")[1];
  fromTahun.value = now.split(" ")[0].split("-")[0];

  toTanggal.value = now.split(" ")[0].split("-")[2];
  toBulan.value = now.split(" ")[0].split("-")[1];
  toTahun.value = now.split(" ")[0].split("-")[0];
});
</script>

<template>
  <v-card title="Ekspor data">
    <v-form class="pa-4" @submit.prevent="onSubmit" validate-on="lazy">
      <v-switch
        v-model="eksporSemua"
        label="Ekspor semua"
        hide-details
        color="info"
      ></v-switch>
      <div class="d-flex gap-2">
        <v-text-field
          density="compact"
          label="Simpan Ke"
          variant="solo-filled"
          v-model="exportPath"
        ></v-text-field>
        <v-btn
          color="success"
          icon="mdi-folder"
          @click="selectExportPath"
        ></v-btn>
      </div>
      <template v-if="!eksporSemua">
        <div class="text-button text-center mb-2">Dari</div>
        <div class="d-flex gap-1">
          <v-select
            v-model="fromTanggal"
            :items="tanggal"
            label="Tanggal"
            density="compact"
            single-line
            variant="solo-filled"
          ></v-select>
          <v-select
            v-model="fromBulan"
            :items="bulan"
            item-title="nama"
            item-value="nomor"
            label="Bulan"
            density="compact"
            single-line
            variant="solo-filled"
          ></v-select>
          <v-select
            v-model="fromTahun"
            :items="tahun"
            label="Tahun"
            density="compact"
            single-line
            variant="solo-filled"
          ></v-select>
        </div>

        <div class="text-button text-center mb-2">Sampai</div>
        <div class="d-flex gap-1">
          <v-select
            v-model="toTanggal"
            :items="tanggal"
            label="Tanggal"
            density="compact"
            single-line
            variant="solo-filled"
          ></v-select>
          <v-select
            v-model="toBulan"
            :items="bulan"
            item-title="nama"
            item-value="nomor"
            label="Bulan"
            density="compact"
            single-line
            variant="solo-filled"
          ></v-select>
          <v-select
            v-model="toTahun"
            :items="tahun"
            label="Tahun"
            density="compact"
            single-line
            variant="solo-filled"
          ></v-select>
        </div>

        <div class="my-4 d-flex justify-center align-center">
          {{ fromResultHuman }}
          <v-icon icon="mdi-arrow-right" size="14" class="mx-4"></v-icon>
          {{ toResultHuman }}
        </div>
      </template>

      <div>Jumlah data: {{ jumlahData }}</div>
      <div class="d-flex justify-end gap-2">
        <v-btn variant="tonal" @click="$emit('cancel')">Batal</v-btn>
        <v-btn type="submit" color="success" :disabled="!exportPath">Ekspor</v-btn>
      </div>
    </v-form>
  </v-card>
</template>
