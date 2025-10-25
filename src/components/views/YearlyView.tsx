import React, { useState } from 'react';
import { Plus, CalendarCheck, ChevronLeft, ChevronRight, TrendingUp, Target, CheckCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const YearlyView: React.FC = () => {
  const { plans, goals } = useData();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentYear(prev => prev + (direction === 'next' ? 1 : -1));
  };

  const getMonthData = (monthIndex: number) => {
    const monthPlans = plans.filter(plan => {
      const planDate = new Date(plan.date);
      return planDate.getFullYear() === currentYear && planDate.getMonth() === monthIndex;
    });

    const completed = monthPlans.filter(plan => plan.completed).length;
    const total = monthPlans.length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return { total, completed, completionRate };
  };

  const yearlyGoals = goals.filter(goal => {
    const targetYear = new Date(goal.targetDate).getFullYear();
    return targetYear === currentYear;
  });

  const yearlyStats = {
    totalPlans: plans.filter(plan => new Date(plan.date).getFullYear() === currentYear).length,
    completedPlans: plans.filter(plan => 
      new Date(plan.date).getFullYear() === currentYear && plan.completed
    ).length,
    activeGoals: yearlyGoals.filter(goal => goal.status === 'in-progress').length,
    completedGoals: yearlyGoals.filter(goal => goal.status === 'completed').length,
  };

  const yearlyCompletionRate = yearlyStats.totalPlans > 0 
    ? (yearlyStats.completedPlans / yearlyStats.totalPlans) * 100 
    : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <CalendarCheck className="text-red-500" size={32} />
              Yearly Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Long-term strategic planning and goal tracking analysis
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateYear('prev')}
              className="p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="text-center min-w-24">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {currentYear}
              </div>
            </div>

            <button
              onClick={() => navigateYear('next')}
              className="p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Yearly Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{yearlyStats.totalPlans}</div>
                <div className="text-sm opacity-90">Total Plans</div>
              </div>
              <CalendarCheck size={24} className="opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{Math.round(yearlyCompletionRate)}%</div>
                <div className="text-sm opacity-90">Completion Rate</div>
              </div>
              <TrendingUp size={24} className="opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{yearlyStats.activeGoals}</div>
                <div className="text-sm opacity-90">Active Goals</div>
              </div>
              <Target size={24} className="opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{yearlyStats.completedGoals}</div>
                <div className="text-sm opacity-90">Achieved Goals</div>
              </div>
              <CheckCircle size={24} className="opacity-80" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Monthly Performance Overview
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {months.map((month, index) => {
            const monthData = getMonthData(index);
            const isCurrentMonth = new Date().getFullYear() === currentYear && new Date().getMonth() === index;
            
            return (
              <div
                key={month}
                className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                  isCurrentMonth 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/10' 
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-red-300'
                }`}
              >
                <div className="text-center mb-3">
                  <div className={`text-lg font-bold ${
                    isCurrentMonth ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                  }`}>
                    {month}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {monthData.total} plans
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(monthData.completionRate)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${monthData.completionRate}%` }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {monthData.completed}/{monthData.total} done
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goals Overview */}
      {yearlyGoals.length > 0 && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Target className="text-red-500" size={24} />
            {currentYear} Goals
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {yearlyGoals.map((goal) => (
              <div
                key={goal.id}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:shadow-md transition-all duration-200"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {goal.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {goal.description}
                </p>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className={`px-2 py-1 rounded-full ${
                    goal.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    goal.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    goal.status === 'paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {goal.status === 'completed' ? 'Completed' :
                     goal.status === 'in-progress' ? 'In Progress' :
                     goal.status === 'paused' ? 'Paused' : 'Not Started'}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default YearlyView;