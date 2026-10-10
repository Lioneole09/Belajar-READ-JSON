// ===== State =====
const API_URL = "https://dummyjson.com/posts?limit=5";

let tugas = [];          // array data utama
let filterAktif = "semua"; // "semua" | "belum"

// ===== Elemen DOM =====
const daftar = document.querySelector("#daftar-tugas");
const form = document.querySelector("#form-tugas");
const input = document.querySelector("#input-tugas");
const pesan = document.querySelector("#pesan");
const info = document.querySelector("#info");
const tombolFilter = document.querySelectorAll(".btn-filter");

// ===== Helper pesan =====
function tampilkanPesan(teks, error = false) {
  pesan.textContent = teks;
  pesan.classList.toggle("error", error);
}

function perbaruiInfo() {
  const belum = tugas.filter((t) => !t.completed).length;
  info.textContent = `${tugas.length} tugas, ${belum} belum selesai`;

  const tampil = ambilTugasTampil();
  if (tugas.length > 0 && tampil.length === 0) {
    tampilkanPesan("Tidak ada tugas yang cocok dengan filter ini.");
  } else if (tugas.length === 0 && !pesan.classList.contains("error")) {
    tampilkanPesan("Belum ada tugas. Tambahkan satu lewat form di atas.");
  } else if (!pesan.classList.contains("error")) {
    tampilkanPesan("");
  }
}

// ===== Filter =====
function ambilTugasTampil() {
  return filterAktif === "belum"
    ? tugas.filter((t) => !t.completed)
    : tugas;
}

// ===== Render =====
function buatItem(item) {
  const li = document.createElement("li");
  li.className = "tugas";
  li.dataset.id = item.id;
  li.classList.toggle("selesai", item.completed);

  const judul = document.createElement("span");
  judul.className = "judul";
  judul.textContent = `${item.completed ? "✔" : "•"} ${item.title}`;

  const btnSelesai = document.createElement("button");
  btnSelesai.className = "btn btn-selesai";
  btnSelesai.type = "button";
  btnSelesai.textContent = item.completed ? "Batal selesai" : "Selesai";
  btnSelesai.addEventListener("click", () => ubahStatus(item.id));

  const btnHapus = document.createElement("button");
  btnHapus.className = "btn btn-hapus";
  btnHapus.type = "button";
  btnHapus.textContent = "Hapus";
  btnHapus.addEventListener("click", () => hapusTugas(item.id));

  li.append(judul, btnSelesai, btnHapus);
  return li;
}

function render() {
  daftar.replaceChildren(...ambilTugasTampil().map(buatItem));
  perbaruiInfo();
}

// ===== Aksi =====
function tambahTugas(judul) {
  const idBaru = tugas.reduce((maks, t) => Math.max(maks, t.id), 0) + 1;
  tugas = [...tugas, { id: idBaru, title: judul, completed: false }];
  render();
}

function ubahStatus(id) {
  tugas = tugas.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );

  const li = daftar.querySelector(`[data-id="${id}"]`);
  const item = tugas.find((t) => t.id === id);
  if (li && item) li.classList.toggle("selesai", item.completed);

  // render ulang supaya teks tombol & filter ikut diperbarui
  render();
}

function hapusTugas(id) {
  tugas = tugas.filter((t) => t.id !== id);
  daftar.querySelector(`[data-id="${id}"]`)?.remove();
  perbaruiInfo();
}

// ===== Event =====
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const judul = input.value.trim();
  if (!judul) return;
  tambahTugas(judul);
  input.value = "";
  input.focus();
});

tombolFilter.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterAktif = btn.dataset.filter;
    tombolFilter.forEach((b) => b.classList.toggle("aktif", b === btn));
    render();
  });
});

// ===== Ambil data awal =====
async function muatTugas() {
  tampilkanPesan("Memuat tugas…");
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Server membalas status ${response.status}`);
    const data = await response.json();
    // dummyjson membungkus daftar di data.posts dan tidak punya field "completed"
    tugas = data.posts.map((p) => ({
      id: p.id,
      title: p.title,
      completed: false,
    }));
    tampilkanPesan("");
  } catch (error) {
    console.error("Gagal memuat tugas:", error);
    tampilkanPesan(
      "Tugas gagal dimuat. Periksa koneksi internet, lalu muat ulang halaman. Kamu tetap bisa menambah tugas baru.",
      true
    );
  }
  render();
}

muatTugas();
