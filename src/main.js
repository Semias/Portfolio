import { createApp } from "vue";
import { MotionPlugin } from "@vueuse/motion";

import App from "./App.vue";
import "../src/assets/fonts/gallographic-font/style.css";
// import "src/assets/include-media.scss";

const app = createApp(App);

app.use(MotionPlugin);
app.mount("#app");
