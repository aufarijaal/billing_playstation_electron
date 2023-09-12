<script setup lang="ts">
import { computed, ref } from "vue";
import useMainStore from "./store";
import { useRouter } from "vue-router";
import backendFetch from "./utils/backend-fetch";
import mejaMainCrudChannelNames from "../electron/channel_names/meja-main-crud-channel-names";
import { MejaMain } from "../electron/@types/models";

const store = useMainStore();
const drawer = ref(false);
const router = useRouter();
const appBarTitle = computed(() => {
  switch (router.currentRoute.value.name) {
    case "billing":
      return {
        title: "Billing Playstation",
        icon: "mdi-gamepad",
      };
      break;
    case "sewa":
      return {
        title: "Sewa",
        icon: "mdi-handshake",
      };
      break;
    case "laporan_billing":
      return {
        title: "Laporan Billing",
        icon: "mdi-chart-box",
      };
      break;
    case "laporan_sewa":
      return {
        title: "Laporan Sewa",
        icon: "mdi-table-key",
      };
      break;
    case "pengaturan_aplikasi":
      return {
        title: "Pengaturan Aplikasi",
        icon: "mdi-application-cog",
      };
      break;
    case "pengaturan_operator":
      return {
        title: "Pengaturan Operator",
        icon: "mdi-account-cog",
      };
      break;
    case "pengaturan_logistik":
      return {
        title: "Pengaturan Logistik",
        icon: "mdi-cookie-cog",
      };
      break;
    case "pengaturan_sewa":
      return {
        title: "Pengaturan Penyewaan",
        icon: "mdi-book-cog",
      };
      break;
    case "pengeluaran":
      return {
        title: "Pengeluaran",
        icon: "mdi-cash",
      };
      break;
    default:
      break;
  }
});
const listNomorMejaMain = ref();

watch(
  () => router.currentRoute.value.name,
  async () => {
    if (router.currentRoute.value.name === "billing") {
      const dataMejaMain: MejaMain[] = await backendFetch(
        mejaMainCrudChannelNames.GET_ALL,
      );
      listNomorMejaMain.value = dataMejaMain.map((meja) => meja.nomor_meja);
    }
  },
  { immediate: true },
);

onMounted(() => {
  document.addEventListener("keyup", (event) => {
    if (event.ctrlKey && event.key === "b" && !store.showLoginDialog) {
      drawer.value = !drawer.value;
    }
  });
});
</script>
<template>
  <v-app :theme="store.theme">
    <!-- DIALOGS -->
    <LoginDialog />

    <v-app-bar
      :color="store.session.full_access === 0 ? 'default' : 'info'"
      density="comfortable"
    >
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      </template>

      <v-app-bar-title>
        <div class="d-flex align-center">
          <v-icon
            :icon="appBarTitle ? appBarTitle.icon : 'mdi-gamepad'"
            size="24"
          />
          <span class="ml-2">{{
            appBarTitle ? appBarTitle.title : "Billing Playstation"
          }}</span>
        </div>
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <!-- <v-btn icon @click="store.theme = store.theme === 'dark' ? 'light' : 'dark'">
                <v-icon icon="mdi-weather-sunny" v-if="store.theme == 'light'" />
                <v-icon icon="mdi-weather-night" v-else />
            </v-btn> -->
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary>
      <v-list density="compact">
        <v-list-item
          to="/"
          prepend-icon="mdi-gamepad"
          title="Billing"
          value="billing"
        />
        <v-list-item
          to="/penyewaan"
          prepend-icon="mdi-handshake"
          title="Penyewaan"
          value="penyewaan"
        />

        <div v-if="store.session.full_access === 1">
          <v-list-subheader class="mt-5">Laporan</v-list-subheader>
          <v-list-item
            to="/laporan_billing"
            prepend-icon="mdi-chart-box"
            title="Laporan Billing"
            value="laporan_billing"
          />
          <v-list-item
            to="/pengeluaran"
            prepend-icon="mdi-cash"
            title="Pengeluaran"
            value="pengeluaran"
          />

          <v-list-subheader class="mt-5">Pengaturan</v-list-subheader>
          <v-list-item
            to="/pengaturan_operator"
            prepend-icon="mdi-account-cog"
            title="Atur Operator"
            value="operator"
          />
          <v-list-item
            to="/pengaturan_aplikasi"
            prepend-icon="mdi-application-cog"
            title="Atur Aplikasi"
            value="aplikasi"
          />
          <v-list-item
            to="/pengaturan_logistik"
            prepend-icon="mdi-cookie-cog"
            title="Atur Logistik"
            value="logistik"
          />
          <v-list-item
            to="/pengaturan_sewa"
            prepend-icon="mdi-book-cog"
            title="Atur Penyewaan"
            value="pengaturan_sewa"
          />
        </div>
      </v-list>

      <template v-slot:append>
        <div
          :class="
            store.session.full_access === 0
              ? 'bg-grey-darken-3'
              : 'bg-blue-darken-3'
          "
        >
          <v-list-item
            v-if="store.isSessionValid"
            lines="two"
            :title="store.session.username"
            :subtitle="`Login pada ${store.session.logged_in_at}`"
          />
          <v-list-item
            :prepend-icon="
              store.isSessionValid ? 'mdi-login' : 'mdi-account-switch-outline'
            "
            :title="store.isSessionValid === null ? 'Login' : 'Ganti Operator'"
            value="login"
            @click="store.showLoginDialog = true"
          />
        </div>
      </template>
    </v-navigation-drawer>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style>
html {
  overflow-y: auto;
}

.v-application--wrap {
  min-height: 100vh !important;
  overflow-y: auto;
}
</style>
