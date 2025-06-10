import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import ApperIcon from '../components/ApperIcon';
import cropService from '../services/api/cropService';

const Crops = () => {
  const { selectedFarm } = useOutletContext();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    plantedDate: '',
    expectedHarvestDate: '',
    status: 'planted',
    area: '',
    notes: ''
  });

  useEffect(() => {
    if (selectedFarm) {
      loadCrops();
    }
  }, [selectedFarm]);

  const loadCrops = async () => {
    if (!selectedFarm) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await cropService.getByFarmId(selectedFarm.id);
      setCrops(data);
    } catch (err) {
      setError(err.message || 'Failed to load crops');
      toast.error('Failed to load crops');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFarm) return;

    try {
      const cropData = {
        ...formData,
        farmId: selectedFarm.id,
        area: parseFloat(formData.area) || 0
      };

      if (editingCrop) {
        await cropService.update(editingCrop.id, cropData);
        setCrops(crops.map(crop => 
          crop.id === editingCrop.id ? { ...cropData, id: editingCrop.id } : crop
        ));
        toast.success('Crop updated successfully');
      } else {
        const newCrop = await cropService.create(cropData);
        setCrops([...crops, newCrop]);
        toast.success('Crop added successfully');
      }

      resetForm();
    } catch (error) {
      toast.error(editingCrop ? 'Failed to update crop' : 'Failed to add crop');
    }
  };

const handleEdit = (crop) => {
    setEditingCrop(crop);
    setFormData({
      name: crop.name || '',
      variety: crop.variety || '',
      plantedDate: crop.plantedDate ? crop.plantedDate.split('T')[0] : '',
      expectedHarvestDate: crop.expectedHarvestDate ? crop.expectedHarvestDate.split('T')[0] : '',
      status: crop.status || 'planted',
      area: crop.area?.toString() || '',
      notes: crop.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (cropId) => {
    if (!confirm('Are you sure you want to delete this crop?')) return;

    try {
      await cropService.delete(cropId);
      setCrops(crops.filter(crop => crop.id !== cropId));
      toast.success('Crop deleted successfully');
    } catch (error) {
      toast.error('Failed to delete crop');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      variety: '',
      plantedDate: '',
      expectedHarvestDate: '',
      status: 'planted',
      area: '',
      notes: ''
    });
    setEditingCrop(null);
    setShowForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planted': return 'bg-info/10 text-info';
      case 'growing': return 'bg-success/10 text-success';
      case 'ready': return 'bg-warning/10 text-warning';
      case 'harvested': return 'bg-secondary/10 text-secondary';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (!selectedFarm) {
    return (
      <div className="text-center py-12">
        <ApperIcon name="Wheat" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Farm Selected</h3>
        <p className="text-gray-500">Please select a farm to manage crops</p>
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Crops</h1>
          <p className="text-gray-600 mt-1">Manage your {selectedFarm.name} crops</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <ApperIcon name="Plus" size={20} />
          <span>Add Crop</span>
        </motion.button>
      </div>

      {/* Crop Form Modal */}
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
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {editingCrop ? 'Edit Crop' : 'Add New Crop'}
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
                        Crop Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="e.g., Corn, Wheat, Tomatoes"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Variety
                      </label>
                      <input
                        type="text"
                        value={formData.variety}
                        onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="e.g., Sweet Corn, Winter Wheat"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Planted Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.plantedDate}
                          onChange={(e) => setFormData({ ...formData, plantedDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expected Harvest
                        </label>
                        <input
                          type="date"
                          value={formData.expectedHarvestDate}
                          onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="planted">Planted</option>
                          <option value="growing">Growing</option>
                          <option value="ready">Ready</option>
                          <option value="harvested">Harvested</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Area (acres)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.area}
                          onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="0.0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Additional notes about this crop..."
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        {editingCrop ? 'Update Crop' : 'Add Crop'}
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

      {/* Crops List */}
      {error ? (
        <div className="text-center py-12">
          <ApperIcon name="AlertCircle" className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Crops</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadCrops}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : crops.length === 0 ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <ApperIcon name="Wheat" className="w-16 h-16 text-gray-300 mx-auto" />
          </motion.div>
          <h3 className="mt-4 text-lg font-medium">No crops yet</h3>
          <p className="mt-2 text-gray-500">Start by adding your first crop to track</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Add First Crop
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop, index) => (
            <motion.div
              key={crop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{crop.name}</h3>
                  {crop.variety && (
                    <p className="text-sm text-gray-500">{crop.variety}</p>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(crop.status)}`}>
                  {crop.status}
                </span>
</div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Planted:</span>
                  <span className="text-gray-900">
                    {crop.plantedDate ? format(new Date(crop.plantedDate), 'MMM dd, yyyy') : 'Not set'}
                  </span>
                </div>
                {crop.expectedHarvestDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Harvest:</span>
                    <span className="text-gray-900">
                      {format(new Date(crop.expectedHarvestDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
{crop.area > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Area:</span>
                    <span className="text-gray-900">{crop.area || 0} acres</span>
                  </div>
                )}
              </div>

{crop.notes && (
                <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded">
                  {crop.notes}
                </p>
              )}
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEdit(crop)}
                  className="flex-1 py-2 px-3 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(crop.id)}
                  className="py-2 px-3 text-sm text-error hover:bg-error/10 rounded transition-colors"
                >
                  <ApperIcon name="Trash2" size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Crops;