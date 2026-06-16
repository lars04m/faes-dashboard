import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { BugReports } from './components/BugReports';
import { Versions, VersionsProvider } from './versions';
import { InstructionBuilder } from './components/InstructionBuilder';
import { Settings } from './components/Settings';

function App() {
  return (
    <BrowserRouter>
      <VersionsProvider>
        <Sidebar />
        <main
          style={{
            marginLeft: 'var(--sidebar-width)',
            flex: 1,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/bug-reports" replace />} />
            <Route path="/bug-reports" element={<BugReports />} />
            <Route path="/versions/*" element={<Versions />} />
            <Route path="/all-instructions/:instructionId/:entryId" element={<InstructionBuilder />} />
            <Route path="/all-instructions/:instructionId" element={<InstructionBuilder />} />
            <Route path="/all-instructions" element={<InstructionBuilder />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/bug-reports" replace />} />
          </Routes>
        </main>
      </VersionsProvider>
    </BrowserRouter>
  );
}

export default App;
