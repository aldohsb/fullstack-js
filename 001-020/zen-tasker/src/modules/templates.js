// templates.js — util render element berbasis template literal (tanpa innerHTML raw)
export const el = (tag, attrs = {}, ...children) => {
const node = document.createElement(tag);
for (const [k, v] of Object.entries(attrs)) {
if (k.startsWith("on") && typeof v === "function") {
node.addEventListener(k.slice(2).toLowerCase(), v);
} else if (v === true) {
node.setAttribute(k, "");
} else if (v ?? false) {
node.setAttribute(k, v);
}
}
for (const c of children.flat()) {
node.append(c.nodeType ? c : document.createTextNode(String(c)));
}
return node;
};


export const taskItem = ({ id, title, completed }, { onToggle, onRemove }) =>
el("li", { class: `zt-item ${completed ? "completed" : ""}`, "data-id": id },
el("input", { class: "zt-check", type: "checkbox", checked: completed, onChange: () => onToggle(id), "aria-label": "Mark done" }),
el("div", { class: "zt-title-sm", role: "textbox", "aria-readonly": "true" }, title),
el("button", { class: "zt-del", title: "Delete", onClick: () => onRemove(id), "aria-label": "Delete" }, "×"),
);