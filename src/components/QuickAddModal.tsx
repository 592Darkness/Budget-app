import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../context';
import { TransactionType, RecurringFrequency } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose }) => {
  const { categories, addTransaction } = useAppContext();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>('monthly');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    addTransaction({
      amount: Number(amount),
      type,
      categoryId: type === 'expense' ? categoryId : undefined,
      date: new Date(date).toISOString(),
      note,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      nextPostDate: isRecurring ? new Date(date).toISOString() : undefined,
    });

    // Reset and close
    setAmount('');
    setNote('');
    setIsRecurring(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#141414] rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-white/5">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">Add Transaction</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex rounded-2xl overflow-hidden bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                type === 'expense' 
                  ? 'bg-[#6366F1] text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                type === 'income' 
                  ? 'bg-[#22c55e] text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-lg">$</span>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl focus:ring-2 focus:ring-[#6366F1] focus:border-transparent outline-none text-2xl font-bold text-white placeholder-gray-600 transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          {type === 'expense' && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl focus:ring-2 focus:ring-[#6366F1] outline-none text-white appearance-none transition-all"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-[#141414]">{cat.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl focus:ring-2 focus:ring-[#6366F1] outline-none text-white transition-all [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Note (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl focus:ring-2 focus:ring-[#6366F1] outline-none text-white placeholder-gray-600 transition-all"
              placeholder="What was this for?"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-5 h-5 rounded border-gray-600 bg-white/5 text-[#6366F1] focus:ring-[#6366F1] focus:ring-offset-[#141414]"
            />
            <label htmlFor="recurring" className="text-sm font-medium text-gray-300 cursor-pointer">
              Make this a recurring transaction
            </label>
          </div>

          {isRecurring && (
            <div className="pl-8 animate-in slide-in-from-top-2">
              <select
                value={recurringFrequency}
                onChange={(e) => setRecurringFrequency(e.target.value as RecurringFrequency)}
                className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl focus:ring-2 focus:ring-[#6366F1] outline-none text-white appearance-none transition-all"
              >
                <option value="daily" className="bg-[#141414]">Daily</option>
                <option value="weekly" className="bg-[#141414]">Weekly</option>
                <option value="monthly" className="bg-[#141414]">Monthly</option>
                <option value="yearly" className="bg-[#141414]">Yearly</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 mt-6 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-2xl font-bold text-lg transition-colors shadow-lg shadow-[#6366F1]/20"
          >
            Save Transaction
          </button>
        </form>
      </div>
    </div>
  );
};
