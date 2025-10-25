import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { DataProvider } from './contexts/DataContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import { ViewType } from './types/planner';

function App() {
  const [activeView, setActiveView] = useState<ViewType>('daily');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <SettingsProvider>
            <DataProvider>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <Header 
                  onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                  sidebarOpen={sidebarOpen}
                  onSettingsClick={() => setActiveView('settings')}
                />
                
                <div className="flex">
                  <Sidebar 
                    activeView={activeView}
                    onViewChange={setActiveView}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                  />
                  
                  <MainContent 
                    activeView={activeView}
                    sidebarOpen={sidebarOpen}
                  />
                </div>
              </div>
            </DataProvider>
        </SettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;