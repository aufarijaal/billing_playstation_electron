<script setup lang="ts">
import { Operator } from "../../../electron/@types/models";
import operatorsCrudChannelNames from "../../../electron/channel_names/operators-crud-channel-names";
import backendFetch from "../../utils/backend-fetch";

const props = defineProps<{
  data?: Operator;
}>();

const emits = defineEmits(["cancel", "submit"]);

const form = reactive({
  id: props.data?.id,
  username: props.data?.username,
  password: props.data?.password,
  full_access: props.data?.full_access,
});

const valid = ref<boolean | null>();
const additionalErrors = ref("");

const rules = ref({
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
    await backendFetch(
      operatorsCrudChannelNames.UPDATE,
      Object.assign({}, form),
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
  <v-card title="Reset password">
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
        v-model="form.password"
        :rules="rules.password"
        variant="solo-filled"
        label="Password"
      ></v-text-field>

      <div class="d-flex justify-end gap-2">
        <v-btn variant="tonal" @click="onCancel">Batal</v-btn>
        <v-btn type="submit" variant="tonal" color="success">OK</v-btn>
      </div>
    </v-form>
  </v-card>
</template>
