const models = require("../data-access/sequelize/models");

class BookStatusRepository {
  constructor() {
    this.BookStatus = models.BookStatus;
  }

  async create(data) {
    return await this.BookStatus.create(data);
  }

  async findLatestByBookId(bookId) {
    return await this.BookStatus.findOne({
      where: { bookId },
      order: [["updatedAt", "DESC"]],
    });
  }

  async findAllByBookId(bookId) {
    return await this.BookStatus.findAll({
      where: { bookId },
      order: [["updatedAt", "ASC"]],
    });
  }
}

module.exports = BookStatusRepository;
