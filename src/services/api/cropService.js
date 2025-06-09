import cropData from '../mockData/crops.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class CropService {
  constructor() {
    this.data = [...cropData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const crop = this.data.find(item => item.id === id);
    if (!crop) throw new Error('Crop not found');
    return { ...crop };
  }

  async getByFarmId(farmId) {
    await delay(250);
    return this.data.filter(crop => crop.farmId === farmId).map(crop => ({ ...crop }));
  }

  async create(cropData) {
    await delay(400);
    const newCrop = {
      ...cropData,
      id: Date.now().toString()
    };
    this.data.push(newCrop);
    return { ...newCrop };
  }

  async update(id, cropData) {
    await delay(350);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Crop not found');
    this.data[index] = { ...this.data[index], ...cropData };
    return { ...this.data[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Crop not found');
    this.data.splice(index, 1);
    return true;
  }
}

export default new CropService();