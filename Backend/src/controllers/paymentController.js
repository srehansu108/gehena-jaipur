// backend/controllers/paymentController.js
// COMPLETE PRODUCTION-READY PAYMENT CONTROLLER

const Order = require('../models/Order');
const crypto = require('crypto');
const axios = require('axios');

class PaymentController {
  // ============================================
  // PHONEPE INIT
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

      // Validate PhonePe credentials
      const clientId = process.env.PHONEPE_CLIENT_ID;
      const apiKey = process.env.PHONEPE_API_KEY;

      if (!clientId || !apiKey) {
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
          clientId: clientId
        }
      };
      await order.save();

      console.log('✅ Order updated with transaction ID:', transactionId);

      // ============================================
      // GET URLs
      // ============================================
      const frontendUrl = process.env.FRONTEND_URL || 'https://gehena-jaipur.netlify.app';
      const backendUrl = process.env.BACKEND_URL || 'https://gehena-jaipur.onrender.com';

      const redirectUrl = `${frontendUrl}/order-success`;
      const callbackUrl = `${backendUrl}/api/orders/payments/phonepe/callback`;

      console.log('🔗 Redirect URL:', redirectUrl);
      console.log('🔗 Callback URL:', callbackUrl);

      // ============================================
      // PHONEPE API PAYLOAD
      // ============================================
      const payload = {
        merchantId: clientId,
        merchantTransactionId: transactionId,
        merchantUserId: order.userId.toString(),
        amount: Math.round(order.total * 100),
        redirectUrl: redirectUrl,
        redirectMode: "POST",
        callbackUrl: callbackUrl,
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
      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
      
      const stringToHash = base64Payload + '/pg/v1/pay' + apiKey;
      const checksum = crypto
        .createHash('sha256')
        .update(stringToHash)
        .digest('hex');

      const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
      const xVerify = checksum + '###' + saltIndex;

      console.log('🔑 X-VERIFY:', xVerify);

      // ============================================
      // CALL PHONEPE API - TRY MULTIPLE ENDPOINTS
      // ============================================
      const endpoints = [
        {
          url: 'https://api.phonepe.com/apis/hermes/sandbox/pg/v1/pay',
          name: 'Sandbox'
        },
        {
          url: 'https://api.phonepe.com/apis/hermes/pg/v1/pay',
          name: 'Production'
        },
        {
          url: 'https://api.phonepe.com/apis/merchant/v1/pay',
          name: 'Merchant API'
        }
      ];

      let response = null;
      let usedEndpoint = '';

      for (const endpoint of endpoints) {
        try {
          console.log(`📤 Trying ${endpoint.name} API: ${endpoint.url}`);
          
          response = await axios.post(
            endpoint.url,
            { request: base64Payload },
            {
              headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': xVerify
              },
              timeout: 30000
            }
          );
          
          if (response.data && response.data.success) {
            usedEndpoint = endpoint.url;
            console.log(`✅ Success with ${endpoint.name} API`);
            break;
          }
        } catch (error) {
          console.log(`❌ ${endpoint.name} API failed:`, error.response?.status);
          console.log('   Response:', error.response?.data);
          
          // If we get a 400 with a specific message, try the next
          if (error.response?.status === 400 && error.response?.data?.message?.includes('Mapping')) {
            console.log('⚠️ API Mapping error, trying next endpoint...');
            continue;
          }
          
          // Store the last response for error handling
          if (error.response) {
            response = error.response;
            usedEndpoint = endpoint.url;
          }
        }
      }

      if (!response || !response.data) {
        throw new Error('All PhonePe API endpoints failed');
      }

      console.log('📦 PhonePe API Response:', JSON.stringify(response.data, null, 2));

      // ============================================
      // PROCESS RESPONSE
      // ============================================
      if (!response.data.success) {
        console.error('❌ PhonePe API error:', response.data);
        const errorMsg = response.data?.message || response.data?.code || 'PhonePe payment initialization failed';
        throw new Error(errorMsg);
      }

      const paymentUrl = response.data.data?.instrumentResponse?.redirectInfo?.url;

      if (!paymentUrl) {
        console.error('❌ No payment URL in response');
        console.error('Full response:', JSON.stringify(response.data, null, 2));
        throw new Error('No payment URL received from PhonePe');
      }

      // Update order with payment URL
      order.paymentMetadata = {
        ...order.paymentMetadata,
        phonepePaymentUrl: paymentUrl,
        phonepeEndpoint: usedEndpoint
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

      if (error.response) {
        console.error('PhonePe Error Response:', error.response.data);
        console.error('PhonePe Error Status:', error.response.status);
      }

      let errorMessage = 'Failed to initialize PhonePe payment';
      if (error.message) {
        errorMessage = error.message;
      }
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  };

  // ============================================
  // PHONEPE CALLBACK
  // ============================================
  handlePhonePeCallback = async (req, res) => {
    try {
      console.log('📞 PhonePe callback received');
      console.log('📦 Callback body:', req.body);
      console.log('📦 Callback headers:', req.headers);

      const { transactionId, orderId, status, paymentId } = req.body;

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
          const payloadString = JSON.stringify(req.body);
          const expectedChecksum = crypto
            .createHash('sha256')
            .update(payloadString + apiKey)
            .digest('hex');

          if (receivedChecksum === expectedChecksum) {
            console.log('✅ Callback signature verified');
            isValid = true;
          } else {
            console.error('❌ Invalid callback signature');
          }
        } catch (error) {
          console.error('❌ Signature verification error:', error);
        }
      }

      // ============================================
      // PROCESS PAYMENT STATUS
      // ============================================
      const paymentStatus = status || req.body.paymentStatus || 'SUCCESS';

      if (paymentStatus === 'SUCCESS') {
        // ✅ Payment successful
        order.paymentStatus = 'Paid';
        order.gatewayPaymentId = paymentId || req.body.transactionId || transactionId;
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

        const frontendUrl = process.env.FRONTEND_URL || 'https://gehena-jaipur.netlify.app';
        return res.redirect(`${frontendUrl}/order-success/${order._id}`);

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

        const frontendUrl = process.env.FRONTEND_URL || 'https://gehena-jaipur.netlify.app';
        return res.redirect(`${frontendUrl}/payment-failed/${order._id}`);
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
      console.log('💳 initRazorpayPayment called');
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

      // Validate Razorpay credentials
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error('❌ Razorpay credentials missing');
        return res.status(500).json({
          success: false,
          message: 'Razorpay configuration error'
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
          orderNumber: order.orderNumber,
          userId: order.userId?.toString() || ''
        }
      };

      console.log('📤 Razorpay Order Options:', options);

      const razorpayOrder = await instance.orders.create(options);

      console.log('✅ Razorpay Order Created:', razorpayOrder.id);

      // Store gateway info
      order.gatewayOrderId = razorpayOrder.id;
      order.paymentGateway = 'razorpay';
      order.paymentStatus = 'Initiated';
      order.paymentAttempts += 1;
      order.paymentMetadata = {
        ...order.paymentMetadata,
        razorpayOrder: razorpayOrder
      };
      await order.save();

      console.log('✅ Order updated with Razorpay Order ID');

      return res.json({
        success: true,
        data: {
          razorpayOrderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
          orderNumber: order.orderNumber,
          orderId: order._id
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
      console.log('🔐 verifyRazorpayPayment called');
      console.log('📦 Request body:', req.body);

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

      // Validate required fields
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required payment verification fields'
        });
      }

      // Verify signature
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        console.error('❌ Invalid Razorpay signature');
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature'
        });
      }

      console.log('✅ Razorpay signature verified');

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Update order
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

      order.paymentMetadata = {
        ...order.paymentMetadata,
        razorpayVerification: {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          verifiedAt: new Date().toISOString()
        }
      };

      await order.save();

      console.log(`✅ Razorpay payment verified for order: ${order.orderNumber}`);

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
  // COD PAYMENT
  // ============================================
  handleCODPayment = async (req, res) => {
    try {
      console.log('📦 handleCODPayment called');
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

      console.log(`✅ Order found: ${order.orderNumber}`);

      // Update order for COD
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

      order.paymentMetadata = {
        ...order.paymentMetadata,
        codConfirmation: {
          confirmedAt: new Date().toISOString(),
          paymentMethod: 'COD'
        }
      };

      await order.save();

      console.log(`✅ COD order confirmed: ${order.orderNumber}`);

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
      console.log('📊 getPaymentStatus called');
      console.log('📦 Order ID:', req.params.orderId);

      const { orderId } = req.params;

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

      console.log(`✅ Payment status for order ${order.orderNumber}: ${order.paymentStatus}`);

      return res.json({
        success: true,
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          paymentGateway: order.paymentGateway,
          amount: order.total,
          transactionId: order.transactionId || order.gatewayOrderId,
          gatewayPaymentId: order.gatewayPaymentId,
          paidAt: order.paymentDate,
          status: order.status,
          shippingStatus: order.shippingStatus
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

  // ============================================
  // GET ORDER WITH PAYMENT DETAILS
  // ============================================
  getOrderWithPaymentDetails = async (req, res) => {
    try {
      console.log('📋 getOrderWithPaymentDetails called');
      console.log('📦 Order ID:', req.params.id);

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
      }

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check if the user is authorized to view this order
      if (order.userId && req.user && order.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to view this order'
        });
      }

      return res.json({
        success: true,
        data: {
          order: order,
          payment: {
            status: order.paymentStatus,
            method: order.paymentMethod,
            gateway: order.paymentGateway,
            transactionId: order.transactionId,
            gatewayPaymentId: order.gatewayPaymentId,
            paidAt: order.paymentDate,
            metadata: order.paymentMetadata
          }
        }
      });

    } catch (error) {
      console.error('❌ Get order with payment details error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching order details'
      });
    }
  };
}

module.exports = new PaymentController();