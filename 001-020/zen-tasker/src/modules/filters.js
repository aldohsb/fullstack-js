// filters.js — pure functions untuk penyaringan task
export const Filters = Object.freeze({ All: "all", Active: "active", Completed: "completed" });


export const byFilter = (filter) => (task) => {
switch (filter) {
case Filters.Active: return !task.completed;
case Filters.Completed: return task.completed;
case Filters.All:
default: return true;
}
};