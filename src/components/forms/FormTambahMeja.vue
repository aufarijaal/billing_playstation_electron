<script setup lang="ts">
import backendFetch from "../../utils/backend-fetch";
import mejaMainCrudChannelNames from "../../../electron/channel_names/meja-main-crud-channel-names";
import { useToast } from "vue-toast-notification";

const props = defineProps<{
  exceptionalMejaMain?: any;
  versiPsTersedia: any;
}>();
const emits = defineEmits(["cancel", "submit"]);

const $toast = useToast();
const additionalErrors = ref("");
const form = ref({
  nomor_meja: 1,
  versi_ps: 1,
});

function increment() {
  form.value.nomor_meja = form.value.nomor_meja + 1;
}

function decrement() {
  if (form.value.nomor_meja === 1) return;
  form.value.nomor_meja = form.value.nomor_meja - 1;
}

async function onSubmit() {
  if (
    props.exceptionalMejaMain?.some(
      (nomorMeja: number) => nomorMeja === form.value.nomor_meja,
    )
  ) {
    additionalErrors.value = `Meja nomor ${form.value.nomor_meja} sudah ada`;

    setTimeout(() => {
      additionalErrors.value = "";
    }, 5000);
    return;
  }

  try {
    await backendFetch(
      mejaMainCrudChannelNames.ADD,
      form.value.nomor_meja,
      form.value.versi_ps,
    );
    emits("submit");
    $toast.success("Berhasil menambahkan meja main baru");
  } catch (error: any) {
    $toast.error(error.message);
  }
}
</script>
<template>
  <v-card title="Tambah Meja">
    <v-form class="pa-4" @submit.prevent="onSubmit" validate-on="lazy">
      <div class="d-flex flex-column align-center gap-1">
        <div>Nomor Meja</div>
        <div class="d-flex align-center gap-2 justify-center mb-6">
          <v-btn
            :disabled="form.nomor_meja === 1"
            variant="tonal"
            icon="mdi-minus"
            @click="decrement"
          ></v-btn>
          <div>{{ form.nomor_meja }}</div>
          <v-btn variant="tonal" icon="mdi-plus" @click="increment"></v-btn>
          <input type="hidden" />
        </div>
      </div>
      <v-select
        v-model="form.versi_ps"
        variant="solo-filled"
        label="Versi PS"
        :items="versiPsTersedia"
      ></v-select>

      <div class="text-center pb-4 pt-2 text-subtitle-2 text-error">
        {{ additionalErrors }}
      </div>
      <div class="text-center pb-4 pt-2 text-subtitle-2 text-error">
        {{ form }}
      </div>
      <div class="d-flex justify-end gap-2">
        <v-btn variant="tonal" @click="$emit('cancel')">Batal</v-btn>
        <v-btn type="submit" color="success">OK</v-btn>
      </div>
    </v-form>
  </v-card>
</template>
