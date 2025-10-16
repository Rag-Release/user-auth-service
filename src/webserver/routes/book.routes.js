const express = require("express");
const router = express.Router();
const BookController = require("../../controllers/book.controller");
const { verifyToken, checkRoles } = require("../../middlewares");

const bookController = new BookController();

router.use(verifyToken); // Ensure all routes require authentication

// Public routes
router.get("/", bookController.getBooks);
router.get("/:id", bookController.getBookById);
router.get("/:id/content", bookController.getBookContent);

// Author/Admin routes
router.use(checkRoles(["author", "admin"])); // Restrict the following routes to authors and admins
router.post("/", bookController.createBook);
router.put("/:id", bookController.updateBook);
router.delete("/:id", bookController.deleteBook);
router.put("/:id/content", bookController.updateBookContent);
router.patch("/:id/status", bookController.updateBookStatus); // New route for updating book status
router.get("/author/:authorId", bookController.getBooksByAuthorId); // New route to get books by author ID

module.exports = router;
