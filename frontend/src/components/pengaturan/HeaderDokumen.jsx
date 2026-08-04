import React, { useRef } from 'react';
import { Building2, Upload, X } from 'lucide-react';

/**
 * Flatten alpha + strip letterboxing marks so PDF/UI don't show gray/boxed edges.
 * Transparent areas become white (same as PDF page). Aspect ratio is kept.
 */
function normalizeLogo(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      try {
        const maxSide = 480;
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (!w || !h) {
          resolve({ dataUrl, width: 55, height: 55 });
          return;
        }
        const scale = Math.min(1, maxSide / Math.max(w, h));
        w = Math.max(1, Math.round(w * scale));
        h = Math.max(1, Math.round(h * scale));

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        // White page background — no transparent “box” edges in PDF renderers
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        resolve({
          dataUrl: canvas.toDataURL('image/jpeg', 0.92),
          width: w,
          height: h,
        });
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Gagal memuat logo'));
    img.src = dataUrl;
  });
}

const HeaderDokumen = ({ value = {}, onChange }) => {
  const form = {
    logoBase64: value.logoBase64 || null,
    logoWidth: value.logoWidth || null,
    logoHeight: value.logoHeight || null,
    namaDinas: value.namaDinas || '',
    kota: value.kota || '',
  };
  const fileRef = useRef();

  const update = (field, next) => {
    onChange?.({ ...form, [field]: next });
  };

  const patch = (partial) => {
    onChange?.({ ...form, ...partial });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const raw = ev.target.result;
        const { dataUrl, width, height } = await normalizeLogo(raw);
        patch({
          logoBase64: dataUrl,
          logoWidth: width,
          logoHeight: height,
        });
      } catch {
        // Fallback: store original if canvas fails
        patch({ logoBase64: ev.target.result, logoWidth: null, logoHeight: null });
      }
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    patch({ logoBase64: null, logoWidth: null, logoHeight: null });
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
          <div className="flex items-center gap-3 py-1">
            <img
              src={form.logoBase64}
              alt="Logo"
              className="h-14 w-auto max-w-[7rem] object-contain select-none"
              style={{ backgroundColor: 'transparent' }}
            />
            <span className="text-sm text-gray-600 flex-1">Logo terpasang</span>
            <button
              type="button"
              onClick={removeLogo}
              className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50"
              data-testid="remove-logo-btn"
              aria-label="Hapus logo"
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
