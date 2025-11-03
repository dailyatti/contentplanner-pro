import React from 'react';
import { ViewType } from '../types/planner';
import HourlyView from './views/HourlyView';
import DailyView from './views/DailyView';
import WeeklyView from './views/WeeklyView';
import MonthlyView from './views/MonthlyView';
import YearlyView from './views/YearlyView';
import NotesView from './views/NotesView';
import GoalsView from './views/GoalsView';
import DrawingView from './views/DrawingView';
import BudgetView from './views/BudgetView';
import PomodoroView from './views/PomodoroView';
import StatisticsView from './views/StatisticsView';
import SettingsView from './views/SettingsView';

interface MainContentProps {
  activeView: ViewType;
  sidebarOpen: boolean;
}

const MainContent: React.FC<MainContentProps> = ({ activeView, sidebarOpen }) => {
  const renderView = () => {
    switch (activeView) {
      case 'hourly':
        return <HourlyView />;
      case 'daily':
        return <DailyView />;
      case 'weekly':
        return <WeeklyView />;
      case 'monthly':
        return <MonthlyView />;
      case 'yearly':
        return <YearlyView />;
      case 'notes':
        return <NotesView />;
      case 'goals':
        return <GoalsView />;
      case 'drawing':
        return <DrawingView />;
      case 'budget':
        return <BudgetView />;
      case 'pomodoro':
        return <PomodoroView />;
      case 'statistics':
        return <StatisticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DailyView />;
    }
  };

  return (
    <main 
      className="flex-1 transition-all duration-300 md:ml-72"
      style={{
        // Mobile: Account for fixed header (56px)
        // Desktop: Full height (header is static)
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div 
        className="overflow-y-auto overflow-x-hidden"
        style={{
          // Mobile: viewport height - header height (56px)
          // Desktop: full viewport height
          height: 'calc(100vh - 56px)',
          // Smooth scrolling
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Content wrapper with proper padding */}
        <div className="min-h-full pt-14 md:pt-0">
          {renderView()}
        </div>
      </div>
    </main>
  );
};

export default MainContent;

