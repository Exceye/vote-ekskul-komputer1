// ============================================================
// config.js — Pusat konfigurasi. Ubah di sini tanpa sentuh logika.
// ============================================================

export const SITE = {
  title: "Pemilu Ekskul Komputer 2026",
  subtitle: "Pemilihan Ketua & Wakil Ketua Ekskul Komputer",
  logo: "assets/logo.png",
  footer: "© 2026 Ekskul Komputer — Dibuat dengan ❤️",
};

// Konfigurasi koleksi & dokumen Firestore
export const FIREBASE = {
  tokensCollection: "tokens",
  votesCollection: "votes",
  settings: { collection: "settings", doc: "config", adminKeyField: "adminKey" },
  tokenFields: { code: "kode", used: "isUsed" },
};

// Warna default untuk chart (jika paslon tidak mendefinisikan warna)
export const CHART_COLORS = [
  "#0f766e", "#14b8a6", "#0d9488", "#1e293b", "#64748b", "#be123c",
];

// ============================================================
// DAFTAR PASLON — edit di sini jika ada perubahan kandidat
// Pastikan file foto ada di folder "assets/"
// ============================================================
export const PASLON = [
  {
    id: "1",
    nomor: 1,
    warna: "#0f766e",
    ketua: {
      nama: "Andi Pratama",
      foto: "assets/ketua-1.png",
    },
    wakil: {
      nama: "Siti Rahma",
      foto: "assets/wakil-1.png",
    },
    visi: "Mewujudkan ekskul komputer yang solid, kreatif, dan berprestasi di tingkat sekolah maupun nasional.",
    misi: [
      "Mengadakan kelas fundamental web development (HTML, CSS, JS) rutin tiap pekan.",
      "Menyelenggarakan workshop UI/UX dan project kolaboratif.",
      "Membangun budaya sharing dan mentoring antar-anggota.",
    ],
  },
  {
    id: "2",
    nomor: 2,
    warna: "#1e293b",
    ketua: {
      nama: "Budi Santoso",
      foto: "assets/ketua-2.png",
    },
    wakil: {
      nama: "Dewi Lestari",
      foto: "assets/wakil-2.png",
    },
    visi: "Menjadikan ekskul komputer sebagai wadah inovasi teknologi dan pengembangan game kreatif.",
    misi: [
      "Membentuk divisi khusus pembuatan game 2D berbasis browser.",
      "Mengadakan kompetisi internal game jam setiap semester.",
      "Menyediakan perpustakaan aset (audio visual) untuk anggota.",
    ],
  },
  {
    id: "3",
    nomor: 3,
    warna: "#64748b",
    ketua: {
      nama: "Rizky Maulana",
      foto: "assets/ketua-3.png",
    },
    wakil: {
      nama: "Nadia Putri",
      foto: "assets/wakil-3.png",
    },
    visi: "Membangun ekosistem belajar ekskul komputer yang kolaboratif dan siap industri.",
    misi: [
      "Menyelenggarakan bootcamp intensif setiap libur semester.",
      "Memfasilitasi kolaborasi proyek tim menggunakan GitHub.",
      "Menjalin kerja sama dengan komunitas developer lokal.",
    ],
  },
];