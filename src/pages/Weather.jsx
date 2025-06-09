import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '../components/ApperIcon';
import weatherService from '../services/api/weatherService';

const Weather = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [current, forecastData] = await Promise.all([
        weatherService.getCurrentWeather(),
        weatherService.getFiveDayForecast()
      ]);
      setCurrentWeather(current);
      setForecast(forecastData);
    } catch (err) {
      setError(err.message || 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return 'Sun';
      case 'cloudy': return 'Cloud';
      case 'partly cloudy': return 'CloudSun';
      case 'rainy': return 'CloudRain';
      case 'stormy': return 'CloudLightning';
      case 'snowy': return 'CloudSnow';
      default: return 'Cloud';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return 'text-yellow-500';
      case 'cloudy': return 'text-gray-500';
      case 'partly cloudy': return 'text-blue-400';
      case 'rainy': return 'text-blue-600';
      case 'stormy': return 'text-purple-600';
      case 'snowy': return 'text-blue-200';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
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
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <ApperIcon name="CloudOff" className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Weather Unavailable</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadWeatherData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Weather Forecast</h1>
        <p className="text-gray-600 mt-1">5-day agricultural weather outlook</p>
      </div>

      {/* Current Weather */}
      {currentWeather && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-primary to-secondary rounded-xl p-8 text-white mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Current Weather</h2>
              <p className="text-primary-100 mb-4">{currentWeather.location}</p>
              <div className="flex items-center space-x-4">
                <div className="text-5xl font-bold">{currentWeather.temperature}°F</div>
                <div>
                  <p className="text-xl">{currentWeather.condition}</p>
                  <p className="text-primary-100">Feels like {currentWeather.feelsLike}°F</p>
                </div>
              </div>
            </div>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="text-6xl"
            >
              <ApperIcon 
                name={getWeatherIcon(currentWeather.condition)} 
                className="w-24 h-24 text-yellow-200" 
              />
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/20">
            <div className="text-center">
              <p className="text-primary-100 text-sm">Humidity</p>
              <p className="text-xl font-semibold">{currentWeather.humidity}%</p>
            </div>
            <div className="text-center">
              <p className="text-primary-100 text-sm">Wind Speed</p>
              <p className="text-xl font-semibold">{currentWeather.windSpeed} mph</p>
            </div>
            <div className="text-center">
              <p className="text-primary-100 text-sm">Precipitation</p>
              <p className="text-xl font-semibold">{currentWeather.precipitation}"</p>
            </div>
            <div className="text-center">
              <p className="text-primary-100 text-sm">UV Index</p>
              <p className="text-xl font-semibold">{currentWeather.uvIndex}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 5-Day Forecast */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">5-Day Forecast</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {forecast.map((day, index) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
            >
              <p className="font-medium text-gray-900 mb-2">
                {index === 0 ? 'Today' : format(new Date(day.date), 'EEE')}
              </p>
              <p className="text-sm text-gray-500 mb-3">
                {format(new Date(day.date), 'MMM dd')}
              </p>
              
              <div className={`w-12 h-12 mx-auto mb-3 ${getConditionColor(day.condition)}`}>
                <ApperIcon name={getWeatherIcon(day.condition)} className="w-12 h-12" />
              </div>
              
              <p className="text-sm font-medium text-gray-900 mb-2">{day.condition}</p>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">High:</span>
                  <span className="font-medium">{day.highTemp}°F</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Low:</span>
                  <span className="font-medium">{day.lowTemp}°F</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Rain:</span>
                  <span className="font-medium">{day.precipitation}"</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <ApperIcon name="Droplets" className="w-3 h-3" />
                  <span>{day.humidity}%</span>
                  <ApperIcon name="Wind" className="w-3 h-3" />
                  <span>{day.windSpeed} mph</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Agricultural Insights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 bg-surface-100 rounded-lg border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <ApperIcon name="Lightbulb" className="w-5 h-5 text-warning" />
          <span>Agricultural Insights</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <ApperIcon name="Droplets" className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Irrigation</h4>
                <p className="text-sm text-gray-600">
                  {forecast.some(day => parseFloat(day.precipitation) > 0.5) 
                    ? 'Natural rainfall expected. Consider reducing irrigation.'
                    : 'No significant rainfall forecast. Monitor soil moisture levels.'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <ApperIcon name="Thermometer" className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Temperature</h4>
                <p className="text-sm text-gray-600">
                  {forecast.some(day => day.lowTemp < 40) 
                    ? 'Frost warning! Protect sensitive crops.'
                    : forecast.some(day => day.highTemp > 85)
                    ? 'High temperatures ahead. Ensure adequate water supply.'
                    : 'Favorable temperature conditions for most crops.'
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <ApperIcon name="Wind" className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Wind Conditions</h4>
                <p className="text-sm text-gray-600">
                  {forecast.some(day => day.windSpeed > 15) 
                    ? 'Strong winds expected. Secure equipment and check plant supports.'
                    : 'Calm wind conditions. Good for spraying and fieldwork.'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <ApperIcon name="Calendar" className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Best Work Days</h4>
                <p className="text-sm text-gray-600">
                  {forecast.filter(day => 
                    day.condition !== 'rainy' && 
                    day.condition !== 'stormy' && 
                    day.windSpeed < 10
                  ).length > 0 
                    ? `${forecast.filter(day => 
                        day.condition !== 'rainy' && 
                        day.condition !== 'stormy' && 
                        day.windSpeed < 10
                      ).length} good working days this week.`
                    : 'Limited good working days. Plan indoor tasks.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Weather;