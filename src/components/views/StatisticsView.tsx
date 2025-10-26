import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, TrendingUp, Target, Calendar, CheckCircle, Clock } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';

const StatisticsView: React.FC = () => {
  const { plans, goals, subscriptions, transactions, budgetSettings } = useData();
  const { t } = useLanguage();
  
  const weeklyChartRef = useRef<HTMLCanvasElement>(null);
  const categoryChartRef = useRef<HTMLCanvasElement>(null);
  const goalProgressChartRef = useRef<HTMLCanvasElement>(null);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Weekly task completion
    const weeklyTasks = plans.filter(p => new Date(p.date) >= sevenDaysAgo);
    const weeklyCompleted = weeklyTasks.filter(p => p.completed).length;
    const weeklyCompletionRate = weeklyTasks.length > 0 ? (weeklyCompleted / weeklyTasks.length) * 100 : 0;

    // Monthly task completion
    const monthlyTasks = plans.filter(p => new Date(p.date) >= thirtyDaysAgo);
    const monthlyCompleted = monthlyTasks.filter(p => p.completed).length;

    // Goals progress
    const activeGoals = goals.filter(g => g.status !== 'completed').length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const avgGoalProgress = goals.length > 0
      ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length
      : 0;

    // Budget stats
    const monthlyExpenses = transactions
      .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === now.getMonth())
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlySubscriptionCost = subscriptions
      .filter(s => s.isActive && s.billingCycle === 'monthly')
      .reduce((sum, s) => sum + s.cost, 0);

    return {
      weeklyTasks: weeklyTasks.length,
      weeklyCompleted,
      weeklyCompletionRate,
      monthlyTasks: monthlyTasks.length,
      monthlyCompleted,
      activeGoals,
      completedGoals,
      avgGoalProgress,
      monthlyExpenses,
      monthlySubscriptionCost,
      budgetRemaining: budgetSettings.monthlyBudget - monthlyExpenses - monthlySubscriptionCost,
    };
  }, [plans, goals, subscriptions, transactions, budgetSettings]);

  // Draw weekly completion chart
  useEffect(() => {
    const canvas = weeklyChartRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Get last 7 days data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayPlans = plans.filter(p => p.date.toISOString().split('T')[0] === dateStr);
      const completed = dayPlans.filter(p => p.completed).length;
      const total = dayPlans.length;
      last7Days.push({ date, completed, total });
    }

    // Draw chart
    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;
    const barWidth = chartWidth / 7 - 10;
    const maxValue = Math.max(...last7Days.map(d => d.total), 1);

    last7Days.forEach((day, i) => {
      const x = padding + i * (chartWidth / 7);
      const completedHeight = (day.completed / maxValue) * chartHeight;
      const totalHeight = (day.total / maxValue) * chartHeight;

      // Draw total bar (light)
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(x, rect.height - padding - totalHeight, barWidth, totalHeight);

      // Draw completed bar (colored)
      ctx.fillStyle = '#10b981';
      ctx.fillRect(x, rect.height - padding - completedHeight, barWidth, completedHeight);

      // Draw day label
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      const dayName = day.date.toLocaleDateString('en', { weekday: 'short' });
      ctx.fillText(dayName, x + barWidth / 2, rect.height - 10);
    });

    // Draw legend
    ctx.fillStyle = '#10b981';
    ctx.fillRect(padding, 10, 15, 15);
    ctx.fillStyle = '#374151';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Completed', padding + 20, 22);

    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(padding + 120, 10, 15, 15);
    ctx.fillStyle = '#374151';
    ctx.fillText('Total', padding + 140, 22);

  }, [plans]);

  // Draw category pie chart
  useEffect(() => {
    const canvas = categoryChartRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    // Count tasks by priority
    const priorityCounts = {
      high: plans.filter(p => p.priority === 'high').length,
      medium: plans.filter(p => p.priority === 'medium').length,
      low: plans.filter(p => p.priority === 'low').length,
    };

    const total = priorityCounts.high + priorityCounts.medium + priorityCounts.low;
    if (total === 0) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No tasks yet', rect.width / 2, rect.height / 2);
      return;
    }

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(rect.width, rect.height) / 2 - 40;

    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981',
    };

    let currentAngle = -Math.PI / 2;

    Object.entries(priorityCounts).forEach(([priority, count]) => {
      const sliceAngle = (count / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[priority as keyof typeof colors];
      ctx.fill();

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${count}`, labelX, labelY);

      currentAngle += sliceAngle;
    });

    // Draw legend
    const legendY = rect.height - 30;
    let legendX = 20;
    Object.entries(priorityCounts).forEach(([priority, count]) => {
      ctx.fillStyle = colors[priority as keyof typeof colors];
      ctx.fillRect(legendX, legendY, 15, 15);
      ctx.fillStyle = '#374151';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${priority.charAt(0).toUpperCase() + priority.slice(1)} (${count})`, legendX + 20, legendY + 12);
      legendX += 120;
    });

  }, [plans]);

  // Draw goal progress chart
  useEffect(() => {
    const canvas = goalProgressChartRef.current;
    if (!canvas || goals.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;
    const barHeight = 30;
    const spacing = 20;

    goals.slice(0, 5).forEach((goal, i) => {
      const y = padding + i * (barHeight + spacing);
      
      // Draw background
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(padding, y, chartWidth, barHeight);

      // Draw progress
      const progressWidth = (goal.progress / 100) * chartWidth;
      const gradient = ctx.createLinearGradient(padding, 0, padding + progressWidth, 0);
      gradient.addColorStop(0, '#3b82f6');
      gradient.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = gradient;
      ctx.fillRect(padding, y, progressWidth, barHeight);

      // Draw goal title
      ctx.fillStyle = '#374151';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      const maxTitleWidth = chartWidth - 60;
      let title = goal.title;
      if (ctx.measureText(title).width > maxTitleWidth) {
        while (ctx.measureText(title + '...').width > maxTitleWidth && title.length > 0) {
          title = title.slice(0, -1);
        }
        title += '...';
      }
      ctx.fillText(title, padding + 10, y + barHeight / 2 + 5);

      // Draw percentage
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${goal.progress}%`, padding + chartWidth - 10, y + barHeight / 2 + 5);
    });

  }, [goals]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="text-blue-500" size={32} />
          Statistics & Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your productivity and progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={20} />
            <span className="text-sm opacity-90">Weekly Tasks</span>
          </div>
          <div className="text-3xl font-bold">{stats.weeklyCompleted}/{stats.weeklyTasks}</div>
          <div className="text-sm opacity-90">{Math.round(stats.weeklyCompletionRate)}% completion</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={20} />
            <span className="text-sm opacity-90">Monthly Tasks</span>
          </div>
          <div className="text-3xl font-bold">{stats.monthlyCompleted}</div>
          <div className="text-sm opacity-90">Completed this month</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Target size={20} />
            <span className="text-sm opacity-90">Goals</span>
          </div>
          <div className="text-3xl font-bold">{stats.activeGoals}</div>
          <div className="text-sm opacity-90">{stats.completedGoals} completed</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={20} />
            <span className="text-sm opacity-90">Avg Progress</span>
          </div>
          <div className="text-3xl font-bold">{Math.round(stats.avgGoalProgress)}%</div>
          <div className="text-sm opacity-90">Goal completion</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Completion Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Task Completion
          </h3>
          <canvas
            ref={weeklyChartRef}
            className="w-full"
            style={{ height: '300px' }}
          />
        </div>

        {/* Priority Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Task Priority Distribution
          </h3>
          <canvas
            ref={categoryChartRef}
            className="w-full"
            style={{ height: '300px' }}
          />
        </div>
      </div>

      {/* Goal Progress Chart */}
      {goals.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top 5 Goals Progress
          </h3>
          <canvas
            ref={goalProgressChartRef}
            className="w-full"
            style={{ height: `${Math.min(goals.length, 5) * 50 + 80}px` }}
          />
        </div>
      )}

      {/* Insights */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          📊 Productivity Insights
        </h3>
        <ul className="space-y-2 text-blue-800 dark:text-blue-200">
          {stats.weeklyCompletionRate >= 80 && (
            <li>• 🎉 Excellent! You completed {Math.round(stats.weeklyCompletionRate)}% of your weekly tasks!</li>
          )}
          {stats.weeklyCompletionRate < 50 && stats.weeklyTasks > 0 && (
            <li>• 💪 Keep going! Try to complete more tasks this week.</li>
          )}
          {stats.activeGoals === 0 && (
            <li>• 🎯 Set some goals to track your long-term progress!</li>
          )}
          {stats.avgGoalProgress >= 75 && stats.activeGoals > 0 && (
            <li>• 🚀 Great progress on your goals! You're almost there!</li>
          )}
          {stats.monthlyCompleted > 20 && (
            <li>• ⭐ Impressive! You completed {stats.monthlyCompleted} tasks this month!</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default StatisticsView;

