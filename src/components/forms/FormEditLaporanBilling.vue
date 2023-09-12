<script setup lang="ts">
// import { useToast } from "vue-toast-notification";
import { LaporanBilling } from "../../../electron/@types/models";

const props = defineProps<{
  data: LaporanBilling;
}>();

const emits = defineEmits(["cancel", "submit"]);
const form = reactive(props.data);
// const $toast = useToast();
const valid = ref<boolean | null>();
// const additionalErrors = ref("");

async function onSubmit() {
  emits("submit");
}

function onCancel() {
  emits("cancel");
}
</script>

<template>
  <v-card :title="`Edit Laporan Billing. Id: ${data.id}`">
    <v-form
      class="pa-4"
      @submit.prevent="onSubmit"
      validate-on="lazy"
      v-model="valid"
    >
      <v-text-field
        v-model="form.op"
        variant="solo-filled"
        label="Operator"
      ></v-text-field>
      <v-text-field
        v-model="form.nomor_meja"
        variant="solo-filled"
        label="Nomor Meja"
      ></v-text-field>
      <v-text-field
        v-model="form.versi_ps"
        variant="solo-filled"
        label="Versi PS"
      ></v-text-field>
      <v-radio-group v-model="form.jenis_main" label="Jenis Main">
        <v-radio label="Di waktu" value="diwaktu"></v-radio>
        <v-radio label="Los" value="los"></v-radio>
      </v-radio-group>
      <v-text-field
        v-model="form.paket_main"
        variant="solo-filled"
        label="Paket Main"
      ></v-text-field>

      <div>
        
      </div>
      <div class="d-flex justify-end gap-2 mt-2">
        <v-btn variant="tonal" @click="onCancel">Batal</v-btn>
        <v-btn type="submit" variant="tonal" color="success">OK</v-btn>
      </div>
    </v-form>
  </v-card>
</template>

<style></style>
