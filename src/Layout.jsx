import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ApperIcon from './components/ApperIcon';
import { routes } from './config/routes';
import { loadFarms, setSelectedFarm } from './store/farmSlice';
import weatherService from './services/api/weatherService';

const Layout = () => {
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const location = useLocation();

// Get farm state from Redux
  const { farms, selectedFarm, loading: farmsLoading, error: farmsError } = useSelector((state) => state.farm);

  useEffect(() => {
    // Load farms on component mount
    dispatch(loadFarms());
  }, [dispatch]);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const weatherData = await weatherService.getCurrentWeather();
        setWeather(weatherData);
      } catch (error) {
        console.error('Failed to load weather:', error);
      }
    };
    loadWeather();
  }, []);

  const navigationItems = [
    routes.dashboard,
    routes.farms,
    routes.crops,
    routes.tasks,
    routes.expenses,
    routes.weather
  ];

  const handleFarmChange = (farmId) => {
    const farm = farms.find(f => f.id === farmId);
    if (farm) {
      dispatch(setSelectedFarm(farm));
      toast.success(`Switched to ${farm.name}`);
    }
  };

  const handleRetryLoadFarms = () => {
    dispatch(loadFarms());
  };
  const isCurrentRoute = (path) => {
    if (path === '/dashboard' && location.pathname === '/') return true;
    return location.pathname === path;
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 h-16 bg-white border-b border-gray-200 z-40">
        <div className="h-full flex items-center justify-between px-4 lg:px-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ApperIcon name="Menu" size={20} />
          </button>

{/* Logo and Farm Selector */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ApperIcon name="Wheat" size={24} className="text-primary" />
              <span className="font-heading font-bold text-xl text-gray-900">CropKeeper</span>
            </div>
            
            {/* Farm Selector */}
            <div className="hidden sm:block">
              {farmsLoading ? (
                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-md">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-600">Loading farms...</span>
                </div>
              ) : farmsError ? (
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-1 bg-error/10 text-error rounded-md text-sm">
                    <ApperIcon name="AlertCircle" size={16} className="inline mr-1" />
                    Failed to load farms
                  </div>
                  <button
                    onClick={handleRetryLoadFarms}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    title="Retry loading farms"
                  >
                    Retry
                  </button>
                </div>
              ) : farms.length > 0 ? (
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedFarm?.id || ''}
                    onChange={(e) => handleFarmChange(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  >
                    {farms.map((farm) => (
                      <option key={farm.id} value={farm.id}>
                        {farm.name}
                      </option>
                    ))}
                  </select>
                  {selectedFarm && (
                    <div className="flex items-center space-x-1 px-2 py-1 bg-success/10 text-success rounded text-xs">
                      <ApperIcon name="CheckCircle" size={12} />
                      <span>Active</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-3 py-1 bg-warning/10 text-warning rounded-md text-sm">
                  <ApperIcon name="Info" size={16} className="inline mr-1" />
                  No farms available
                </div>
              )}
            </div>
          </div>

          {/* Weather and Date */}
          <div className="flex items-center space-x-4">
            {weather && (
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <ApperIcon name="Cloud" size={16} className="text-gray-500" />
                <span className="text-gray-600">{weather.temperature}°F</span>
              </div>
            )}
            <div className="text-sm text-gray-600">
              {format(new Date(), 'MMM dd, yyyy')}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 z-40">
          <nav className="h-full overflow-y-auto p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive || isCurrentRoute(item.path)
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <ApperIcon name={item.icon} size={20} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </aside>

        {/* Mobile Navigation Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black/50 z-50"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white z-50"
              >
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="Wheat" size={20} className="text-primary" />
                    <span className="font-heading font-bold text-lg">CropKeeper</span>
                  </div>
                </div>
                <nav className="p-4">
                  <div className="space-y-2">
                    {navigationItems.map((item) => (
                      <NavLink
                        key={item.id}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive || isCurrentRoute(item.path)
                              ? 'bg-primary text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`
                        }
                      >
                        <ApperIcon name={item.icon} size={20} />
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
<Outlet context={{ selectedFarm, farms, farmsLoading, farmsError }} />
          </motion.div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden bg-white border-t border-gray-200">
        <nav className="flex justify-around py-2">
          {navigationItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-3 text-xs ${
                  isActive || isCurrentRoute(item.path)
                    ? 'text-primary'
                    : 'text-gray-500'
                }`
              }
            >
              <ApperIcon name={item.icon} size={20} />
              <span className="mt-1">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;