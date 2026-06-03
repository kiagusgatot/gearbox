# Backend Spec: Image Upload System
**Status:** Ready for Implementation  
**Priority:** High  
**Date:** 3 Juni 2026

---

## 1. OVERVIEW

Sistem upload gambar untuk:
- Service/layanan cover image (admin upload saat tambah/edit layanan)
- Future: foto inspeksi, foto checklist documentation

---

## 2. STORAGE

### Recommended: Local Storage (Simple)
```
storage/app/public/uploads/
├── services/          ← Cover image layanan
│   ├── ganti-oli-xxxxx.jpg
│   └── tune-up-xxxxx.jpg
├── inspections/       ← Foto inspeksi (future)
└── checklists/        ← Foto checklist (future)
```

### Laravel Setup:
```bash
php artisan storage:link
# Creates symlink: public/storage → storage/app/public
```

### Accessible via:
```
http://127.0.0.1:8000/storage/uploads/services/ganti-oli-xxxxx.jpg
```

---

## 3. DATABASE CHANGES

### Services Table — ADD image_url
```sql
ALTER TABLE services ADD COLUMN image_url VARCHAR(500) NULL AFTER description;
```

---

## 4. API ENDPOINTS

### 4.1 POST /api/upload/image (General Upload)

**Request:** multipart/form-data
```
POST /api/upload/image
Content-Type: multipart/form-data

file: [binary image file]
folder: "services"              (services | inspections | checklists)
```

**Validation:**
- file: required, image (jpeg/png/webp), max 2MB
- folder: required, in [services, inspections, checklists]

**Response:**
```json
{
  "data": {
    "url": "http://127.0.0.1:8000/storage/uploads/services/ganti-oli-1717400000.jpg",
    "path": "uploads/services/ganti-oli-1717400000.jpg",
    "filename": "ganti-oli-1717400000.jpg",
    "size": 245000,
    "mime_type": "image/jpeg"
  }
}
```

### 4.2 POST /api/services (UPDATE — accept image_url)

Tambah field `image_url` di request body:
```json
{
  "name": "Ganti Oli",
  "description": "...",
  "image_url": "http://127.0.0.1:8000/storage/uploads/services/ganti-oli.jpg",
  "labor_price": 50000,
  "parts_price": 100000,
  "..."
}
```

### 4.3 PUT /api/services/{id} (UPDATE — accept image_url)

Same as POST, include `image_url` in update body.

---

## 5. IMPLEMENTATION NOTES

```php
// UploadController.php
public function uploadImage(Request $request)
{
    $request->validate([
        'file'   => 'required|image|mimes:jpeg,png,webp|max:2048',
        'folder' => 'required|in:services,inspections,checklists',
    ]);

    $folder = 'uploads/' . $request->folder;
    $path = $request->file('file')->store($folder, 'public');
    $url = asset('storage/' . $path);

    return response()->json([
        'data' => [
            'url'       => $url,
            'path'      => $path,
            'filename'  => basename($path),
            'size'      => $request->file('file')->getSize(),
            'mime_type' => $request->file('file')->getMimeType(),
        ]
    ]);
}
```

### Route:
```php
Route::post('/upload/image', [UploadController::class, 'uploadImage'])->middleware('auth:sanctum');
```

---

## 6. DELIVERABLES

- [ ] ALTER services table (add image_url)
- [ ] Create UploadController
- [ ] Register route
- [ ] Run `php artisan storage:link`
- [ ] Test upload via Postman
- [ ] Update ServiceController to accept image_url on create/update
- [ ] Verify image accessible via URL

---

**Document Version:** 1.0  
**Date:** 3 Juni 2026
