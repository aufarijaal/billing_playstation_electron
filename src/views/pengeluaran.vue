<script setup lang="ts">
import { Pengeluaran } from "../../electron/@types/models";
import pengeluaranCrudChannelNames from "../../electron/channel_names/pengeluaran-crud-channel-names";
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
  { title: "ID", value: "id" },
  { title: "Operator", value: "op" },
  { title: "Deskripsi", value: "deskripsi" },
  { title: "Nominal", value: "nominal" },
  { title: "Dikeluarkan pada", value: "dikeluarkan_pada" },
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
const pengeluaranData = ref<{
  data: Pengeluaran[];
  pagination: PaginationResponse;
}>();
const whichForm = ref<
  "add" | "edit" | "delete" | "bulk-delete" | "date-range" | "export"
>("add");
const showDialog = ref(false);
const loading = ref(false);
const dateRangeFilterActive = ref(false);
const todayInfo = ref(dayjs().format("dddd, D MMMM YYYY | HH:mm"));
const dataForManipulation = ref<Pengeluaran>();
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
    by: "dikeluarkan_pada",
    asc: false,
  },
  page: 1,
});

const dateRangeFromHumanize = computed(() => {
  return `${paginationParams.value.dateRange.from?.split("-")[2]} ${bulan
    .find(
      (item) =>
        item.nomor === paginationParams.value.dateRange.from?.split("-")[1]
    )
    ?.nama.slice(0, 3)} ${
    paginationParams.value.dateRange.from?.split("-")[0]
  }`;
});

const dateRangeToHumanize = computed(() => {
  return `${paginationParams.value.dateRange.to?.split("-")[2]} ${bulan
    .find(
      (item) =>
        item.nomor === paginationParams.value.dateRange.to?.split("-")[1]
    )
    ?.nama.slice(0, 3)} ${paginationParams.value.dateRange.to?.split("-")[0]}`;
});

async function getPengeluaranData(showNotif: boolean = false) {
  try {
    loading.value = true;
    pengeluaranData.value = await backendFetch(
      pengeluaranCrudChannelNames.GET,
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
      } as PaginationParams
    );

    if (showNotif) $toast.success("Berhasil memuat ulang data pengeluaran");
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
      by: "dikeluarkan_pada",
      asc: false,
    },
    page: 1,
  };

  await getPengeluaranData();
}

async function deletePengeluaran() {
  try {
    await backendFetch(
      pengeluaranCrudChannelNames.DELETE,
      idForDeleteOne.value
    );
    await getPengeluaranData();

    $toast.success("Berhasil menghapus data pengeluaran");
    showDialog.value = false;
  } catch (error: any) {
    $toast.error(error.message.split("Error: ")[1]);
  }
}

async function bulkDeletePengeluaran() {
  try {
    await backendFetch(pengeluaranCrudChannelNames.BULK_DELETE, [
      ...selectedIds.value,
    ]);
    await getPengeluaranData();

    $toast.success(
      `Berhasil menghapus ${selectedIds.value.length} data pengeluaran`
    );
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
    await backendFetch(pengeluaranCrudChannelNames.EXPORT, path, from, to);
    showDialog.value = false;
  } catch (error: any) {
    $toast.error(error.message);
  }
}

watch(
  [paginationParams.value],
  async () => {
    await getPengeluaranData();
  },
  { deep: true }
);

onMounted(async () => {
  await getPengeluaranData();

  setInterval(() => {
    todayInfo.value = dayjs().format("dddd, D MMMM YYYY | HH:mm");
  }, 60000);
});
</script>

<template>
  <div id="pengeluaran-page" class="pa-4">
    <!-- <VueJsonPretty :data="paginationParams" />
        <VueJsonPretty :data="pengeluaranData" /> -->
    <v-dialog attach="body" v-model="showDialog" max-width="800px">
      <FormTambahPengeluaran
        v-if="whichForm === 'add'"
        @cancel="showDialog = false"
        @submit="
          async () => {
            await getPengeluaranData();
            showDialog = false;
          }
        "
      />
      <FormUpdatePengeluaran
        v-if="whichForm === 'edit'"
        @cancel="showDialog = false"
        :data-for-update="dataForManipulation!"
        @submit="
          async () => {
            await getPengeluaranData();
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

            await getPengeluaranData();
            showDialog = false;
          }
        "
      />
      <GeneralConfirmForm
        :text="`Apakah Anda yakin ingin menghapus data pengeluaran dgn id: ${idForDeleteOne}?`"
        v-if="whichForm === 'delete'"
        @cancel="showDialog = false"
        @submit="async () => await deletePengeluaran()"
        dangerous
      />
      <GeneralConfirmForm
        :text="`Anda akan menghapus ${selectedIds.length} data, lanjutkan?`"
        v-if="whichForm === 'bulk-delete'"
        @cancel="showDialog = false"
        @submit="async () => await bulkDeletePengeluaran()"
        dangerous
      />
      <FormEksporData
        v-if="whichForm === 'export'"
        :channel-to-get-data-count="
          pengeluaranCrudChannelNames.GET_COUNT_FROM_DATE_RANGE
        "
        :default-file-name="`pengeluaran_${dayjs().format(
          'YYYY-MM-DD HH:mm:ss'
        )}.csv`"
        @submit="
          (path, from, to) => {
            exportData(path, from, to);
          }
        "
        @cancel="showDialog = false"
      />
    </v-dialog>

    <!-- Tabel Pengeluaran -->
    <v-table density="comfortable" class="rounded" v-if="pengeluaranData">
      <template v-slot:top>
        <div
          class="d-flex flex-column justify-space-between align-center gap-4 mb-4 pa-4"
        >
          <div class="font-weight-bold text-h6">Pengeluaran</div>

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
              @click:append-inner="async () => await getPengeluaranData()"
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
                @click="async () => await getPengeluaranData(true)"
              ></v-btn>
              <v-btn
                class="mr-2"
                text="Ekspor"
                color="success"
                variant="tonal"
                prepend-icon="mdi-file-export-outline"
                @click="
                  () => {
                    whichForm = 'export';
                    showDialog = true;
                  }
                "
              ></v-btn>
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
                    @update:model-value="async () => await getPengeluaranData()"
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
            Total: {{ pengeluaranData?.pagination.total ?? 0 }} data
          </div>
          <div
            class="d-flex justify-end"
            style="max-width: 500px; flex-grow: 1"
          >
            <v-pagination
              density="compact"
              :length="pengeluaranData?.pagination.pageCount"
              v-model="paginationParams.page"
              @update:model-value="async () => await getPengeluaranData()"
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
            Deskripsi
          </th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">
            Nominal
          </th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">
            Dikeluarkan Pada
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
        <tr v-for="item in pengeluaranData?.data" class="pengeluaran-data-row">
          <td
            class="pengeluaran-data-cell"
            style="min-width: 60px"
            v-if="store.session.full_access === 1"
          >
            <v-btn
              density="compact"
              :icon="
                selectedIds.includes(item.id!)
                  ? 'mdi-checkbox-marked'
                  : 'mdi-checkbox-blank-outline'
              "
              @click="toggleRowSelection(item.id!)"
            ></v-btn>
          </td>
          <td
            class="pengeluaran-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
            :title="item.id?.toString()"
          >
            {{ item.id }}
          </td>
          <td
            class="pengeluaran-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
            :title="item.op"
          >
            {{ item.op }}
          </td>
          <td
            class="pengeluaran-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
            :title="item.deskripsi"
          >
            {{ item.deskripsi }}
          </td>
          <td
            class="pengeluaran-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
            :title="formatRupiah(item.nominal)"
          >
            {{ formatRupiah(item.nominal) }}
          </td>
          <td
            class="pengeluaran-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
            :title="item.dikeluarkan_pada"
          >
            {{ item.dikeluarkan_pada }}
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
                        dataForManipulation = item;
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
                        idForDeleteOne = item.id;
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
.pengeluaran-data-cell {
  max-width: 250px;
  overflow-x: hidden;
  text-overflow: ellipsis;
}
.pengeluaran-data-row:hover {
  background-color: #212f3a;
}
</style>
