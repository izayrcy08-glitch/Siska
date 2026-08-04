import React from 'react';
import { Users } from 'lucide-react';

const DataAtasan = ({ value = {}, onChange }) => {
  const form = {
    nama: value.nama || '',
    nip: value.nip || '',
    jabatan: value.jabatan || '',
  };

  const update = (field, next) => {
    onChange?.({ ...form, [field]: next });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
          <Users size={16} className="text-teal-700" />
        </div>
        <h2 className="font-semibold text-gray-900">Data Atasan</h2>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Nama Atasan</label>
          <input
            type="text"
            value={form.nama}
            onChange={(e) => update('nama', e.target.value)}
            placeholder="Contoh: HARTADI, S.T."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 transition-all"
            data-testid="atasan-nama"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">NIP Atasan</label>
          <input
            type="text"
            value={form.nip}
            onChange={(e) => update('nip', e.target.value)}
            placeholder="Contoh: 19811104 201001 1 018"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 transition-all"
            data-testid="atasan-nip"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Jabatan Atasan</label>
          <textarea
            value={form.jabatan}
            onChange={(e) => update('jabatan', e.target.value)}
            placeholder="Contoh: Kepala UPT Balai Pengelolaan Alat..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 transition-all resize-none"
            data-testid="atasan-jabatan"
          />
        </div>
      </div>
    </div>
  );
};

export default DataAtasan;
