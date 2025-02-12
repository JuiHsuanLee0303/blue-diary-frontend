import type { App } from "vue";

declare global {
  interface Element {
    __vue_app__?: App;
  }
}
