<script setup lang="ts">
import { formatRupiah } from "convert-rupiah";
import backendFetch from "../../utils/backend-fetch";
import playstationsCrudChannelNames from "../../../electron/channel_names/playstations-crud-channel-names";
import { useToast } from "vue-toast-notification";

const props = defineProps<{
  data: {
    versi: number;
    tarif_per_menit: number;
  };
}>();

const emits = defineEmits(["cancel", "submit"]);

const $toast = useToast();
const additionalErrors = ref("");
const form = ref({
  tarif_per_menit: props.data.tarif_per_menit,
});

const formRules = ref({
  tarif_per_menit: [
    (value: number) => {
      if (value > 0) return true;
      return "Tarif tidak boleh nol";
    },
  ],
});

async function onSubmit() {
  try {
    await backendFetch(
      playstationsCrudChannelNames.UPDATE_TARIF,
      props.data.versi,
      form.value.tarif_per_menit,
    );
    emits("submit");
    $toast.success(`Berhasil update tarif PS ${props.data.versi}`);
  } catch (error: any) {
    $toast.error(error.message);
  }
}
</script>
<template>
  <v-card :title="`Ubah tarif untuk PS ${data.versi}`">
    <v-form class="pa-4" @submit.prevent="onSubmit">
      <v-text-field
        v-model.number="form.tarif_per_menit"
        :rules="formRules.tarif_per_menit"
        variant="solo-filled"
        label="Tarif baru"
      ></v-text-field>

      <div class="text-subtitle-2 text-center mb-4 mt-2">
        Tarif baru
        <span class="text-green-lighten-2"
          >{{ formatRupiah(form.tarif_per_menit) }} ({{
            formatRupiah(form.tarif_per_menit * 60)
          }}/Jam)</span
        >
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
