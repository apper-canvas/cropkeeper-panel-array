import weatherData from '../mockData/weather.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class WeatherService {
  async getCurrentWeather() {
    await delay(500);
    return { ...weatherData.current };
  }

  async getFiveDayForecast() {
    await delay(600);
    return weatherData.forecast.map(day => ({ ...day }));
  }

  async getWeatherAlerts() {
    await delay(300);
    return weatherData.alerts?.map(alert => ({ ...alert })) || [];
  }
}

export default new WeatherService();