import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format, isToday, isPast, isFuture } from 'date-fns';
import ApperIcon from '../components/ApperIcon';
import taskService from '../services/api/taskService';
import cropService from '../services/api/cropService';

const Tasks = () => {
  const { selectedFarm } = useOutletContext();
  const [tasks, setTasks] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    type: 'watering',
    cropId: '',
    dueDate: '',
    priority: 'medium'
  });

  useEffect(() => {
    if (selectedFarm) {
      loadData();
    }
  }, [selectedFarm]);

  const loadData = async () => {
    if (!selectedFarm) return;
    
    setLoading(true);
    setError(null);
    try {
      const [tasksData, cropsData] = await Promise.all([
        taskService.getByFarmId(selectedFarm.id),
        cropService.getByFarmId(selectedFarm.id)
      ]);
      setTasks(tasksData);
      setCrops(cropsData);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFarm) return;

    try {
      const taskData = {
        ...formData,
        farmId: selectedFarm.id,
        completed: false,
        completedDate: null
      };

      if (editingTask) {
        await taskService.update(editingTask.id, taskData);
        setTasks(tasks.map(task => 
          task.id === editingTask.id ? { ...taskData, id: editingTask.id } : task
        ));
        toast.success('Task updated successfully');
      } else {
        const newTask = await taskService.create(taskData);
        setTasks([...tasks, newTask]);
        toast.success('Task added successfully');
      }

      resetForm();
    } catch (error) {
      toast.error(editingTask ? 'Failed to update task' : 'Failed to add task');
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const updatedTask = {
        ...task,
        completed: !task.completed,
        completedDate: !task.completed ? new Date().toISOString() : null
      };
      
      await taskService.update(taskId, updatedTask);
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
      toast.success(task.completed ? 'Task marked incomplete' : 'Task completed!');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      type: task.type,
      cropId: task.cropId || '',
      dueDate: task.dueDate.split('T')[0],
      priority: task.priority
    });
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskService.delete(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'watering',
      cropId: '',
      dueDate: '',
      priority: 'medium'
    });
    setEditingTask(null);
    setShowForm(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-error/10 text-error';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'low': return 'bg-info/10 text-info';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTaskTypeIcon = (type) => {
    switch (type) {
      case 'watering': return 'Droplets';
      case 'fertilizing': return 'Zap';
      case 'harvesting': return 'Scissors';
      case 'planting': return 'Seed';
      case 'weeding': return 'Trash2';
      default: return 'CheckSquare';
    }
  };

  const getDateStatus = (dueDate) => {
    if (isToday(new Date(dueDate))) return 'today';
    if (isPast(new Date(dueDate))) return 'overdue';
    if (isFuture(new Date(dueDate))) return 'upcoming';
    return 'normal';
  };

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'pending': return !task.completed;
      case 'completed': return task.completed;
      case 'overdue': return !task.completed && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
      case 'today': return isToday(new Date(task.dueDate));
      default: return true;
    }
  });

  if (!selectedFarm) {
    return (
      <div className="text-center py-12">
        <ApperIcon name="CheckSquare" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Farm Selected</h3>
        <p className="text-gray-500">Please select a farm to manage tasks</p>
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
          <h1 className="text-2xl font-heading font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">Manage {selectedFarm.name} farm activities</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <ApperIcon name="Plus" size={20} />
          <span>Add Task</span>
        </motion.button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'All Tasks' },
          { key: 'pending', label: 'Pending' },
          { key: 'today', label: 'Today' },
          { key: 'overdue', label: 'Overdue' },
          { key: 'completed', label: 'Completed' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task Form Modal */}
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
                      {editingTask ? 'Edit Task' : 'Add New Task'}
                    </h2>
                    <button
                      onClick={resetForm}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ApperIcon name="X" size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Task Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="e.g., Water tomatoes, Apply fertilizer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Task Type
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="watering">Watering</option>
                          <option value="fertilizing">Fertilizing</option>
                          <option value="harvesting">Harvesting</option>
                          <option value="planting">Planting</option>
                          <option value="weeding">Weeding</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Priority
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Related Crop
                      </label>
                      <select
                        value={formData.cropId}
                        onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">General farm task</option>
                        {crops.map((crop) => (
                          <option key={crop.id} value={crop.id}>
                            {crop.name} - {crop.variety}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        {editingTask ? 'Update Task' : 'Add Task'}
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

      {/* Tasks List */}
      {error ? (
        <div className="text-center py-12">
          <ApperIcon name="AlertCircle" className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Tasks</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : filteredTasks.length === 0 ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <ApperIcon name="CheckSquare" className="w-16 h-16 text-gray-300 mx-auto" />
          </motion.div>
          <h3 className="mt-4 text-lg font-medium">
            {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
          </h3>
          <p className="mt-2 text-gray-500">
            {filter === 'all' 
              ? 'Start by adding your first farm task' 
              : 'Try changing the filter or add new tasks'
            }
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Add Task
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task, index) => {
            const dateStatus = getDateStatus(task.dueDate);
            const relatedCrop = crops.find(c => c.id === task.cropId);
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-lg border p-6 transition-all ${
                  task.completed 
                    ? 'border-gray-200 opacity-75' 
                    : dateStatus === 'overdue'
                    ? 'border-error/30 bg-error/5'
                    : dateStatus === 'today'
                    ? 'border-warning/30 bg-warning/5'
                    : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    className={`mt-1 w-6 h-6 border-2 rounded transition-all ${
                      task.completed
                        ? 'border-success bg-success text-white'
                        : 'border-gray-300 hover:border-success hover:bg-success/10'
                    }`}
                  >
                    {task.completed && (
                      <ApperIcon name="Check" className="w-4 h-4" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-semibold ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <ApperIcon name={getTaskTypeIcon(task.type)} className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500 capitalize">{task.type}</span>
                          {relatedCrop && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="text-sm text-gray-500">{relatedCrop.name}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEdit(task)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <ApperIcon name="Edit2" size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="p-1 text-gray-400 hover:text-error transition-colors"
                          >
                            <ApperIcon name="Trash2" size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <ApperIcon name="Calendar" className="w-4 h-4 text-gray-400" />
                        <span className={
                          dateStatus === 'overdue' ? 'text-error font-medium' :
                          dateStatus === 'today' ? 'text-warning font-medium' :
                          'text-gray-600'
                        }>
                          {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                          {dateStatus === 'today' && ' (Today)'}
                          {dateStatus === 'overdue' && ' (Overdue)'}
                        </span>
                      </div>

                      {task.completed && task.completedDate && (
                        <div className="text-sm text-gray-500">
                          Completed {format(new Date(task.completedDate), 'MMM dd')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Tasks;