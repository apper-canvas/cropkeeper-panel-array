import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { 
  Plus, 
  Edit2, 
  Eye, 
  Trash2, 
  MapPin, 
  Ruler,
  Calendar,
  X
} from 'lucide-react'
import farmService from '../services/api/farmService'

const Farms = () => {
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedFarm, setSelectedFarm] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    size: '',
    sizeUnit: 'acres',
    location: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Load farms on component mount
  useEffect(() => {
    loadFarms()
  }, [])

  const loadFarms = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await farmService.getAll()
      setFarms(data || [])
    } catch (err) {
      setError(err.message)
      toast.error('Failed to load farms')
      console.error('Error loading farms:', err)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.name?.trim()) {
      errors.name = 'Farm name is required'
    }
    
    if (!formData.size || isNaN(formData.size) || parseFloat(formData.size) <= 0) {
      errors.size = 'Valid size is required'
    }
    
    if (!formData.location?.trim()) {
      errors.location = 'Location is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setFormData({
      name: '',
      size: '',
      sizeUnit: 'acres',
      location: ''
    })
    setFormErrors({})
    setSelectedFarm(null)
  }

  const handleAddFarm = () => {
    resetForm()
    setShowAddModal(true)
  }

  const handleEditFarm = async (farm) => {
    try {
      setLoading(true)
      const farmDetails = await farmService.getById(farm.id)
      setSelectedFarm(farmDetails)
      setFormData({
        name: farmDetails.name || '',
        size: farmDetails.size?.toString() || '',
        sizeUnit: farmDetails.sizeUnit || 'acres',
        location: farmDetails.location || ''
      })
      setShowEditModal(true)
    } catch (err) {
      toast.error('Failed to load farm details')
      console.error('Error loading farm details:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewFarm = async (farm) => {
    try {
      setLoading(true)
      const farmDetails = await farmService.getById(farm.id)
      setSelectedFarm(farmDetails)
      setShowViewModal(true)
    } catch (err) {
      toast.error('Failed to load farm details')
      console.error('Error loading farm details:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFarm = (farm) => {
    setSelectedFarm(farm)
    setShowDeleteModal(true)
  }

  const handleSubmitAdd = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      await farmService.create(formData)
      toast.success('Farm created successfully')
      setShowAddModal(false)
      resetForm()
      await loadFarms()
    } catch (err) {
      toast.error('Failed to create farm')
      console.error('Error creating farm:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitEdit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      await farmService.update(selectedFarm.id, formData)
      toast.success('Farm updated successfully')
      setShowEditModal(false)
      resetForm()
      await loadFarms()
    } catch (err) {
      toast.error('Failed to update farm')
      console.error('Error updating farm:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedFarm) return

    setSubmitting(true)
    try {
      await farmService.delete(selectedFarm.id)
      toast.success('Farm deleted successfully')
      setShowDeleteModal(false)
      setSelectedFarm(null)
      await loadFarms()
    } catch (err) {
      toast.error('Failed to delete farm')
      console.error('Error deleting farm:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const closeModals = () => {
    setShowAddModal(false)
    setShowEditModal(false)
    setShowViewModal(false)
    setShowDeleteModal(false)
    resetForm()
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return 'N/A'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Farm Management</h1>
          <p className="text-gray-600 mt-1">Manage your farms and agricultural operations</p>
        </div>
        <button
          onClick={handleAddFarm}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
          disabled={loading}
        >
          <Plus className="w-4 h-4" />
          Add Farm
        </button>
      </div>

      {/* Loading State */}
      {loading && !showEditModal && !showViewModal && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button
            onClick={loadFarms}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && farms?.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No farms found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first farm</p>
          <button
            onClick={handleAddFarm}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Farm
          </button>
        </div>
      )}

      {/* Farms Table */}
      {!loading && !error && farms?.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Farm Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {farms.map((farm) => (
                  <tr key={farm.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{farm.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {farm.size} {farm.sizeUnit || 'acres'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{farm.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(farm.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewFarm(farm)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View farm"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditFarm(farm)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Edit farm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFarm(farm)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete farm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Farm Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Farm</h3>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
                disabled={submitting}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Farm Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter farm name"
                  disabled={submitting}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size *
                  </label>
                  <input
                    type="number"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      formErrors.size ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    disabled={submitting}
                  />
                  {formErrors.size && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.size}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    name="sizeUnit"
                    value={formData.sizeUnit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={submitting}
                  >
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                    <option value="square feet">Square Feet</option>
                    <option value="square meters">Square Meters</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter farm location"
                  disabled={submitting}
                />
                {formErrors.location && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.location}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                  disabled={submitting}
                >
                  {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  {submitting ? 'Creating...' : 'Create Farm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Farm Modal */}
      {showEditModal && selectedFarm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Farm</h3>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
                disabled={submitting}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Farm Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter farm name"
                  disabled={submitting}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size *
                  </label>
                  <input
                    type="number"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      formErrors.size ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    disabled={submitting}
                  />
                  {formErrors.size && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.size}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    name="sizeUnit"
                    value={formData.sizeUnit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={submitting}
                  >
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                    <option value="square feet">Square Feet</option>
                    <option value="square meters">Square Meters</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter farm location"
                  disabled={submitting}
                />
                {formErrors.location && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.location}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                  disabled={submitting}
                >
                  {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  {submitting ? 'Updating...' : 'Update Farm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Farm Modal */}
      {showViewModal && selectedFarm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Farm Details</h3>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Farm Name
                </label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {selectedFarm.name || 'N/A'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {selectedFarm.size} {selectedFarm.sizeUnit || 'acres'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {formatDate(selectedFarm.createdAt)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {selectedFarm.location || 'N/A'}
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={closeModals}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedFarm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-red-600">Delete Farm</h3>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
                disabled={submitting}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete <strong>{selectedFarm.name}</strong>? 
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModals}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                disabled={submitting}
              >
                {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                {submitting ? 'Deleting...' : 'Delete Farm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Farms