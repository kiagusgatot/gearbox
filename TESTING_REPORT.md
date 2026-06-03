# Activity Log System - Testing & Verification Report
**Date:** 3 Juni 2026  
**Status:** All Tests Passed (100% Success)  
**Workspace:** `d:\portfolio-apps\bengkel`

---

## 1. Database Structure Verification

We verified the table structure, indexes, and constraints on the `activity_logs` table in the MySQL database. All parameters match the specifications:

### Table Schema (`DESCRIBE activity_logs`)
| Field | Type | Null | Key | Default | Extra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `char(36)` | NO | PRI | NULL | |
| `booking_id` | `char(36)` | YES | MUL | NULL | |
| `user_id` | `char(36)` | YES | | NULL | |
| `actor_id` | `char(36)` | YES | MUL | NULL | |
| `actor_role` | `enum('admin','mechanic','customer','system')` | NO | | NULL | |
| `action` | `varchar(100)` | NO | | NULL | |
| `description` | `text` | NO | | NULL | |
| `metadata` | `json` | YES | | NULL | |
| `created_at` | `timestamp` | NO | MUL | `CURRENT_TIMESTAMP` | `DEFAULT_GENERATED` |

### Indexes (`SHOW INDEX FROM activity_logs`)
- `PRIMARY` on `id`
- `idx_logs_booking` on `booking_id`
- `idx_logs_actor` on `actor_id`
- `idx_logs_created` on `created_at`

### Foreign Keys
- `activity_logs_booking_id_foreign` reference to `bookings(id)` ON DELETE SET NULL
- `activity_logs_actor_id_foreign` reference to `users(id)` ON DELETE CASCADE

---

## 2. API Endpoint Testing & Edge Cases

The following endpoints were verified:
1. **`GET /api/activity-logs`** (Basic fetch) -> **200 OK**
2. **`GET /api/activity-logs?page=1&limit=5`** (Pagination) -> **200 OK** (correctly returns max 5 items per page)
3. **`GET /api/activity-logs?booking_id=[UUID]`** (Filter by booking_id) -> **200 OK**
4. **`GET /api/activity-logs?action=booking.created`** (Filter by action) -> **200 OK**
5. **`GET /api/bookings/{id}/logs`** (Booking-specific logs) -> **200 OK**

### Edge Cases Verified
- **Unauthorized Access (Customer role)**: Requests to `/api/activity-logs` or `/api/bookings/{id}/logs` return **`403 Forbidden`** as expected.
- **Cancel Booking**: Triggers `booking.cancelled` activity log correctly.
- **Customer Reject Estimation**: Triggers `booking.estimation_rejected` activity log correctly.

---

## 3. Full Flow Auto-Logging Verification

We ran an automated end-to-end integration test simulating the entire booking lifecycle:

### Chronological Steps and Logs Recorded
1. **`booking.created`** (Actor: `John Doe` - `customer`)
   - *Description:* `Booking baru dari John Doe — Ganti Oli`
   - *Metadata:* `{"service_name":"Ganti Oli","vehicle_plate":"B 9876 XYZ","scheduled_date":"2026-06-05"}`
2. **`booking.assigned`** (Actor: `Admin User` - `admin`)
   - *Description:* `Admin assign Ahmad Mekanik ke booking Ganti Oli`
   - *Metadata:* `{"service_name":"Ganti Oli","mechanic_name":"Ahmad Mekanik"}`
3. **`booking.accepted`** (Actor: `Ahmad Mekanik` - `mechanic`)
   - *Description:* `Mekanik Ahmad Mekanik menerima job Ganti Oli`
   - *Metadata:* `{"service_name":"Ganti Oli","mechanic_name":"Ahmad Mekanik"}`
4. **`booking.inspection_done`** (Actor: `Ahmad Mekanik` - `mechanic`)
   - *Description:* `Inspeksi selesai — Ganti Oli (John Doe)`
   - *Metadata:* `{"service_name":"Ganti Oli","customer_name":"John Doe"}`
5. **`booking.estimation_sent`** (Actor: `Admin User` - `admin`)
   - *Description:* `Estimasi dikirim ke John Doe — Rp 525.000`
   - *Metadata:* `{"amount":525000,"customer_name":"John Doe"}`
6. **`booking.estimation_approved`** (Actor: `John Doe` - `customer`)
   - *Description:* `Customer John Doe menyetujui estimasi`
   - *Metadata:* `{"customer_name":"John Doe"}`
7. **`booking.service_started`** (Actor: `Admin User` - `admin`)
   - *Description:* `Perintah mulai service dikirim ke Ahmad Mekanik`
   - *Metadata:* `{"mechanic_name":"Ahmad Mekanik"}`
8. **`booking.service_confirmed`** (Actor: `Ahmad Mekanik` - `mechanic`)
   - *Description:* `Mekanik Ahmad Mekanik mulai mengerjakan Ganti Oli`
   - *Metadata:* `{"service_name":"Ganti Oli","mechanic_name":"Ahmad Mekanik"}`
9. **`booking.service_completed`** (Actor: `Ahmad Mekanik` - `mechanic`)
   - *Description:* `Service selesai — Ganti Oli (John Doe)`
   - *Metadata:* `{"service_name":"Ganti Oli","customer_name":"John Doe"}`
10. **`booking.payment_confirmed`** (Actor: `Admin User` - `admin`)
    - *Description:* `Pembayaran Rp 525.000 dikonfirmasi — Cash`
    - *Metadata:* `{"amount":525000,"method":"cash"}`
11. **`booking.completed`** (Actor: `System` - `system`)
    - *Description:* `Booking Ganti Oli selesai & lunas`
    - *Metadata:* `{"service_name":"Ganti Oli"}`

All 11 status-transition events automatically create clean logs, assign correct roles, and store descriptive details.

---

## 4. Updates Applied & Bugs Fixed
- **Authorization Check in Controller:** Added role checks using `$this->getAuthenticatedUser()` in `ActivityLogController` to restrict index and booking logs endpoints to `admin` role only, resolving the leak where other roles could fetch global logs.

---

## 5. Postman Collection
The updated file [booking_bengkel_api_collection.json](booking_bengkel_api_collection.json) has been populated with a new folder **"Activity Logs"** containing the five tested requests.

---

## 6. Image Upload System

We successfully implemented and verified the Image Upload System:
- **Database Alteration:** Run Laravel database migration adding the `image_url` column (VARCHAR 500, nullable) to the `services` table.
- **Public Storage Link:** Connected public storage path via `php artisan storage:link`.
- **Upload Controller:** Created `UploadController` validating image formats (`jpeg`, `png`, `webp`), size (max 2MB), folder parameters (`services`, `inspections`, `checklists`), and restricting endpoint access exclusively to the `admin` role.
- **Service Controller Integration:** Enabled `ServiceController`'s store/update methods to parse and persist the new `image_url` field, and updated the Eloquent `Service` model's `$fillable` array.
- **Endpoint Verification:** `POST /api/upload/image` returns HTTP 200 with the metadata nested under the `data` key containing the fully qualified public asset URL (`http://127.0.0.1:8000/storage/uploads/services/{filename}.png`) when uploaded as admin, and correctly blocks unauthorized customer attempts with a `403 Forbidden` response.
- **Postman Collection Update:** Added `4. POST Upload Service Image` to the `Services Catalog` folder, configured with `file` and `folder` formdata fields.
