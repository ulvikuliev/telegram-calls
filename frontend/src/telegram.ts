import { init, miniApp, viewport } from "@telegram-apps/sdk";

init();

miniApp.mount();
miniApp.ready();

viewport.mount();
viewport.expand();
