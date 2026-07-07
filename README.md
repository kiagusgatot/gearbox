# 🔧 GEARBOX

**Car Workshop Booking & Service Transparency Platform**

GEARBOX adalah platform booking service kendaraan yang menekankan transparansi biaya dan tracking real-time. Dibangun sebagai solusi untuk masalah umum di bengkel konvensional: biaya tersembunyi, status pengerjaan tidak jelas, dan proses booking yang rumit.

---

## ✨ Features

### Customer
- 📅 **Online Booking** — Pilih layanan, jadwal, dan booking dalam 2 menit
- 💰 **Estimasi Biaya Transparan** — Lihat estimasi sebelum service dimulai, setujui atau tolak
- 📱 **Real-Time Tracking** — Pantau status service dari pending hingga selesai
- 📸 **Inspeksi Terdokumentasi** — Foto dan catatan inspeksi bisa dilihat langsung
- ⭐ **Review & Rating** — Berikan ulasan setelah service selesai

### Admin
- 👥 **Multi-Role Dashboard** — Kelola booking, user, layanan, dan pembayaran
- 📊 **Activity Feed** — Pantau semua aktivitas bengkel secara real-time
- 💳 **Pembayaran Kasir** — Konfirmasi pembayaran offline (tunai, transfer, e-wallet, kartu)
- 📋 **Assign Mekanik** — Distribusi pekerjaan ke mekanik yang tersedia

### Mekanik
- 🔍 **Inspeksi Digital** — Submit temuan inspeksi + estimasi tambahan parts
- ✅ **Checklist Service** — Auto-generated checklist berdasarkan layanan + parts tambahan
- 📷 **Foto Dokumentasi** — Dokumentasi per checklist item
- 📅 **Jadwal Hari Ini** — Lihat antrian job berdasarkan jadwal

---

## 🛠️ Tech Stack

### Backend
- **Laravel 13** — PHP Framework
- **MySQL** — Database
- **Laravel Sanctum** — Authentication (token-based)
- **Mailtrap** — Email sandbox (verification & password reset)

### Frontend
- **React 19** — UI Library
- **Vite** — Build tool
- **Tailwind CSS** — Utility-first CSS
- **React Router v6** — Client-side routing
- **Axios** — HTTP client
- **Lucide React** — Icon library

---

## 📊 System Architecture

### Booking Flow (11 Statuses)
```
pending → confirmed → ready → inspection_done → estimation_sent
→ customer_approved → service_started → in_progress
→ waiting_payment → completed (+ cancelled)
```

### Role-Based Access
| Role | Layout | Access |
|------|--------|--------|
| Customer | Top Navbar | Booking, tracking, review |
| Admin | Sidebar | Full management dashboard |
| Mechanic | Sidebar | Job queue, inspection, checklist |

### Database Schema
- **12+ Tables** — users, bookings, services, vehicles, inspections, estimation_items, service_checklist_items, payments, reviews, activity_logs
- **UUID Primary Keys** — Secure, non-sequential identifiers
- **Activity Logging** — 18 action codes, auto-logged on every status transition

---

## 🚀 Getting Started

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+

### Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Environment Variables

**Backend (.env)**
```env
DB_DATABASE=gearbox
DB_USERNAME=root
DB_PASSWORD=

FRONTEND_URL=http://localhost:3000

MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
```

**Frontend (.env)**
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

### Default Accounts & Dummy Data
> [!WARNING]
> **DANGER: DATA WIPE**
> Menjalankan perintah `php artisan migrate:fresh --seed` akan **MENGHAPUS TOTAL (DROP)** semua data yang ada di database lokal Anda dan menggantinya dengan data dummy dari seeder. Jangan jalankan perintah ini jika Anda memiliki data manual yang penting! Untuk testing migration secara aman, gunakan database testing terpisah (baca bagian Testing Workflow).

**Test Accounts:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gearbox.co.id | password123 |
| Customer | budi@gearbox.co.id | password123 |
| Mechanic | ahmad@gearbox.co.id | password123 |

**Dummy Services:**
1. Ganti Oli
2. Service Umum
3. Kelistrikan
4. Tune-Up

---

## 📁 Project Structure

```
gearbox/
├── backend/                 # Laravel 13 API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Notifications/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── resources/views/emails/
│   └── routes/api.php
│
├── frontend/                # React 19 + Vite
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth context
│   │   ├── hooks/           # Custom hooks
│   │   ├── layouts/         # Navbar, Sidebar, Footer
│   │   ├── pages/           # Route pages
│   │   │   ├── customer/    # Customer pages
│   │   │   ├── admin/       # Admin pages
│   │   │   └── mechanic/    # Mechanic pages
│   │   ├── services/        # API service layer
│   │   └── utils/           # Helpers & constants
│   └── index.html
│
└── README.md
```

---

## 📸 Screenshots

### Landing Page
> Dark hero section dengan app mockup, social proof, layanan dengan harga transparan

### Admin Dashboard
> Real-time activity feed, action needed alerts, quick actions

### Mechanic Checklist
> Interactive checklist dengan foto dokumentasi per item

### Customer Booking Flow
> 2-step booking modal, estimation approval, real-time tracking

---

## 🔐 Security Features

- **Email Verification** — Wajib verifikasi email sebelum login
- **Password Reset** — Self-service via email
- **Role-Based Access** — Endpoint protection per role
- **Token Authentication** — Stateless API auth via Sanctum
- **Input Validation** — Server-side validation pada semua endpoint
- **CORS Protection** — Configured for frontend origin

---

## 📄 API Documentation

### Key Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/register | Register customer |
| POST | /api/login | Login |
| GET | /api/services | List services |
| POST | /api/bookings | Create booking |
| GET | /api/bookings/{id} | Booking detail |
| POST | /api/inspections | Submit inspection |
| PUT | /api/bookings/{id}/send-estimation | Send estimation |
| PUT | /api/bookings/{id}/approve-estimation | Approve/reject |
| PUT | /api/bookings/{id}/confirm-start | Mechanic confirm |
| GET | /api/bookings/{id}/checklist | Get checklist |
| PUT | /api/bookings/{id}/complete-service | Complete service |
| GET | /api/activity-logs | Activity feed |

Full API documentation available in Postman collection.

---

## 👤 Author

**Ki Agus Gatot Mahendra Setiawan**  
UI/UX Designer & Product Strategist

- GitHub: [@kiagusgatot](https://github.com/kiagusgatot)
- LinkedIn: [linkedin.com/in/kiagusgatot](https://linkedin.com/in/kiagusgatot)

---

## 📝 License

This project is licensed under the MIT License.
