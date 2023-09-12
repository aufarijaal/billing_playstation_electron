<script setup lang="ts">
import { useToast } from "vue-toast-notification";
import backendFetch from "../../utils/backend-fetch";
import { formatRupiah } from "convert-rupiah";
import generator from "../../utils/generator";
import pengeluaranCrudChannelNames from "../../../electron/channel_names/pengeluaran-crud-channel-names";
import useMainStore from "../../store";
import dayjs from "dayjs";
import { Pengeluaran } from "../../../electron/@types/models";

const props = defineProps<{
  dataForUpdate: Pengeluaran;
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

const store = useMainStore();
const $toast = useToast();
const valid = ref<boolean | null>();
const additionalErrors = ref("");
const metodeIsiTanggalKeluar = ref<"sekarang" | "manual">("manual");

// Form
const form = reactive({
  deskripsi: props.dataForUpdate.deskripsi,
  nominal: props.dataForUpdate.nominal,
  dikeluarkan_pada: {
    tahun: props.dataForUpdate.dikeluarkan_pada.split(" ")[0].split("-")[0],
    bulan: props.dataForUpdate.dikeluarkan_pada.split(" ")[0].split("-")[1],
    tanggal: props.dataForUpdate.dikeluarkan_pada.split(" ")[0].split("-")[2],
    jam: props.dataForUpdate.dikeluarkan_pada.split(" ")[1].split(":")[0],
    menit: props.dataForUpdate.dikeluarkan_pada.split(" ")[1].split(":")[1],
    detik: props.dataForUpdate.dikeluarkan_pada.split(" ")[1].split(":")[2],
  },
});
const rules = ref({
  deskripsi: [
    (value: string) => {
      if (value) return true;
      return "Deskripsi harus di isi";
    },
  ],
  nominal: [
    (value: number) => {
      if (value > 0) return true;
      return "Nominal pengeluaran harus di isi dan tidak boleh nol";
    },
  ],
});

const tahunUntukDipilih = computed(() => {
  if (metodeIsiTanggalKeluar.value === "manual") {
    return generator.generateTahunUntukDipilih();
  } else {
    return [];
  }
});

const tanggalUntukDipilih = computed(() => {
  if (metodeIsiTanggalKeluar.value === "manual") {
    return generator.generateTanggal();
  } else {
    return [];
  }
});

const waktuUntukDipilih = computed(() => {
  if (metodeIsiTanggalKeluar.value === "manual") {
    return generator.generateWaktu();
  } else {
    return [];
  }
});

const formattedTanggalKeluar = computed(() => {
  return `${form.dikeluarkan_pada.tahun}-${form.dikeluarkan_pada.bulan}-${form.dikeluarkan_pada.tanggal} ${form.dikeluarkan_pada.jam}:${form.dikeluarkan_pada.menit}:${form.dikeluarkan_pada.detik}`;
});

async function onSubmit() {
  if (!valid.value) return;

  try {
    await backendFetch(
      pengeluaranCrudChannelNames.UPDATE,
      Object.assign(
        {},
        {
          id: props.dataForUpdate.id,
          op: store.session.username,
          deskripsi: form.deskripsi,
          nominal: form.nominal,
          dikeluarkan_pada:
            metodeIsiTanggalKeluar.value === "sekarang"
              ? dayjs().format("YYYY-MM-DD HH:mm:ss")
              : formattedTanggalKeluar.value,
        },
      ),
    );
    $toast.success(
      `Berhasil mengubah data pengeluaran id: ${props.dataForUpdate.id}`,
    );
    emits("submit");
  } catch (error: any) {
    additionalErrors.value = error.message.split("Error: ")[1];
    setTimeout(() => {
      additionalErrors.value = "";
    }, 4000);
  }
}

function onCancel() {
  emits("cancel");
}

watch([metodeIsiTanggalKeluar], () => {
  if (metodeIsiTanggalKeluar.value === "manual") {
    const now = new Date();

    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const dayNumber = now.getDate().toString().padStart(2, "0");
    const hour = now.getHours().toString().padStart(2, "0");
    const minute = now.getMinutes().toString().padStart(2, "0");
    const second = now.getSeconds().toString().padStart(2, "0");

    form.dikeluarkan_pada.tahun = year;
    form.dikeluarkan_pada.bulan = month;
    form.dikeluarkan_pada.tanggal = dayNumber;
    form.dikeluarkan_pada.jam = hour;
    form.dikeluarkan_pada.menit = minute;
    form.dikeluarkan_pada.detik = second;
  }
});
</script>
<template>
  <v-card :title="`Ubah pengeluaran id: ${dataForUpdate.id}`">
    <v-card-subtitle>
      <div class="pl-6 text-error font-weight-medium">
        {{ additionalErrors }}
      </div>
      <div class="ml-2">
        Input berbintang (<span class="text-red-lighten-3">*</span>) berarti
        wajib di isi.
      </div>
    </v-card-subtitle>

    <v-form
      class="pa-4"
      @submit.prevent="onSubmit"
      validate-on="lazy"
      v-model="valid"
    >
      <div>
        <v-text-field
          v-model="form.deskripsi"
          :rules="rules.deskripsi"
          class="mb-2"
          variant="solo-filled"
        >
          <template v-slot:label>
            <span
              >Deskripsi / Keterangan
              <span class="text-red-lighten-3">*</span></span
            >
          </template>
        </v-text-field>
        <v-text-field
          v-model.number="form.nominal"
          :rules="rules.nominal"
          class="mb-2"
          variant="solo-filled"
          :hint="formatRupiah(form.nominal)"
          persistent-hint
        >
          <template v-slot:label>
            <span>Nominal <span class="text-red-lighten-3">*</span></span>
          </template>
        </v-text-field>
      </div>
      <v-divider></v-divider>

      <div>
        <div class="ml-2 mt-4 mb-2 text-h6">Tanggal keluar</div>
        <v-radio-group v-model="metodeIsiTanggalKeluar" inline>
          <v-radio value="sekarang" label="Sekarang"></v-radio>
          <v-radio value="manual" label="Isi manual"></v-radio>
        </v-radio-group>
        <div
          class="text-center text-h6 mb-2"
          v-if="metodeIsiTanggalKeluar === 'manual'"
        >
          {{ formattedTanggalKeluar }}
        </div>
        <div class="d-flex gap-1" v-if="metodeIsiTanggalKeluar === 'manual'">
          <v-select
            :items="tanggalUntukDipilih"
            v-model="form.dikeluarkan_pada.tanggal"
          >
            <template v-slot:label>
              <span>Tanggal <span class="text-red-lighten-3">*</span></span>
            </template>
          </v-select>

          <v-select
            :items="bulan"
            item-value="nomor"
            item-title="nama"
            :return-object="false"
            v-model="form.dikeluarkan_pada.bulan"
          >
            <template v-slot:label>
              <span>Bulan <span class="text-red-lighten-3">*</span></span>
            </template>
          </v-select>
          <v-select
            :items="tahunUntukDipilih"
            v-model="form.dikeluarkan_pada.tahun"
          >
            <template v-slot:label>
              <span>Tahun <span class="text-red-lighten-3">*</span></span>
            </template>
          </v-select>
        </div>
        <div class="d-flex gap-1" v-if="metodeIsiTanggalKeluar === 'manual'">
          <v-select
            :items="waktuUntukDipilih"
            v-model="form.dikeluarkan_pada.jam"
          >
            <template v-slot:label>
              <span>Jam <span class="text-red-lighten-3">*</span></span>
            </template>
          </v-select>
          <v-select
            :items="waktuUntukDipilih"
            v-model="form.dikeluarkan_pada.menit"
          >
            <template v-slot:label>
              <span>Menit <span class="text-red-lighten-3">*</span></span>
            </template>
          </v-select>
          <v-select
            :items="waktuUntukDipilih"
            v-model="form.dikeluarkan_pada.detik"
          >
            <template v-slot:label>
              <span>Detik <span class="text-red-lighten-3">*</span></span>
            </template>
          </v-select>
        </div>
      </div>

      <div class="d-flex justify-end gap-2 mt-2">
        <v-btn variant="tonal" @click="onCancel">Batal</v-btn>
        <v-btn type="submit" variant="tonal" color="success">OK</v-btn>
      </div>
    </v-form>
  </v-card>
</template>
