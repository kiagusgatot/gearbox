import { useState, useEffect } from 'react';
import { User, Mail, Phone, Pencil, Check, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { AlertDialog } from '../../components/common/ConfirmDialog';

export function Profile() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name:'', phone:'' });
  const [alertDlg, setAlertDlg] = useState(null);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await userService.update(user.id, form);
      setUser(prev => ({ ...prev, ...form }));
      setEditing(false);
      setAlertDlg({ title: 'Berhasil!', message: 'Profil berhasil diperbarui.', variant: 'success' });
    } catch (e) {
      setAlertDlg({ title: 'Gagal', message: e.response?.data?.message || 'Gagal menyimpan profil', variant: 'danger' });
    } finally { setSaving(false); }
  };

  const handleCancel = () => {
    setForm({ name: user?.name || '', phone: user?.phone || '' });
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="section-title">Profil Saya</h1>

        <div className="card">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <User size={28} className="text-primary-600"/>
            </div>
            <div className="flex-1">
              {editing ? (
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nama lengkap"/>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                  <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                </>
              )}
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-primary-600 transition-colors">
                <Pencil size={18}/>
              </button>
            )}
          </div>

          {/* Info fields */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <Mail size={20} className="text-gray-400 flex-shrink-0"/>
              <div className="flex-1">
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <Phone size={20} className="text-gray-400 flex-shrink-0"/>
              <div className="flex-1">
                <p className="text-xs text-gray-400">Telepon</p>
                {editing ? (
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="input-field mt-1" placeholder="08xxxxxxxxxx"/>
                ) : (
                  <p className="text-sm font-semibold text-gray-900">{user?.phone || '-'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Save/Cancel buttons */}
          {editing && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button onClick={handleSave} loading={saving} className="flex-1"><Check size={18}/>Simpan</Button>
              <Button variant="secondary" onClick={handleCancel} className="flex-1"><X size={18}/>Batal</Button>
            </div>
          )}
        </div>
      </div>

      <AlertDialog config={alertDlg} onClose={() => setAlertDlg(null)}/>
    </div>
  );
}
