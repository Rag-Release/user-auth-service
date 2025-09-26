const express = require("express");
const router = express.Router();
const { AccountUpgradeController } = require("../../controllers/index");
const {
  UserRepository,
  PaymentRecordRepository,
  AccountUpgradeRepository,
} = require("../../repositories/index");
const { verifyToken } = require("../../middlewares");

let accountUpgradeController;
try {
  const dependencies = {
    accountUpgradeRepository: new AccountUpgradeRepository(),
    userRepository: new UserRepository(),
    paymentRecordRepository: new PaymentRecordRepository(),
  };
  accountUpgradeController = new AccountUpgradeController(dependencies);
} catch (error) {
  console.error("Failed to initialize AccountUpgradeController:", error);
  throw error;
}

const boundMethods = {
  upgradeAccount: accountUpgradeController.upgradeAccount?.bind(
    accountUpgradeController
  ),
  getUpgrades: accountUpgradeController.getUpgrades?.bind(
    accountUpgradeController
  ),
  getUserUpgrades: accountUpgradeController.getUserUpgrades?.bind(
    accountUpgradeController
  ),
  getUpgradesById: accountUpgradeController.getUpgradesById?.bind(
    accountUpgradeController
  ),
  getUpgradesPayments: accountUpgradeController.getUpgradesPayments?.bind(
    accountUpgradeController
  ),
  getUpgradesPaymentsById:
    accountUpgradeController.getUpgradesPaymentsById?.bind(
      accountUpgradeController
    ),
  updatePaymentStatus: accountUpgradeController.updatePaymentStatus?.bind(
    accountUpgradeController
  ),
  updateUpgradeStatus: accountUpgradeController.updateUpgradeStatus?.bind(
    accountUpgradeController
  ),
};

router.use(verifyToken);

router.post("/upgrades", boundMethods.upgradeAccount);

router.get("/upgrades", boundMethods.getUpgrades);

router.get("/upgrades/users/:id", boundMethods.getUserUpgrades);

router.get("/upgrades/:id", boundMethods.getUpgradesById);

router.get("/upgrade-payments", boundMethods.getUpgradesPayments);

router.get("/upgrades/payments/:id", boundMethods.getUpgradesPaymentsById);

router.patch("/upgrades/payments/:id", boundMethods.updatePaymentStatus);

router.patch("/upgrades/:id", boundMethods.updateUpgradeStatus);

module.exports = router;
