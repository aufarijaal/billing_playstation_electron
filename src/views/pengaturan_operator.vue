<script setup lang="ts">
import { Operator } from "../../electron/@types/models";
import operatorsCrudChannelNames from "../../electron/channel_names/operators-crud-channel-names";
import backendFetch from "../utils/backend-fetch";

type FormType = "tambah" | "pass" | "name" | "akses" | "delete";

const operatorsData = ref();
const whatForm = ref<FormType>("tambah");
const showDialog = ref(false);
const dataForUpdate = ref<Operator>();

function showWhichDialog(whatFormType: FormType) {
  whatForm.value = whatFormType;
  showDialog.value = true;
}

async function getOperatorData() {
  operatorsData.value = await backendFetch(operatorsCrudChannelNames.GET_ALL);
  showDialog.value = false;
}

onMounted(async () => {
  await getOperatorData();
});
</script>
<template>
  <div id="pengaturan-operator-page" class="pa-4">
    <!-- Dialogs -->
    <v-dialog v-model="showDialog" width="300px">
      <FormTambahOperator
        v-if="whatForm === 'tambah'"
        @submit="getOperatorData"
        @cancel="showDialog = false"
      />
      <FormUbahNamaOperator
        v-else-if="whatForm === 'name'"
        @submit="getOperatorData"
        @cancel="showDialog = false"
        :data="dataForUpdate"
      />
      <FormResetPasswordOperator
        v-else-if="whatForm === 'pass'"
        @submit="getOperatorData"
        @cancel="showDialog = false"
        :data="dataForUpdate"
      />
      <FormConfirmUbahAksesOperator
        v-else-if="whatForm === 'akses'"
        @submit="getOperatorData"
        @cancel="showDialog = false"
        :data="dataForUpdate"
      />

      <FormConfirmDeleteOperator
        v-else-if="whatForm === 'delete'"
        @submit="getOperatorData"
        @cancel="showDialog = false"
        :data="dataForUpdate"
      />
    </v-dialog>

    <div class="mb-2 d-flex justify-end">
      <v-btn
        class="mr-2"
        color="info"
        icon="mdi-refresh"
        size="small"
        @click="getOperatorData"
      ></v-btn>
      <v-btn color="success" @click="showWhichDialog('tambah')">Tambah</v-btn>
    </div>
    <v-table>
      <thead>
        <tr>
          <th>Nama</th>
          <th>Password</th>
          <th>Akses Penuh</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="operator in operatorsData">
          <td>{{ operator.username }}</td>
          <td>{{ operator.password }}</td>
          <td>{{ operator.full_access ? "Ya" : "Tidak" }}</td>
          <td class="py-2">
            <v-tooltip content-class="bg-white" text="Ubah nama" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-rename-box"
                  size="small"
                  variant="tonal"
                  color="green"
                  @click="
                    () => {
                      dataForUpdate = operator;
                      showWhichDialog('name');
                    }
                  "
                ></v-btn>
              </template>
            </v-tooltip>
            <v-tooltip
              content-class="bg-white"
              text="Reset Password"
              location="top"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  class="ml-2"
                  v-bind="props"
                  icon="mdi-form-textbox-password"
                  size="small"
                  variant="tonal"
                  color="orange"
                  @click="
                    () => {
                      dataForUpdate = operator;
                      showWhichDialog('pass');
                    }
                  "
                ></v-btn>
              </template>
            </v-tooltip>
            <v-tooltip
              content-class="bg-white"
              text="Ubah hak akses"
              location="top"
              v-if="operator.id !== 1"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  class="ml-2"
                  v-bind="props"
                  :icon="operator.full_access ? 'mdi-lock-open' : 'mdi-lock'"
                  size="small"
                  variant="tonal"
                  :color="operator.full_access ? 'yellow' : 'grey'"
                  @click="
                    () => {
                      dataForUpdate = operator;
                      showWhichDialog('akses');
                    }
                  "
                ></v-btn>
              </template>
            </v-tooltip>
            <v-tooltip
              content-class="bg-white"
              text="Hapus"
              location="top"
              v-if="operator.id !== 1"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  class="ml-2"
                  v-bind="props"
                  icon="mdi-delete"
                  size="small"
                  variant="tonal"
                  color="error"
                  @click="
                    () => {
                      dataForUpdate = operator;
                      showWhichDialog('delete');
                    }
                  "
                ></v-btn>
              </template>
            </v-tooltip>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>
