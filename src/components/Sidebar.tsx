import React from 'react';
import { 
  Clock, Calendar, CalendarDays, CalendarRange, 
  CalendarCheck, StickyNote, Target, Brush,
  X, DollarSign, Timer, BarChart3
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

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-800 
        border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full pt-16 md:pt-6">
          {/* Mobile close button */}
          <div className="md:hidden flex justify-end p-4">
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pb-4 space-y-2">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('nav.navigation')}
              </h2>
            </div>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    onClose();
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon size={20} className={isActive ? 'text-blue-500' : item.color} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
              ContentPlanner Pro v1.0
              <br />
              Professional Planning Suite
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;