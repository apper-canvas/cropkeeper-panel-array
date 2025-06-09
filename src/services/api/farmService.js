import farmData from '../mockData/farms.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class FarmService {
  constructor() {
    this.data = [...farmData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const farm = this.data.find(item => item.id === id);
    if (!farm) throw new Error('Farm not found');
    return { ...farm };
  }

  async create(farmData) {
    await delay(400);
    const newFarm = {
      ...farmData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    this.data.push(newFarm);
    return { ...newFarm };
  }

  async update(id, farmData) {
    await delay(350);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Farm not found');
    this.data[index] = { ...this.data[index], ...farmData };
    return { ...this.data[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Farm not found');
    this.data.splice(index, 1);
    return true;
  }
}

export default new FarmService();