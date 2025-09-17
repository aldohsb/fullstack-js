// view.js — mengikat DOM dengan store & templates
import { Store } from "./store.js";
import { Filters } from "./filters.js";
import { el, taskItem } from "./templates.js";


const $ = (sel, root = document) => root.querySelector(sel);


export function mount() {
const form = $("#new-task-form");
const input = $("#new-task-input");
const list = $("#task-list");
const chips = document.querySelectorAll(".zt-chip");
const itemsLeft = $("#items-left");
const clearBtn = $("#clear-completed");


const render = () => {
list.replaceChildren(...Store.visible().map(t => taskItem(t, {
onToggle: (id) => { Store.toggle(id); render(); updateStats(); },
onRemove: (id) => { Store.remove(id); render(); updateStats(); },
})));
};


const updateStats = () => {
const { active } = Store.stats();
itemsLeft.textContent = `${active} item${active === 1 ? "" : "s"} left`;
};


form.addEventListener("submit", (e) => {
e.preventDefault();
const title = input.value.trim();
if (!title) return;
Store.add(title);
input.value = "";
render(); updateStats();
});


chips.forEach(btn => btn.addEventListener("click", () => {
chips.forEach(b => { b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false"); });
btn.classList.add("is-active");
btn.setAttribute("aria-pressed", "true");
const f = btn.dataset.filter;
Store.setFilter(f);
render(); updateStats();
}));


clearBtn.addEventListener("click", () => { Store.clearCompleted(); render(); updateStats(); });


// initial paint
render();
updateStats();
}