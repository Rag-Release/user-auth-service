class PaymentService {
  constructor(stripeSecret) {
    this.stripe = require("stripe")(stripeSecret);
  }

  async processPayment(paymentDetails) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: this.getAmountForAccountType(paymentDetails.accountType),
        currency: "usd",
        payment_method_data: {
          type: "card",
          card: {
            number: paymentDetails.cardNumber,
            exp_month: paymentDetails.expiryMonth,
            exp_year: paymentDetails.expiryYear,
            cvc: paymentDetails.cvv,
          },
        },
        confirmation_method: "manual",
        confirm: true,
      });

      return paymentIntent;
    } catch (error) {
      throw new Error(`Payment processing failed: ${error.message}`);
    }
  }

  getAmountForAccountType(accountType) {
    const prices = {
      premium: 999, // $9.99
      enterprise: 4999, // $49.99
    };
    return prices[accountType] || 0;
  }
}

module.exports = PaymentService;
