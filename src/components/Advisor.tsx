import React, { useState } from 'react';
import { useAppContext } from '../context';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { Sparkles, Loader2 } from 'lucide-react';

export const Advisor: React.FC = () => {
  const { transactions, categories } = useAppContext();
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const summary = {
        categories: categories.map(c => ({ name: c.name, budget: c.allocatedAmount })),
        transactions: transactions.map(t => ({
          date: t.date,
          amount: t.amount,
          type: t.type,
          category: categories.find(c => c.id === t.categoryId)?.name || 'Uncategorized',
          note: t.note,
          isRecurring: t.isRecurring,
          frequency: t.recurringFrequency
        }))
      };

      const prompt = `
You are an expert financial advisor. Review the user's financial data (budgets and transactions) provided below.
Provide personalized feedback on their spending habits, actionable advice on how to save money, and highlight any upcoming recurring expenses they should prepare for.
Keep your tone encouraging, professional, and concise. Format your response in Markdown.

Financial Data:
${JSON.stringify(summary, null, 2)}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAdvice(response.text || "No advice generated.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate advice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 lg:pb-8 animate-in fade-in duration-300">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">AI Advisor</h1>
          <p className="text-gray-400 mt-1">Get personalized financial insights and tips</p>
        </div>
        <button
          onClick={getAdvice}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-2xl font-bold transition-colors shadow-lg shadow-[#6366F1]/20"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
          <span>{advice ? 'Refresh Advice' : 'Get Advice'}</span>
        </button>
      </header>

      <div className="bg-[#141414] rounded-[2rem] border border-white/5 overflow-hidden p-6 md:p-8 min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-4 h-full">
            <Loader2 size={48} className="animate-spin text-[#6366F1]" />
            <p className="font-medium animate-pulse">Analyzing your finances...</p>
          </div>
        ) : error ? (
          <div className="text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
            <p className="font-bold mb-1">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : advice ? (
          <div className="markdown-body text-gray-300">
            <Markdown>{advice}</Markdown>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 h-full flex flex-col items-center justify-center">
            <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-gray-400">Ready for some financial wisdom?</p>
            <p className="text-sm mt-2">Click the button above to generate your personalized insights.</p>
          </div>
        )}
      </div>
    </div>
  );
};
