<script setup lang="ts">
import { PaketSewa, LaporanSewa } from "../../electron/@types/models";
import paketSewaCrudChannelNames from "../../electron/channel_names/paket-sewa-crud-channel-names";
import laporanSewaCrudChannelNames from "../../electron/channel_names/laporan-sewa-crud-channel-names";
import backendFetch from "../utils/backend-fetch";
import { formatRupiah } from "convert-rupiah";
import {
  PaginationParams,
  PaginationResponse,
} from "../../electron/@types/pagination";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import idLocale from "dayjs/locale/id";
import { useToast } from "vue-toast-notification";
import useMainStore from "../store";

dayjs.extend(localizedFormat);
dayjs.locale(idLocale);

const sortChoices = [
  { title: "Operator", value: "op" },
  { title: "Nama Penyewa", value: "nama_penyewa" },
  { title: "Alamat Penyewa", value: "alamat_penyewa" },
  { title: "Kontak Penyewa", value: "kontak_penyewa" },
  { title: "Paket Sewa", value: "paket_sewa" },
  { title: "Tanggal Sewa", value: "tanggal_sewa" },
  { title: "Total Bayar", value: "total_bayar" },
  { title: "Status", value: "status" },
];
const dataPerPage = [10, 30, 50, 100];
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
const paketSewaData = ref<PaketSewa[]>();
const laporanSewaData = ref<{
  data: LaporanSewa[];
  pagination: PaginationResponse;
}>();
const whichForm = ref<
  "add" | "edit" | "delete" | "bulk-delete" | "date-range" | "status" | "export"
>("add");
const showDialog = ref(false);
const loading = ref(false);
const dateRangeFilterActive = ref(false);
const todayInfo = ref(dayjs().format("dddd, D MMMM YYYY | HH:mm"));
const dataForManipulation = ref<LaporanSewa>();
const idForDeleteOne = ref<number>();
const selectedIds = ref<number[]>([]);

const paginationParams = ref<PaginationParams>({
  dataPerPage: dataPerPage[0],
  dateRange: {
    from: dayjs().startOf("day").format("YYYY-MM-DD"),
    to: dayjs().endOf("day").format("YYYY-MM-DD"),
  },
  query: "",
  sort: {
    by: "tanggal_sewa",
    asc: false,
  },
  page: 1,
});

const dateRangeFromHumanize = computed(() => {
  return `${paginationParams.value.dateRange.from?.split("-")[2]} ${bulan
    .find(
      (item) =>
        item.nomor === paginationParams.value.dateRange.from?.split("-")[1],
    )
    ?.nama.slice(0, 3)} ${paginationParams.value.dateRange.from?.split(
    "-",
  )[0]}`;
});

const dateRangeToHumanize = computed(() => {
  return `${paginationParams.value.dateRange.to?.split("-")[2]} ${bulan
    .find(
      (item) =>
        item.nomor === paginationParams.value.dateRange.to?.split("-")[1],
    )
    ?.nama.slice(0, 3)} ${paginationParams.value.dateRange.to?.split("-")[0]}`;
});

async function getPaketSewaData() {
  try {
    paketSewaData.value = await backendFetch(paketSewaCrudChannelNames.GET_ALL);
  } catch (error: any) {
    $toast.error(error.message);
  }
}

async function getLaporanSewaData(showNotif: boolean = false) {
  try {
    loading.value = true;
    laporanSewaData.value = await backendFetch(
      laporanSewaCrudChannelNames.GET,
      {
        dataPerPage: paginationParams.value.dataPerPage,
        dateRange: {
          from: dateRangeFilterActive.value
            ? paginationParams.value.dateRange.from
            : "1970-01-01",
          to: paginationParams.value.dateRange.to,
        },
        query: paginationParams.value.query,
        sort: {
          by: paginationParams.value.sort.by,
          asc: paginationParams.value.sort.asc,
        },
        page: paginationParams.value.page,
      } as PaginationParams,
    );

    if (showNotif) $toast.success("Berhasil memuat ulang data laporan");
  } catch (error: any) {
    $toast.error(error.message);
  } finally {
    loading.value = false;
  }
}

async function resetFilterAndSorting() {
  dateRangeFilterActive.value = false;
  paginationParams.value = {
    dataPerPage: dataPerPage[0],
    dateRange: {
      from: dayjs().startOf("day").format("YYYY-MM-DD"),
      to: dayjs().endOf("day").format("YYYY-MM-DD"),
    },
    query: "",
    sort: {
      by: "tanggal_sewa",
      asc: false,
    },
    page: 1,
  };

  await getLaporanSewaData();
}

async function toggleStatusPengembalian() {
  try {
    await backendFetch(
      laporanSewaCrudChannelNames.UPDATE_STATUS,
      dataForManipulation.value?.id,
      dataForManipulation.value?.status === 1 ? 0 : 1,
    );
    await getLaporanSewaData();
    $toast.success(
      `Berhasil mengubah status data sewa id: ${dataForManipulation.value?.id}`,
    );

    showDialog.value = false;
  } catch (error: any) {
    $toast.error(error.message.split("Error: ")[1]);
  }
}

async function deleteLaporanSewa() {
  try {
    await backendFetch(
      laporanSewaCrudChannelNames.DELETE,
      idForDeleteOne.value,
    );
    await getLaporanSewaData();

    $toast.success("Berhasil menghapus data sewa");
    showDialog.value = false;
  } catch (error: any) {
    $toast.error(error.message.split("Error: ")[1]);
  }
}

async function bulkDeleteLaporanSewa() {
  try {
    await backendFetch(laporanSewaCrudChannelNames.BULK_DELETE, [
      ...selectedIds.value,
    ]);
    await getLaporanSewaData();

    $toast.success(`Berhasil menghapus ${selectedIds.value.length} data sewa`);
    selectedIds.value = [];
    showDialog.value = false;
  } catch (error: any) {
    $toast.error(error.message);
  }
}

function toggleRowSelection(id: number) {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id);
  } else {
    selectedIds.value.push(id);
  }
}

async function exportData(path: string, from: string, to: string) {
  try {
    await backendFetch(laporanSewaCrudChannelNames.EXPORT, path, from, to);
    showDialog.value =  false;
  } catch (error: any) {
    $toast.error(error.message);
  }
}

watch(
  [paginationParams.value],
  async () => {
    await getLaporanSewaData();
  },
  { deep: true },
);

onMounted(async () => {
  await getPaketSewaData();
  await getLaporanSewaData();

  setInterval(() => {
    todayInfo.value = dayjs().format("dddd, D MMMM YYYY | HH:mm");
  }, 60000);
});
</script>

<template>
  <div id="penyewaan-page" class="pa-4">
    <v-dialog attach="body" v-model="showDialog" max-width="800px">
      <FormTambahSewa
        v-if="whichForm === 'add'"
        @cancel="showDialog = false"
        :data-paket-sewa="paketSewaData"
        @submit="
          async () => {
            await getLaporanSewaData();
            showDialog = false;
          }
        "
      />
      <FormUpdateSewa
        v-if="whichForm === 'edit'"
        @cancel="showDialog = false"
        :data-for-update="dataForManipulation!"
        :data-paket-sewa="paketSewaData"
        @submit="
          async () => {
            await getLaporanSewaData();
            showDialog = false;
          }
        "
      />
      <FormPilihDateRange
        v-if="whichForm === 'date-range'"
        :pagination-params="paginationParams"
        @cancel="showDialog = false"
        @submit="
          async (fromResult, toResult) => {
            paginationParams.dateRange = {
              from: fromResult,
              to: toResult,
            };

            await getLaporanSewaData();
            showDialog = false;
          }
        "
      />
      <GeneralConfirmForm
        :text="`Tandai data sewa dgn ID ${dataForManipulation?.id} sbg ${
          dataForManipulation?.status
            ? '&quot;belum dikembalikan&quot;?'
            : '&quot;sudah dikembalikan&quot;?'
        }`"
        v-if="whichForm === 'status'"
        @cancel="showDialog = false"
        :dangerous="false"
        @submit="async () => await toggleStatusPengembalian()"
      />
      <GeneralConfirmForm
        dangerous
        :text="`Apakah Anda yakin ingin menghapus data dgn id ${idForDeleteOne}?`"
        v-if="whichForm === 'delete'"
        @cancel="showDialog = false"
        @submit="async () => await deleteLaporanSewa()"
      />
      <GeneralConfirmForm
        dangerous
        :text="`Anda akan menghapus ${selectedIds.length} data, lanjutkan?`"
        v-if="whichForm === 'bulk-delete'"
        @cancel="showDialog = false"
        @submit="async () => await bulkDeleteLaporanSewa()"
      />
      <FormEksporData
        v-if="whichForm === 'export'"
        :channel-to-get-data-count="laporanSewaCrudChannelNames.GET_COUNT_FROM_DATE_RANGE"
        :default-file-name="`laporan_sewa_${dayjs().format('YYYY-MM-DD HH:mm:ss')}.csv`"
        @submit="(path, from, to) => {
          exportData(path, from ,to);
        }"
        @cancel="showDialog = false"
      />
    </v-dialog>

    <!-- Tabel Laporan -->
    <v-table density="comfortable" class="rounded" v-if="laporanSewaData">
      <template v-slot:top>
        <div
          class="d-flex flex-column justify-space-between align-center gap-4 mb-4 pa-4"
        >
          <div class="font-weight-bold text-h6">Penyewaan</div>

          <div class="text-caption text-grey">{{ todayInfo }}</div>

          <div class="w-100 d-flex justify-space-between">
            <v-text-field
              style="max-width: 250px"
              density="compact"
              variant="outlined"
              label="Cari ..."
              append-inner-icon="mdi-magnify"
              single-line
              hide-details
              @click:append-inner="async () => await getLaporanSewaData()"
              v-model="paginationParams.query"
              clearable
              @click:clear="paginationParams.query = ''"
            ></v-text-field>
            <div>
              <v-tooltip
                content-class="bg-white"
                :text="`Hapus data terpilih (${selectedIds.length})`"
                location="top"
                v-if="selectedIds.length > 0"
              >
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-if="selectedIds.length > 0"
                    v-bind="props"
                    class="mr-2"
                    color="error"
                    size="small"
                    icon="mdi-delete-alert"
                    @click="
                      () => {
                        whichForm = 'bulk-delete';
                        showDialog = true;
                      }
                    "
                  ></v-btn>
                </template>
              </v-tooltip>
              <v-tooltip
                content-class="bg-white"
                :text="`Batalkan pemilihan data`"
                location="top"
                v-if="selectedIds.length > 0"
              >
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-if="selectedIds.length > 0"
                    v-bind="props"
                    class="mr-2"
                    color="warning"
                    size="small"
                    icon="mdi-select-off"
                    @click="selectedIds = []"
                  ></v-btn>
                </template>
              </v-tooltip>
              <v-btn
                class="mr-2"
                color="info"
                size="small"
                icon="mdi-refresh"
                @click="async () => await getLaporanSewaData(true)"
              ></v-btn>
              <v-btn
                class="mr-2"
                color="success"
                prepend-icon="mdi-file-export-outline"
                @click="
                  () => {
                    whichForm = 'export';
                    showDialog = true;
                  }
                "
                variant="tonal"
                >Ekspor</v-btn
              >
              <v-btn
                color="success"
                @click="
                  () => {
                    whichForm = 'add';
                    showDialog = true;
                  }
                "
                >Tambah</v-btn
              >
            </div>
          </div>

          <div
            id="params-date_range-sort-limit"
            class="w-100 d-flex justify-end gap-1 mt-4 align-center"
          >
            <v-tooltip
              content-class="bg-white"
              text="Reset filter"
              location="top"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  class="mr-4"
                  color="error"
                  size="small"
                  icon="mdi-filter-off-outline"
                  @click="resetFilterAndSorting"
                ></v-btn>
              </template>
            </v-tooltip>

            <v-divider class="mx-2" vertical thickness="2"></v-divider>

            <div class="d-flex align-center gap-2">
              <v-tooltip
                content-class="bg-white"
                :text="
                  dateRangeFilterActive
                    ? 'Nonaktifkan filter tanggal'
                    : 'Aktifkan filter tanggal'
                "
                location="top"
              >
                <template v-slot:activator="{ props }">
                  <v-checkbox
                    v-bind="props"
                    v-model="dateRangeFilterActive"
                    hide-details
                    @update:model-value="async () => await getLaporanSewaData()"
                  ></v-checkbox>
                </template>
              </v-tooltip>
              <v-tooltip
                content-class="bg-white"
                text="Tampilkan data dari tanggal brp sampai tanggal brp"
                location="top"
              >
                <template v-slot:activator="{ props }">
                  <v-btn
                    :disabled="!dateRangeFilterActive"
                    v-bind="props"
                    size="large"
                    prepend-icon="mdi-calendar"
                    hide-details
                    variant="outlined"
                    :text="`${dateRangeFromHumanize} &#8658; ${dateRangeToHumanize}`"
                    @click="
                      () => {
                        whichForm = 'date-range';
                        showDialog = true;
                      }
                    "
                  ></v-btn>
                </template>
              </v-tooltip>
            </div>

            <v-divider class="mx-2" vertical thickness="2"></v-divider>

            <v-select
              style="max-width: 180px"
              density="compact"
              hide-details
              variant="outlined"
              label="Urut berdasarkan"
              :items="sortChoices"
              v-model="paginationParams.sort.by"
            >
              <template v-slot:prepend-item>
                <v-radio-group
                  v-model="paginationParams.sort.asc"
                  inline
                  hide-details
                >
                  <v-radio :value="true" label="Menaik"></v-radio>
                  <v-radio :value="false" label="Menurun"></v-radio>
                </v-radio-group>
                <v-divider class="mt-2"></v-divider>
              </template>
            </v-select>

            <v-divider class="mx-2" vertical thickness="2"></v-divider>

            <v-select
              style="max-width: 120px"
              density="compact"
              hide-details
              variant="outlined"
              label="Data per halaman"
              :items="dataPerPage"
              v-model="paginationParams.dataPerPage"
            ></v-select>
          </div>
        </div>
        <v-divider :thickness="2"></v-divider>
      </template>

      <template v-slot:bottom>
        <v-divider :thickness="2"></v-divider>
        <div class="d-flex justify-space-between pa-4 align-center">
          <div class="text-subtitle-2" style="flex-shrink: 0">
            Total: {{ laporanSewaData?.pagination.total ?? 0 }} data
          </div>
          <div
            class="d-flex justify-end"
            style="max-width: 500px; flex-grow: 1"
          >
            <v-pagination
              density="compact"
              :length="laporanSewaData?.pagination.pageCount"
              v-model="paginationParams.page"
              @update:model-value="async () => await getLaporanSewaData()"
            ></v-pagination>
          </div>
        </div>
      </template>

      <thead>
        <tr>
          <th
            class="whitespace-nowrap text-subtitle-2 font-weight-bold"
            style="min-width: 60px"
            v-if="store.session.full_access === 1"
          >
            <!-- <v-btn :icon="selectionState === 'all' ? 'mdi-checkbox-marked' : selectionState === 'some' ? 'mdi-minus-box' : 'mdi-checkbox-blank-outline'" density="compact"></v-btn> -->
            Pilih ({{ selectedIds.length }})
          </th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">Id</th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">
            Operator
          </th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">
            Nama Penyewa
          </th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">
            Alamat Penyewa
          </th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">
            Kontak Penyewa
          </th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">
            Paket Sewa
          </th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">
            Tanggal Sewa
          </th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">
            Total Bayar
          </th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">
            Sudah dikembalikan?
          </th>
          <th
            class="whitespace-nowrap text-subtitle-2 font-weight-bold"
            v-if="store.session.full_access === 1"
          >
            Aksi
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="laporan in laporanSewaData?.data"
          class="laporan-sewa-data-row"
        >
          <td
            class="laporan-sewa-data-cell"
            style="min-width: 60px"
            v-if="store.session.full_access === 1"
          >
            <v-btn
              density="compact"
              :icon="
                selectedIds.includes(laporan.id!)
                  ? 'mdi-checkbox-marked'
                  : 'mdi-checkbox-blank-outline'
              "
              @click="toggleRowSelection(laporan.id!)"
            ></v-btn>
          </td>
          <td
            class="laporan-sewa-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
            :title="laporan.id?.toString()"
          >
            {{ laporan.id }}
          </td>
          <td
            class="laporan-sewa-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
            :title="laporan.op"
          >
            {{ laporan.op }}
          </td>
          <td
            class="laporan-sewa-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
            :title="laporan.nama_penyewa"
          >
            {{ laporan.nama_penyewa }}
          </td>
          <td
            class="laporan-sewa-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
            :title="laporan.alamat_penyewa"
          >
            {{ laporan.alamat_penyewa }}
          </td>
          <td
            class="laporan-sewa-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
            :title="laporan.kontak_penyewa"
          >
            {{ laporan.kontak_penyewa }}
          </td>
          <td
            class="laporan-sewa-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
            :title="laporan.paket_sewa"
          >
            {{ laporan.paket_sewa }}
          </td>
          <td
            class="laporan-sewa-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
            :title="laporan.tanggal_sewa"
          >
            {{ laporan.tanggal_sewa }}
          </td>
          <td
            class="laporan-sewa-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
            :title="formatRupiah(laporan.total_bayar)"
          >
            {{ formatRupiah(laporan.total_bayar) }}
          </td>
          <td
            :class="[
              laporan.status ? 'text-success' : 'text-grey',
              'd-flex gap-2 align-center',
            ]"
            :title="laporan.status ? 'Sudah' : 'Belum'"
          >
            {{ laporan.status ? "Sudah" : "Belum" }}
            <v-tooltip
              content-class="bg-white"
              text="Ubah status pengembalian"
              location="top"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  size="x-small"
                  icon="mdi-pencil-box"
                  :color="laporan.status ? 'success' : ''"
                  :variant="laporan.status ? 'elevated' : 'tonal'"
                  :disabled="selectedIds.length !== 0"
                  @click="
                    () => {
                      dataForManipulation = laporan;
                      whichForm = 'status';
                      showDialog = true;
                    }
                  "
                ></v-btn>
              </template>
            </v-tooltip>
          </td>
          <td v-if="store.session.full_access === 1">
            <div class="d-flex gap-1">
              <v-tooltip content-class="bg-white" text="Edit" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    :disabled="selectedIds.length !== 0"
                    v-bind="props"
                    size="x-small"
                    icon="mdi-pencil"
                    color="success"
                    @click="
                      () => {
                        dataForManipulation = laporan;
                        whichForm = 'edit';
                        showDialog = true;
                      }
                    "
                  ></v-btn>
                </template>
              </v-tooltip>
              <v-tooltip content-class="bg-white" text="Hapus" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    :disabled="selectedIds.length !== 0"
                    v-bind="props"
                    size="x-small"
                    icon="mdi-delete"
                    color="error"
                    @click="
                      () => {
                        idForDeleteOne = laporan.id;
                        whichForm = 'delete';
                        showDialog = true;
                      }
                    "
                  ></v-btn>
                </template>
              </v-tooltip>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<style scoped>
.laporan-sewa-data-cell {
  max-width: 250px;
  overflow-x: hidden;
  text-overflow: ellipsis;
}
.laporan-sewa-data-row:hover {
  background-color: #212f3a;
}
</style>
