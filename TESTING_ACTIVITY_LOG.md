# Testing & Debug Checklist: Activity Log System
**For:** Antigravity  
**Date:** 3 Juni 2026  
**Priority:** High — Frontend sudah ready, tinggal verify backend

---

## 1. DATABASE VERIFICATION

Jalankan query berikut dan paste hasilnya:

```sql
-- 1. Verify table exists & structure
DESCRIBE activity_logs;

-- 2. Verify indexes
SHOW INDEX FROM activity_logs;

-- 3. Verify foreign keys
SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_NAME = 'activity_logs' AND TABLE_SCHEMA = 'bengkel';

-- 4. Count existing logs (should be > 0 if auto-logging active)
SELECT COUNT(*) as total_logs FROM activity_logs;

-- 5. Sample data
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 5;
```

**Expected:**
- [ ] Table `activity_logs` exists
- [ ] Columns: id, booking_id, user_id, actor_id, actor_role, action, description, metadata, created_at
- [ ] Indexes on: booking_id, actor_id, created_at
- [ ] Foreign keys to bookings & users

---

## 2. ENDPOINT TESTING

### 2.1 GET /api/activity-logs

**Test 1: Basic fetch (no filters)**
```bash
curl -X GET http://127.0.0.1:8000/api/activity-logs \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": "...",
      "booking_id": "...",
      "actor": { "id": "...", "name": "...", "role": "admin" },
      "action": "booking.created",
      "description": "Booking baru dari John Doe — Ganti Oli",
      "metadata": { ... },
      "created_at": "2026-06-03T..."
    }
  ],
  "pagination": { "total": ..., "page": 1, "per_page": 20, "last_page": ... }
}
```

**Checklist:**
- [ ] Status 200 OK
- [ ] Response has `data` array
- [ ] Response has `pagination` object
- [ ] Each log has: id, booking_id, actor (object with name & role), action, description, created_at
- [ ] Sorted by created_at DESC (newest first)

---

**Test 2: With pagination**
```bash
curl -X GET "http://127.0.0.1:8000/api/activity-logs?page=1&limit=5" \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

**Checklist:**
- [ ] Returns max 5 items
- [ ] pagination.per_page = 5
- [ ] pagination.total reflects actual count

---

**Test 3: Filter by booking_id**
```bash
curl -X GET "http://127.0.0.1:8000/api/activity-logs?booking_id=[BOOKING_UUID]" \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

**Checklist:**
- [ ] Only returns logs for that booking
- [ ] All items have matching booking_id

---

**Test 4: Filter by action**
```bash
curl -X GET "http://127.0.0.1:8000/api/activity-logs?action=booking.created" \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

**Checklist:**
- [ ] Only returns logs with action = "booking.created"

---

### 2.2 GET /api/bookings/{id}/logs

```bash
curl -X GET "http://127.0.0.1:8000/api/bookings/[BOOKING_UUID]/logs" \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

**Checklist:**
- [ ] Returns logs for specific booking only
- [ ] Sorted by created_at DESC
- [ ] All log items have correct booking_id

---

## 3. AUTO-LOGGING VERIFICATION

Lakukan full flow booking dan verify setiap step auto-create log:

### Step 1: Customer buat booking
```bash
# Login as customer
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Create booking
curl -X POST http://127.0.0.1:8000/api/bookings \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"service_id":"[SERVICE_UUID]","vehicle_id":"[VEHICLE_UUID]","user_id":"[USER_UUID]","scheduled_date":"2026-06-05","scheduled_time":"09:00"}'
```

**Verify log:**
```sql
SELECT action, description, actor_role FROM activity_logs 
WHERE action = 'booking.created' ORDER BY created_at DESC LIMIT 1;
```
- [ ] Log exists with action = `booking.created`
- [ ] actor_role = `customer`
- [ ] description contains customer name & service name

---

### Step 2: Admin assign mekanik
```bash
curl -X PUT "http://127.0.0.1:8000/api/bookings/[BOOKING_UUID]" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"mechanic_id":"[MECHANIC_UUID]","status":"confirmed"}'
```

**Verify log:**
```sql
SELECT action, description, actor_role FROM activity_logs 
WHERE action = 'booking.assigned' ORDER BY created_at DESC LIMIT 1;
```
- [ ] Log exists with action = `booking.assigned`
- [ ] actor_role = `admin`

---

### Step 3: Mekanik terima job
```bash
curl -X PUT "http://127.0.0.1:8000/api/bookings/[BOOKING_UUID]" \
  -H "Authorization: Bearer [MECHANIC_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"status":"ready"}'
```

**Verify log:**
```sql
SELECT action, description FROM activity_logs 
WHERE action = 'booking.accepted' ORDER BY created_at DESC LIMIT 1;
```
- [ ] Log exists with action = `booking.accepted`

---

### Step 4: Mekanik submit inspeksi
```bash
curl -X POST http://127.0.0.1:8000/api/inspections \
  -H "Authorization: Bearer [MECHANIC_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"booking_id":"[BOOKING_UUID]","mechanic_id":"[MECHANIC_UUID]","findings":"Oli hitam, kampas rem tipis","estimated_cost":525000,"estimated_duration":105,"items":[{"name":"Kampas Rem","qty":2,"unit_price":150000,"duration_minutes":30}]}'
```

**Verify log:**
```sql
SELECT action, description FROM activity_logs 
WHERE action = 'booking.inspection_done' ORDER BY created_at DESC LIMIT 1;
```
- [ ] Log exists with action = `booking.inspection_done`

---

### Step 5: Admin kirim estimasi
```bash
curl -X PUT "http://127.0.0.1:8000/api/bookings/[BOOKING_UUID]/send-estimation" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"admin_notes":"Estimasi baru Rp525.000"}'
```

**Verify log:**
```sql
SELECT action, description FROM activity_logs 
WHERE action = 'booking.estimation_sent' ORDER BY created_at DESC LIMIT 1;
```
- [ ] Log exists with action = `booking.estimation_sent`

---

### Step 6: Customer approve estimasi
```bash
curl -X PUT "http://127.0.0.1:8000/api/bookings/[BOOKING_UUID]/approve-estimation" \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"action":"approve"}'
```

**Verify log:**
```sql
SELECT action, description FROM activity_logs 
WHERE action = 'booking.estimation_approved' ORDER BY created_at DESC LIMIT 1;
```
- [ ] Log exists with action = `booking.estimation_approved`

---

### Step 7: Admin kirim perintah mulai
```bash
curl -X PUT "http://127.0.0.1:8000/api/bookings/[BOOKING_UUID]/start-service" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"skip_estimation":false}'
```

**Verify log:**
```sql
SELECT action, description FROM activity_logs 
WHERE action = 'booking.service_started' ORDER BY created_at DESC LIMIT 1;
```
- [ ] Log exists with action = `booking.service_started`

---

### Step 8: Mekanik konfirmasi mulai
```bash
curl -X PUT "http://127.0.0.1:8000/api/bookings/[BOOKING_UUID]/confirm-start" \
  -H "Authorization: Bearer [MECHANIC_TOKEN]"
```

**Verify log:**
```sql
SELECT action, description FROM activity_logs 
WHERE action = 'booking.service_confirmed' ORDER BY created_at DESC LIMIT 1;
```
- [ ] Log exists with action = `booking.service_confirmed`

---

### Step 9: Mekanik selesai (checklist done → complete)
```bash
curl -X PUT "http://127.0.0.1:8000/api/bookings/[BOOKING_UUID]/complete-service" \
  -H "Authorization: Bearer [MECHANIC_TOKEN]"
```

**Verify log:**
```sql
SELECT action, description FROM activity_logs 
WHERE action = 'booking.service_completed' ORDER BY created_at DESC LIMIT 1;
```
- [ ] Log exists with action = `booking.service_completed`

---

### Step 10: Kasir konfirmasi pembayaran
```bash
# Create payment
curl -X POST http://127.0.0.1:8000/api/payments \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"booking_id":"[BOOKING_UUID]","amount":525000,"method":"cash","payment_type":"full","status":"pending"}'

# Mark as paid
curl -X PUT "http://127.0.0.1:8000/api/payments/[PAYMENT_UUID]" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"status":"success"}'
```

**Verify logs:**
```sql
SELECT action, description FROM activity_logs 
WHERE action IN ('booking.payment_confirmed', 'booking.completed') 
ORDER BY created_at DESC LIMIT 2;
```
- [ ] Log exists: `booking.payment_confirmed`
- [ ] Log exists: `booking.completed`

---

## 4. FINAL VERIFICATION

Setelah full flow di atas selesai, jalankan:

```sql
-- Total logs for this booking (should be 10-12)
SELECT COUNT(*) FROM activity_logs WHERE booking_id = '[BOOKING_UUID]';

-- All logs in chronological order
SELECT action, description, actor_role, created_at 
FROM activity_logs 
WHERE booking_id = '[BOOKING_UUID]'
ORDER BY created_at ASC;
```

**Expected sequence:**
```
1. booking.created          (customer)
2. booking.assigned         (admin)
3. booking.accepted         (mechanic)
4. booking.inspection_done  (mechanic)
5. booking.estimation_sent  (admin)
6. booking.estimation_approved (customer)
7. booking.service_started  (admin)
8. booking.service_confirmed (mechanic)
9. booking.service_completed (mechanic)
10. booking.payment_confirmed (admin)
11. booking.completed       (system)
```

- [ ] All 11 logs present in correct order
- [ ] Each log has correct actor_role
- [ ] Descriptions readable & contain relevant names

---

## 5. EDGE CASES TO TEST

### 5.1 Cancel booking
```bash
curl -X PUT "http://127.0.0.1:8000/api/bookings/[BOOKING_UUID]" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -d '{"status":"cancelled"}'
```
- [ ] Log created: `booking.cancelled`

### 5.2 Customer reject estimation
```bash
curl -X PUT "http://127.0.0.1:8000/api/bookings/[BOOKING_UUID]/approve-estimation" \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]" \
  -d '{"action":"reject"}'
```
- [ ] Log created: `booking.estimation_rejected`

### 5.3 Unauthorized access
```bash
curl -X GET http://127.0.0.1:8000/api/activity-logs \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]"
```
- [ ] Should return 403 (only admin can view all logs)

---

## 6. POSTMAN COLLECTION UPDATE

Tambahkan ke Postman collection:
- [ ] GET /api/activity-logs
- [ ] GET /api/activity-logs?page=1&limit=5
- [ ] GET /api/activity-logs?booking_id=xxx
- [ ] GET /api/activity-logs?action=booking.created
- [ ] GET /api/bookings/{id}/logs

---

## 7. DELIVERABLES

Setelah testing selesai, mohon kirimkan:
- [ ] Screenshot / paste hasil semua SQL queries di atas
- [ ] Postman test results (semua endpoint 200 OK)
- [ ] Confirmation: auto-logging aktif di semua status transitions
- [ ] List any bugs found & fixes applied
- [ ] Updated Postman collection

---

**Terima kasih! 🙌**
