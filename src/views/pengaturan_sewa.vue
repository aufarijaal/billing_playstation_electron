<script setup lang="ts">
import { useToast } from "vue-toast-notification";
import { PaketSewa } from "../../electron/@types/models";
import paketSewaCrudChannelNames from "../../electron/channel_names/paket-sewa-crud-channel-names";
import backendFetch from "../utils/backend-fetch";
import { formatRupiah } from "convert-rupiah";

const $toast = useToast();
const paketSewaData = ref<PaketSewa[]>([]);
const showDialog = ref(false);
const whichForm = ref<"add" | "ubah-nama" | "ubah-harga" | "hapus">("add");
const dataForManipulation = ref<PaketSewa>();

async function getPaketSewaData(showNotif: boolean = false) {
  paketSewaData.value = await backendFetch(paketSewaCrudChannelNames.GET_ALL);
  if (showNotif) $toast.success("Berhasil memuat ulang data paket sewa");
}

async function deletePaket() {
  try {
    await backendFetch(
      paketSewaCrudChannelNames.DELETE,
      dataForManipulation.value?.id,
    );
    await getPaketSewaData();
    showDialog.value = false;
  } catch (error: any) {
    $toast.error(error.message);
  }
}
onMounted(async () => {
  await getPaketSewaData();
});
</script>

<template>
  <div id="pengaturan-paket-sewa-page" class="pa-4">
    <!-- Dialogs -->
    <v-dialog
      v-model="showDialog"
      :width="whichForm === 'hapus' ? '500px' : '300px'"
    >
      <GeneralConfirmForm
        v-if="whichForm === 'hapus'"
        :text="`Yakin ingin hapus ${dataForManipulation?.nama_paket}?`"
        @cancel="showDialog = false"
        @submit="deletePaket"
      />
      <FormTambahPaketSewa
        v-else-if="whichForm === 'add'"
        @cancel="showDialog = false"
        @submit="
          async () => {
            await getPaketSewaData();
            showDialog = false;
          }
        "
      />
      <FormUbahNamaPaketSewa
        v-else-if="whichForm === 'ubah-nama'"
        @cancel="showDialog = false"
        @submit="
          async () => {
            await getPaketSewaData();
            showDialog = false;
          }
        "
        :data="dataForManipulation as any"
      />
      <FormUbahHargaPaketSewa
        v-else-if="whichForm === 'ubah-harga'"
        @cancel="showDialog = false"
        @submit="
          async () => {
            await getPaketSewaData();
            showDialog = false;
          }
        "
        :data="dataForManipulation as any"
      />
    </v-dialog>

    <div class="d-flex justify-space-between mb-2 align-center">
      <div class="font-weight-bold text-h6">Pengaturan Sewa</div>
      <div>
        <v-btn
          class="mr-2"
          color="info"
          size="small"
          icon="mdi-refresh"
          @click="getPaketSewaData(true)"
        ></v-btn>
        <v-btn
          color="success"
          @click="
            () => {
              whichForm = 'add';
              showDialog = true;
            }
          "
          >Tambah Paket</v-btn
        >
      </div>
    </div>
    <v-table v-if="paketSewaData?.length">
      <thead>
        <tr>
          <th>Nama Paket</th>
          <th>Harga</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="paket in paketSewaData" :key="paket.id">
          <td>{{ paket.nama_paket }}</td>
          <td>{{ formatRupiah(paket.harga) }}</td>
          <td>
            <v-tooltip
              content-class="bg-white"
              text="Ubah nama paket"
              location="top"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  class="ml-2"
                  v-bind="props"
                  size="small"
                  color="success"
                  variant="tonal"
                  icon="mdi-rename-box"
                  @click="
                    () => {
                      dataForManipulation = paket;
                      whichForm = 'ubah-nama';
                      showDialog = true;
                    }
                  "
                ></v-btn>
              </template>
            </v-tooltip>
            <v-tooltip
              content-class="bg-white"
              text="Ubah harga"
              location="top"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  class="ml-2"
                  v-bind="props"
                  size="small"
                  color="info"
                  variant="tonal"
                  icon="mdi-cash"
                  @click="
                    () => {
                      dataForManipulation = paket;
                      whichForm = 'ubah-harga';
                      showDialog = true;
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
                      dataForManipulation = paket;
                      whichForm = 'hapus';
                      showDialog = true;
                    }
                  "
                ></v-btn>
              </template>
            </v-tooltip>
          </td>
        </tr>
      </tbody>
    </v-table>

    <div v-else class="text-center pt-6 text-grey">Tidak ada data</div>
  </div>
</template>
