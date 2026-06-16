import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { BugReports } from './components/BugReports';
import { Versions } from './components/Versions';
import { InstructionBuilder } from './components/InstructionBuilder';
import { Settings } from './components/Settings';

function App() {
  const [activeTab, setActiveTab] = useState('bug-reports');

  const renderContent = () => {
    switch (activeTab) {
      case 'bug-reports':
        return <BugReports />;
      case 'versions':
        return <Versions onNavigateToBuilder={() => setActiveTab('all-instructions')} />;
      case 'all-instructions':
        return <InstructionBuilder />;
      case 'settings':
        return <Settings />;
      default:
        return <BugReports />;
    }
  };

  return (
    <>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ marginLeft: 'var(--sidebar-width)', flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {renderContent()}
      </main>
    </>
  );
}

export default App;
