// backend/controllers/paymentController.js
// PRODUCTION ONLY - Using PHONEPE_MERCHANT_ID and PHONEPE_API_KEY

const Order = require('../models/Order');
const crypto = require('crypto');
const axios = require('axios');

class PaymentController {
  // ============================================
  // PHONEPE INIT - PRODUCTION ONLY
  // ============================================
  initPhonePePayment = async (req, res) => {
    try {
      console.log('📱 initPhonePePayment called');
      console.log('📦 Order ID:', req.body.orderId);

      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      console.log('✅ Order found:', order.orderNumber, 'Total:', order.total);

      // Validate PhonePe credentials exist
      if (!process.env.PHONEPE_MERCHANT_ID || !process.env.PHONEPE_API_KEY) {
        console.error('❌ PhonePe credentials missing');
        return res.status(500).json({
          success: false,
          message: 'Payment gateway configuration error'
        });
      }

      // Generate transaction ID
      const transactionId = `TXN_${Date.now()}_${order._id.toString().slice(-6)}`;

      // Store gateway info
      order.gatewayOrderId = transactionId;
      order.paymentGateway = 'phonepe';
      order.paymentStatus = 'Initiated';
      order.paymentAttempts += 1;
      order.paymentMetadata = {
        ...order.paymentMetadata,
        phonepeInit: {
          transactionId,
          initiatedAt: new Date().toISOString(),
          amount: order.total,
          environment: 'production'
        }
      };
      await order.save();

      console.log('✅ Order updated with transaction ID:', transactionId);

      // ============================================
      // PHONEPE API PAYLOAD
      // ============================================
      // Note: PhonePe uses different API versions
      // Using the latest API structure

      const merchantId = process.env.PHONEPE_MERCHANT_ID;
      const apiKey = process.env.PHONEPE_API_KEY; // This is your salt key
      const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';

      // Prepare payload based on PhonePe API v3
      const payload = {
        merchantId: merchantId,
        merchantTransactionId: transactionId,
        merchantUserId: order.userId.toString(),
        amount: Math.round(order.total * 100), // Convert to paise (e.g., 19055 -> 1905500)
        redirectUrl: `${process.env.PHONEPE_REDIRECT_URL || 'https://yourdomain.com/order-success'}/${order._id}`,
        redirectMode: "POST",
        callbackUrl: process.env.PHONEPE_CALLBACK_URL || 'https://yourdomain.com/api/orders/payments/phonepe/callback',
        mobileNumber: order.shippingAddress?.phoneNumber || '9999999999',
        email: order.userEmail || 'customer@example.com',
        paymentInstrument: {
          type: "PAY_PAGE"
        }
      };

      console.log('📤 PhonePe Payload:', JSON.stringify(payload, null, 2));

      // ============================================
      // GENERATE CHECKSUM
      // ============================================
      // Convert payload to base64
      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

      // Generate checksum: SHA256(base64Payload + "/pg/v1/pay" + saltKey)
      const checksum = crypto
        .createHash('sha256')
        .update(base64Payload + '/pg/v1/pay' + apiKey)
        .digest('hex');

      // Final X-VERIFY header: checksum + "###" + saltIndex
      const xVerify = checksum + '###' + saltIndex;

      console.log('🔑 X-VERIFY:', xVerify);

      // ============================================
      // CALL PHONEPE API
      // ============================================
      const apiUrl = process.env.PHONEPE_BASE_URL || 'https://api.phonepe.com/apis/hermes/pg/v1';

      console.log('📤 Calling PhonePe API:', `${apiUrl}/pay`);

      const response = await axios.post(
        `${apiUrl}/pay`,
        { request: base64Payload },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
            'X-MERCHANT-ID': merchantId
          }
        }
      );

      console.log('📦 PhonePe API Response:', JSON.stringify(response.data, null, 2));

      // ============================================
      // PROCESS RESPONSE
      // ============================================
      if (!response.data || !response.data.success) {
        console.error('❌ PhonePe API error:', response.data);
        throw new Error(response.data?.message || 'PhonePe payment initialization failed');
      }

      const paymentUrl = response.data.data.instrumentResponse.redirectInfo.url;

      if (!paymentUrl) {
        console.error('❌ No payment URL in response');
        throw new Error('No payment URL received from PhonePe');
      }

      // Update order with payment URL
      order.paymentMetadata = {
        ...order.paymentMetadata,
        phonepePaymentUrl: paymentUrl
      };
      await order.save();

      console.log('✅ PhonePe payment URL generated:', paymentUrl);

      return res.json({
        success: true,
        data: {
          transactionId,
          paymentUrl,
          amount: order.total,
          orderNumber: order.orderNumber,
          orderId: order._id
        }
      });

    } catch (error) {
      console.error('❌ PhonePe init error:', error.message);
      console.error('Error stack:', error.stack);

      // If error response from PhonePe
      if (error.response) {
        console.error('PhonePe Error Response:', error.response.data);
        console.error('PhonePe Error Status:', error.response.status);
      }

      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to initialize PhonePe payment'
      });
    }
  };

  // ============================================
  // PHONEPE CALLBACK - PRODUCTION ONLY
  // ============================================
  handlePhonePeCallback = async (req, res) => {
    try {
      console.log('📞 PhonePe callback received');
      console.log('📦 Callback body:', req.body);
      console.log('📦 Callback headers:', req.headers);

      const { transactionId, orderId } = req.body;

      // Find order
      let order;
      if (transactionId) {
        order = await Order.findOne({ gatewayOrderId: transactionId });
      } else if (orderId) {
        order = await Order.findById(orderId);
      }

      if (!order) {
        console.error('❌ Order not found for callback');
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      console.log(`✅ Order found: ${order.orderNumber}`);

      // ============================================
      // VERIFY CALLBACK SIGNATURE
      // ============================================
      let isValid = false;
      const apiKey = process.env.PHONEPE_API_KEY;

      if (req.headers['x-verify']) {
        try {
          const receivedChecksum = req.headers['x-verify'].split('###')[0];
          const payload = JSON.stringify(req.body);
          const expectedChecksum = crypto
            .createHash('sha256')
            .update(payload + apiKey)
            .digest('hex');

          if (receivedChecksum === expectedChecksum) {
            console.log('✅ Callback signature verified');
            isValid = true;
          } else {
            console.error('❌ Invalid callback signature');
            console.error('  Received:', receivedChecksum);
            console.error('  Expected:', expectedChecksum);
          }
        } catch (error) {
          console.error('❌ Signature verification error:', error);
        }
      }

      // ============================================
      // PROCESS PAYMENT STATUS
      // ============================================
      const status = req.body.status || req.body.paymentStatus || 'SUCCESS';

      if (status === 'SUCCESS' && isValid) {
        // ✅ Payment successful
        order.paymentStatus = 'Paid';
        order.gatewayPaymentId = req.body.paymentId || req.body.transactionId || transactionId;
        order.paymentDate = new Date();
        order.status = 'Processing';
        order.shippingStatus = 'Processing';

        order.statusHistory.push({
          status: 'Processing',
          date: new Date(),
          note: `Payment confirmed via PhonePe (${order.gatewayPaymentId})`,
          updatedBy: 'System'
        });

        order.paymentMetadata = {
          ...order.paymentMetadata,
          phonepeCallback: {
            receivedAt: new Date().toISOString(),
            data: req.body,
            verified: isValid,
            status: 'success'
          }
        };

        await order.save();

        console.log(`✅ PhonePe payment confirmed for order: ${order.orderNumber}`);

        // Redirect to success page
        const redirectUrl = process.env.PHONEPE_REDIRECT_URL || 'https://yourdomain.com/order-success';
        return res.redirect(`${redirectUrl}/${order._id}`);

      } else {
        // ❌ Payment failed
        order.paymentStatus = 'Failed';
        order.paymentMetadata = {
          ...order.paymentMetadata,
          phonepeCallback: {
            receivedAt: new Date().toISOString(),
            data: req.body,
            verified: isValid,
            status: 'failed',
            reason: req.body.message || 'Payment failed'
          }
        };
        await order.save();

        console.log(`❌ PhonePe payment failed for order: ${order.orderNumber}`);

        // Redirect to failure page
        const failureUrl = process.env.PHONEPE_FAILURE_URL || 'https://yourdomain.com/payment-failed';
        return res.redirect(`${failureUrl}/${order._id}`);
      }

    } catch (error) {
      console.error('❌ PhonePe callback error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error processing payment callback'
      });
    }
  };

  // ============================================
  // RAZORPAY INIT
  // ============================================
  initRazorpayPayment = async (req, res) => {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error('❌ Razorpay credentials missing');
        return res.status(500).json({
          success: false,
          message: 'Payment gateway configuration error'
        });
      }

      const razorpay = require('razorpay');
      const instance = new razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const options = {
        amount: Math.round(order.total * 100),
        currency: 'INR',
        receipt: order.orderNumber,
        notes: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber
        }
      };

      const razorpayOrder = await instance.orders.create(options);

      order.gatewayOrderId = razorpayOrder.id;
      order.paymentGateway = 'razorpay';
      order.paymentStatus = 'Initiated';
      order.paymentAttempts += 1;
      order.paymentMetadata = {
        ...order.paymentMetadata,
        razorpayOrder: razorpayOrder
      };
      await order.save();

      return res.json({
        success: true,
        data: {
          razorpayOrderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
          orderNumber: order.orderNumber
        }
      });

    } catch (error) {
      console.error('❌ Razorpay init error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to initialize Razorpay payment'
      });
    }
  };

  // ============================================
  // RAZORPAY VERIFY
  // ============================================
  verifyRazorpayPayment = async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature'
        });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      order.paymentStatus = 'Paid';
      order.gatewayPaymentId = razorpay_payment_id;
      order.gatewaySignature = razorpay_signature;
      order.transactionId = razorpay_payment_id;
      order.paymentDate = new Date();
      order.status = 'Processing';
      order.shippingStatus = 'Processing';

      order.statusHistory.push({
        status: 'Processing',
        date: new Date(),
        note: `Payment confirmed via Razorpay (${razorpay_payment_id})`,
        updatedBy: 'System'
      });

      await order.save();

      return res.json({
        success: true,
        message: 'Payment verified successfully',
        data: order
      });

    } catch (error) {
      console.error('❌ Razorpay verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error verifying payment'
      });
    }
  };

  // ============================================
  // COD
  // ============================================
  handleCODPayment = async (req, res) => {
    try {
      const { orderId } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      order.paymentStatus = 'COD';
      order.paymentGateway = 'cod';
      order.paymentDate = new Date();
      order.status = 'Processing';
      order.shippingStatus = 'Processing';

      order.statusHistory.push({
        status: 'Processing',
        date: new Date(),
        note: 'Order placed with Cash on Delivery',
        updatedBy: 'System'
      });

      await order.save();

      return res.json({
        success: true,
        message: 'COD order confirmed',
        data: order
      });

    } catch (error) {
      console.error('❌ COD payment error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error processing COD payment'
      });
    }
  };

  // ============================================
  // GET PAYMENT STATUS
  // ============================================
  getPaymentStatus = async (req, res) => {
    try {
      const { orderId } = req.params;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      return res.json({
        success: true,
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          paymentGateway: order.paymentGateway,
          amount: order.total,
          transactionId: order.transactionId,
          paidAt: order.paymentDate
        }
      });

    } catch (error) {
      console.error('❌ Payment status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching payment status'
      });
    }
  };
}

module.exports = new PaymentController();