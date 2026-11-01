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
      nama: "Naufal Azhar",
      foto: "assets/ketua-1.png",
    },
    wakil: {
      nama: "Tofail Lutfi",
      foto: "assets/wakil-1.png",
    },
    visi: "Menjadikan eskul komputer sebagai wadah yang aktif, kreatif, dan inovatif dalam mengembangkan bakat teknologi anggota.",
    misi: [
      "Mengembangkan Minat & Bakat: Menyediakan wadah bagi anggota untuk mendalami pemrograman, desain, dan teknologi komputer lainnya.",
      "Mempererat Kekompakan: Meningkatkan kedisiplinan, kerja sama, dan rasa kekeluargaan yang seru antar sesama anggota dan pengurus.",
      "Evaluasi & Inovasi: Mengevaluasi program secara berkala agar kegiatan eskul selalu asyik dan mengikuti perkembangan teknologi.",
    ],
  },
  {
    id: "2",
    nomor: 2,
    warna: "#1e293b",
    ketua: {
      nama: "Dafa Alparizi",
      foto: "assets/ketua-2.png",
    },
    wakil: {
      nama: "Wahyu Saputra",
      foto: "assets/wakil-2.png",
    },
    visi: "Mewujudkan ekstrakurikuler komputer yang aktif, solid, dan progresif melalui kebersamaan, komunikasi terbuka, serta kegiatan yang bermanfaat agar setiap anggota dapat berkembang dan berkontribusi bersama.",
    misi: [
      "Meningkatkan keaktifan dan partisipasi anggota dalam setiap kegiatan ekskul melalui kegiatan yang terarah dan melibatkan seluruh anggota.",
      "Membangun solidaritas dan kekompakan dengan menciptakan lingkungan ekskul yang nyaman, saling menghargai, peduli, dan membantu satu sama lain.",
      "Mengembangkan kemampuan anggota secara bersama-sama melalui kegiatan praktik, berbagi ilmu, dan proyek kelompok sesuai kemampuan serta fasilitas yang tersedia.",
      "Membuka ruang diskusi dan aspirasi agar setiap anggota berani menyampaikan pendapat, ide, maupun kritik yang membangun.",
    ],
  },
  {
    id: "3",
    nomor: 3,
    warna: "#64748b",
    ketua: {
      nama: "Muhammad Alviansyah",
      foto: "assets/ketua-3.png",
    },
    wakil: {
      nama: "Dimas Singgih.S",
      foto: "assets/wakil-3.png",
    },
    visi: "Terwujudnya ekstrakurikuler komputer yang berprestasi di bidang teknologi informasi dengan melandaskan setiap kegiatannya pada rasa tanggung jawab terhadap kebersihan lingkungan.",
    misi: [
      "Mengintegrasikan nilai kebersihan dan keteraturan sebagai standar utama dalam operasional kegiatan komputer.",
      "Melaksanakan program piket dan perawatan berkala terhadap seluruh inventaris fasilitas komputer.",
      "Mengajarkan pola pikir bertanggung jawab terhadap kebersihan data pribadi, ruang penyimpanan, dan ekosistem digital yang sehat.",
    ],
  },
];