<script setup lang="ts">
import { useToast } from "vue-toast-notification";
import backendFetch from "../../utils/backend-fetch";
import { formatRupiah } from "convert-rupiah";
import { PaketSewa } from "../../../electron/@types/models";
import generator from "../../utils/generator";
import laporanSewaCrudChannelNames from "../../../electron/channel_names/laporan-sewa-crud-channel-names";
import useMainStore from "../../store";
import dayjs from "dayjs";

const props = defineProps<{
  dataPaketSewa?: PaketSewa[];
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
const metodeIsiPaket = ref<"pilih" | "manual">("manual");
const metodeIsiTanggalSewa = ref<"sekarang" | "manual">("sekarang");

// Form
const form = reactive({
  nama_penyewa: "",
  alamat_penyewa: "",
  kontak_penyewa: "",
  tanggal_sewa: {
    tahun: "1999",
    bulan: "01",
    tanggal: "01",
    jam: "00",
    menit: "00",
    detik: "00",
  },
  paket_sewa: {
    id: 0,
    nama_paket: "",
    harga: 0,
  },
  status: 0,
});
const rules = ref({
  pilihan_paket_sewa: [
    (value: { id: number; nama_paket: string; harga: number }) => {
      if (!value.id || value.id === 0 || !value.nama_paket || !value.harga) {
        return "Pilih salah satu paket";
      }
      return true;
    },
  ],
  nama_paket: [
    (value: string) => {
      if (value) return true;
      return "Nama paket harus di isi";
    },
  ],
  total_bayar: [
    (value: number) => {
      if (value > 0) return true;
      return "Total bayar harus di isi dan tidak boleh nol";
    },
  ],
});

const tahunUntukDipilih = computed(() => {
  if (metodeIsiTanggalSewa.value === "manual") {
    return generator.generateTahunUntukDipilih();
  } else {
    return [];
  }
});

const tanggalUntukDipilih = computed(() => {
  if (metodeIsiTanggalSewa.value === "manual") {
    return generator.generateTanggal();
  } else {
    return [];
  }
});

const waktuUntukDipilih = computed(() => {
  if (metodeIsiTanggalSewa.value === "manual") {
    return generator.generateWaktu();
  } else {
    return [];
  }
});

const formattedTanggalSewa = computed(() => {
  return `${form.tanggal_sewa.tahun}-${form.tanggal_sewa.bulan}-${form.tanggal_sewa.tanggal} ${form.tanggal_sewa.jam}:${form.tanggal_sewa.menit}:${form.tanggal_sewa.detik}`;
});

async function onSubmit() {
  if (!valid.value) return;

  try {
    await backendFetch(
      laporanSewaCrudChannelNames.ADD,
      Object.assign(
        {},
        {
          op: store.session.username,
          nama_penyewa: form.nama_penyewa,
          alamat_penyewa: form.alamat_penyewa,
          kontak_penyewa: form.kontak_penyewa,
          paket_sewa: form.paket_sewa.nama_paket,
          tanggal_sewa:
            metodeIsiTanggalSewa.value === "sekarang"
              ? dayjs().format("YYYY-MM-DD HH:mm:ss")
              : formattedTanggalSewa.value,
          total_bayar: form.paket_sewa.harga,
          status: form.status,
        },
      ),
    );
    $toast.success("Berhasil tambah data penyewaan");
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

watch([metodeIsiTanggalSewa], () => {
  if (metodeIsiTanggalSewa.value === "manual") {
    const now = new Date();

    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const dayNumber = now.getDate().toString().padStart(2, "0");
    const hour = now.getHours().toString().padStart(2, "0");
    const minute = now.getMinutes().toString().padStart(2, "0");
    const second = now.getSeconds().toString().padStart(2, "0");

    form.tanggal_sewa.tahun = year;
    form.tanggal_sewa.bulan = month;
    form.tanggal_sewa.tanggal = dayNumber;
    form.tanggal_sewa.jam = hour;
    form.tanggal_sewa.menit = minute;
    form.tanggal_sewa.detik = second;
  }
});

watch([metodeIsiPaket], () => {
  if (props.dataPaketSewa && metodeIsiPaket.value === "pilih") {
    form.paket_sewa = props.dataPaketSewa[0] as any;
  }
  if (metodeIsiPaket.value === "manual") {
    form.paket_sewa = {
      id: 0,
      nama_paket: "",
      harga: 0,
    };
  }
});
</script>
<template>
  <v-card title="Buat Data Sewa Baru">
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
      <v-text-field
        v-model="form.nama_penyewa"
        class="mb-2"
        variant="solo-filled"
        label="Nama Penyewa"
      ></v-text-field>
      <v-text-field
        v-model="form.alamat_penyewa"
        class="mb-2"
        variant="solo-filled"
        label="Alamat Penyewa"
      ></v-text-field>
      <v-text-field
        v-model="form.kontak_penyewa"
        class="mb-2"
        variant="solo-filled"
        label="Kontak Penyewa"
      ></v-text-field>

      <v-divider></v-divider>
      <div>
        <div class="ml-2 mt-4 mb-2 text-h6">Tanggal Sewa</div>
        <v-radio-group v-model="metodeIsiTanggalSewa" inline>
          <v-radio value="sekarang" label="Sekarang"></v-radio>
          <v-radio value="manual" label="Isi manual"></v-radio>
        </v-radio-group>
        <div
          class="text-center text-h6 mb-2"
          v-if="metodeIsiTanggalSewa === 'manual'"
        >
          {{ formattedTanggalSewa }}
        </div>
        <div class="d-flex gap-1" v-if="metodeIsiTanggalSewa === 'manual'">
          <v-select
            :items="tanggalUntukDipilih"
            v-model="form.tanggal_sewa.tanggal"
          >
            <template v-slot:label>
              <span>Tanggal <span class="text-red-lighten-3">*</span></span>
            </template>
          </v-select>

          <!-- Bug: harusnya bulan me-return value nomor bulan nya, tapi malah object dari bulan yang dipilih e.g {nama: "Januari", nomor: 1} -->
          <v-select
            :items="bulan"
            item-value="nomor"
            item-title="nama"
            :return-object="false"
            v-model="form.tanggal_sewa.bulan"
          >
            <template v-slot:label>
              <span>Bulan <span class="text-red-lighten-3">*</span></span>
            </template>
          </v-select>
          <v-select
            :items="tahunUntukDipilih"
            v-model="form.tanggal_sewa.tahun"
          >
            <template v-slot:label>
              <span>Tahun <span class="text-red-lighten-3">*</span></span>
            </template>
          </v-select>
        </div>
        <div class="d-flex gap-1" v-if="metodeIsiTanggalSewa === 'manual'">
          <v-select :items="waktuUntukDipilih" v-model="form.tanggal_sewa.jam">
            <template v-slot:label>
              <span>Jam <span class="text-red-lighten-3">*</span></span>
            </template>
          </v-select>
          <v-select
            :items="waktuUntukDipilih"
            v-model="form.tanggal_sewa.menit"
          >
            <template v-slot:label>
              <span>Menit <span class="text-red-lighten-3">*</span></span>
            </template>
          </v-select>
          <v-select
            :items="waktuUntukDipilih"
            v-model="form.tanggal_sewa.detik"
          >
            <template v-slot:label>
              <span>Detik <span class="text-red-lighten-3">*</span></span>
            </template>
          </v-select>
        </div>
      </div>

      <v-divider></v-divider>
      <div class="ml-2 mt-4 mb-2 text-h6">Status Pengembalian</div>
      <v-checkbox
        v-model="form.status"
        :true-value="1"
        :false-value="0"
        label="Sudah dikembalikan"
      ></v-checkbox>

      <v-divider></v-divider>
      <div>
        <div class="ml-2 mt-4 mb-2 text-h6">Paket Sewa</div>
        <v-radio-group v-model="metodeIsiPaket" inline>
          <v-radio value="pilih" label="Pilih paket"></v-radio>
          <v-radio value="manual" label="Isi manual"></v-radio>
        </v-radio-group>
        <v-text-field
          v-if="metodeIsiPaket === 'manual'"
          :rules="rules.nama_paket"
          v-model="form.paket_sewa.nama_paket"
          class="mb-2"
          variant="solo-filled"
        >
          <template v-slot:label>
            <span>Nama Paket <span class="text-red-lighten-3">*</span></span>
          </template>
        </v-text-field>
        <v-text-field
          v-if="metodeIsiPaket === 'manual'"
          :rules="rules.total_bayar"
          v-model.number="form.paket_sewa.harga"
          class="mb-2"
          variant="solo-filled"
          :hint="formatRupiah(form.paket_sewa.harga)"
          persistent-hint
        >
          <template v-slot:label>
            <span>Total Bayar <span class="text-red-lighten-3">*</span></span>
          </template>
        </v-text-field>
        <v-select
          v-else
          variant="solo-filled"
          :items="dataPaketSewa"
          item-title="nama_paket"
          item-value="harga"
          return-object
          v-model="form.paket_sewa"
        >
          <template v-slot:label>
            <span
              >Pilih paket tersedia
              <span class="text-red-lighten-3">*</span></span
            >
          </template>
        </v-select>
        <div class="text-center mb-4 text-h6">
          Bayar:
          <span class="text-success">{{
            formatRupiah(form.paket_sewa.harga)
          }}</span>
        </div>
      </div>
      <div class="d-flex justify-end gap-2 mt-2">
        <v-btn variant="tonal" @click="onCancel">Batal</v-btn>
        <v-btn type="submit" variant="tonal" color="success">OK</v-btn>
      </div>
    </v-form>
  </v-card>
</template>
