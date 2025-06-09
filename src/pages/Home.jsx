import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '../components/ApperIcon';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: 'Wheat',
      title: 'Crop Management',
      description: 'Track planting dates, growth stages, and harvest schedules',
      action: () => navigate('/crops')
    },
    {
      icon: 'CheckSquare',
      title: 'Task Scheduling',
      description: 'Organize farm activities with due dates and priorities',
      action: () => navigate('/tasks')
    },
    {
      icon: 'DollarSign',
      title: 'Expense Tracking',
      description: 'Monitor farm costs and categorize expenses',
      action: () => navigate('/expenses')
    },
    {
      icon: 'Cloud',
      title: 'Weather Monitoring',
      description: 'Stay informed with 5-day agricultural forecasts',
      action: () => navigate('/weather')
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center mb-6">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            <ApperIcon name="Wheat" className="w-16 h-16 text-primary" />
          </motion.div>
        </div>
        <h1 className="text-4xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
          Welcome to CropKeeper
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Your comprehensive farm management solution for tracking crops, scheduling tasks, 
          monitoring expenses, and staying ahead of weather conditions.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Get Started
        </motion.button>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            onClick={feature.action}
            className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer group hover:border-primary/30 transition-all"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <ApperIcon name={feature.icon} className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-primary to-secondary rounded-xl p-8 text-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold mb-2">100%</div>
            <div className="text-primary-100">Crop Visibility</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">24/7</div>
            <div className="text-primary-100">Weather Monitoring</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">Easy</div>
            <div className="text-primary-100">Expense Tracking</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;