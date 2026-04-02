import { createApp } from "vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import router from "./router/index.js";
import i18n from "./i18n/index.js";
import "./style.css";
import App from "./App.vue";
import { useUiStore } from "./stores/ui.js";
import animateDirective from "./directives/animate.js";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);
app.directive("animate", animateDirective);

// Initialize persisted state (dark mode, locale) BEFORE mounting
const uiStore = useUiStore();
uiStore.initFromStorage();

// Initialize auth from storage
import { useAuthStore } from "./stores/auth.js";
const authStore = useAuthStore();
authStore.initFromStorage();
if (authStore.user) {
  authStore.refreshSession();
}

app.mount("#app");
