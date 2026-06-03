import { Loader2 } from 'lucide-react';
export function Loading({ text = 'Memuat...' }) {
  return <div className="flex flex-col items-center justify-center py-20">
    <Loader2 size={40} className="text-primary-600 animate-spin mb-4"/>
    <p className="text-gray-500">{text}</p>
  </div>;
}
