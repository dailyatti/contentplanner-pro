import React, { useState, useMemo } from 'react';
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar, Edit2, Trash2, AlertTriangle, CheckCircle, CreditCard, Wallet, PieChart } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Subscription, Transaction } from '../../types/planner';

const BudgetView: React.FC = () => {
  const { subscriptions, transactions, budgetSettings, addSubscription, updateSubscription, deleteSubscription, addTransaction, updateBudgetSettings } = useData();
  const { t } = useLanguage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'transactions'>('overview');
  
  const [newSubscription, setNewSubscription] = useState({
    name: '',
    description: '',
    cost: 0,
    currency: 'USD',
    billingCycle: 'monthly' as const,
    nextPayment: '',
    category: 'Software',
    isActive: true,
  });

  const [newTransaction, setNewTransaction] = useState({
    amount: 0,
    description: '',
    type: 'expense' as const,
    category: 'Other',
  });

  const categories = ['Software', 'Entertainment', 'Utilities', 'Food', 'Transport', 'Health', 'Education', 'Other'];
  const currencies = ['USD', 'EUR', 'GBP', 'HUF', 'CAD', 'AUD'];

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Monthly subscription costs
    const monthlySubscriptions = subscriptions.filter(sub => sub.isActive && sub.billingCycle === 'monthly')
      .reduce((sum, sub) => sum + sub.cost, 0);
    
    const yearlySubscriptions = subscriptions.filter(sub => sub.isActive && sub.billingCycle === 'yearly')
      .reduce((sum, sub) => sum + (sub.cost / 12), 0);

    const totalMonthlySubscriptions = monthlySubscriptions + yearlySubscriptions;

    // This month's transactions
    const thisMonthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });

    const monthlyExpenses = thisMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyIncome = thisMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalMonthlyExpenses = monthlyExpenses + totalMonthlySubscriptions;
    const remainingBudget = budgetSettings.monthlyBudget - totalMonthlyExpenses;
    const budgetUsedPercentage = budgetSettings.monthlyBudget > 0 ? (totalMonthlyExpenses / budgetSettings.monthlyBudget) * 100 : 0;

    // Upcoming payments (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    const upcomingPayments = subscriptions.filter(sub => 
      sub.isActive && new Date(sub.nextPayment) <= thirtyDaysFromNow
    );

    return {
      totalMonthlySubscriptions,
      monthlyExpenses,
      monthlyIncome,
      totalMonthlyExpenses,
      remainingBudget,
      budgetUsedPercentage,
      upcomingPayments,
      activeSubscriptions: subscriptions.filter(sub => sub.isActive).length,
    };
  }, [subscriptions, transactions, budgetSettings]);

  const handleSubmitSubscription = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateSubscription(editingId, {
        name: newSubscription.name,
        description: newSubscription.description,
        cost: newSubscription.cost,
        currency: newSubscription.currency,
        billingCycle: newSubscription.billingCycle,
        nextPayment: new Date(newSubscription.nextPayment),
        category: newSubscription.category,
        isActive: newSubscription.isActive,
      });
      setEditingId(null);
    } else {
      addSubscription({
        name: newSubscription.name,
        description: newSubscription.description,
        cost: newSubscription.cost,
        currency: newSubscription.currency,
        billingCycle: newSubscription.billingCycle,
        nextPayment: new Date(newSubscription.nextPayment),
        category: newSubscription.category,
        isActive: newSubscription.isActive,
      });
    }

    setNewSubscription({
      name: '', description: '', cost: 0, currency: 'USD',
      billingCycle: 'monthly', nextPayment: '', category: 'Software', isActive: true
    });
    setShowAddForm(false);
  };

  const handleSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault();

    addTransaction({
      amount: newTransaction.amount,
      description: newTransaction.description,
      date: new Date(),
      type: newTransaction.type,
      category: newTransaction.category,
    });

    setNewTransaction({ amount: 0, description: '', type: 'expense', category: 'Other' });
    setShowTransactionForm(false);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setNewSubscription({
      name: subscription.name,
      description: subscription.description,
      cost: subscription.cost,
      currency: subscription.currency,
      billingCycle: subscription.billingCycle,
      nextPayment: subscription.nextPayment.toISOString().split('T')[0],
      category: subscription.category,
      isActive: subscription.isActive,
    });
    setEditingId(subscription.id);
    setShowAddForm(true);
  };

  const getBudgetStatusColor = () => {
    if (stats.budgetUsedPercentage >= 100) return 'text-red-600 dark:text-red-400';
    if (stats.budgetUsedPercentage >= budgetSettings.warningThreshold) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getBudgetBarColor = () => {
    if (stats.budgetUsedPercentage >= 100) return 'from-red-500 to-red-600';
    if (stats.budgetUsedPercentage >= budgetSettings.warningThreshold) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-500';
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <DollarSign className="text-emerald-500" size={32} />
              {t('budget.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('budget.subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowTransactionForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <Plus size={16} />
              <span className="hidden md:inline">Transaction</span>
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <Plus size={16} />
              <span className="hidden md:inline">Subscription</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <PieChart size={16} className="inline mr-2" />
            {t('budget.overview')}
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === 'subscriptions'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CreditCard size={16} className="inline mr-2" />
            {t('budget.subscriptions')}
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === 'transactions'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Wallet size={16} className="inline mr-2" />
            {t('budget.transactions')}
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Budget Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">${stats.remainingBudget.toFixed(2)}</div>
                  <div className="text-sm opacity-90">{t('budget.remainingBudget')}</div>
                </div>
                <Wallet size={24} className="opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">${stats.totalMonthlySubscriptions.toFixed(2)}</div>
                  <div className="text-sm opacity-90">{t('budget.monthlySubscriptions')}</div>
                </div>
                <CreditCard size={24} className="opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">${stats.monthlyExpenses.toFixed(2)}</div>
                  <div className="text-sm opacity-90">{t('budget.otherExpenses')}</div>
                </div>
                <TrendingDown size={24} className="opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
                  <div className="text-sm opacity-90">{t('budget.activeSubscriptions')}</div>
                </div>
                <CheckCircle size={24} className="opacity-80" />
              </div>
            </div>
          </div>

          {/* Budget Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('budget.budgetProgress')}</h3>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>{t('budget.used')}: ${stats.totalMonthlyExpenses.toFixed(2)}</span>
                <span className={getBudgetStatusColor()}>
                  {stats.budgetUsedPercentage.toFixed(1)}% of ${budgetSettings.monthlyBudget}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                <div
                  className={`bg-gradient-to-r ${getBudgetBarColor()} h-4 rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(100, stats.budgetUsedPercentage)}%` }}
                />
              </div>
            </div>

            {stats.budgetUsedPercentage >= budgetSettings.warningThreshold && (
              <div className={`p-3 rounded-lg ${
                stats.budgetUsedPercentage >= 100 
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200' 
                  : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
              }`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} />
                  <span className="font-medium">
                    {stats.budgetUsedPercentage >= 100 ? t('budget.budgetExceeded') : t('budget.budgetWarning')}
                  </span>
                </div>
                <p className="text-sm mt-1">
                  {stats.budgetUsedPercentage >= 100 
                    ? `You've exceeded your monthly budget by $${(stats.totalMonthlyExpenses - budgetSettings.monthlyBudget).toFixed(2)}`
                    : `You've used ${stats.budgetUsedPercentage.toFixed(1)}% of your monthly budget`
                  }
                </p>
              </div>
            )}
          </div>

          {/* Upcoming Payments */}
          {stats.upcomingPayments.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('budget.upcomingPayments')}</h3>
              <div className="space-y-3">
                {stats.upcomingPayments.map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{subscription.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(subscription.nextPayment).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white">
                        ${subscription.cost} {subscription.currency}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t(`budget.${subscription.billingCycle}`)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          {subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400 mb-4">{t('budget.noSubscriptions')}</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                {t('budget.addFirstSubscription')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className={`p-6 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                    subscription.isActive 
                      ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700' 
                      : 'bg-gray-100 dark:bg-gray-700 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {subscription.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {subscription.description}
                      </p>
                      <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full text-xs">
                        {t(`category.${subscription.category.toLowerCase()}`)}
                      </span>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditSubscription(subscription)}
                        className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteSubscription(subscription.id)}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t('budget.cost')}:</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        ${subscription.cost} {subscription.currency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t('budget.billingCycle')}:</span>
                      <span className="text-sm text-gray-900 dark:text-white capitalize">
                        {t(`budget.${subscription.billingCycle}`)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t('budget.nextPayment')}:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(subscription.nextPayment).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t('budget.status')}:</span>
                      <span className={`text-sm font-medium ${
                        subscription.isActive 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {subscription.isActive ? t('budget.active') : t('budget.inactive')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400 mb-4">{t('budget.noTransactions')}</p>
              <button
                onClick={() => setShowTransactionForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                {t('budget.addFirstTransaction')}
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('budget.date')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('budget.description')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('budget.category')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('budget.type')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('budget.amount')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                            {t(`category.${transaction.category.toLowerCase()}`)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.type === 'income' 
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                          }`}>
                            {transaction.type === 'income' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {transaction.type === 'income' ? t('budget.income') : t('budget.expense')}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                          transaction.type === 'income' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Subscription Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingId ? t('budget.editSubscription') : t('budget.addSubscription')}
            </h3>
            
            <form onSubmit={handleSubmitSubscription} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('budget.serviceName')}
                </label>
                <input
                  type="text"
                  value={newSubscription.name}
                  onChange={(e) => setNewSubscription({ ...newSubscription, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  required
                  placeholder={t('budget.servicePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('budget.description')}
                </label>
                <textarea
                  value={newSubscription.description}
                  onChange={(e) => setNewSubscription({ ...newSubscription, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  rows={2}
                  placeholder={t('budget.descriptionPlaceholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('budget.cost')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSubscription.cost}
                    onChange={(e) => setNewSubscription({ ...newSubscription, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('budget.currency')}
                  </label>
                  <select
                    value={newSubscription.currency}
                    onChange={(e) => setNewSubscription({ ...newSubscription, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {currencies.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('budget.billingCycle')}
                  </label>
                  <select
                    value={newSubscription.billingCycle}
                    onChange={(e) => setNewSubscription({ ...newSubscription, billingCycle: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="monthly">{t('budget.monthly')}</option>
                    <option value="yearly">{t('budget.yearly')}</option>
                    <option value="weekly">{t('budget.weekly')}</option>
                    <option value="daily">{t('budget.daily')}</option>
                    <option value="one-time">{t('budget.oneTime')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('budget.category')}
                  </label>
                  <select
                    value={newSubscription.category}
                    onChange={(e) => setNewSubscription({ ...newSubscription, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{t(`category.${category.toLowerCase()}`)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('budget.nextPayment')}
                </label>
                <input
                  type="date"
                  value={newSubscription.nextPayment}
                  onChange={(e) => setNewSubscription({ ...newSubscription, nextPayment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newSubscription.isActive}
                  onChange={(e) => setNewSubscription({ ...newSubscription, isActive: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('budget.activeSubscription')}
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  {editingId ? t('common.update') : t('common.add')} {t('budget.subscriptions')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                    setNewSubscription({
                      name: '', description: '', cost: 0, currency: 'USD',
                      billingCycle: 'monthly', nextPayment: '', category: 'Software', isActive: true
                    });
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('budget.addTransaction')}
            </h3>
            
            <form onSubmit={handleSubmitTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('budget.description')}
                </label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder={t('budget.transactionPlaceholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('budget.amount')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('budget.type')}
                  </label>
                  <select
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="expense">{t('budget.expense')}</option>
                    <option value="income">{t('budget.income')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('budget.category')}
                </label>
                <select
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{t(`category.${category.toLowerCase()}`)}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  {t('budget.addTransaction')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTransactionForm(false);
                    setNewTransaction({ amount: 0, description: '', type: 'expense', category: 'Other' });
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetView;