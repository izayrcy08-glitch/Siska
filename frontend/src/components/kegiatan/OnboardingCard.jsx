import React from 'react';
import { Check, Circle, FileText, X } from 'lucide-react';

const STEPS = [
  { key: 'settings', label: 'Isi data pegawai di Pengaturan' },
  { key: 'kegiatan', label: 'Input & simpan kegiatan harian' },
  { key: 'pdf', label: 'Download laporan PDF' },
];

const OnboardingCard = ({ stepsDone, onGoToSettings, onDismiss }) => {
  const allDone = stepsDone.settings && stepsDone.kegiatan && stepsDone.pdf;

  if (allDone) return null;

  return (
    <div className="mx-3 mt-3 bg-white border border-blue-100 rounded-2xl p-4 shadow-sm" data-testid="onboarding-card">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Mulai pakai SISKA</p>
          <p className="text-xs text-gray-500 mt-0.5">3 langkah sederhana</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
          aria-label="Tutup panduan"
          data-testid="dismiss-onboarding-btn"
        >
          <X size={16} />
        </button>
      </div>

      <ol className="space-y-2">
        {STEPS.map((step, idx) => {
          const done = !!stepsDone[step.key];
          return (
            <li key={step.key} className="flex items-center gap-2.5">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  done ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {done ? <Check size={13} strokeWidth={2.5} /> : <span className="text-[11px] font-semibold">{idx + 1}</span>}
              </span>
              <span className={`text-sm ${done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                {step.label}
              </span>
              {step.key === 'settings' && !done && (
                <button
                  type="button"
                  onClick={onGoToSettings}
                  className="ml-auto text-xs font-semibold text-blue-800 bg-blue-50 px-2 py-1 rounded-lg"
                >
                  Buka
                </button>
              )}
              {step.key === 'pdf' && !done && (
                <FileText size={14} className="ml-auto text-gray-300" />
              )}
              {step.key === 'kegiatan' && !done && (
                <Circle size={14} className="ml-auto text-gray-300" />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default OnboardingCard;
