import taskData from '../mockData/tasks.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class TaskService {
  constructor() {
    this.data = [...taskData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const task = this.data.find(item => item.id === id);
    if (!task) throw new Error('Task not found');
    return { ...task };
  }

  async getByFarmId(farmId) {
    await delay(250);
    return this.data.filter(task => task.farmId === farmId).map(task => ({ ...task }));
  }

  async create(taskData) {
    await delay(400);
    const newTask = {
      ...taskData,
      id: Date.now().toString()
    };
    this.data.push(newTask);
    return { ...newTask };
  }

  async update(id, taskData) {
    await delay(350);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Task not found');
    this.data[index] = { ...this.data[index], ...taskData };
    return { ...this.data[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Task not found');
    this.data.splice(index, 1);
    return true;
  }
}

export default new TaskService();