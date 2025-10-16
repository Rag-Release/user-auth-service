const express = require("express");
const router = express.Router();
const CoverDesignController = require("../../controllers/coverdesign.controller");
const { verifyToken, checkRoles } = require("../../middlewares");

const coverDesignController = new CoverDesignController();

// Ensure all methods are properly bound and exist
const boundMethods = {
  getMyTasks: coverDesignController.getMyTasks?.bind(coverDesignController),
  createCoverDesign: coverDesignController.createCoverDesign?.bind(
    coverDesignController
  ),
  getCoverDesignsByBook: coverDesignController.getCoverDesignsByBook?.bind(
    coverDesignController
  ),
  getBidsForCoverDesign: coverDesignController.getBidsForCoverDesign?.bind(
    coverDesignController
  ),
  assignBid: coverDesignController.assignBid?.bind(coverDesignController),
  rejectBid: coverDesignController.rejectBid?.bind(coverDesignController),
  approveDesign: coverDesignController.approveDesign?.bind(
    coverDesignController
  ),
  rejectDesign: coverDesignController.rejectDesign?.bind(coverDesignController),
  claimCoverDesign: coverDesignController.claimCoverDesign?.bind(
    coverDesignController
  ),
  submitDesign: coverDesignController.submitDesign?.bind(coverDesignController),
  withdrawBid: coverDesignController.withdrawBid?.bind(coverDesignController),
  getAllCoverDesigns: coverDesignController.getAllCoverDesigns?.bind(
    coverDesignController
  ),
  getClaimedTasks: coverDesignController.getClaimedTasks?.bind(
    coverDesignController
  ),
  getDesignerClaimedTasks: coverDesignController.getDesignerClaimedTasks?.bind(
    coverDesignController
  ),
  getBidsWithCoverDesign: coverDesignController.getBidsWithCoverDesign?.bind(
    coverDesignController
  ),
  getCoverDesignsByAuthor: coverDesignController.getCoverDesignsByAuthor?.bind(
    coverDesignController
  ),
};

// Middleware to verify token
router.use(verifyToken);

// Author routes
//done
router.post("/", checkRoles(["author"]), boundMethods.createCoverDesign);

router.get(
  "/:bookId",
  checkRoles(["author"]),
  boundMethods.getCoverDesignsByBook
);

//done - get bids for a specific cover design
router.get(
  "/:id/bids",
  checkRoles(["author"]),
  boundMethods.getBidsForCoverDesign
);

//done - assign a bid to a cover design
router.patch(
  "/:id/assign/:bidId",
  checkRoles(["author"]),
  boundMethods.assignBid
);

router.patch(
  "/:id/approve",
  checkRoles(["author"]),
  boundMethods.approveDesign
);

router.patch("/:id/reject", checkRoles(["author"]), boundMethods.rejectDesign);

router.get(
  "/claimed-tasks/:id",
  checkRoles(["admin", "author"]),
  boundMethods.getClaimedTasks
);

//done - get cover designs by author
router.get(
  "/author/:authorId",
  checkRoles(["author"]),
  boundMethods.getCoverDesignsByAuthor
);

// Done - reject a bid for a cover design
router.patch(
  "/:id/reject/:bidId",
  checkRoles(["author"]),
  boundMethods.rejectBid
);

// Designer routes
//done
router.get("/", checkRoles(["designer"]), boundMethods.getAllCoverDesigns);
//done
router.post(
  "/:id/bids",
  checkRoles(["designer"]),
  boundMethods.claimCoverDesign
);

router.patch(
  "/:id/submit",
  checkRoles(["designer"]),
  boundMethods.submitDesign
);

router.patch(
  "/:id/bids/:bidId/withdraw",
  checkRoles(["designer"]),
  boundMethods.withdrawBid
);

//done
router.get(
  "/designer-claimed-tasks/:id",
  checkRoles(["designer"]),
  boundMethods.getDesignerClaimedTasks
);
//done
router.get(
  "/bids-with-cover-design/:designerId",
  checkRoles(["designer"]),
  boundMethods.getBidsWithCoverDesign
);
//done
// Allow designers to access their tasks
router.get("/my-tasks/:id", checkRoles(["designer"]), boundMethods.getMyTasks);

module.exports = router;
