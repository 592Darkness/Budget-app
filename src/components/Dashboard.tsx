import React, { useState } from 'react';
import { useAppContext } from '../context';
import { ChevronLeft, ChevronRight, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { transactions, categories } = useAppContext();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isBalanceDropdownOpen, setIsBalanceDropdownOpen] = useState(false);

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

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

  // Calendar logic
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = monthStart;
  const endDate = monthEnd;
  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const handlePrevMonth = () => setSelectedDate(subMonths(selectedDate, 1));
  const handleNextMonth = () => setSelectedDate(addMonths(selectedDate, 1));

  const hasActivity = (day: Date) => {
    return currentMonthTransactions.some(tx => isSameDay(new Date(tx.date), day));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      {/* Top Header */}
      <header className="flex items-center justify-between mb-8 relative z-20">
        <button onClick={handlePrevMonth} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-app-card text-app-text hover:bg-app-hover border border-app-border transition-colors">
          <ChevronLeft size={20} />
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-app-card text-app-text hover:bg-app-hover border border-app-border transition-colors text-sm font-medium"
          >
            <CalendarIcon size={16} className="text-app-muted" />
            {format(selectedDate, 'MMMM yyyy')}
            <ChevronDown size={16} className="text-app-muted" />
          </button>

          {isCalendarOpen && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-72 bg-app-card border border-app-border rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-app-text">{format(selectedDate, 'MMMM yyyy')}</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-app-muted mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8" />
                ))}
                {days.map((day, i) => {
                  const active = hasActivity(day);
                  const today = isToday(day);
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedDate(day);
                        setIsCalendarOpen(false);
                      }}
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm relative transition-colors ${
                        today ? 'bg-[#6366F1] text-white font-bold' : 'text-app-text hover:bg-app-hover'
                      }`}
                    >
                      {format(day, dateFormat)}
                      {active && !today && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#6366F1]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button onClick={handleNextMonth} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-app-card text-app-text hover:bg-app-hover border border-app-border transition-colors">
          <ChevronRight size={20} />
        </button>
      </header>

      {/* Total Balance Card */}
      <div className="relative z-10">
        <div 
          onClick={() => setIsBalanceDropdownOpen(!isBalanceDropdownOpen)}
          className="bg-app-card p-6 rounded-[2rem] shadow-lg border border-app-border relative overflow-hidden cursor-pointer hover:border-app-muted transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-app-muted">Total Balance</h3>
            <ChevronDown size={20} className={`text-app-muted transition-transform ${isBalanceDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          <p className="text-4xl font-bold text-app-text tracking-tight">
            {formatCurrency(balance)}
          </p>
        </div>

        {isBalanceDropdownOpen && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-app-card border border-app-border rounded-[2rem] shadow-2xl p-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
            <h4 className="text-sm font-bold text-app-muted mb-4 uppercase tracking-wider">Balance Overview</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-app-text">Total Income</span>
                <span className="font-semibold text-green-500">{formatCurrency(totalIncome)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-app-text">Total Expenses</span>
                <span className="font-semibold text-red-500">-{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="h-px bg-app-border w-full my-2" />
              <div className="flex justify-between items-center">
                <span className="text-app-text font-bold">Net Savings</span>
                <span className={`font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(balance)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Budget Card */}
      <div className="bg-app-card p-6 rounded-[2rem] shadow-lg border border-app-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-app-text">Budget</h3>
          <button className="px-4 py-1.5 rounded-xl bg-[#6366F1]/10 text-[#6366F1] text-xs font-semibold hover:bg-[#6366F1]/20 transition-colors">
            All Budgets
          </button>
        </div>
        
        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-app-text">{formatCurrency(remainingBudget)}</span>
            <span className="text-sm font-medium text-app-muted">left</span>
          </div>
          <p className="text-sm text-app-muted">
            -{formatCurrency(totalExpenses)} spent this month
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-app-hover rounded-full h-2 mb-8 overflow-hidden">
          <div 
            className="h-full bg-[#6366F1] rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${budgetProgress}%` }}
          />
        </div>

        {/* Horizontal Category List */}
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
          {categorySpending.map((cat, i) => (
            <div key={cat.id} className="flex items-center gap-3 bg-app-hover rounded-2xl p-3 min-w-[160px] shrink-0">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-10 h-10 transform -rotate-90">
                  <circle cx="20" cy="20" r="16" stroke="var(--app-border)" strokeWidth="4" fill="none" />
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
                <p className="text-sm font-medium text-app-text">{cat.name}</p>
                <p className="text-xs font-medium" style={{ color: cat.color }}>
                  {formatCurrency(cat.spent)} spent
                </p>
              </div>
            </div>
          ))}
          {categorySpending.length === 0 && (
            <div className="text-sm text-app-muted p-2">No expenses yet this month.</div>
          )}
        </div>
      </div>

      {/* Categories Chart Card */}
      <div className="bg-app-card p-6 rounded-[2rem] shadow-lg border border-app-border">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-semibold text-app-text">Categories</h3>
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
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--app-border)" strokeWidth="8" />
            )}
          </svg>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs font-medium text-app-muted mb-1">Expense</p>
            <p className="text-xl font-bold text-app-text tracking-tight">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
