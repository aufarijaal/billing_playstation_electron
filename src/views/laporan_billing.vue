<script setup lang="ts">
import { LaporanBilling } from "../../electron/@types/models";
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
import laporanBillingCrudChannelNames from "../../electron/channel_names/laporan-billing-crud-channel-names";

dayjs.extend(localizedFormat);
dayjs.locale(idLocale);

const sortChoices = [
  { title: "Tanggal", value: "tanggal" },
  { title: "Id", value: "id" },
  { title: "Operator", value: "op" },
  { title: "Nomor Meja", value: "nomor_meja" },
  { title: "Versi PS", value: "versi_ps" },
  { title: "Jenis Main", value: "jenis_main" },
  { title: "Total Bayar Main", value: "total_bayar_main" },
  { title: "Total Bayar Konsumsi", value: "total_bayar_konsumsi" },
  { title: "Total Bayar Semua", value: "total_bayar_semua" },
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
const laporanBillingData = ref<{
  data: LaporanBilling[];
  pagination: PaginationResponse;
}>();
const whichForm = ref<
  "edit" | "delete" | "bulk-delete" | "date-range" | "export"
>("delete");
const showDialog = ref(false);
const loading = ref(false);
const dateRangeFilterActive = ref(false);
const todayInfo = ref(dayjs().format("dddd, D MMMM YYYY | HH:mm"));
const dataForManipulation = ref<LaporanBilling>();
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
    by: "id",
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

const dialogWidth = computed(() => {
  switch (whichForm.value) {
    case "export":
      return 450;
      break;
    default:
      break;
  }
});

async function getLaporanBillingData(showNotif: boolean = false) {
  try {
    loading.value = true;
    laporanBillingData.value = await backendFetch(
      laporanBillingCrudChannelNames.GET,
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
      by: "id",
      asc: false,
    },
    page: 1,
  };

  await getLaporanBillingData();
}

async function deleteLaporanBilling() {
  try {
    await backendFetch(
      laporanBillingCrudChannelNames.DELETE,
      idForDeleteOne.value
    );
    await getLaporanBillingData();

    $toast.success("Berhasil menghapus data");
    showDialog.value = false;
  } catch (error: any) {
    $toast.error(error.message.split("Error: ")[1]);
  }
}

async function bulkDeleteLaporanSewa() {
  try {
    await backendFetch(laporanBillingCrudChannelNames.BULK_DELETE, [
      ...selectedIds.value,
    ]);
    await getLaporanBillingData();

    $toast.success(`Berhasil menghapus ${selectedIds.value.length} data`);
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
    await backendFetch(laporanBillingCrudChannelNames.EXPORT, path, from, to);
    showDialog.value = false;
  } catch (error: any) {
    $toast.error(error.message);
  }
}

watch(
  [paginationParams.value],
  async () => {
    await getLaporanBillingData();
  },
  { deep: true }
);

onMounted(async () => {
  await getLaporanBillingData();

  setInterval(() => {
    todayInfo.value = dayjs().format("dddd, D MMMM YYYY | HH:mm");
  }, 60000);
});
</script>

<template>
  <div id="penyewaan-page" class="pa-4">
    <v-dialog
      attach="body"
      v-model="showDialog"
      max-width="800px"
      :width="dialogWidth"
    >
      <FormEditLaporanBilling
        :data="dataForManipulation!"
        v-if="whichForm === 'edit'"
        @cancel="showDialog = false"
        @submit="
          async () => {
            await getLaporanBillingData();
            showDialog = false;
          }
        "
      >
      </FormEditLaporanBilling>
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

            await getLaporanBillingData();
            showDialog = false;
          }
        "
      />
      <GeneralConfirmForm
        dangerous
        :text="`Apakah Anda yakin ingin menghapus data dgn id ${idForDeleteOne}?`"
        v-if="whichForm === 'delete'"
        @cancel="showDialog = false"
        @submit="async () => await deleteLaporanBilling()"
      />
      <GeneralConfirmForm
        dangerous
        :text="`Anda akan menghapus ${selectedIds.length} data, lanjutkan?`"
        v-if="whichForm === 'bulk-delete'"
        @cancel="showDialog = false"
        @submit="async () => await bulkDeleteLaporanSewa()"
      />

      <!-- Form pilih date range untuk ekspor -->
      <FormEksporData
        v-if="whichForm === 'export'"
        :channel-to-get-data-count="
          laporanBillingCrudChannelNames.GET_COUNT_FROM_DATE_RANGE
        "
        :default-file-name="`laporan_billing_${dayjs().format(
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

    <!-- Tabel Laporan -->
    <v-table density="comfortable" class="rounded" v-if="laporanBillingData">
      <template v-slot:top>
        <div
          class="d-flex flex-column justify-space-between align-center gap-4 mb-4 pa-4"
        >
          <div class="font-weight-bold text-h6">Laporan Billing</div>

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
              @click:append-inner="async () => await getLaporanBillingData()"
              v-model="paginationParams.query"
              clearable
              @click:clear="paginationParams.query = ''"
            ></v-text-field>
            <div class="d-flex">
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
                @click="async () => await getLaporanBillingData(true)"
              ></v-btn>
              <v-btn
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
                    @update:model-value="
                      async () => await getLaporanBillingData()
                    "
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
            Total: {{ laporanBillingData?.pagination.total ?? 0 }} data
          </div>
          <div
            class="d-flex justify-end"
            style="max-width: 500px; flex-grow: 1"
          >
            <v-pagination
              density="compact"
              :length="laporanBillingData?.pagination.pageCount"
              v-model="paginationParams.page"
              @update:model-value="async () => await getLaporanBillingData()"
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
            Pilih ({{ selectedIds.length }})
          </th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">Id</th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">
            Operator
          </th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">
            Nomor Meja
          </th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">
            Versi PS
          </th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">
            Jenis Main
          </th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">
            Paket Main
          </th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">
            Waktu Mulai
          </th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">
            Waktu Selesai
          </th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">
            Lama Main
          </th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">
            Konsumsi
          </th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">
            Total Bayar Main
          </th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">
            Total Bayar Konsumsi
          </th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">
            Total
          </th>
          <th class="whitespace-nowrap text-subtitle-2 font-weight-bold">
            Aksi
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="laporan in laporanBillingData?.data"
          class="laporan-sewa-data-row"
        >
          <td
            class="laporan-billing-data-cell"
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
            class="laporan-billing-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
            :title="laporan.id?.toString()"
          >
            {{ laporan.id }}
          </td>
          <td
            class="laporan-billing-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
            :title="laporan.op"
          >
            {{ laporan.op }}
          </td>
          <td
            class="laporan-billing-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
            :title="laporan.nomor_meja.toString()"
          >
            {{ laporan.nomor_meja }}
          </td>
          <td
            class="laporan-billing-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
            :title="laporan.versi_ps.toString()"
          >
            {{ laporan.versi_ps }}
          </td>
          <td
            :class="[
              'laporan-billing-data-cell whitespace-nowrap text-subtitle-2 font-weight-medium',
              laporan.jenis_main === 'diwaktu'
                ? 'text-green-lighten-2'
                : 'text-blue-lighten-2',
            ]"
            :title="laporan.jenis_main"
          >
            {{ laporan.jenis_main }}
          </td>
          <td
            :class="[
              'laporan-billing-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular',
              !laporan.paket_main ? 'text-grey-darken-1' : '',
            ]"
            :title="laporan.paket_main"
          >
            {{ laporan.paket_main ?? "Tidak ada" }}
          </td>
          <td
            class="laporan-billing-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
            :title="laporan.waktu_mulai"
          >
            {{ laporan.waktu_mulai }}
          </td>
          <td
            class="laporan-billing-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
            :title="laporan.waktu_selesai"
          >
            {{ laporan.waktu_selesai }}
          </td>
          <td
            class="laporan-billing-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
            :title="laporan.lama_main"
          >
            {{ laporan.lama_main }}
          </td>
          <td
            class="laporan-billing-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
          >
            <v-menu open-on-hover :open-delay="0">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  text="Lihat"
                  prepend-icon="mdi-information-outline"
                  variant="tonal"
                  size="small"
                  color="light-blue"
                ></v-btn>
              </template>

              <v-card border elevation="5">
                <v-table density="compact" height="250" fixed-header>
                  <thead>
                    <tr>
                      <th class="whitespace-nowrap">Nama Produk</th>
                      <th class="whitespace-nowrap">Jumlah</th>
                      <th class="whitespace-nowrap">Bayar</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="konsumsi in JSON.parse(laporan.konsumsi ?? '[]')"
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
                    </tr>
                  </tbody>

                  <template #bottom>
                    <v-divider></v-divider>
                    <div
                      class="d-flex justify-space-between align-center px-4 py-2"
                    >
                      <div>Total:</div>

                      <div class="font-weight-bold">
                        {{
                          laporan.konsumsi === "[]"
                            ? "Rp. 0"
                            : formatRupiah(
                                JSON.parse(laporan.konsumsi ?? "[]").reduce(
                                  (acc: number, konsumsi: any) =>
                                    acc + konsumsi.bayar,
                                  0
                                ) ?? 0
                              )
                        }}
                      </div>
                    </div>
                  </template>
                </v-table>
              </v-card>
            </v-menu>
          </td>
          <td
            class="laporan-billing-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
            :title="formatRupiah(laporan.total_bayar_main)"
          >
            {{ formatRupiah(laporan.total_bayar_main) }}
          </td>
          <td
            class="laporan-billing-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
            :title="formatRupiah(laporan.total_bayar_konsumsi)"
          >
            {{ formatRupiah(laporan.total_bayar_konsumsi) }}
          </td>
          <td
            class="laporan-billing-data-cell whitespace-nowrap text-subtitle-2 font-weight-regular"
            :title="formatRupiah(laporan.total_bayar_semua)"
          >
            {{ formatRupiah(laporan.total_bayar_semua) }}
          </td>
          <td>
            <div class="d-flex gap-1">
              <v-tooltip content-class="bg-white" text="Cetak" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    :disabled="selectedIds.length !== 0"
                    v-bind="props"
                    size="x-small"
                    icon="mdi-printer"
                    color="warning"
                    @click="() => {}"
                  ></v-btn>
                </template>
              </v-tooltip>

              <div v-if="store.session.full_access === 1" class="d-flex gap-1">
                <!-- <v-tooltip content-class="bg-white" text="Edit" location="top">
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
                </v-tooltip> -->

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
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<style scoped>
.laporan-billing-data-cell {
  max-width: 250px;
  overflow-x: hidden;
  text-overflow: ellipsis;
}
.laporan-billing-data-row:hover {
  background-color: #212f3a;
}

th.tbl-laporan-billing-header {
  white-space: nowrap;
}
</style>
