<script setup lang="ts">
import { formatRupiah } from "convert-rupiah";
import backendFetch from "../../utils/backend-fetch";
import playstationsCrudChannelNames from "../../../electron/channel_names/playstations-crud-channel-names";
import { useToast } from "vue-toast-notification";

const props = defineProps<{
  exceptionalVersions?: any;
}>();
const emits = defineEmits(["cancel", "submit"]);

const $toast = useToast();
const additionalErrors = ref("");
const form = ref({
  versi: 1,
  tarif_per_menit: 10,
});

const formRules = ref({
  tarif_per_menit: [
    (value: number) => {
      if (value > 0) return true;
      return "Tarif tidak boleh nol";
    },
  ],
});

const tarifInRupiah = computed(() => {
  return formatRupiah(form.value.tarif_per_menit);
});

function incrementVersiPs() {
  form.value.versi = form.value.versi + 1;
}

function decrementVersiPs() {
  if (form.value.versi === 1) return;
  form.value.versi = form.value.versi - 1;
}

async function onSubmit() {
  if (
    props.exceptionalVersions?.some(
      (versionNumber: number) => versionNumber === form.value.versi,
    )
  ) {
    additionalErrors.value = `PS versi ${form.value.versi} sudah ada`;

    setTimeout(() => {
      additionalErrors.value = "";
    }, 5000);
    return;
  }

  try {
    await backendFetch(
      playstationsCrudChannelNames.ADD,
      form.value.versi,
      form.value.tarif_per_menit,
    );
    emits("submit");
    $toast.success("Berhasil menambahkan PS baru");
  } catch (error: any) {
    $toast.error(error.message);
  }
}
</script>
<template>
  <v-card title="Tambah PS">
    <v-form class="pa-4" @submit.prevent="onSubmit" validate-on="lazy">
      <div class="d-flex flex-column align-center gap-1">
        <div>Versi</div>
        <div class="d-flex align-center gap-2 justify-center mb-6">
          <v-btn
            :disabled="form.versi === 1"
            variant="tonal"
            icon="mdi-minus"
            @click="decrementVersiPs"
          ></v-btn>
          <div>{{ form.versi }}</div>
          <v-btn
            variant="tonal"
            icon="mdi-plus"
            @click="incrementVersiPs"
          ></v-btn>
          <input type="hidden" />
        </div>
      </div>
      <v-text-field
        v-model.number="form.tarif_per_menit"
        :rules="formRules.tarif_per_menit"
        variant="solo-filled"
        label="Tarif per menit"
      ></v-text-field>

      <div class="text-center pb-4 pt-2 text-subtitle-2 text-error">
        {{ additionalErrors }}
      </div>

      <div class="text-center mb-4">
        <div>
          Versi: <span class="text-success">{{ form.versi }}</span>
        </div>
        <div>
          Tarif:
          <span class="text-info"
            >{{ tarifInRupiah }} ({{
              formatRupiah(form.tarif_per_menit * 60)
            }}/Jam)</span
          >
        </div>
      </div>
      <div class="d-flex justify-end gap-2">
        <v-btn variant="tonal" @click="$emit('cancel')">Batal</v-btn>
        <v-btn type="submit" color="success">OK</v-btn>
      </div>
    </v-form>
  </v-card>
</template>
