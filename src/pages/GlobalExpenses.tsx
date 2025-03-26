import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Pencil, Trash2, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import GlobalExpenseModal from '../components/GlobalExpenseModal';

interface GlobalExpense {
  id: string;
  name: string;
  category: 'payroll' | 'rent' | 'software' | 'utilities' | 'insurance' | 'marketing' | 'office_supplies' | 'accounting' | 'other';
  amount: number;
  description: string | null;
  start_date: string;
  end_date: string | null;
}

function GlobalExpenses() {
  const [expenses, setExpenses] = useState<GlobalExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalMonthlyExpenses, setTotalMonthlyExpenses] = useState(0);
  const [expensesByCategory, setExpensesByCategory] = useState<Record<string, number>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<GlobalExpense | undefined>();

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    // Calculate total monthly expenses and expenses by category
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalMonthlyExpenses(total);

    // Calculate totals by category
    const categoryTotals = expenses.reduce((acc, expense) => {
      const category = expense.category;
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    setExpensesByCategory(categoryTotals);
  }, [expenses]);

  async function fetchExpenses() {
    try {
      const { data, error } = await supabase
        .from('global_expenses')
        .select('*')
        .order('category')
        .order('name');

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleEdit = (expense: GlobalExpense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const { error } = await supabase
        .from('global_expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Error deleting expense. Please try again.');
    }
  };

  const getCategoryLabel = (category: GlobalExpense['category']) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getCategoryColor = (category: GlobalExpense['category']) => {
    const colors: Record<GlobalExpense['category'], string> = {
      accounting: 'bg-cyan-100 text-cyan-800',
      payroll: 'bg-blue-100 text-blue-800',
      rent: 'bg-purple-100 text-purple-800',
      software: 'bg-green-100 text-green-800',
      utilities: 'bg-yellow-100 text-yellow-800',
      insurance: 'bg-pink-100 text-pink-800',
      marketing: 'bg-indigo-100 text-indigo-800',
      office_supplies: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category];
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Global Expenses</h1>
          <p className="text-sm text-gray-600 mt-1">Track company-wide recurring expenses</p>
        </div>
        <button
          onClick={() => {
            setSelectedExpense(undefined);
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-3 py-1.5 text-sm rounded-lg flex items-center hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Expense
        </button>
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-lg shadow-md p-5 mb-6">
        {/* Total Monthly Expenses */}
        <div className="flex items-center mb-4">
          <div className="bg-green-500 p-2 rounded-full text-white mr-3">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Total Monthly Expenses</h3>
            <p className="text-base font-bold text-gray-800">
              ${totalMonthlyExpenses.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Category List */}
        <div className="border-t pt-4">
          <h4 className="text-xs font-medium text-gray-500 mb-3">Expenses by Category</h4>
          <div className="space-y-2">
            {Object.entries(expensesByCategory).map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${getCategoryColor(category as GlobalExpense['category']).replace('bg-', 'bg-opacity-100 bg-').replace('text-', '')}`} />
                  <span className="text-sm text-gray-700">{getCategoryLabel(category as GlobalExpense['category'])}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">${amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{expense.name}</div>
                      {expense.description && (
                        <div className="text-sm text-gray-500">{expense.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(expense.category)}`}>
                      {getCategoryLabel(expense.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-900 font-medium">
                      ${expense.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {format(new Date(expense.start_date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {expense.end_date ? format(new Date(expense.end_date), 'MMM d, yyyy') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-3">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="text-blue-500 hover:text-blue-700 inline-block"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-500 hover:text-red-700 inline-block"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <GlobalExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedExpense(undefined);
        }}
        onExpenseSaved={fetchExpenses}
        expense={selectedExpense}
      />
    </div>
  );
}

export default GlobalExpenses;