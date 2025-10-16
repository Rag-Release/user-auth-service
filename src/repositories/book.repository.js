const models = require("../data-access/sequelize/models");

class BookRepository {
  constructor() {
    this.Book = models.Book;
  }

  async create(data) {
    return await this.Book.create(data);
  }

  async findAll(options = {}) {
    return await this.Book.findAll(options);
  }

  async findById(id) {
    return await this.Book.findByPk(id);
  }

  async update(id, updates) {
    await this.Book.update(updates, { where: { id } });
    return await this.findById(id);
  }

  async delete(id) {
    return await this.Book.destroy({ where: { id } });
  }

  async updateContent(id, content) {
    await this.Book.update({ content }, { where: { id } });
    return await this.findById(id);
  }
}

module.exports = BookRepository;
