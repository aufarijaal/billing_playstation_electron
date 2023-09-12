<script setup lang="ts">
import logistikCrudChannelNames from "../../../electron/channel_names/logistik-crud-channel-names";
import backendFetch from "../../utils/backend-fetch";

const props = defineProps<{
  data?: {
    id: number;
    nama_produk: string;
  };
}>();

const emits = defineEmits(["cancel", "submit"]);

const form = reactive({
  id: props.data?.id,
  nama_produk: props.data?.nama_produk,
});

const valid = ref<boolean | null>();
const additionalErrors = ref("");

const rules = ref({
  nama_produk: [
    (value: string) => {
      if (value) return true;
      return "Nama produk harus diisi!";
    },
  ],
});

async function onSubmit() {
  if (!valid.value) return;

  try {
    await backendFetch(
      logistikCrudChannelNames.UPDATE_NAMA_PRODUK,
      form.id,
      form.nama_produk,
    );
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
  <v-card title="Ubah nama">
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
        label="Nama produk baru"
      ></v-text-field>

      <div class="d-flex justify-end gap-2">
        <v-btn variant="tonal" @click="onCancel">Batal</v-btn>
        <v-btn type="submit" variant="tonal" color="success">OK</v-btn>
      </div>
    </v-form>
  </v-card>
</template>
