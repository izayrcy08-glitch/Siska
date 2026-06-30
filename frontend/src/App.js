import React, { useState } from 'react';
import KegiatanPage from './pages/KegiatanPage';
import PengaturanPage from './pages/PengaturanPage';
import BottomNav from './components/BottomNav';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('kegiatan');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20 relative shadow-sm">
        {activeTab === 'kegiatan' ? <KegiatanPage onGoToSettings={() => setActiveTab('pengaturan')} /> : <PengaturanPage />}
      </div>
      <div className="max-w-md mx-auto">
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}

export default App;
