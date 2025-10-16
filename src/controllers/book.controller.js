const BookRepository = require("../repositories/book.repository");
const BookStatusRepository = require("../repositories/bookstatus.repository");
const {
  ValidationError,
  ErrorHandler,
} = require("../shared/utils/ErrorHandler");
const models = require("../data-access/sequelize/models"); // Import models

class BookController {
  constructor() {
    this.bookRepository = new BookRepository();
    this.bookStatusRepository = new BookStatusRepository();

    this.createBook = this.createBook.bind(this);
    this.getBooks = this.getBooks.bind(this);
    this.getBookById = this.getBookById.bind(this);
    this.updateBook = this.updateBook.bind(this);
    this.deleteBook = this.deleteBook.bind(this);
    this.updateBookContent = this.updateBookContent.bind(this);
    this.getBookContent = this.getBookContent.bind(this);
    this.getBooksByAuthorId = this.getBooksByAuthorId.bind(this);
  }

  async createBook(req, res) {
    try {
      const { title, content, authorId } = req.body;

      if (!title || !content || !authorId) {
        throw new ValidationError(
          "Missing required fields: title, content, authorId"
        );
      }

      const book = await this.bookRepository.create({
        title,
        content,
        authorId,
      });

      // Set initial status to "Draft"
      await this.bookStatusRepository.create({
        bookId: book.id,
        status: "Draft",
      });

      res.status(201).json({ status: "success", data: book });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getBooks(req, res) {
    try {
      const books = await this.bookRepository.findAll({
        include: [
          {
            model: models.BookStatus, // Use models.BookStatus
            as: "statuses",
            order: [["updatedAt", "DESC"]],
            limit: 1,
          },
        ],
      });

      res.status(200).json({ status: "success", data: books });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getBookById(req, res) {
    try {
      const { id } = req.params;
      const book = await this.bookRepository.findById(id, {
        include: [
          {
            model: models.BookStatus,
            as: "statuses",
            order: [["updatedAt", "DESC"]],
            limit: 1,
          },
        ],
      });

      if (!book) {
        throw ErrorHandler.notFound(`Book with id ${id} not found`);
      }

      res.status(200).json({ status: "success", data: book });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateBook(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedBook = await this.bookRepository.update(id, updates);
      res.status(200).json({ status: "success", data: updatedBook });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deleteBook(req, res) {
    try {
      const { id } = req.params;
      console.log("🚀 ~ BookController ~ deleteBook ~ id:", id);

      const deleted = await this.bookRepository.delete(id);

      if (deleted) {
        res.status(200).json({
          status: "success",
          message: `Book with ID ${id} deleted successfully.`,
        });
      } else {
        throw ErrorHandler.notFound(`Book with ID ${id} not found.`);
      }
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateBookContent(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;

      if (!content) {
        throw new ValidationError("Missing required field: content");
      }

      const updatedBook = await this.bookRepository.updateContent(id, content);
      res.status(200).json({ status: "success", data: updatedBook });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getBookContent(req, res) {
    try {
      const { id } = req.params;
      const book = await this.bookRepository.findById(id);

      if (!book) {
        throw ErrorHandler.notFound(`Book with id ${id} not found`);
      }

      res
        .status(200)
        .json({ status: "success", data: { content: book.content } });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getBooksByAuthorId(req, res) {
    try {
      const { authorId } = req.params;
      console.log(
        "🚀 ~ BookController ~ getBooksByAuthorId ~ authorId:",
        authorId
      );

      if (!authorId) {
        return res.status(400).json({
          status: "error",
          message: "Author ID is required",
        });
      }

      const books = await this.bookRepository.findAll({
        where: { authorId },
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: models.BookStatus, // Use models.BookStatus
            as: "statuses",
            order: [["updatedAt", "DESC"]],
            limit: 1,
          },
        ],
      });

      // Return success with an empty array if no books are found
      res.status(200).json({
        status: "success",
        data: books || [],
      });
    } catch (error) {
      console.error("Error fetching books by author ID:", error.message);
      res.status(500).json({
        status: "error",
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateBookStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = [
        "Draft",
        "Under Review",
        "Cover Page Uploaded",
        "ISBN Acquired",
        "Pending Moderation",
        "Published",
        "Rejected",
      ];

      if (!validStatuses.includes(status)) {
        throw new ValidationError("Invalid status");
      }

      const book = await this.bookRepository.findById(id);
      if (!book) {
        throw ErrorHandler.notFound(`Book with ID ${id} not found`);
      }

      const newStatus = await this.bookStatusRepository.create({
        bookId: id,
        status,
      });

      res.status(200).json({
        status: "success",
        message: "Book status updated successfully",
        data: newStatus,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  handleError(res, error) {
    res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message || "Internal Server Error",
    });
  }
}

module.exports = BookController;
