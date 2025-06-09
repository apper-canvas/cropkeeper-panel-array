class ExpenseService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'expense'
    this.fields = ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'farm_id', 'category', 'amount', 'description', 'date', 'vendor']
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
      
      return response.data?.map(expense => ({
        id: expense.Id,
        farmId: expense.farm_id,
        category: expense.category,
        amount: expense.amount,
        description: expense.description,
        date: expense.date,
        vendor: expense.vendor
      })) || []
    } catch (error) {
      console.error('Error fetching expenses:', error)
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
        throw new Error('Expense not found')
      }
      
      return {
        id: response.data.Id,
        farmId: response.data.farm_id,
        category: response.data.category,
        amount: response.data.amount,
        description: response.data.description,
        date: response.data.date,
        vendor: response.data.vendor
      }
    } catch (error) {
      console.error(`Error fetching expense with ID ${id}:`, error)
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
      
      return response.data?.map(expense => ({
        id: expense.Id,
        farmId: expense.farm_id,
        category: expense.category,
        amount: expense.amount,
        description: expense.description,
        date: expense.date,
        vendor: expense.vendor
      })) || []
    } catch (error) {
      console.error('Error fetching expenses by farm ID:', error)
      throw error
    }
  }

  async create(expenseData) {
    try {
      const params = {
        records: [{
          farm_id: parseInt(expenseData.farmId),
          category: expenseData.category || 'other',
          amount: parseFloat(expenseData.amount),
          description: expenseData.description || '',
          date: expenseData.date,
          vendor: expenseData.vendor || ''
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
          throw new Error('Failed to create expense')
        }
        
        if (successfulRecords.length > 0) {
          const record = successfulRecords[0].data
          return {
            id: record.Id,
            farmId: record.farm_id,
            category: record.category,
            amount: record.amount,
            description: record.description,
            date: record.date,
            vendor: record.vendor
          }
        }
      }
      
      throw new Error('No records created')
    } catch (error) {
      console.error('Error creating expense:', error)
      throw error
    }
  }

  async update(id, expenseData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          farm_id: parseInt(expenseData.farmId),
          category: expenseData.category || 'other',
          amount: parseFloat(expenseData.amount),
          description: expenseData.description || '',
          date: expenseData.date,
          vendor: expenseData.vendor || ''
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
          throw new Error('Failed to update expense')
        }
        
        if (successfulUpdates.length > 0) {
          const record = successfulUpdates[0].data
          return {
            id: record.Id,
            farmId: record.farm_id,
            category: record.category,
            amount: record.amount,
            description: record.description,
            date: record.date,
            vendor: record.vendor
          }
        }
      }
      
      throw new Error('No records updated')
    } catch (error) {
      console.error('Error updating expense:', error)
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
          throw new Error('Failed to delete expense')
        }
        
        return successfulDeletions.length > 0
      }
      
      return false
    } catch (error) {
      console.error('Error deleting expense:', error)
      throw error
    }
  }
}

export default new ExpenseService()