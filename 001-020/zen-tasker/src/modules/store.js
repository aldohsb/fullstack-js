// store.js — state manajemen minimal + persist ke storage
import { storage } from "./storage.js";
import { Filters, byFilter } from "./filters.js";


const KEY = "state";


const initial = /** @type {{ tasks: Array<{id:string,title:string,completed:boolean}>, filter: 'all'|'active'|'completed' }} */({
tasks: [],
filter: Filters.All,
});


let state = storage.get(KEY, initial);


const persist = () => storage.set(KEY, state);
const uid = () => crypto.randomUUID();


export const Store = {
all() { return structuredClone(state); },
visible() { return state.tasks.filter(byFilter(state.filter)); },
stats() {
const total = state.tasks.length;
const active = state.tasks.filter(t => !t.completed).length;
const completed = total - active;
return { total, active, completed };
},
add(title) {
const task = { id: uid(), title: title.trim(), completed: false };
if (!task.title) return;
state.tasks.unshift(task);
persist();
return task;
},
toggle(id) {
const t = state.tasks.find(t => t.id === id);
if (t) { t.completed = !t.completed; persist(); }
},
remove(id) {
state.tasks = state.tasks.filter(t => t.id !== id);
persist();
},
clearCompleted() {
state.tasks = state.tasks.filter(t => !t.completed);
persist();
},
setFilter(filter) {
state.filter = filter;
persist();
},
};