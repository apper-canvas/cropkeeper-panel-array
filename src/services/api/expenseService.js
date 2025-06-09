import expenseData from '../mockData/expenses.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ExpenseService {
  constructor() {
    this.data = [...expenseData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const expense = this.data.find(item => item.id === id);
    if (!expense) throw new Error('Expense not found');
    return { ...expense };
  }

  async getByFarmId(farmId) {
    await delay(250);
    return this.data.filter(expense => expense.farmId === farmId).map(expense => ({ ...expense }));
  }

  async create(expenseData) {
    await delay(400);
    const newExpense = {
      ...expenseData,
      id: Date.now().toString()
    };
    this.data.push(newExpense);
    return { ...newExpense };
  }

  async update(id, expenseData) {
    await delay(350);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Expense not found');
    this.data[index] = { ...this.data[index], ...expenseData };
    return { ...this.data[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Expense not found');
    this.data.splice(index, 1);
    return true;
  }
}

export default new ExpenseService();