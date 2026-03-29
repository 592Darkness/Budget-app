import React, { useMemo } from 'react';
import { useAppContext } from '../context';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

export const Reports: React.FC = () => {
  const { transactions, categories } = useAppContext();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthTransactions = transactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // Prepare data for Pie Chart (Expenses by Category)
  const pieData = useMemo(() => {
    const expensesByCategory = currentMonthTransactions
      .filter(tx => tx.type === 'expense' && tx.categoryId)
      .reduce((acc, tx) => {
        acc[tx.categoryId!] = (acc[tx.categoryId!] || 0) + tx.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(expensesByCategory).map(([categoryId, amount]) => {
      const category = categories.find(c => c.id === categoryId);
      return {
        name: category?.name || 'Unknown',
        value: Number(amount),
        color: category?.color || '#374151',
      };
    }).sort((a, b) => b.value - a.value);
  }, [currentMonthTransactions, categories]);

  // Prepare data for Line Chart (Daily Income vs Expense)
  const lineData = useMemo(() => {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const dayTransactions = currentMonthTransactions.filter(tx => isSameDay(parseISO(tx.date), day));
      const income = dayTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
      const expense = dayTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);

      return {
        date: format(day, 'MMM d'),
        income,
        expense,
      };
    });
  }, [currentMonthTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GY', {
      style: 'currency',
      currency: 'GYD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-app-card p-4 border border-app-border shadow-2xl rounded-2xl">
          <p className="font-bold text-app-text mb-2">{label || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-medium">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 lg:pb-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-app-text tracking-tight">Reports</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category Pie Chart */}
        <div className="bg-app-card p-6 rounded-[2rem] border border-app-border">
          <h3 className="text-xl font-bold text-app-text mb-6">Expenses by Category</h3>
          {pieData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-app-muted">
              No expenses recorded this month.
            </div>
          )}
        </div>

        {/* Income vs Expenses Line Chart */}
        <div className="bg-app-card p-6 rounded-[2rem] border border-app-border">
          <h3 className="text-xl font-bold text-app-text mb-6">Cash Flow Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#6b7280' }} 
                  tickMargin={10}
                  minTickGap={20}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  width={60}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  name="Income" 
                  stroke="#22c55e" 
                  strokeWidth={4}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expense" 
                  name="Expense" 
                  stroke="#ef4444" 
                  strokeWidth={4}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
