import React, { useState } from 'react';
import { User } from 'lucide-react';

const SETTINGS_KEY = 'settings';

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveSettings(data) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(data)); } catch {}
}

const DataPegawai = () => {
  const init = loadSettings()?.pegawai || { nama: '', nip: '', jabatan: '' };
  const [form, setForm] = useState(init);

  const handleBlur = (field, value) => {
    const current = loadSettings() || { pegawai: {}, atasan: {}, headerDokumen: {} };
    current.pegawai = { ...current.pegawai, [field]: value };
    saveSettings(current);
  };

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <User size={16} className="text-blue-700" />
        </div>
        <h2 className="font-semibold text-gray-900">Data Pegawai</h2>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Nama Lengkap</label>
          <input
            type="text"
            value={form.nama}
            onChange={e => update('nama', e.target.value)}
            onBlur={e => handleBlur('nama', e.target.value)}
            placeholder="Masukkan nama lengkap"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-all"
            data-testid="pegawai-nama"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">NIP</label>
          <input
            type="text"
            value={form.nip}
            onChange={e => update('nip', e.target.value)}
            onBlur={e => handleBlur('nip', e.target.value)}
            placeholder="Contoh: 199703162025061003"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-all"
            data-testid="pegawai-nip"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Jabatan</label>
          <textarea
            value={form.jabatan}
            onChange={e => update('jabatan', e.target.value)}
            onBlur={e => handleBlur('jabatan', e.target.value)}
            placeholder="Contoh: Operator Alat Berat Pada UPT..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-all resize-none"
            data-testid="pegawai-jabatan"
          />
        </div>
      </div>
    </div>
  );
};

export default DataPegawai;
