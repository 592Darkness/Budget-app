import React, { useState } from 'react';
import { useAppContext } from '../context';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { Category } from '../types';
import { ConfirmModal } from './ConfirmModal';

export const Envelopes: React.FC = () => {
  const { categories, transactions, addCategory, updateCategory, deleteCategory } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [allocatedAmount, setAllocatedAmount] = useState('');
  const [color, setColor] = useState('#6366F1');
  const [parentId, setParentId] = useState<string>('');

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthExpenses = transactions.filter(tx => {
    const d = new Date(tx.date);
    return tx.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setAllocatedAmount(category.allocatedAmount.toString());
      setColor(category.color);
      setParentId(category.parentId || '');
    } else {
      setEditingCategory(null);
      setName('');
      setAllocatedAmount('');
      setColor('#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'));
      setParentId('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !allocatedAmount || isNaN(Number(allocatedAmount))) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name,
        allocatedAmount: Number(allocatedAmount),
        color,
        parentId: parentId || undefined,
      });
    } else {
      addCategory({
        name,
        allocatedAmount: Number(allocatedAmount),
        color,
        parentId: parentId || undefined,
      });
    }
    handleCloseModal();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 lg:pb-8 animate-in fade-in duration-300">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-app-text tracking-tight">Budgets</h1>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-app-text px-6 py-3 rounded-2xl font-bold transition-colors shadow-lg shadow-[#6366F1]/20"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">New Budget</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => {
          const spent = currentMonthExpenses
            .filter(tx => tx.categoryId === category.id)
            .reduce((sum, tx) => sum + tx.amount, 0);
          
          const remaining = category.allocatedAmount - spent;
          const percentSpent = Math.min(100, Math.max(0, (spent / category.allocatedAmount) * 100));
          
          let progressColor = 'bg-[#22c55e]';
          if (percentSpent > 90) progressColor = 'bg-[#ef4444]';
          else if (percentSpent > 75) progressColor = 'bg-[#eab308]';

          return (
            <div key={category.id} className="bg-app-card rounded-[2rem] border border-app-border overflow-hidden group hover:border-app-border transition-colors">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-app-text font-bold text-lg shadow-lg" 
                      style={{ backgroundColor: category.color }}
                    >
                      {category.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-app-text">{category.name}</h3>
                      {category.parentId && (
                        <p className="text-sm text-app-muted">
                          Sub-budget of {categories.find(c => c.id === category.parentId)?.name || 'Unknown'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenModal(category)}
                      className="p-2 text-app-muted hover:text-[#6366F1] rounded-xl hover:bg-[#6366F1]/10 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => setCategoryToDelete(category.id)}
                      className="p-2 text-app-muted hover:text-red-500 rounded-xl hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-app-muted font-medium">Spent</span>
                      <span className="font-bold text-app-text">{formatCurrency(spent)}</span>
                    </div>
                    <div className="w-full bg-app-hover rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${progressColor} transition-all duration-500`} 
                        style={{ width: `${percentSpent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end pt-4 border-t border-app-border">
                    <div>
                      <p className="text-xs text-app-muted uppercase tracking-wider font-bold mb-1">Remaining</p>
                      <p className={`text-2xl font-bold ${remaining < 0 ? 'text-red-500' : 'text-app-text'}`}>
                        {formatCurrency(remaining)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-app-muted uppercase tracking-wider font-bold mb-1">Budget</p>
                      <p className="text-lg font-bold text-app-muted">
                        {formatCurrency(category.allocatedAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-app-card rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-app-border">
            <div className="flex items-center justify-between p-6 border-b border-app-border">
              <h2 className="text-xl font-bold text-app-text">
                {editingCategory ? 'Edit Budget' : 'New Budget'}
              </h2>
              <button onClick={handleCloseModal} className="text-app-muted hover:text-app-text transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-app-muted mb-2">Budget Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 bg-app-hover border border-app-border rounded-2xl focus:ring-2 focus:ring-[#6366F1] outline-none text-app-text placeholder-gray-600 transition-all"
                  placeholder="e.g., Groceries"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-app-muted mb-2">Monthly Budget</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-app-muted font-medium text-lg">$</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={allocatedAmount}
                    onChange={(e) => setAllocatedAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 bg-app-hover border border-app-border rounded-2xl focus:ring-2 focus:ring-[#6366F1] focus:border-transparent outline-none text-2xl font-bold text-app-text placeholder-gray-600 transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-app-muted mb-2">Parent Budget (Optional)</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full p-4 bg-app-hover border border-app-border rounded-2xl focus:ring-2 focus:ring-[#6366F1] outline-none text-app-text appearance-none transition-all"
                >
                  <option value="" className="bg-app-card">None (Top Level)</option>
                  {categories
                    .filter(c => c.id !== editingCategory?.id) // Prevent self-referencing
                    .map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-app-card">{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-app-muted mb-2">Color</label>
                <div className="flex items-center gap-4 p-2 bg-app-hover rounded-2xl border border-app-border">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-12 w-12 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                  />
                  <span className="text-sm font-bold text-app-text uppercase">{color}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 mt-6 bg-[#6366F1] hover:bg-[#4F46E5] text-app-text rounded-2xl font-bold text-lg transition-colors shadow-lg shadow-[#6366F1]/20"
              >
                {editingCategory ? 'Save Changes' : 'Create Budget'}
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!categoryToDelete}
        title="Delete Budget"
        message="Are you sure you want to delete this budget? Transactions associated with it will become uncategorized."
        confirmText="Delete"
        isDestructive={true}
        onConfirm={() => {
          if (categoryToDelete) deleteCategory(categoryToDelete);
        }}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
};
