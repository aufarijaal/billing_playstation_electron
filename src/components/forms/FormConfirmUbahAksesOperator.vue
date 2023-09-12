<script setup lang="ts">
import { Operator } from "../../../electron/@types/models";
import operatorsCrudChannelNames from "../../../electron/channel_names/operators-crud-channel-names";
import backendFetch from "../../utils/backend-fetch";

const emits = defineEmits(["cancel", "submit"]);
const props = defineProps<{
  data?: Operator;
}>();
const form = reactive({
  id: props.data?.id,
  username: props.data?.username,
  password: props.data?.password,
  full_access: props.data?.full_access,
});
const additionalErrors = ref("");
async function onSubmit() {
  try {
    await backendFetch(operatorsCrudChannelNames.UPDATE, {
      id: form.id,
      username: form.username,
      password: form.password,
      full_access: !form.full_access,
    });
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
  <v-card title="Ubah akses">
    <v-card-subtitle class="pl-6 text-error font-weight-medium">
      {{ additionalErrors }}
    </v-card-subtitle>
    <v-form class="pa-4 pl-6" @submit.prevent="onSubmit">
      <div class="mb-4">
        Ubah <span class="text-blue">{{ data?.username }}</span> ke
        {{ data?.full_access ? "akses terbatas" : "akses penuh" }} ?
      </div>
      <div class="d-flex justify-end gap-2">
        <v-btn variant="tonal" @click="onCancel">Batal</v-btn>
        <v-btn type="submit" variant="tonal" color="success">OK</v-btn>
      </div>
    </v-form>
  </v-card>
</template>
