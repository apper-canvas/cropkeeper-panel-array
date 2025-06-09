import { useOutletContext } from 'react-router-dom';
import MainFeature from '../components/MainFeature';

const Dashboard = () => {
  const { selectedFarm } = useOutletContext();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Farm Dashboard</h1>
        <p className="text-gray-600 mt-1">
          {selectedFarm ? `Managing ${selectedFarm.name}` : 'Select a farm to get started'}
        </p>
      </div>
      
      <MainFeature selectedFarm={selectedFarm} />
    </div>
  );
};

export default Dashboard;