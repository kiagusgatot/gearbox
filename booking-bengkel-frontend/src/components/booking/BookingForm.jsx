import { useState, useEffect } from 'react';
import { Calendar, Clock, FileText } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { vehicleService } from '../../services/vehicleService';
export function BookingForm({serviceId,onSubmit,loading}){
  const [vehicles,setVehicles]=useState([]);
  const [form,setForm]=useState({vehicle_id:'',scheduled_date:'',scheduled_time:'',notes:''});
  useEffect(()=>{vehicleService.getAll().then(setVehicles).catch(()=>{});},[]);
  const h=(e)=>setForm({...form,[e.target.name]:e.target.value});
  return <form onSubmit={e=>{e.preventDefault();onSubmit({...form,service_id:serviceId});}} className="space-y-4">
    <div><label className="block text-sm font-medium text-gray-700 mb-2">Kendaraan</label><select name="vehicle_id" value={form.vehicle_id} onChange={h} className="input-field" required><option value="">-- Pilih --</option>{vehicles.map(v=><option key={v.id} value={v.id}>{v.brand} {v.model} — {v.plate}</option>)}</select></div>
    <Input label="Tanggal" name="scheduled_date" type="date" icon={Calendar} value={form.scheduled_date} onChange={h} required/>
    <Input label="Jam" name="scheduled_time" type="time" icon={Clock} value={form.scheduled_time} onChange={h} required/>
    <Input label="Catatan (opsional)" name="notes" icon={FileText} value={form.notes} onChange={h} placeholder="Keluhan atau catatan"/>
    <Button type="submit" fullWidth loading={loading}>Buat Booking</Button>
  </form>;
}
