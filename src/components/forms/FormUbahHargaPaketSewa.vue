<script setup lang="ts">
import { formatRupiah } from "convert-rupiah";
import backendFetch from "../../utils/backend-fetch";
import paketSewaCrudChannelNames from "../../../electron/channel_names/paket-sewa-crud-channel-names";
import { useToast } from "vue-toast-notification";

const props = defineProps<{
  data?: {
    id: number;
    nama_paket: string;
    harga: number;
  };
}>();

const emits = defineEmits(["cancel", "submit"]);

const $toast = useToast();
const additionalErrors = ref("");
const form = ref({
  harga: props.data?.harga,
});

const formRules = ref({
  harga: [
    (value: number) => {
      if (value > 0) return true;
      return "Harga tidak boleh nol";
    },
  ],
});

async function onSubmit() {
  try {
    await backendFetch(
      paketSewaCrudChannelNames.UPDATE_HARGA,
      props.data?.id,
      form.value.harga,
    );
    emits("submit");
    $toast.success(`Berhasil update harga ${props.data?.nama_paket}`);
  } catch (error: any) {
    $toast.error(error.message);
  }
}
</script>
<template>
  <v-card title="Ubah harga">
    <v-form class="pa-4" @submit.prevent="onSubmit">
      <v-text-field
        v-model.number="form.harga"
        :rules="formRules.harga"
        variant="solo-filled"
        label="Harga baru"
      ></v-text-field>

      <div class="text-subtitle-2 text-center mb-4 mt-2">
        Harga baru
        <span class="text-green-lighten-2">{{ formatRupiah(form.harga) }}</span>
      </div>
      <div class="text-subtitle-2 text-center mb-4 mt-2 text-error">
        {{ additionalErrors }}
      </div>

      <div class="d-flex justify-end gap-2">
        <v-btn variant="tonal" @click="$emit('cancel')">Batal</v-btn>
        <v-btn type="submit" color="success">OK</v-btn>
      </div>
    </v-form>
  </v-card>
</template>
