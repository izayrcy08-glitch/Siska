import React, { useRef } from 'react';
import { Building2, Upload, X } from 'lucide-react';

const HeaderDokumen = ({ value = {}, onChange }) => {
  const form = {
    logoBase64: value.logoBase64 || null,
    namaDinas: value.namaDinas || '',
    kota: value.kota || '',
  };
  const fileRef = useRef();

  const update = (field, next) => {
    onChange?.({ ...form, [field]: next });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      update('logoBase64', ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    update('logoBase64', null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <Building2 size={16} className="text-purple-700" />
        </div>
        <h2 className="font-semibold text-gray-900">Header Dokumen</h2>
      </div>
      <p className="text-xs text-gray-400 mb-4 ml-10">Opsional — tampil di bagian atas PDF</p>

      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-500 mb-1">Logo Dinas (opsional)</label>
        {form.logoBase64 ? (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <img src={form.logoBase64} alt="Logo" className="w-12 h-12 object-contain" />
            <span className="text-sm text-gray-600 flex-1">Logo terpasang</span>
            <button
              type="button"
              onClick={removeLogo}
              className="text-red-400 hover:text-red-600"
              data-testid="remove-logo-btn"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
            data-testid="upload-logo-btn"
          >
            <Upload size={16} />
            Upload logo (PNG/JPG)
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleLogoUpload}
          className="hidden"
        />
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Nama Dinas / Instansi (opsional)</label>
          <input
            type="text"
            value={form.namaDinas}
            onChange={(e) => update('namaDinas', e.target.value)}
            placeholder="Contoh: DINAS PEKERJAAN UMUM"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all"
            data-testid="header-nama-dinas"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Kota</label>
          <input
            type="text"
            value={form.kota}
            onChange={(e) => update('kota', e.target.value)}
            placeholder="Contoh: Muara Teweh"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all"
            data-testid="header-kota"
          />
        </div>
      </div>
    </div>
  );
};

export default HeaderDokumen;
