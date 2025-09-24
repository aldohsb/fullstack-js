// app.js sebagai modul utama to-do list Zen Tasker
// Menggunakan modular programming dan menulis semua logika dalam satu file
// Semua fungsi diberi komentar untuk belajar

// Penyimpanan dan pembacaan task di localStorage
const STORAGE_KEY = 'zenTaskerTasks';

// Elemen DOM utama
const newTaskInput = document.getElementById('new-task'); // input tambah tugas
const addTaskBtn = document.getElementById('add-task-btn'); // tombol tambah tugas
const taskList = document.getElementById('task-list'); // container list tugas
const filterButtons = document.querySelectorAll('.filter-btn'); // tombol filter tugas

// State aplikasi simpan semua task dalam array objek {id, description, completed}
let tasks = [];

// Fungsi menyimpan tasks ke localStorage dalam bentuk string JSON
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Fungsi membaca tasks dari localStorage dan parsing balik ke array
function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  tasks = saved ? JSON.parse(saved) : [];
}

// Membuat elemen li untuk satu task, dengan checkbox dan tombol hapus
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'task-item';
  if (task.completed) li.classList.add('completed');
  li.dataset.id = task.id;

  // Checkbox untuk menandai selesai / belum selesai
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => toggleTaskCompleted(task.id));

  // Deskripsi task
  const desc = document.createElement('p');
  desc.className = 'task-desc';
  desc.textContent = task.description;

  // Tombol hapus task
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'task-delete-btn';
  deleteBtn.textContent = '×';
  deleteBtn.setAttribute('aria-label', `Hapus tugas: ${task.description}`);
  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  // Susun dalam elemen li
  li.appendChild(checkbox);
  li.appendChild(desc);
  li.appendChild(deleteBtn);

  return li;
}

// Render daftar tugas ke DOM berdasarkan filter saat ini
function renderTasks(filter = 'all') {
  // Bersihkan semua children di taskList
  taskList.innerHTML = '';

  // Filter task sesuai filter
  let filteredTasks = [];
  switch (filter) {
    case 'active':
      filteredTasks = tasks.filter(t => !t.completed);
      break;
    case 'completed':
      filteredTasks = tasks.filter(t => t.completed);
      break;
    default:
      filteredTasks = tasks;
  }

  // Render each task ke DOM
  filteredTasks.forEach(task => {
    const taskElement = createTaskElement(task);
    taskList.appendChild(taskElement);
  });
}

// Tambah task baru ke array dan simpan kemudian render ulang
function addTask(description) {
  // Trim untuk menghindari spasi kosong
  const descTrimmed = description.trim();
  if (!descTrimmed) return alert('Masukkan deskripsi tugas sebelum menambah.');

  // Buat objek task baru dengan id unik timestamp + random
  const newTask = {
    id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    description: descTrimmed,
    completed: false
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks(getCurrentFilter());
  newTaskInput.value = ''; // Kosongkan input setelah tambah
}

// Hapus task dengan id tertentu dari array
function deleteTask(taskId) {
  tasks = tasks.filter(t => t.id !== taskId);
  saveTasks();
  renderTasks(getCurrentFilter());
}

// Toggle status completed task
function toggleTaskCompleted(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  renderTasks(getCurrentFilter());
}

// Mendapatkan filter aktif saat ini dari tombol filter
function getCurrentFilter() {
  const activeBtn = [...filterButtons].find(btn => btn.classList.contains('active'));
  return activeBtn ? activeBtn.dataset.filter : 'all';
}

// Event handler untuk filter klik tombol
function handleFilterClick(event) {
  // Hilangkan active dari semua tombol
  filterButtons.forEach(btn => btn.classList.remove('active'));

  // Tambah active pada tombol yang dipilih
  const btn = event.target;
  btn.classList.add('active');

  // Render ulang task sesuai filter yang dipilih
  renderTasks(btn.dataset.filter);
}

// Event setup dan initial render ketika halaman selesai dimuat
function init() {
  // Load data dari localStorage
  loadTasks();

  // Render task semua saat awal
  renderTasks();

  // Event tombol tambah task
  addTaskBtn.addEventListener('click', () => addTask(newTaskInput.value));

  // Support enter key pada input field untuk submit task
  newTaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTask(newTaskInput.value);
    }
  });

  // Event untuk tombol filter
  filterButtons.forEach(btn => {
    btn.addEventListener('click', handleFilterClick);
  });
}

// Jalankan inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', init);
