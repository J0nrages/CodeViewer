import React from 'react';
import { useState } from 'react';
import { Layout } from './components/Layout';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { WikiView } from './components/WikiView';
import { FileExplorer } from './components/FileExplorer';
import { FlowChartView } from './components/FlowChartView';

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'wiki':
        return <WikiView />;
      case 'explorer':
        return <FileExplorer />;
      case 'flowchart':
        return <FlowChartView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeView={activeView} onViewChange={setActiveView} />
      <main className="pt-16">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
