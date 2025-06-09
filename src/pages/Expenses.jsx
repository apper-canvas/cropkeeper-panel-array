import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import ApperIcon from '../components/ApperIcon';
import expenseService from '../services/api/expenseService';

const Expenses = () => {
  const { selectedFarm } = useOutletContext();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filterMonth, setFilterMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [formData, setFormData] = useState({
    category: 'seeds',
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    vendor: ''
  });

  const categories = [
    { key: 'seeds', label: 'Seeds', icon: 'Seed', color: 'bg-success/10 text-success' },
    { key: 'equipment', label: 'Equipment', icon: 'Wrench', color: 'bg-info/10 text-info' },
    { key: 'labor', label: 'Labor', icon: 'Users', color: 'bg-warning/10 text-warning' },
    { key: 'fertilizer', label: 'Fertilizer', icon: 'Zap', color: 'bg-accent/10 text-accent' },
    { key: 'fuel', label: 'Fuel', icon: 'Fuel', color: 'bg-error/10 text-error' },
    { key: 'maintenance', label: 'Maintenance', icon: 'Settings', color: 'bg-secondary/10 text-secondary' },
    { key: 'other', label: 'Other', icon: 'Package', color: 'bg-gray-100 text-gray-600' }
  ];

  useEffect(() => {
    if (selectedFarm) {
      loadExpenses();
    }
  }, [selectedFarm]);

  const loadExpenses = async () => {
    if (!selectedFarm) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await expenseService.getByFarmId(selectedFarm.id);
      setExpenses(data);
    } catch (err) {
      setError(err.message || 'Failed to load expenses');
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFarm) return;

    try {
      const expenseData = {
        ...formData,
        farmId: selectedFarm.id,
        amount: parseFloat(formData.amount)
      };

      if (editingExpense) {
        await expenseService.update(editingExpense.id, expenseData);
        setExpenses(expenses.map(expense => 
          expense.id === editingExpense.id ? { ...expenseData, id: editingExpense.id } : expense
        ));
        toast.success('Expense updated successfully');
      } else {
        const newExpense = await expenseService.create(expenseData);
        setExpenses([...expenses, newExpense]);
        toast.success('Expense added successfully');
      }

      resetForm();
    } catch (error) {
      toast.error(editingExpense ? 'Failed to update expense' : 'Failed to add expense');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description,
      date: expense.date.split('T')[0],
      vendor: expense.vendor || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (expenseId) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      await expenseService.delete(expenseId);
      setExpenses(expenses.filter(expense => expense.id !== expenseId));
      toast.success('Expense deleted successfully');
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'seeds',
      amount: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      vendor: ''
    });
    setEditingExpense(null);
    setShowForm(false);
  };

  const getCategoryData = (categoryKey) => {
    return categories.find(cat => cat.key === categoryKey) || categories[categories.length - 1];
  };

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const monthStart = startOfMonth(new Date(filterMonth + '-01'));
    const monthEnd = endOfMonth(new Date(filterMonth + '-01'));
    return isWithinInterval(expenseDate, { start: monthStart, end: monthEnd });
  });

  const categoryTotals = categories.map(category => {
    const categoryExpenses = filteredExpenses.filter(exp => exp.category === category.key);
    const total = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return { ...category, total, count: categoryExpenses.length };
  }).filter(cat => cat.total > 0);

  const monthlyTotal = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (!selectedFarm) {
    return (
      <div className="text-center py-12">
        <ApperIcon name="DollarSign" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Farm Selected</h3>
        <p className="text-gray-500">Please select a farm to track expenses</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="animate-pulse space-y-3">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">Track {selectedFarm.name} farm costs</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ApperIcon name="Plus" size={20} />
            <span>Add Expense</span>
          </motion.button>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Total</p>
              <p className="text-2xl font-bold text-gray-900">${monthlyTotal.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="DollarSign" className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{filteredExpenses.length}</p>
            </div>
            <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="Receipt" className="w-6 h-6 text-info" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average</p>
              <p className="text-2xl font-bold text-gray-900">
                ${filteredExpenses.length > 0 ? (monthlyTotal / filteredExpenses.length).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="TrendingUp" className="w-6 h-6 text-warning" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categoryTotals.length}</p>
            </div>
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="PieChart" className="w-6 h-6 text-secondary" />
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryTotals.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryTotals.map((category) => (
              <motion.div
                key={category.key}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.color}`}>
                    <ApperIcon name={category.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{category.label}</p>
                    <p className="text-sm text-gray-500">{category.count} items</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">${category.total.toFixed(2)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Expense Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={resetForm}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                    </h2>
                    <button
                      onClick={resetForm}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ApperIcon name="X" size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category *
                        </label>
                        <select
                          required
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          {categories.map((category) => (
                            <option key={category.key} value={category.key}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount ($) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="e.g., Tomato seeds, Fertilizer spray"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vendor
                        </label>
                        <input
                          type="text"
                          value={formData.vendor}
                          onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Store name"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        {editingExpense ? 'Update Expense' : 'Add Expense'}
                      </motion.button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Expenses List */}
      {error ? (
        <div className="text-center py-12">
          <ApperIcon name="AlertCircle" className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Expenses</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadExpenses}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <ApperIcon name="DollarSign" className="w-16 h-16 text-gray-300 mx-auto" />
          </motion.div>
          <h3 className="mt-4 text-lg font-medium">No expenses this month</h3>
          <p className="mt-2 text-gray-500">Start tracking your farm expenses</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Add Expense
          </motion.button>
        </motion.div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h3>
            <div className="space-y-4">
              {filteredExpenses
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((expense, index) => {
                  const categoryData = getCategoryData(expense.category);
                  
                  return (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryData.color}`}>
                          <ApperIcon name={categoryData.icon} className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{expense.description}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{categoryData.label}</span>
                            <span>•</span>
                            <span>{format(new Date(expense.date), 'MMM dd, yyyy')}</span>
                            {expense.vendor && (
                              <>
                                <span>•</span>
                                <span>{expense.vendor}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <p className="font-semibold text-gray-900">${expense.amount.toFixed(2)}</p>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <ApperIcon name="Edit2" size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="p-1 text-gray-400 hover:text-error transition-colors"
                          >
                            <ApperIcon name="Trash2" size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;