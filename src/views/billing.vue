<script setup lang="ts">
import { onBeforeRouteLeave } from "vue-router";
import logistikCrudChannelNames from "../../electron/channel_names/logistik-crud-channel-names";
import mejaMainCrudChannelNames from "../../electron/channel_names/meja-main-crud-channel-names";
import useMainStore from "../store";
import backendFetch from "../utils/backend-fetch";
import { useToast } from "vue-toast-notification";

// Reactive data
const $toast = useToast();
const store = useMainStore();
const dataMejaMain = ref<{ nomor_meja: number; versi_ps: number }[]>([]);
const dataKonsumsi = ref();
const mejaMainTampilSaatIni = ref();

// Functions
async function getDataMejaMain() {
  const result = await backendFetch(mejaMainCrudChannelNames.GET_ALL);

  dataMejaMain.value.push(...result);
}

async function getDataKonsumsi() {
  dataKonsumsi.value = await backendFetch(logistikCrudChannelNames.GET_ALL);
}

// Watchers
// Watcher untuk mengelola background timeout untuk meja yg sedang tidak ditampilkan.
watch(mejaMainTampilSaatIni, async (newNomorMeja, _oldNomorMeja) => {
  try {
    const hiddenDesks = dataMejaMain.value
      .filter((meja) => meja.nomor_meja !== newNomorMeja)
      .map((meja) => meja.nomor_meja);
    const sisaSisaWaktu: {
      nomor_meja: number;
      waktu_selesai: string;
      timeout: number;
    }[] = await backendFetch(
      mejaMainCrudChannelNames.GET_SISA_WAKTU,
      hiddenDesks,
    );

    store.cancelTimeout(newNomorMeja);

    if (sisaSisaWaktu.length) {
      for (let i = 0; i < sisaSisaWaktu.length; i++) {
        store.runTimeout(sisaSisaWaktu[i].nomor_meja, sisaSisaWaktu[i].timeout);
      }
    }
  } catch (error: any) {
    $toast.error(error.message);
  }
});

// Lifecycle hooks
onMounted(async () => {
  await getDataMejaMain();
  await getDataKonsumsi();

  mejaMainTampilSaatIni.value = dataMejaMain.value[0].nomor_meja;
});

onBeforeRouteLeave(async () => {
  const sisaSisaWaktu: {
    nomor_meja: number;
    waktu_selesai: string;
    timeout: number;
  }[] = await backendFetch(
    mejaMainCrudChannelNames.GET_SISA_WAKTU,
    dataMejaMain.value.map((meja) => meja.nomor_meja),
  );

  store.cancelAllTimeout();

  if (sisaSisaWaktu.length) {
    for (let i = 0; i < sisaSisaWaktu.length; i++) {
      store.runTimeout(sisaSisaWaktu[i].nomor_meja, sisaSisaWaktu[i].timeout);
    }
  }
});
</script>

<template>
  <div
    id="billing-page"
    class="d-flex flex-wrap justify-center align-center pa-2"
    style="gap: 0.5rem"
  >
    <v-card v-if="dataMejaMain">
      <v-tabs
        show-arrows
        v-model="mejaMainTampilSaatIni"
        density="compact"
        center-active
        bg-color="indigo"
      >
        <v-tab
          :rounded="false"
          :value="meja.nomor_meja"
          v-for="meja in dataMejaMain"
          :key="meja.nomor_meja"
          >Meja {{ meja.nomor_meja }}</v-tab
        >
      </v-tabs>

      <v-window v-model="mejaMainTampilSaatIni">
        <v-window-item
          v-for="meja in dataMejaMain"
          :value="meja.nomor_meja"
          :key="meja.nomor_meja"
        >
          <v-card
            height="calc(100vh - 56px - 16px - 48px)"
            style="overflow: auto"
          >
            <meja-main :data-meja="meja" :data-konsumsi="dataKonsumsi" />
          </v-card>
        </v-window-item>
      </v-window>
    </v-card>

    <v-alert v-else text="Tidak ada data meja main." type="error"></v-alert>
  </div>
</template>
