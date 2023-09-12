<script setup lang="ts">
import { PaginationParams } from "../../../electron/@types/pagination";
import generator from "../../utils/generator";

const props = defineProps<{
  paginationParams: PaginationParams;
}>();

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

const fromTanggal = ref();
const fromBulan = ref();
const fromTahun = ref();

const toTanggal = ref();
const toBulan = ref();
const toTahun = ref();

const fromResult = computed(() => {
  return `${fromTahun.value}-${fromBulan.value}-${fromTanggal.value}`;
});

const toResult = computed(() => {
  return `${toTahun.value}-${toBulan.value}-${toTanggal.value}`;
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
  emits("submit", fromResult.value, toResult.value);
}

onMounted(() => {
  const fromDateRange = props.paginationParams.dateRange.from?.split("-");
  const toDateRange = props.paginationParams.dateRange.to?.split("-");

  if (fromDateRange && toDateRange) {
    fromTanggal.value = fromDateRange[2];
    fromBulan.value = fromDateRange[1];
    fromTahun.value = fromDateRange[0];

    toTanggal.value = toDateRange[2];
    toBulan.value = toDateRange[1];
    toTahun.value = toDateRange[0];
  }
});
</script>

<template>
  <v-card title="Filter Tanggal">
    <v-form class="pa-4" @submit.prevent="onSubmit" validate-on="lazy">
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
        <div class="d-flex flex-column justify-space-between">
          <div class="text-h6">{{ fromResultHuman }}</div>
          <div class="text-caption text-grey-darken-1">
            {{ fromResult }}
          </div>
        </div>
        <v-icon class="mx-6" icon="mdi-arrow-right"></v-icon>
        <div class="d-flex flex-column justify-space-between">
          <div class="text-h6">{{ toResultHuman }}</div>
          <div class="text-caption text-grey-darken-1">
            {{ toResult }}
          </div>
        </div>
      </div>
      <div class="d-flex justify-end gap-2">
        <v-btn variant="tonal" @click="$emit('cancel')">Batal</v-btn>
        <v-btn type="submit" color="success">OK</v-btn>
      </div>
    </v-form>
  </v-card>
</template>
