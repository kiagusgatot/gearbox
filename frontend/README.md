# Booking Bengkel Frontend

React + Tailwind CSS frontend dengan 3 role: Customer, Admin, Mekanik.

## Quick Start
```bash
npm install
npm run dev
```

## Tech Stack
- React 18 + Vite
- Tailwind CSS
- React Router v6 (role-based routing)
- Axios
- Lucide React icons
- Plus Jakarta Sans font

## 3 Role System

### Customer
| Page | Route | Fungsi |
|------|-------|--------|
| Home | `/` | Landing page |
| Services | `/services` | Browse layanan |
| Service Detail | `/services/:id` | Detail + booking |
| My Bookings | `/bookings` | Daftar booking |
| Booking Detail | `/bookings/:id` | Status + review |
| Profile | `/profile` | Data diri + kendaraan |
| Payments | `/payments` | Riwayat pembayaran |

### Admin
| Page | Route | Fungsi |
|------|-------|--------|
| Dashboard | `/admin` | Stats + overview |
| Kelola Booking | `/admin/bookings` | List + filter booking |
| Detail Booking | `/admin/bookings/:id` | Assign mekanik + status |
| Kelola User | `/admin/users` | List user by role |
| Kelola Service | `/admin/services` | CRUD services |

### Mekanik
| Page | Route | Fungsi |
|------|-------|--------|
| Dashboard | `/mechanic` | Stats + antrian |
| Antrian Job | `/mechanic/jobs` | Semua job |
| Detail Job | `/mechanic/jobs/:id` | Accept/inspeksi/selesai |
| Riwayat | `/mechanic/history` | Job selesai |

## Booking Flow
```
Customer booking → Admin assign mekanik → Mekanik accept →
Customer check-in → Mekanik inspeksi → Estimasi ke customer →
Customer approve → Service dikerjakan → Selesai → Review
```

## Status Flow
```
pending → confirmed → ready → in_progress → completed
                                          → cancelled
```

## Environment
```
VITE_API_URL=http://localhost:8000/api
```
