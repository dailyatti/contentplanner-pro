import React from 'react';
import { 
  Clock, Calendar, CalendarDays, CalendarRange, 
  CalendarCheck, StickyNote, Target, Brush,
  DollarSign, Timer, BarChart3
} from 'lucide-react';
import { ViewType } from '../types/planner';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isOpen, onClose }) => {
  const { t } = useLanguage();

  const menuItems = [
    { id: 'hourly' as ViewType, label: t('nav.hourlyPlanning'), icon: Clock, color: 'text-blue-500' },
    { id: 'daily' as ViewType, label: t('nav.dailyPlanning'), icon: Calendar, color: 'text-green-500' },
    { id: 'weekly' as ViewType, label: t('nav.weeklyPlanning'), icon: CalendarDays, color: 'text-purple-500' },
    { id: 'monthly' as ViewType, label: t('nav.monthlyPlanning'), icon: CalendarRange, color: 'text-orange-500' },
    { id: 'yearly' as ViewType, label: t('nav.yearlyPlanning'), icon: CalendarCheck, color: 'text-red-500' },
    { id: 'notes' as ViewType, label: t('nav.smartNotes'), icon: StickyNote, color: 'text-yellow-500' },
    { id: 'goals' as ViewType, label: t('nav.goals'), icon: Target, color: 'text-teal-500' },
    { id: 'drawing' as ViewType, label: t('nav.visualPlanning'), icon: Brush, color: 'text-pink-500' },
    { id: 'budget' as ViewType, label: t('nav.budgetTracker'), icon: DollarSign, color: 'text-emerald-500' },
    { id: 'pomodoro' as ViewType, label: t('nav.pomodoroTimer'), icon: Timer, color: 'text-rose-500' },
    { id: 'statistics' as ViewType, label: t('nav.statistics'), icon: BarChart3, color: 'text-indigo-500' },
  ];

  const handleItemClick = (viewId: ViewType) => {
    onViewChange(viewId);
    // Auto-close on mobile after selection
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay - Click to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:static top-14 md:top-0 bottom-0 left-0 z-50 
          w-72 bg-white dark:bg-gray-800 
          border-r border-gray-200 dark:border-gray-700 
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-4 py-4 md:py-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
              {t('nav.navigation')}
            </h2>
          </div>

          {/* Navigation Menu */}
          <nav 
            className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden"
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth',
            }}
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-lg 
                    transition-all duration-200 text-left
                    min-h-[48px]
                    ${isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }
                    active:scale-95
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon 
                    size={20} 
                    className={`flex-shrink-0 ${isActive ? item.color : ''}`}
                  />
                  <span className="font-medium text-sm md:text-base truncate">
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              ContentPlanner Pro v1.0
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
              Professional Planning Suite
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

