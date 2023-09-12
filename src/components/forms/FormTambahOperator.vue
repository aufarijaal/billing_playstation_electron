<script setup lang="ts">
import operatorsCrudChannelNames from "../../../electron/channel_names/operators-crud-channel-names";
import backendFetch from "../../utils/backend-fetch";

const emits = defineEmits(["cancel", "submit"]);

const form = reactive({
  username: "",
  password: "",
  full_access: false,
});

const valid = ref<boolean | null>();
const additionalErrors = ref("");

const rules = ref({
  username: [
    (value: string) => {
      if (value) return true;
      return "Nama harus diisi!";
    },
  ],
  password: [
    (value: string) => {
      if (value) return true;
      return "Password harus diisi!";
    },
    (value: string) => {
      if (value.length >= 3) return true;
      return "Password minimal 3 karakter";
    },
  ],
});

async function onSubmit() {
  if (!valid.value) return;

  try {
    await backendFetch(operatorsCrudChannelNames.ADD, Object.assign({}, form));
  } catch (error: any) {
    additionalErrors.value = error.message.split("Error: ")[1];
    setTimeout(() => {
      additionalErrors.value = "";
    }, 4000);
  }

  emits("submit");
}

function onCancel() {
  emits("cancel");
}
</script>
<template>
  <v-card title="Tambah Operator">
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
        v-model="form.username"
        :rules="rules.username"
        class="mb-2"
        variant="solo-filled"
        label="Nama"
      ></v-text-field>
      <v-text-field
        v-model="form.password"
        :rules="rules.password"
        variant="solo-filled"
        label="Password"
      ></v-text-field>
      <v-checkbox v-model="form.full_access" label="Akses penuh"></v-checkbox>

      <div class="d-flex justify-end gap-2">
        <v-btn variant="tonal" @click="onCancel">Batal</v-btn>
        <v-btn type="submit" variant="tonal" color="success">OK</v-btn>
      </div>
    </v-form>
  </v-card>
</template>
