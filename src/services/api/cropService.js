class CropService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'crop'
    this.fields = ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'variety', 'planted_date', 'expected_harvest_date', 'status', 'area', 'notes', 'farm_id']
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
      
      return response.data?.map(crop => ({
        id: crop.Id,
        farmId: crop.farm_id,
        name: crop.Name,
        variety: crop.variety,
        plantedDate: crop.planted_date,
        expectedHarvestDate: crop.expected_harvest_date,
        status: crop.status,
        area: crop.area,
        notes: crop.notes
      })) || []
    } catch (error) {
      console.error('Error fetching crops:', error)
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
        throw new Error('Crop not found')
      }
      
      return {
        id: response.data.Id,
        farmId: response.data.farm_id,
        name: response.data.Name,
        variety: response.data.variety,
        plantedDate: response.data.planted_date,
        expectedHarvestDate: response.data.expected_harvest_date,
        status: response.data.status,
        area: response.data.area,
        notes: response.data.notes
      }
    } catch (error) {
      console.error(`Error fetching crop with ID ${id}:`, error)
      throw error
    }
  }

  async getByFarmId(farmId) {
    try {
      const params = {
        fields: this.fields,
        where: [
          {
            fieldName: "farm_id",
            operator: "EqualTo",
            values: [parseInt(farmId)]
          }
        ]
      }
      const response = await this.client.fetchRecords(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      return response.data?.map(crop => ({
        id: crop.Id,
        farmId: crop.farm_id,
        name: crop.Name,
        variety: crop.variety,
        plantedDate: crop.planted_date,
        expectedHarvestDate: crop.expected_harvest_date,
        status: crop.status,
        area: crop.area,
        notes: crop.notes
      })) || []
    } catch (error) {
      console.error('Error fetching crops by farm ID:', error)
      throw error
    }
  }

  async create(cropData) {
    try {
      const params = {
        records: [{
          Name: cropData.name,
          variety: cropData.variety || '',
          planted_date: cropData.plantedDate,
          expected_harvest_date: cropData.expectedHarvestDate || null,
          status: cropData.status || 'planted',
          area: parseFloat(cropData.area) || 0,
          notes: cropData.notes || '',
          farm_id: parseInt(cropData.farmId)
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
          throw new Error('Failed to create crop')
        }
        
        if (successfulRecords.length > 0) {
          const record = successfulRecords[0].data
          return {
            id: record.Id,
            farmId: record.farm_id,
            name: record.Name,
            variety: record.variety,
            plantedDate: record.planted_date,
            expectedHarvestDate: record.expected_harvest_date,
            status: record.status,
            area: record.area,
            notes: record.notes
          }
        }
      }
      
      throw new Error('No records created')
    } catch (error) {
      console.error('Error creating crop:', error)
      throw error
    }
  }

  async update(id, cropData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: cropData.name,
          variety: cropData.variety || '',
          planted_date: cropData.plantedDate,
          expected_harvest_date: cropData.expectedHarvestDate || null,
          status: cropData.status || 'planted',
          area: parseFloat(cropData.area) || 0,
          notes: cropData.notes || '',
          farm_id: parseInt(cropData.farmId)
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
          throw new Error('Failed to update crop')
        }
        
        if (successfulUpdates.length > 0) {
          const record = successfulUpdates[0].data
          return {
            id: record.Id,
            farmId: record.farm_id,
            name: record.Name,
            variety: record.variety,
            plantedDate: record.planted_date,
            expectedHarvestDate: record.expected_harvest_date,
            status: record.status,
            area: record.area,
            notes: record.notes
          }
        }
      }
      
      throw new Error('No records updated')
    } catch (error) {
      console.error('Error updating crop:', error)
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
          throw new Error('Failed to delete crop')
        }
        
        return successfulDeletions.length > 0
      }
      
      return false
    } catch (error) {
      console.error('Error deleting crop:', error)
      throw error
    }
  }
}

export default new CropService()