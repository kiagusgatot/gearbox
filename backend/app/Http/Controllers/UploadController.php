<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function uploadImage(Request $request)
    {
        // 1. Authorization check - only Admin can upload service images
        $actor = $this->getAuthenticatedUser();
        if (!$actor || $actor->role !== 'admin') {
            return response()->json(['message' => 'Forbidden. Only admin can upload images.'], 403);
        }

        // 2. Validation: Image type, formats (jpeg/png/webp), max size 2MB, and folder destination
        $request->validate([
            'file'   => 'required|image|mimes:jpeg,png,webp|max:2048',
            'folder' => 'required|in:services,inspections,checklists',
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $folder = 'uploads/' . $request->folder;
            
            // 3. Save to storage/app/public/uploads/{folder}/
            $path = $file->store($folder, 'public');
            
            // 4. Generate public URL
            $url = asset('storage/' . $path);

            return response()->json([
                'data' => [
                    'url'       => $url,
                    'path'      => $path,
                    'filename'  => basename($path),
                    'size'      => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]
            ], 200);
        }

        return response()->json([
            'success' => false,
            'message' => 'No image file uploaded.'
        ], 400);
    }
}
