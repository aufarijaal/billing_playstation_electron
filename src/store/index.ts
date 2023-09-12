import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { ref } from "vue";
import backendFetch from "../utils/backend-fetch";

const useMainStore = defineStore("main", function () {
  const theme = ref(useLocalStorage("theme", "dark"));
  const showLoginDialog = ref(true);
  const session = ref(
    useLocalStorage("session", {
      username: "",
      full_access: 0,
      logged_in_at: "",
    }),
  );

  const isSessionValid = computed(() => {
    return !!session.value.username;
  });

  const timeouts = ref<{ nomorMeja: number; timeoutId: any }[]>([]);

  function runTimeout(nomorMeja: number, delay: number) {
    const timeoutId = setTimeout(async () => {
      await backendFetch(
        "/notification",
        "Permainan selesai",
        `Meja nomor ${nomorMeja} telah selesai bermain`,
      );
      timeouts.value = timeouts.value.filter(
        (timeout) => timeout.nomorMeja !== nomorMeja,
      );
    }, delay);

    timeouts.value.push({
      nomorMeja,
      timeoutId,
    });
  }

  function cancelTimeout(nomorMeja: number) {
    if (timeouts.value.length) {
      const dataTimeoutUntukDibatalkan = timeouts.value.findIndex(
        (timeout) => timeout.nomorMeja === nomorMeja,
      );
      clearTimeout(timeouts.value[dataTimeoutUntukDibatalkan].timeoutId);
      timeouts.value = timeouts.value.filter(
        (timeout) => timeout.nomorMeja !== nomorMeja,
      );
    }
  }

  function cancelAllTimeout() {
    if (timeouts.value.length) {
      for (let i = 0; i < timeouts.value.length; i++) {
        clearTimeout(timeouts.value[i].timeoutId);
      }
      timeouts.value = [];
    }
  }

  return {
    theme,
    session,
    showLoginDialog,
    isSessionValid,
    timeouts,
    runTimeout,
    cancelTimeout,
    cancelAllTimeout,
  };
});

export default useMainStore;
