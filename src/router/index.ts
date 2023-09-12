import {
  createRouter,
  createWebHistory,
  RouteRecordRaw,
} from "vue-router";
import billing from "../views/billing.vue";
import laporan_billing from "../views/laporan_billing.vue";
import penyewaan from "../views/penyewaan.vue";
import pengaturan_aplikasi from "../views/pengaturan_aplikasi.vue";
import pengaturan_operator from "../views/pengaturan_operator.vue";
import pengaturan_logistik from "../views/pengaturan_logistik.vue";
import pengaturan_sewa from "../views/pengaturan_sewa.vue";
import pengeluaran from "../views/pengeluaran.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "billing",
    component: billing,
  },
  {
    path: "/laporan_billing",
    name: "laporan_billing",
    component: laporan_billing,
  },
  {
    path: "/penyewaan",
    name: "penyewaan",
    component: penyewaan,
  },
  {
    path: "/pengaturan_aplikasi",
    name: "pengaturan_aplikasi",
    component: pengaturan_aplikasi,
  },
  {
    path: "/pengaturan_operator",
    name: "pengaturan_operator",
    component: pengaturan_operator,
  },
  {
    path: "/pengaturan_logistik",
    name: "pengaturan_logistik",
    component: pengaturan_logistik,
  },
  {
    path: "/pengaturan_sewa",
    name: "pengaturan_sewa",
    component: pengaturan_sewa,
  },
  {
    path: "/pengeluaran",
    name: "pengeluaran",
    component: pengeluaran,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
