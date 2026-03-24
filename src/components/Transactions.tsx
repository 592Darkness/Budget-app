import React, { useState } from 'react';
import { useAppContext } from '../context';
import { format } from 'date-fns';
import { Trash2, Search, Filter } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const Transactions: React.FC = () => {
  const { transactions, categories, deleteTransaction } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const filteredTransactions = transactions
    .filter(tx => {
      if (filterType !== 'all' && tx.type !== filterType) return false;
      if (searchTerm) {
        const cat = categories.find(c => c.id === tx.categoryId);
        const searchLower = searchTerm.toLowerCase();
        return (
          tx.note?.toLowerCase().includes(searchLower) ||
          cat?.name.toLowerCase().includes(searchLower) ||
          tx.amount.toString().includes(searchLower)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GY', {
      style: 'currency',
      currency: 'GYD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 lg:pb-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Transactions</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-[#141414] border border-white/5 rounded-2xl focus:ring-2 focus:ring-[#6366F1] focus:border-transparent outline-none text-white placeholder-gray-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-6 py-4 bg-[#141414] border border-white/5 rounded-2xl focus:ring-2 focus:ring-[#6366F1] outline-none text-white appearance-none transition-all cursor-pointer"
          >
            <option value="all" className="bg-[#141414]">All Types</option>
            <option value="income" className="bg-[#141414]">Income</option>
            <option value="expense" className="bg-[#141414]">Expenses</option>
          </select>
        </div>
      </div>

      <div className="bg-[#141414] rounded-[2rem] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-6 font-medium text-gray-400">Date</th>
                <th className="p-6 font-medium text-gray-400">Transaction</th>
                <th className="p-6 font-medium text-gray-400 text-right">Amount</th>
                <th className="p-6 font-medium text-gray-400 text-center w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => {
                  const category = categories.find(c => c.id === tx.categoryId);
                  return (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-6 text-gray-400 whitespace-nowrap">
                        {format(new Date(tx.date), 'MMM d, yyyy')}
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-lg"
                            style={{ backgroundColor: category?.color || (tx.type === 'income' ? '#22c55e' : '#374151') }}
                          >
                            {category?.name.charAt(0) || (tx.type === 'income' ? 'I' : 'E')}
                          </div>
                          <div>
                            <p className="font-bold text-white text-lg">
                              {category?.name || (tx.type === 'income' ? 'Income' : 'Uncategorized')}
                            </p>
                            {tx.note && (
                              <p className="text-gray-400 truncate max-w-[200px] sm:max-w-xs">
                                {tx.note}
                              </p>
                            )}
                            {tx.isRecurring && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[#6366F1]/10 text-[#6366F1] mt-2">
                                Recurring ({tx.recurringFrequency})
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={`p-6 text-right font-bold text-lg whitespace-nowrap ${
                        tx.type === 'income' ? 'text-green-500' : 'text-white'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="p-6 text-center">
                        <button
                          onClick={() => setTransactionToDelete(tx.id)}
                          className="p-3 text-gray-500 hover:text-red-500 rounded-xl hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Delete transaction"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!transactionToDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        onConfirm={() => {
          if (transactionToDelete) deleteTransaction(transactionToDelete);
        }}
        onCancel={() => setTransactionToDelete(null)}
      />
    </div>
  );
};
