<script setup lang="ts">
import { useToast } from "vue-toast-notification";
import { Logistik } from "../../electron/@types/models";
import logistikCrudChannelNames from "../../electron/channel_names/logistik-crud-channel-names";
import backendFetch from "../utils/backend-fetch";
import { formatRupiah } from "convert-rupiah";

const $toast = useToast();
const logistikData = ref<Logistik[]>([]);
const showDialog = ref(false);
const whichForm = ref<
  "add-logistik" | "ubah-nama-produk" | "ubah-harga" | "hapus"
>("add-logistik");
const dataForManipulation = ref<Logistik>();

async function getLogistikData(showNotif: boolean = false) {
  logistikData.value = await backendFetch(logistikCrudChannelNames.GET_ALL);
  if (showNotif) $toast.success("Berhasil memuat ulang data logistik");
}

async function deleteLogistik() {
  try {
    await backendFetch(
      logistikCrudChannelNames.DELETE,
      dataForManipulation.value?.id,
    );
    await getLogistikData();
    showDialog.value = false;
  } catch (error: any) {
    $toast.error(error.message);
  }
}
onMounted(async () => {
  await getLogistikData();
});
</script>

<template>
  <div id="pengaturan-logistik-page" class="pa-4">
    <!-- Dialogs -->
    <v-dialog
      v-model="showDialog"
      :width="whichForm === 'hapus' ? '500px' : '300px'"
    >
      <GeneralConfirmForm
        v-if="whichForm === 'hapus'"
        :text="`Yakin ingin hapus ${dataForManipulation?.nama_produk}?`"
        @cancel="showDialog = false"
        @submit="deleteLogistik"
      />
      <FormTambahLogistik
        v-else-if="whichForm === 'add-logistik'"
        @cancel="showDialog = false"
        @submit="
          async () => {
            await getLogistikData();
            showDialog = false;
          }
        "
      />
      <FormUbahNamaProdukLogistik
        v-else-if="whichForm === 'ubah-nama-produk'"
        @cancel="showDialog = false"
        @submit="
          async () => {
            await getLogistikData();
            showDialog = false;
          }
        "
        :data="dataForManipulation as any"
      />
      <FormUbahHargaProdukLogistik
        v-else-if="whichForm === 'ubah-harga'"
        @cancel="showDialog = false"
        @submit="
          async () => {
            await getLogistikData();
            showDialog = false;
          }
        "
        :data="dataForManipulation as any"
      />
    </v-dialog>

    <div class="d-flex justify-space-between mb-2 align-center">
      <div class="font-weight-bold text-h6">Pengaturan Logistik</div>
      <div>
        <v-btn
          class="mr-2"
          color="info"
          size="small"
          icon="mdi-refresh"
          @click="getLogistikData(true)"
        ></v-btn>
        <v-btn
          color="success"
          @click="
            () => {
              whichForm = 'add-logistik';
              showDialog = true;
            }
          "
          >Tambah Item</v-btn
        >
      </div>
    </div>
    <v-table v-if="logistikData?.length">
      <thead>
        <tr>
          <th>Nama Produk</th>
          <th>Harga</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="logistik in logistikData" :key="logistik.id">
          <td>{{ logistik.nama_produk }}</td>
          <td>{{ formatRupiah(logistik.harga) }}</td>
          <td>
            <v-tooltip
              content-class="bg-white"
              text="Ubah nama produk"
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
                      dataForManipulation = logistik;
                      whichForm = 'ubah-nama-produk';
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
                      dataForManipulation = logistik;
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
                      dataForManipulation = logistik;
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
