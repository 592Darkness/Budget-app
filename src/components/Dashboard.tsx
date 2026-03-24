import React from 'react';
import { useAppContext } from '../context';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { transactions, categories } = useAppContext();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthTransactions = transactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = currentMonthTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = currentMonthTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const balance = totalIncome - totalExpenses;

  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
  const remainingBudget = totalAllocated - totalExpenses;
  const budgetProgress = totalAllocated > 0 ? Math.min(100, (totalExpenses / totalAllocated) * 100) : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GY', {
      style: 'currency',
      currency: 'GYD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate category spending
  const categorySpending = categories.map(cat => {
    const spent = currentMonthTransactions
      .filter(tx => tx.categoryId === cat.id && tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { ...cat, spent };
  }).filter(cat => cat.spent > 0).sort((a, b) => b.spent - a.spent);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <header className="flex items-center justify-between mb-8">
        <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-[#141414] text-white hover:bg-white/10 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#141414] text-white hover:bg-white/10 transition-colors text-sm font-medium">
          {format(new Date(), 'dd MMM yyyy').toUpperCase()}
          <ChevronDown size={16} className="text-gray-400" />
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-[#141414] text-white hover:bg-white/10 transition-colors">
          <ChevronRight size={20} />
        </button>
      </header>

      {/* Total Balance Card */}
      <div className="bg-[#141414] p-6 rounded-[2rem] shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-400">Total Balance</h3>
          <ChevronDown size={20} className="text-gray-400" />
        </div>
        <p className="text-4xl font-bold text-white tracking-tight">
          {formatCurrency(balance)}
        </p>
      </div>

      {/* Budget Card */}
      <div className="bg-[#141414] p-6 rounded-[2rem] shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Budget</h3>
          <button className="px-4 py-1.5 rounded-xl bg-[#6366F1]/10 text-[#6366F1] text-xs font-semibold hover:bg-[#6366F1]/20 transition-colors">
            All Budgets
          </button>
        </div>
        
        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-white">{formatCurrency(remainingBudget)}</span>
            <span className="text-sm font-medium text-gray-400">left</span>
          </div>
          <p className="text-sm text-gray-500">
            -{formatCurrency(totalExpenses)} spent this month
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/5 rounded-full h-2 mb-8 overflow-hidden">
          <div 
            className="h-full bg-[#6366F1] rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${budgetProgress}%` }}
          />
        </div>

        {/* Horizontal Category List */}
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
          {categorySpending.map((cat, i) => (
            <div key={cat.id} className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 min-w-[160px] shrink-0">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-10 h-10 transform -rotate-90">
                  <circle cx="20" cy="20" r="16" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
                  <circle 
                    cx="20" cy="20" r="16" 
                    stroke={cat.color} 
                    strokeWidth="4" 
                    fill="none" 
                    strokeDasharray={`${2 * Math.PI * 16}`}
                    strokeDashoffset={`${2 * Math.PI * 16 * (1 - (cat.spent / cat.allocatedAmount))}`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{cat.name}</p>
                <p className="text-xs font-medium" style={{ color: cat.color }}>
                  {formatCurrency(cat.spent)} spent
                </p>
              </div>
            </div>
          ))}
          {categorySpending.length === 0 && (
            <div className="text-sm text-gray-500 p-2">No expenses yet this month.</div>
          )}
        </div>
      </div>

      {/* Categories Chart Card */}
      <div className="bg-[#141414] p-6 rounded-[2rem] shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-semibold text-white">Categories</h3>
          <button className="px-4 py-1.5 rounded-xl bg-[#6366F1]/10 text-[#6366F1] text-xs font-semibold hover:bg-[#6366F1]/20 transition-colors">
            Statistics
          </button>
        </div>

        <div className="relative w-64 h-64 mx-auto">
          {/* Custom SVG Donut Chart to match the specific look */}
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {categorySpending.length > 0 ? (() => {
              let currentAngle = 0;
              const total = categorySpending.reduce((sum, cat) => sum + cat.spent, 0);
              
              return categorySpending.map((cat, i) => {
                const percentage = cat.spent / total;
                const angle = percentage * 360;
                const strokeDasharray = `${(angle / 360) * (2 * Math.PI * 40)} ${2 * Math.PI * 40}`;
                const strokeDashoffset = `-${(currentAngle / 360) * (2 * Math.PI * 40)}`;
                
                currentAngle += angle;
                
                return (
                  <circle
                    key={cat.id}
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke={cat.color}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out origin-center"
                    style={{ transform: `rotate(${currentAngle - angle}deg)` }}
                  />
                );
              });
            })() : (
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            )}
          </svg>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs font-medium text-gray-400 mb-1">Expense</p>
            <p className="text-xl font-bold text-white tracking-tight">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
