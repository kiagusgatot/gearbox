import { useState, useEffect } from 'react';
import { Users, Search, Shield, Wrench, User, Plus, Pencil, Trash2 } from 'lucide-react';
import { userService } from '../../services/userService';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog, AlertDialog } from '../../components/common/ConfirmDialog';
import { formatDateTime } from '../../utils/formatters';

const ROLE_STYLE = {
  admin:    { label:'Admin',    color:'bg-red-100 text-red-700',    icon:Shield },
  mechanic: { label:'Mekanik',  color:'bg-orange-100 text-orange-700', icon:Wrench },
  customer: { label:'Customer', color:'bg-blue-100 text-blue-700',  icon:User },
};

export function AdminUsers() {
  const [list, setList] = useState([]); const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); const [q, setQ] = useState('');
  const [modal, setModal] = useState(false); const [editUser, setEditUser] = useState(null);
  const [sub, setSub] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', role:'customer' });
  const [dialog, setDialog] = useState(null);
  const [alertDlg, setAlertDlg] = useState(null);

  const load = () => userService.getAll().then(data => {
    const arr = Array.isArray(data) ? data : (data?.data || []);
    arr.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    setList(arr);
  }).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditUser(null); setForm({ name:'', email:'', phone:'', password:'', role:'customer' }); setModal(true); };
  const openEdit = (u) => { setEditUser(u); setForm({ name:u.name||'', email:u.email||'', phone:u.phone||'', password:'', role:u.role||'customer' }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSub(true);
    try {
      if (editUser) {
        const data = { name:form.name, email:form.email, phone:form.phone, role:form.role };
        if (form.password) data.password = form.password;
        await userService.update(editUser.id, data);
      } else {
        await userService.create ? await userService.create(form) : await fetch('/api/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
      }
      setModal(false); load();
    } catch (e) { setAlertDlg({ title:'Gagal', message:e.response?.data?.message || 'Gagal menyimpan user', variant:'danger' }); }
    finally { setSub(false); }
  };

  const handleDelete = (u) => {
    setDialog({ title:'Hapus User?', message:`"${u.name}" akan dihapus. Pastikan user ini tidak memiliki booking aktif.`, variant:'danger', confirmLabel:'Ya, Hapus',
      onConfirm: async () => { try { await userService.delete(u.id); load(); } catch { setAlertDlg({title:'Gagal',message:'Gagal hapus user. Mungkin masih ada booking aktif.',variant:'danger'}); } }
    });
  };

  const filtered = list.filter(u => filter === 'all' || u.role === filter)
    .filter(u => !q || [u.name, u.email, u.phone].some(v => v?.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 lg:px-8">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div><h1 className="section-title">Kelola User</h1><p className="text-gray-500">Semua pengguna terdaftar</p></div>
          <Button onClick={openAdd}><Plus size={18}/>Tambah User</Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {['customer','mechanic','admin'].map(role => { const st = ROLE_STYLE[role]; return <div key={role} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${st.color}`}><st.icon size={20}/></div><div><p className="text-2xl font-bold text-gray-900">{list.filter(u=>u.role===role).length}</p><p className="text-xs text-gray-500">{st.label}</p></div></div>; })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input icon={Search} placeholder="Cari user..." value={q} onChange={e => setQ(e.target.value)} className="max-w-xs"/>
          <div className="flex gap-2">{['all','customer','mechanic','admin'].map(f => <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f ? 'bg-gray-900 text-white font-semibold shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-500'}`}>{f === 'all' ? 'Semua' : ROLE_STYLE[f]?.label}</button>)}</div>
        </div>

        {loading ? <Loading/> : filtered.length === 0 ? <EmptyState icon={Users} title="Tidak ada user"/> : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Nama</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Telepon</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Terdaftar</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Aksi</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(u => { const st = ROLE_STYLE[u.role] || ROLE_STYLE.customer; return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3 text-gray-600">{u.phone || <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${st.color}`}><st.icon size={12}/>{st.label}</span></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDateTime(u.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEdit(u)} className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors" title="Edit"><Pencil size={16}/></button>
                          <button onClick={() => handleDelete(u)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors" title="Hapus"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ); })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">{filtered.length} user</div>
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editUser ? 'Edit User' : 'Tambah User'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama" value={form.name} onChange={e => setForm({...form, name:e.target.value})} required/>
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} required/>
          <Input label="Telepon" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})}/>
          <Input label={editUser ? 'Password (kosongkan jika tidak diubah)' : 'Password'} type="password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} required={!editUser}/>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select value={form.role} onChange={e => setForm({...form, role:e.target.value})} className="input-field">
              <option value="customer">Customer</option><option value="mechanic">Mekanik</option><option value="admin">Admin</option>
            </select>
          </div>
          <Button type="submit" fullWidth loading={sub}>{editUser ? 'Simpan Perubahan' : 'Tambah User'}</Button>
        </form>
      </Modal>

      <ConfirmDialog config={dialog} onClose={() => setDialog(null)}/>
      <AlertDialog config={alertDlg} onClose={() => setAlertDlg(null)}/>
    </div>
  );
}
