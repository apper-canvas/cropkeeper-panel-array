import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import Crops from '../pages/Crops';
import Farms from '../pages/Farms';
import Tasks from '../pages/Tasks';
import Expenses from '../pages/Expenses';
import Weather from '../pages/Weather';
export const routes = {
  home: {
    id: 'home',
    label: 'Home',
    path: '/home',
    icon: 'Home',
    component: Home
  },
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    component: Dashboard
  },
  crops: {
    id: 'crops',
    label: 'Crops',
    path: '/crops',
    icon: 'Wheat',
    component: Crops
  },
  tasks: {
    id: 'tasks',
    label: 'Tasks',
    path: '/tasks',
    icon: 'CheckSquare',
    component: Tasks
  },
  expenses: {
    id: 'expenses',
    label: 'Expenses',
    path: '/expenses',
    icon: 'DollarSign',
    component: Expenses
  },
  weather: {
    id: 'weather',
    label: 'Weather',
    path: '/weather',
    icon: 'Cloud',
    component: Weather
},
farms: {
    id: 'farms',
    label: 'Farms',
    path: '/farms',
    icon: 'Barn',
    component: Farms
  }
};

export const routeArray = Object.values(routes);