# Aplikasi Booking Bengkel (Bengkel Booking App)

Aplikasi Web Booking Service Bengkel Motor/Mobil berbasis **Laravel (Backend)** dan **React Vite (Frontend)**.

## Struktur Project

```text
project/
├── backend/          # Laravel 11/13 API Service
├── frontend/         # React JS (Vite) Client App
├── .gitignore        # Root Git Ignore
└── README.md         # Dokumentasi Project
```

## Cara Menjalankan Project

### 1. Running Backend (API Server)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### 2. Running Frontend (Client Application)
```bash
cd frontend
npm install
npm run dev
```

## Fitur Utama

- **Autentikasi & Otorisasi**: Login, Register, Forgot Password, dan Email Verification.
- **Manajemen Role**: Hak akses terpisah untuk Admin, Mekanik, dan Customer.
- **Manajemen Kendaraan**: CRUD data kendaraan milik customer dengan validasi tipe bahan bakar dan jenis transmisi.
- **Manajemen Layanan**: Katalog servis bengkel beserta deskripsi, harga, dan gambar.
- **Booking & Lifecycle Flow**: Alur komprehensif mulai dari pemesanan, inspeksi mekanik, persetujuan estimasi biaya, pengerjaan, pembayaran kasir, hingga status selesai.
- **Activity Log System**: Pencatatan aktivitas audit trail pengguna untuk transparansi histori.
