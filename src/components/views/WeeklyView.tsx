import React, { useState } from 'react';
import { Plus, CalendarDays, ChevronLeft, ChevronRight, CheckCircle, Circle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { PlanItem } from '../../types/planner';
import LinkifiedText from '../common/LinkifiedText';

const WeeklyView: React.FC = () => {
  const { plans, addPlan, updatePlan, deletePlan } = useData();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
  });

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDays = getWeekDays(currentWeek);
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const getPlansForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return plans.filter(plan => 
      plan.date.toISOString().split('T')[0] === dateStr
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay) return;

    addPlan({
      title: newPlan.title,
      description: newPlan.description,
      date: selectedDay,
      completed: false,
      priority: newPlan.priority,
      linkedNotes: [],
    });

    setNewPlan({ title: '', description: '', priority: 'medium' });
    setShowAddForm(false);
    setSelectedDay(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <CalendarDays className="text-purple-500" size={32} />
              Weekly Planning
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Review and plan your week strategically
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {weekDays[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {weekDays[0].toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - {weekDays[6].toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
              </div>
            </div>

            <button
              onClick={() => navigateWeek('next')}
              className="p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {showAddForm && selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Add Task - {selectedDay.toLocaleDateString('en-US')}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newPlan.title}
                  onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={newPlan.priority}
                  onChange={(e) => setNewPlan({ ...newPlan, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Add Task
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedDay(null);
                    setNewPlan({ title: '', description: '', priority: 'medium' });
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dayPlans = getPlansForDay(day);
          const isToday = day.toDateString() === new Date().toDateString();
          const completedTasks = dayPlans.filter(plan => plan.completed).length;
          
          return (
            <div
              key={day.toISOString()}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 transition-all duration-200 hover:shadow-xl ${
                isToday ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              <div className="mb-4">
                <div className={`text-center ${isToday ? 'text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-white'}`}>
                  <div className="text-sm font-medium mb-1">{dayNames[index]}</div>
                  <div className={`text-2xl font-bold ${isToday ? 'bg-purple-100 dark:bg-purple-900/20 rounded-full w-10 h-10 flex items-center justify-center mx-auto' : ''}`}>
                    {day.getDate()}
                  </div>
                </div>
                
                {dayPlans.length > 0 && (
                  <div className="text-center mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {completedTasks}/{dayPlans.length} done
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-4 min-h-32">
                {dayPlans.slice(0, 3).map((plan) => (
                  <div
                    key={plan.id}
                    className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <button
                        onClick={() => updatePlan(plan.id, { completed: !plan.completed })}
                        className="text-purple-500 hover:text-purple-600 transition-colors duration-200"
                      >
                        {plan.completed ? <CheckCircle size={16} /> : <Circle size={16} />}
                      </button>
                      <span className={`text-sm font-medium ${plan.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                        {plan.title.length > 20 ? plan.title.substring(0, 20) + '...' : plan.title}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(plan.priority)}`}>
                      {plan.priority === 'high' ? 'H' : plan.priority === 'medium' ? 'M' : 'L'}
                    </span>
                  </div>
                ))}
                
                {dayPlans.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    +{dayPlans.length - 3} more
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setSelectedDay(day);
                  setShowAddForm(true);
                }}
                className="w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-purple-500 hover:text-purple-500 dark:hover:text-purple-400 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                <span className="text-sm">Add Task</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyView;