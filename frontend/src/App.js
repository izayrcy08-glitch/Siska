import React, { useState } from 'react';
import { Toaster } from 'sonner';
import KegiatanPage from './pages/KegiatanPage';
import PengaturanPage from './pages/PengaturanPage';
import BottomNav from './components/BottomNav';
import './App.css';

function App() {
  const today = new Date();
  const [activeTab, setActiveTab] = useState('kegiatan');
  const [activeMonth, setActiveMonth] = useState({
    bulan: today.getMonth() + 1,
    tahun: today.getFullYear(),
  });
  const [dataVersion, setDataVersion] = useState(0);

  const bumpData = () => setDataVersion((v) => v + 1);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 safe-bottom relative shadow-sm">
        {activeTab === 'kegiatan' ? (
          <KegiatanPage
            activeMonth={activeMonth}
            onMonthChange={setActiveMonth}
            onGoToSettings={() => setActiveTab('pengaturan')}
            dataVersion={dataVersion}
          />
        ) : (
          <PengaturanPage
            activeMonth={activeMonth}
            onDataChanged={bumpData}
          />
        )}
      </div>
      <div className="max-w-md mx-auto">
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <Toaster position="top-center" richColors closeButton duration={2500} />
    </div>
  );
}

export default App;
