<script setup lang="ts">
import { useToast } from "vue-toast-notification";
import logistikCrudChannelNames from "../../../electron/channel_names/logistik-crud-channel-names";
import backendFetch from "../../utils/backend-fetch";

const emits = defineEmits(["cancel", "submit"]);

const form = reactive({
  nama_produk: "",
  harga: 0,
});
const $toast = useToast();
const valid = ref<boolean | null>();
const additionalErrors = ref("");

const rules = ref({
  nama_produk: [
    (value: string) => {
      if (value) return true;
      return "Nama produk harus diisi!";
    },
  ],
  harga: [
    (value: number) => {
      if (value > 0) return true;
      return "Harga tidak boleh nol!";
    },
  ],
});

async function onSubmit() {
  if (!valid.value) return;

  try {
    await backendFetch(
      logistikCrudChannelNames.ADD,
      form.nama_produk,
      form.harga,
    );
    $toast.success("Berhasil tambah logistik");
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
</script>
<template>
  <v-card title="Tambah Logistik">
    <v-card-subtitle class="pl-6 text-error font-weight-medium">
      {{ additionalErrors }}
    </v-card-subtitle>
    <v-form
      class="pa-4"
      @submit.prevent="onSubmit"
      validate-on="lazy"
      v-model="valid"
    >
      <v-text-field
        v-model="form.nama_produk"
        :rules="rules.nama_produk"
        class="mb-2"
        variant="solo-filled"
        label="Nama Produk"
      ></v-text-field>
      <v-text-field
        v-model.number="form.harga"
        :rules="rules.harga"
        variant="solo-filled"
        label="Harga"
      ></v-text-field>

      <div class="d-flex justify-end gap-2 mt-2">
        <v-btn variant="tonal" @click="onCancel">Batal</v-btn>
        <v-btn type="submit" variant="tonal" color="success">OK</v-btn>
      </div>
    </v-form>
  </v-card>
</template>
