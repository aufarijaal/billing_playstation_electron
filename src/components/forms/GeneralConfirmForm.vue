<script setup lang="ts">
withDefaults(
  defineProps<{
    text: string;
    dangerous: boolean;
  }>(),
  {
    dangerous: true,
  },
);

defineEmits(["cancel", "submit"]);
</script>
<template>
  <v-card :title="text">
    <v-form class="pa-4 pl-6" @submit.prevent="$emit('submit')">
      <div class="d-flex justify-end gap-2">
        <v-btn variant="tonal" @click="$emit('cancel')">Batal</v-btn>
        <v-btn
          type="submit"
          :variant="dangerous ? 'plain' : 'tonal'"
          :color="dangerous ? 'error' : 'success'"
          >Ya</v-btn
        >
      </div>
    </v-form>
  </v-card>
</template>
