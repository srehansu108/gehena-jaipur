// backend/controllers/paymentWebhookController.js
const Order = require('../models/Order');
const Product = require('../models/Product');

class PaymentWebhookController {
  /**
   * Handle Razorpay payment success webhook
   */
  async handleRazorpaySuccess(req, res) {
    try {
      const { order_id, payment_id, signature } = req.body;

      // Verify signature (implement your verification logic)
      // const isValid = verifyRazorpaySignature(order_id, payment_id, signature);
      
      // Find order by payment_id or order_id
      const order = await Order.findOne({ 
        $or: [
          { 'paymentDetails.razorpayOrderId': order_id },
          { transactionId: payment_id }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Update order status
      order.paymentStatus = 'Paid';
      order.paymentDate = new Date();
      order.transactionId = payment_id;
      order.status = 'Processing';
      order.shippingStatus = 'Processing';
      
      order.statusHistory.push({
        status: 'Processing',
        date: new Date(),
        note: 'Payment confirmed via Razorpay',
        updatedBy: 'System'
      });

      await order.save();

      console.log(`✅ Payment confirmed for order: ${order.orderNumber}`);

      res.json({
        success: true,
        message: 'Payment confirmed successfully'
      });

    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing webhook'
      });
    }
  }

  /**
   * Handle Stripe payment success webhook
   */
  async handleStripeSuccess(req, res) {
    try {
      const event = req.body;

      // Handle the event
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata.orderId;

        const order = await Order.findById(orderId);
        if (!order) {
          return res.status(404).json({
            success: false,
            message: 'Order not found'
          });
        }

        // Update order status
        order.paymentStatus = 'Paid';
        order.paymentDate = new Date();
        order.transactionId = session.payment_intent;
        order.status = 'Processing';
        order.shippingStatus = 'Processing';
        
        order.statusHistory.push({
          status: 'Processing',
          date: new Date(),
          note: 'Payment confirmed via Stripe',
          updatedBy: 'System'
        });

        await order.save();

        console.log(`✅ Payment confirmed for order: ${order.orderNumber}`);
      }

      res.json({
        success: true,
        received: true
      });

    } catch (error) {
      console.error('❌ Error processing Stripe webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing webhook'
      });
    }
  }
}

module.exports = new PaymentWebhookController();