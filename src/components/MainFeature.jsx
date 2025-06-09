import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from './ApperIcon';
import cropService from '../services/api/cropService';
import taskService from '../services/api/taskService';
import expenseService from '../services/api/expenseService';

const MainFeature = ({ selectedFarm }) => {
  const [crops, setCrops] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedFarm) return;
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [cropsData, tasksData, expensesData] = await Promise.all([
          cropService.getByFarmId(selectedFarm.id),
          taskService.getByFarmId(selectedFarm.id),
          expenseService.getByFarmId(selectedFarm.id)
        ]);
        
        setCrops(cropsData);
        setTasks(tasksData);
        setExpenses(expensesData);
      } catch (err) {
        setError(err.message || 'Failed to load farm data');
        toast.error('Failed to load farm data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedFarm]);

  const handleQuickTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      await taskService.update(taskId, { 
        ...task, 
        completed: !task.completed,
        completedDate: !task.completed ? new Date().toISOString() : null
      });
      
      setTasks(tasks.map(t => 
        t.id === taskId 
          ? { 
              ...t, 
              completed: !t.completed,
              completedDate: !t.completed ? new Date().toISOString() : null
            }
          : t
      ));
      
      toast.success(task.completed ? 'Task marked incomplete' : 'Task completed!');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  if (!selectedFarm) {
    return (
      <div className="text-center py-12">
        <ApperIcon name="Farm" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Farm Selected</h3>
        <p className="text-gray-500">Please select a farm to view dashboard</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
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

  if (error) {
    return (
      <div className="text-center py-12">
        <ApperIcon name="AlertCircle" className="w-16 h-16 text-error mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const activeCrops = crops.filter(crop => crop.status !== 'harvested');
  const pendingTasks = tasks.filter(task => !task.completed);
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && 
           expenseDate.getFullYear() === now.getFullYear();
  });

  const totalExpenses = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      {/* Farm Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Crops</p>
              <p className="text-2xl font-bold text-gray-900">{activeCrops.length}</p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="Wheat" className="w-6 h-6 text-success" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{pendingTasks.length}</p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="CheckSquare" className="w-6 h-6 text-warning" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
              <p className="text-2xl font-bold text-gray-900">${totalExpenses.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="DollarSign" className="w-6 h-6 text-info" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Crops */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Crops</h3>
            <ApperIcon name="Plus" className="w-5 h-5 text-gray-400" />
          </div>
          
          {activeCrops.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="Wheat" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No active crops</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCrops.slice(0, 3).map((crop, index) => (
                <motion.div
                  key={crop.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{crop.name}</p>
                    <p className="text-sm text-gray-500">{crop.variety}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    crop.status === 'growing' ? 'bg-success/10 text-success' :
                    crop.status === 'planted' ? 'bg-info/10 text-info' :
                    'bg-warning/10 text-warning'
                  }`}>
                    {crop.status}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
            <ApperIcon name="Plus" className="w-5 h-5 text-gray-400" />
          </div>
          
          {pendingTasks.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="CheckSquare" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No pending tasks</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTasks.slice(0, 3).map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-500">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleQuickTask(task.id)}
                    className="w-6 h-6 border-2 border-gray-300 rounded hover:border-success hover:bg-success/10 transition-colors"
                  >
                    {task.completed && (
                      <ApperIcon name="Check" className="w-4 h-4 text-success" />
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainFeature;