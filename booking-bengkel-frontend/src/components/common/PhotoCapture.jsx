import { useState, useRef } from 'react';
import { Camera, X, Image, Plus } from 'lucide-react';

export function PhotoCapture({ photos = [], onPhotosChange, maxPhotos = 3, label = 'Foto Dokumentasi' }) {
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      if (photos.length >= maxPhotos) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newPhoto = {
          id: Date.now() + Math.random(),
          url: ev.target.result,
          name: file.name,
          timestamp: new Date().toISOString(),
        };
        onPhotosChange([...photos, newPhoto]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const handleRemove = (photoId) => {
    onPhotosChange(photos.filter(p => p.id !== photoId));
  };

  return (
    <div>
      {label && <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>}

      {/* Photo grid */}
      <div className="flex gap-2 flex-wrap">
        {photos.map(photo => (
          <div key={photo.id} className="relative group w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200">
            <img src={photo.url} alt={photo.name} className="w-full h-full object-cover"/>
            <button
              type="button"
              onClick={() => handleRemove(photo.id)}
              className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12}/>
            </button>
          </div>
        ))}

        {/* Add photo button */}
        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-600 transition-colors"
          >
            <Camera size={18}/>
            <span className="text-[10px] mt-0.5">Foto</span>
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {photos.length > 0 && (
        <p className="text-[10px] text-gray-400 mt-1">{photos.length}/{maxPhotos} foto</p>
      )}
    </div>
  );
}
