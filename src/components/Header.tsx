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
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 fixed top-0 left-0 right-0 z-30 md:static">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Left Section */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Hamburger Menu (Mobile Only) */}
              <button
                onClick={onMenuClick}
                className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={sidebarOpen}
              >
                <Menu size={22} />
              </button>
              
              {/* Logo & Title */}
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
                  <Calendar size={18} className="text-white md:w-5 md:h-5" />
                </div>
                
                {/* Desktop Title */}
                <div className="hidden md:block">
                  <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-tight">
                    {t('header.title')}
                  </h1>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-tight">
                    {t('header.subtitle')}
                  </p>
                </div>
                
                {/* Mobile Title */}
                <div className="md:hidden">
                  <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                    ContentPlanner
                  </h1>
                </div>
              </div>
            </div>

            {/* Right Section - Action Buttons */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                title={isDark ? t('header.lightTheme') : t('header.darkTheme')}
                aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Import/Export */}
              <button
                onClick={() => setShowImportExport(true)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                title={t('header.importExport')}
                aria-label="Import or export data"
              >
                <Download size={20} />
              </button>

              {/* Settings (Desktop Only) */}
              <button 
                onClick={onSettingsClick}
                className="hidden md:flex p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-all duration-200 min-w-[44px] min-h-[44px] items-center justify-center"
                title={t('header.settings')}
                aria-label="Open settings"
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

