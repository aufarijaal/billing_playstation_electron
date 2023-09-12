<script setup lang="ts">
import useMainStore from "../../store";
import backendFetch from "../../utils/backend-fetch";
import operatorsCrudChannelNames from "../../../electron/channel_names/operators-crud-channel-names";

const store = useMainStore();
const valid = ref(null);
const formRef = ref();
const additionalErrors = ref("");
const form = reactive({
  username: "",
  password: "",
});
const rules = ref({
  username: [
    (value: string) => {
      if (value.trim().length) return true;
      return "Nama harus di isi";
    },
  ],
  password: [
    (value: string) => {
      if (value.trim().length) return true;
      return "Password harus di isi";
    },
  ],
});

async function onSubmit() {
  if (!valid.value) return;

  try {
    const session = await backendFetch(
      operatorsCrudChannelNames.LOGIN,
      form.username,
      form.password,
    );
    store.session.username = session.username;
    store.session.full_access = session.full_access;
    store.session.logged_in_at = session.logged_in_at;

    store.showLoginDialog = false;
  } catch (error: any) {
    additionalErrors.value = error.message.split("Error: ")[1];
    setTimeout(() => {
      additionalErrors.value = "";
    }, 4000);
  }
}

onUpdated(() => {
  form.username = "";
  form.password = "";
});
</script>

<template>
  <v-dialog
    attach="body"
    v-model="store.showLoginDialog"
    width="350"
    :persistent="!store.isSessionValid"
  >
    <v-card :title="!store.isSessionValid ? 'Login' : 'Ganti Operator'">
      <v-form
        class="pa-4"
        @submit.prevent="onSubmit"
        validate-on="lazy"
        v-model="valid"
        ref="formRef"
      >
        <v-text-field
          v-model="form.username"
          :rules="rules.username"
          prepend-inner-icon="mdi-account"
          variant="solo-filled"
          label="Nama"
        ></v-text-field>
        <v-text-field
          v-model="form.password"
          type="password"
          :rules="rules.password"
          prepend-inner-icon="mdi-key"
          variant="solo-filled"
          label="Password"
        ></v-text-field>

        <div class="text-error font-weight-medium text-center text-subtitle-2">
          {{ additionalErrors }}
        </div>

        <div class="d-flex justify-end gap-2 mt-4">
          <v-btn
            v-if="store.isSessionValid"
            type="button"
            text="Batal"
            variant="tonal"
            @click="store.showLoginDialog = false"
          ></v-btn>
          <v-btn
            type="submit"
            text="Login"
            variant="tonal"
            color="success"
          ></v-btn>
        </div>
      </v-form>
    </v-card>
  </v-dialog>
</template>
