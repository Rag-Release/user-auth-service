const models = require("../data-access/sequelize/models");

class CoverDesignController {
  async createCoverDesign(req, res) {
    try {
      const { bookId, description } = req.body;
      const authorId = req.user.id;

      const coverDesign = await models.CoverDesign.create({
        bookId,
        authorId,
        description,
      });

      res.status(201).json({ status: "success", data: coverDesign });
    } catch (error) {
      console.error("Error creating cover design:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async getCoverDesignsByBook(req, res) {
    try {
      const { bookId } = req.params;

      const coverDesigns = await models.CoverDesign.findAll({
        where: { bookId },
        include: [{ model: models.CoverDesignBid, as: "bids" }],
      });

      res.status(200).json({ status: "success", data: coverDesigns });
    } catch (error) {
      console.error("Error fetching cover designs:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async claimCoverDesign(req, res) {
    try {
      const { id } = req.params;
      const designerId = req.user.id;

      const bid = await models.CoverDesignBid.create({
        coverDesignId: id,
        designerId,
      });

      res.status(201).json({ status: "success", data: bid });
    } catch (error) {
      console.error("Error claiming cover design:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async getBidsForCoverDesign(req, res) {
    try {
      const { id } = req.params;

      const bids = await models.CoverDesignBid.findAll({
        where: { coverDesignId: id },
        include: [{ model: models.User, as: "designer" }],
      });

      res.status(200).json({ status: "success", data: bids });
    } catch (error) {
      console.error("Error fetching bids:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  //done
  async assignBid(req, res) {
    try {
      const { id, bidId } = req.params;

      await models.CoverDesignBid.update(
        { bidStatus: "ACCEPTED" },
        { where: { id: bidId } }
      );

      await models.CoverDesignBid.update(
        { bidStatus: "REJECTED" },
        {
          where: { coverDesignId: id, id: { [models.Sequelize.Op.ne]: bidId } },
        }
      );

      await models.CoverDesign.update(
        { status: "ASSIGNED" },
        { where: { id } }
      );

      res.status(200).json({ status: "success", message: "Bid assigned." });
    } catch (error) {
      console.error("Error assigning bid:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async submitDesign(req, res) {
    try {
      const { id } = req.params;
      const { designUrl } = req.body;

      await models.CoverDesign.update(
        { status: "SUBMITTED", designUrl },
        { where: { id } }
      );

      res.status(200).json({ status: "success", message: "Design submitted." });
    } catch (error) {
      console.error("Error submitting design:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async approveDesign(req, res) {
    try {
      const { id } = req.params;

      await models.CoverDesign.update(
        { status: "APPROVED" },
        { where: { id } }
      );

      res.status(200).json({ status: "success", message: "Design approved." });
    } catch (error) {
      console.error("Error approving design:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async rejectDesign(req, res) {
    try {
      const { id } = req.params;
      const { feedback } = req.body;

      await models.CoverDesign.update(
        { status: "REJECTED", feedback },
        { where: { id } }
      );

      res.status(200).json({ status: "success", message: "Design rejected." });
    } catch (error) {
      console.error("Error rejecting design:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async withdrawBid(req, res) {
    try {
      const { id, bidId } = req.params;

      // Update the bid status to "WITHDRAWN"
      await models.CoverDesignBid.update(
        { bidStatus: "WITHDRAWN" },
        { where: { id: bidId, coverDesignId: id } }
      );

      res.status(200).json({ status: "success", message: "Bid withdrawn." });
    } catch (error) {
      console.error("Error withdrawing bid:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  //done
  async getAllCoverDesigns(req, res) {
    try {
      const coverDesigns = await models.CoverDesign.findAll({
        include: [
          { model: models.Book, as: "book" },
          { model: models.User, as: "author" },
        ],
      });

      res.status(200).json({ status: "success", data: coverDesigns });
    } catch (error) {
      console.error("Error fetching all cover designs:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  //done
  async getMyTasks(req, res) {
    try {
      const designerId = req.params.id;

      const myTasks = await models.CoverDesign.findAll({
        where: { assignedDesignerId: designerId },
        include: [
          { model: models.Book, as: "book" },
          { model: models.User, as: "author" },
        ],
      });

      res.status(200).json({ status: "success", data: myTasks });
    } catch (error) {
      console.error("Error fetching my tasks:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  async getClaimedTasks(req, res) {
    try {
      const authorId = req.params.id;

      const claimedTasks = await models.CoverDesign.findAll({
        where: { status: "CLAIMED", authorId }, // Filter tasks by status and authorId
        include: [
          { model: models.User, as: "assignedDesigner" }, // Include designer data
          { model: models.Book, as: "book" }, // Include book data
        ],
      });

      res.status(200).json({ status: "success", data: claimedTasks });
    } catch (error) {
      console.error("Error fetching claimed tasks:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  //done
  async getDesignerClaimedTasks(req, res) {
    try {
      const designerId = req.params.id;

      const claimedTasks = await models.CoverDesignBid.findAll({
        where: { designerId, bidStatus: "CLAIMED" },
        include: [{ model: models.CoverDesign, as: "coverDesign" }],
      });

      res.status(200).json({ status: "success", data: claimedTasks });
    } catch (error) {
      console.error("Error fetching designer claimed tasks:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  //done
  async getBidsWithCoverDesign(req, res) {
    try {
      const designerId = req.params.designerId;

      const bids = await models.CoverDesignBid.findAll({
        where: { designerId },
        include: [
          {
            model: models.CoverDesign,
            as: "coverDesign",
            include: [
              { model: models.Book, as: "book" },
              { model: models.User, as: "author" },
            ],
          },
        ],
      });

      res.status(200).json({ status: "success", data: bids });
    } catch (error) {
      console.error("Error fetching bids with cover design:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  //done
  async getCoverDesignsByAuthor(req, res) {
    try {
      const authorId = req.params.authorId;

      const coverDesigns = await models.CoverDesign.findAll({
        where: { authorId },
        include: [
          { model: models.Book, as: "book" },
          { model: models.User, as: "assignedDesigner" },
        ],
      });

      res.status(200).json({ status: "success", data: coverDesigns });
    } catch (error) {
      console.error("Error fetching cover designs by author:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  //done
  async rejectBid(req, res) {
    try {
      const { id, bidId } = req.params;

      // Update the bid status to "REJECTED"
      await models.CoverDesignBid.update(
        { bidStatus: "REJECTED" },
        { where: { id: bidId, coverDesignId: id } }
      );

      res.status(200).json({ status: "success", message: "Bid rejected." });
    } catch (error) {
      console.error("Error rejecting bid:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  }
}

module.exports = CoverDesignController;
