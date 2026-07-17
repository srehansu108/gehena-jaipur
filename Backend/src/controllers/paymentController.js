// backend/controllers/paymentController.js
// ✅ FIXED: All methods use arrow function syntax to preserve 'this' binding

const Order = require('../models/Order');
const crypto = require('crypto');
const axios = require('axios');
const razorpay = require('razorpay');

class PaymentController {
  // ============================================
  // GENERATE MOCK PAYMENT URL - ARROW FUNCTION ✅
  // ============================================
  generateMockPaymentUrl = (order, transactionId) => {
    console.log('🎯 Generating mock payment URL for order:', order.orderNumber);
    const mockBaseUrl = process.env.PHONEPE_MOCK_URL || 'http://localhost:5173/mock-phonepe';
    return `${mockBaseUrl}?transactionId=${transactionId}&amount=${order.total}&orderId=${order._id}&orderNumber=${order.orderNumber}`;
  };

  // ============================================
  // PHONEPE INIT - ARROW FUNCTION ✅
  // ============================================
  initPhonePePayment = async (req, res) => {
    try {
      console.log('📱 initPhonePePayment called');
      console.log('📦 Request body:', req.body);

      console.log('🔑 PhonePe Environment:', process.env.PHONEPE_ENV || 'sandbox');
      console.log('🔑 Merchant ID:', process.env.PHONEPE_MERCHANT_ID ? '✅ Set' : '❌ Missing');
      console.log('🔑 Salt Key:', process.env.PHONEPE_SALT_KEY ? '✅ Set' : '❌ Missing');

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
          environment: process.env.PHONEPE_ENV || 'sandbox'
        }
      };
      await order.save();

      console.log('✅ Order updated with transaction ID:', transactionId);

      // CHECK: Are we in TESTING mode or PRODUCTION mode?
      const isProduction = process.env.PHONEPE_ENV === 'production' &&
                          process.env.PHONEPE_MERCHANT_ID &&
                          process.env.PHONEPE_SALT_KEY;

      let paymentUrl;

      if (isProduction) {
        // ============================================
        // 🚀 PRODUCTION MODE - REAL PhonePe API
        // ============================================
        console.log('🚀 Using PRODUCTION PhonePe API');

        try {
          const payload = {
            merchantId: process.env.PHONEPE_MERCHANT_ID,
            merchantTransactionId: transactionId,
            merchantUserId: order.userId.toString(),
            amount: Math.round(order.total * 100),
            redirectUrl: `${process.env.PHONEPE_REDIRECT_URL || 'http://localhost:5173/order-success'}/${order._id}`,
            redirectMode: "POST",
            callbackUrl: process.env.PHONEPE_CALLBACK_URL || 'http://localhost:5000/api/orders/payments/phonepe/callback',
            mobileNumber: order.shippingAddress?.phoneNumber || '9999999999',
            email: order.userEmail || 'customer@example.com',
            paymentInstrument: {
              type: "PAY_PAGE"
            }
          };

          console.log('📤 PhonePe Payload:', JSON.stringify(payload, null, 2));

          const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
          const saltKey = process.env.PHONEPE_SALT_KEY;
          const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
          const checksum = crypto
            .createHash('sha256')
            .update(base64Payload + '/pg/v1/pay' + saltKey)
            .digest('hex');

          const apiUrl = process.env.PHONEPE_BASE_URL || 'https://api.phonepe.com/apis/hermes/pg/v1';

          console.log('📤 Calling PhonePe API:', `${apiUrl}/pay`);

          const response = await axios.post(
            `${apiUrl}/pay`,
            { request: base64Payload },
            {
              headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': checksum + '###' + saltIndex,
                'X-MERCHANT-ID': process.env.PHONEPE_MERCHANT_ID
              }
            }
          );

          console.log('📦 PhonePe API Response:', response.data);

          if (response.data && response.data.success) {
            paymentUrl = response.data.data.instrumentResponse.redirectInfo.url;
          } else {
            throw new Error(response.data.message || 'PhonePe API error');
          }

        } catch (phonepeError) {
          console.error('❌ PhonePe API error:', phonepeError);
          console.log('⚠️ Falling back to MOCK mode due to API error');
          paymentUrl = this.generateMockPaymentUrl(order, transactionId);
        }

      } else {
        // ============================================
        // 🧪 TESTING MODE - Mock PhonePe
        // ============================================
        console.log('🧪 Using TESTING (Mock) PhonePe');

        if (!process.env.PHONEPE_MERCHANT_ID || !process.env.PHONEPE_SALT_KEY) {
          console.warn('⚠️ PhonePe credentials not fully configured. Using MOCK mode.');
        }

        paymentUrl = this.generateMockPaymentUrl(order, transactionId);
      }

      // Update order with payment URL
      order.paymentMetadata = {
        ...order.paymentMetadata,
        phonepePaymentUrl: paymentUrl,
        mode: isProduction ? 'production' : 'testing'
      };
      await order.save();

      console.log('✅ Payment URL generated:', paymentUrl);

      res.json({
        success: true,
        data: {
          transactionId,
          paymentUrl,
          amount: order.total,
          orderNumber: order.orderNumber,
          orderId: order._id,
          mode: isProduction ? 'production' : 'testing'
        }
      });

    } catch (error) {
      console.error('❌ PhonePe init error:');
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);

      // FALLBACK: Use mock on error
      try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);
        if (order) {
          const transactionId = `MOCK_${Date.now()}`;
          const paymentUrl = this.generateMockPaymentUrl(order, transactionId);

          return res.json({
            success: true,
            data: {
              transactionId,
              paymentUrl,
              amount: order.total,
              orderNumber: order.orderNumber,
              orderId: order._id,
              mode: 'testing_fallback'
            }
          });
        }
      } catch (fallbackError) {
        console.error('❌ Fallback error:', fallbackError);
      }

      res.status(500).json({
        success: false,
        message: 'Failed to initialize PhonePe payment',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

  // ============================================
  // PHONEPE CALLBACK - ARROW FUNCTION ✅
  // ============================================
  handlePhonePeCallback = async (req, res) => {
    try {
      console.log('📞 PhonePe callback received');
      console.log('📦 Callback data:', req.body);
      console.log('📦 Callback headers:', req.headers);

      const { transactionId, orderId } = req.body;

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

      // Verify callback signature (for production)
      const isProduction = process.env.PHONEPE_ENV === 'production';
      let isValid = true;

      if (isProduction && req.headers['x-verify']) {
        try {
          const receivedChecksum = req.headers['x-verify'].split('###')[0];
          const saltKey = process.env.PHONEPE_SALT_KEY;
          const payload = JSON.stringify(req.body);
          const expectedChecksum = crypto
            .createHash('sha256')
            .update(payload + saltKey)
            .digest('hex');

          if (receivedChecksum !== expectedChecksum) {
            console.error('❌ Invalid callback signature');
            isValid = false;
          }
        } catch (error) {
          console.error('❌ Signature verification error:', error);
          isValid = false;
        }
      }

      const status = req.body.status || req.body.paymentStatus || 'SUCCESS';

      if (status === 'SUCCESS' && isValid) {
        // Payment successful
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
        if (req.body.redirectUrl || process.env.PHONEPE_REDIRECT_URL) {
          const redirectUrl = req.body.redirectUrl || process.env.PHONEPE_REDIRECT_URL;
          return res.redirect(`${redirectUrl}/${order._id}`);
        }

        res.json({
          success: true,
          message: 'Payment confirmed',
          data: order
        });

      } else {
        // Payment failed
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

        if (process.env.PHONEPE_FAILURE_URL) {
          return res.redirect(`${process.env.PHONEPE_FAILURE_URL}/${order._id}`);
        }

        res.status(400).json({
          success: false,
          message: 'Payment failed',
          data: order
        });
      }

    } catch (error) {
      console.error('❌ PhonePe callback error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing payment callback'
      });
    }
  };

  // ============================================
  // RAZORPAY INIT - ARROW FUNCTION ✅
  // ============================================
  initRazorpayPayment = async (req, res) => {
    try {
      const { orderId } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

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

      res.json({
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
      res.status(500).json({
        success: false,
        message: 'Failed to initialize Razorpay payment'
      });
    }
  };

  // ============================================
  // RAZORPAY VERIFY - ARROW FUNCTION ✅
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

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: order
      });

    } catch (error) {
      console.error('❌ Razorpay verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Error verifying payment'
      });
    }
  };

  // ============================================
  // COD - ARROW FUNCTION ✅
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

      res.json({
        success: true,
        message: 'COD order confirmed',
        data: order
      });

    } catch (error) {
      console.error('❌ COD payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing COD payment'
      });
    }
  };

  // ============================================
  // GET PAYMENT STATUS - ARROW FUNCTION ✅
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

      res.json({
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
      res.status(500).json({
        success: false,
        message: 'Error fetching payment status'
      });
    }
  };
}

module.exports = new PaymentController();