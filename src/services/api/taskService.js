class TaskService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'task'
    this.fields = ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'title', 'type', 'due_date', 'priority', 'completed', 'completed_date', 'farm_id', 'crop_id']
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
      
      return response.data?.map(task => ({
        id: task.Id,
        farmId: task.farm_id,
        cropId: task.crop_id,
        title: task.title,
        type: task.type,
        dueDate: task.due_date,
        priority: task.priority,
        completed: task.completed,
        completedDate: task.completed_date
      })) || []
    } catch (error) {
      console.error('Error fetching tasks:', error)
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
        throw new Error('Task not found')
      }
      
      return {
        id: response.data.Id,
        farmId: response.data.farm_id,
        cropId: response.data.crop_id,
        title: response.data.title,
        type: response.data.type,
        dueDate: response.data.due_date,
        priority: response.data.priority,
        completed: response.data.completed,
        completedDate: response.data.completed_date
      }
    } catch (error) {
      console.error(`Error fetching task with ID ${id}:`, error)
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
      
      return response.data?.map(task => ({
        id: task.Id,
        farmId: task.farm_id,
        cropId: task.crop_id,
        title: task.title,
        type: task.type,
        dueDate: task.due_date,
        priority: task.priority,
        completed: task.completed,
        completedDate: task.completed_date
      })) || []
    } catch (error) {
      console.error('Error fetching tasks by farm ID:', error)
      throw error
    }
  }

  async create(taskData) {
    try {
      const params = {
        records: [{
          title: taskData.title,
          type: taskData.type || 'other',
          due_date: taskData.dueDate,
          priority: taskData.priority || 'medium',
          completed: false,
          completed_date: null,
          farm_id: parseInt(taskData.farmId),
          crop_id: taskData.cropId ? parseInt(taskData.cropId) : null
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
          throw new Error('Failed to create task')
        }
        
        if (successfulRecords.length > 0) {
          const record = successfulRecords[0].data
          return {
            id: record.Id,
            farmId: record.farm_id,
            cropId: record.crop_id,
            title: record.title,
            type: record.type,
            dueDate: record.due_date,
            priority: record.priority,
            completed: record.completed,
            completedDate: record.completed_date
          }
        }
      }
      
      throw new Error('No records created')
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  }

  async update(id, taskData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          title: taskData.title,
          type: taskData.type || 'other',
          due_date: taskData.dueDate,
          priority: taskData.priority || 'medium',
          completed: taskData.completed || false,
          completed_date: taskData.completedDate || null,
          farm_id: parseInt(taskData.farmId),
          crop_id: taskData.cropId ? parseInt(taskData.cropId) : null
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
          throw new Error('Failed to update task')
        }
        
        if (successfulUpdates.length > 0) {
          const record = successfulUpdates[0].data
          return {
            id: record.Id,
            farmId: record.farm_id,
            cropId: record.crop_id,
            title: record.title,
            type: record.type,
            dueDate: record.due_date,
            priority: record.priority,
            completed: record.completed,
            completedDate: record.completed_date
          }
        }
      }
      
      throw new Error('No records updated')
    } catch (error) {
      console.error('Error updating task:', error)
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
          throw new Error('Failed to delete task')
        }
        
        return successfulDeletions.length > 0
      }
      
      return false
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }
}

export default new TaskService()