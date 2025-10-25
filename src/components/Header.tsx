import React from 'react';
import { Menu, Moon, Sun, Calendar, Settings, Download, Cog } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import ImportExportModal from './common/ImportExportModal';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
  onSettingsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, sidebarOpen, onSettingsClick }) => {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [showImportExport, setShowImportExport] = React.useState(false);

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300 fixed top-0 left-0 right-0 z-30 md:static">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 md:hidden"
            >
              <Menu size={20} />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Calendar size={20} className="text-white" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('header.title')}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('header.subtitle')}
                </p>
              </div>
              <div className="md:hidden">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  ContentPlanner
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title={isDark ? 'Light Theme' : 'Dark Theme'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={() => setShowImportExport(true)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title="Import/Export Data"
            >
              <Download size={20} />
            </button>

            <button 
              onClick={onSettingsClick}
              className="hidden md:block p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title="Settings"
            >
              <Cog size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>

      <ImportExportModal 
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
      />
    </>
  );
};

export default Header;