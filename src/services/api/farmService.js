const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class FarmService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'farm'
    this.fields = ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'size', 'size_unit', 'location']
  }

  async getAll() {
    try {
      const params = {
        fields: this.fields
      }
      const response = await this.client.fetchRecords(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      return response.data?.map(farm => ({
        id: farm.Id,
        name: farm.Name,
        size: farm.size,
        sizeUnit: farm.size_unit,
        location: farm.location,
        createdAt: farm.CreatedOn
      })) || []
    } catch (error) {
      console.error('Error fetching farms:', error)
      throw error
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: this.fields
      }
      const response = await this.client.getRecordById(this.tableName, parseInt(id), params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (!response.data) {
        throw new Error('Farm not found')
      }
      
      return {
        id: response.data.Id,
        name: response.data.Name,
        size: response.data.size,
        sizeUnit: response.data.size_unit,
        location: response.data.location,
        createdAt: response.data.CreatedOn
      }
    } catch (error) {
      console.error(`Error fetching farm with ID ${id}:`, error)
      throw error
    }
  }

  async create(farmData) {
    try {
      const params = {
        records: [{
          Name: farmData.name,
          size: parseFloat(farmData.size) || 0,
          size_unit: farmData.sizeUnit || 'acres',
          location: farmData.location || ''
        }]
      }
      
      const response = await this.client.createRecord(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${failedRecords}`)
          throw new Error('Failed to create farm')
        }
        
        if (successfulRecords.length > 0) {
          const record = successfulRecords[0].data
          return {
            id: record.Id,
            name: record.Name,
            size: record.size,
            sizeUnit: record.size_unit,
            location: record.location,
            createdAt: record.CreatedOn
          }
        }
      }
      
      throw new Error('No records created')
    } catch (error) {
      console.error('Error creating farm:', error)
      throw error
    }
  }

  async update(id, farmData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: farmData.name,
          size: parseFloat(farmData.size) || 0,
          size_unit: farmData.sizeUnit || 'acres',
          location: farmData.location || ''
        }]
      }
      
      const response = await this.client.updateRecord(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        const failedUpdates = response.results.filter(result => !result.success)
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${failedUpdates}`)
          throw new Error('Failed to update farm')
        }
        
        if (successfulUpdates.length > 0) {
          const record = successfulUpdates[0].data
          return {
            id: record.Id,
            name: record.Name,
            size: record.size,
            sizeUnit: record.size_unit,
            location: record.location,
            createdAt: record.CreatedOn
          }
        }
      }
      
      throw new Error('No records updated')
    } catch (error) {
      console.error('Error updating farm:', error)
      throw error
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      }
      
      const response = await this.client.deleteRecord(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        const failedDeletions = response.results.filter(result => !result.success)
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${failedDeletions}`)
          throw new Error('Failed to delete farm')
        }
        
        return successfulDeletions.length > 0
      }
      
      return false
    } catch (error) {
      console.error('Error deleting farm:', error)
      throw error
    }
  }
}

export default new FarmService()