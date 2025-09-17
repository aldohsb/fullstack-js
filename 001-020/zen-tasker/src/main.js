// main.js — entry module
import { mount } from "./modules/view.js";


// Progressive enhancement: jalankan setelah DOM siap
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", mount, { once: true });
} else {
mount();
}