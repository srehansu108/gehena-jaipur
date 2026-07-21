// backend/controllers/paymentController.js
// COMPLETE PRODUCTION-READY PAYMENT CONTROLLER WITH QR CODE & FILE UPLOAD SUPPORT ✅

const Order = require('../models/Order');
const crypto = require('crypto');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

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
          
          if (error.response?.status === 400 && error.response?.data?.message?.includes('Mapping')) {
            console.log('⚠️ API Mapping error, trying next endpoint...');
            continue;
          }
          
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

      const paymentStatus = status || req.body.paymentStatus || 'SUCCESS';

      if (paymentStatus === 'SUCCESS') {
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

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required payment verification fields'
        });
      }

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
  // QR CODE PAYMENT - INIT
  // ============================================
  initQRPayment = async (req, res) => {
    try {
      console.log('📱 initQRPayment called');
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

      // Get UPI ID from env or use default
      const upiId = process.env.UPI_ID || 'jewellery@phonepe';
      
      // Generate UPI QR Code data
      const upiString = `upi://pay?pa=${upiId}&am=${order.total}&cu=INR&tn=Payment%20for%20Order%20${order.orderNumber}`;
      
      // Generate QR Code URL using QR Server API
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;

      // Update order
      order.paymentStatus = 'Initiated';
      order.paymentGateway = 'qr';
      order.paymentAttempts += 1;
      order.paymentMetadata = {
        ...order.paymentMetadata,
        qrPayment: {
          upiId: upiId,
          amount: order.total,
          qrCodeUrl: qrCodeUrl,
          upiString: upiString,
          initiatedAt: new Date().toISOString()
        }
      };
      await order.save();

      console.log('✅ QR Code generated for order:', order.orderNumber);

      return res.json({
        success: true,
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          amount: order.total,
          upiId: upiId,
          qrCodeUrl: qrCodeUrl,
          transactionId: `QR-${Date.now()}`
        }
      });

    } catch (error) {
      console.error('❌ QR Payment init error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to initialize QR payment'
      });
    }
  };

  // ============================================
  // QR CODE PAYMENT - VERIFY (WITH FILE UPLOAD) ✅
  // ============================================
  verifyQRPayment = async (req, res) => {
  try {
    console.log('🔐 verifyQRPayment called - Submitting for admin review');
    
    // Handle file upload
    let screenshotFile = null;
    if (req.file) {
      screenshotFile = req.file;
      console.log('📸 Screenshot uploaded:', screenshotFile.filename);
    }

    const { 
      orderId, 
      transactionId, 
      upiReferenceNumber, 
      paymentDate, 
      paymentTime, 
      amount, 
      bankName 
    } = req.body;

    // Validate required fields
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Find the order
    const Order = require('../models/Order');
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log(`✅ Order found: ${order.orderNumber}`);

    // Save screenshot path
    let screenshotPath = null;
    let screenshotUrl = null;
    
    if (screenshotFile) {
      screenshotPath = screenshotFile.path;
      screenshotUrl = `/api/orders/payments/screenshot/${screenshotFile.filename}`;
    }

    // Update order - Set to "Pending Verification" status
    order.paymentStatus = 'Pending';
    order.status = 'Pending';
    order.paymentMethod = 'QR';
    order.paymentGateway = 'qr';
    order.transactionId = transactionId;
    order.gatewayPaymentId = transactionId;

    // Add status history
    order.statusHistory.push({
      status: 'Pending',
      date: new Date(),
      note: `📋 QR Payment details submitted for admin verification. Transaction: ${transactionId}`,
      updatedBy: 'Customer'
    });

    // Store all verification details in metadata
    order.paymentMetadata = {
      ...order.paymentMetadata,
      qrVerification: {
        submittedAt: new Date().toISOString(),
        transactionId: transactionId,
        upiReferenceNumber: upiReferenceNumber,
        paymentDate: paymentDate,
        paymentTime: paymentTime,
        amount: parseFloat(amount),
        bankName: bankName || 'Not provided',
        screenshotPath: screenshotPath,
        screenshotUrl: screenshotUrl,
        filename: screenshotFile ? screenshotFile.filename : null,
        status: 'pending', // pending, approved, rejected
        reviewedBy: null,
        reviewedAt: null,
        rejectionReason: null
      }
    };

    await order.save();

    console.log(`✅ QR Payment details submitted for admin review: ${order.orderNumber}`);

    return res.json({
      success: true,
      message: 'Payment details submitted for verification. Please wait for admin approval.',
      data: {
        order: order,
        verificationStatus: 'pending'
      }
    });

  } catch (error) {
    console.error('❌ QR Payment verification error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error submitting payment details'
    });
  }
};

// ============================================
// ADMIN: APPROVE QR PAYMENT ✅
// ============================================
adminVerifyQRPayment = async (req, res) => {
  try {
    console.log('✅ Admin approving QR payment');
    const { orderId } = req.params;
    const { adminNote } = req.body;

    const Order = require('../models/Order');
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log(`📦 Order found: ${order.orderNumber}`);
    console.log(`📦 Current status: ${order.status}, Payment: ${order.paymentStatus}`);

    // Check if it's a QR payment pending verification
    if (order.paymentMethod !== 'QR') {
      return res.status(400).json({
        success: false,
        message: 'This is not a QR payment order'
      });
    }

    if (order.paymentStatus !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Order is not pending verification. Current status: ${order.paymentStatus}`
      });
    }

    // Update order - Mark as Paid
    order.paymentStatus = 'Paid';
    order.paymentDate = new Date();
    order.status = 'Processing';
    order.shippingStatus = 'Processing';

    // Update QR verification metadata
    if (order.paymentMetadata?.qrVerification) {
      order.paymentMetadata.qrVerification.status = 'approved';
      order.paymentMetadata.qrVerification.reviewedBy = req.user?.name || 'Admin';
      order.paymentMetadata.qrVerification.reviewedAt = new Date().toISOString();
      order.paymentMetadata.qrVerification.adminNote = adminNote || 'Payment verified by admin';
    }

    // Add status history
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status: 'Processing',
      date: new Date(),
      note: `✅ QR Payment approved by Admin. Transaction: ${order.transactionId || 'N/A'}`,
      updatedBy: req.user?.name || 'Admin'
    });

    await order.save();

    console.log(`✅ QR Payment approved for order: ${order.orderNumber}`);

    return res.json({
      success: true,
      message: 'QR Payment approved successfully',
      data: order
    });

  } catch (error) {
    console.error('❌ Error approving QR payment:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error approving QR payment'
    });
  }
};

// ============================================
// ADMIN: REJECT QR PAYMENT ✅
// ============================================
adminRejectQRPayment = async (req, res) => {
  try {
    console.log('❌ Admin rejecting QR payment');
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const Order = require('../models/Order');
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log(`📦 Order found: ${order.orderNumber}`);
    console.log(`📦 Current status: ${order.status}, Payment: ${order.paymentStatus}`);

    // Check if it's a QR payment pending verification
    if (order.paymentMethod !== 'QR') {
      return res.status(400).json({
        success: false,
        message: 'This is not a QR payment order'
      });
    }

    if (order.paymentStatus !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Order is not pending verification. Current status: ${order.paymentStatus}`
      });
    }

    // Update order - Mark as Failed
    order.paymentStatus = 'Failed';
    order.status = 'Cancelled';
    order.cancelledAt = new Date();

    // Update QR verification metadata
    if (order.paymentMetadata?.qrVerification) {
      order.paymentMetadata.qrVerification.status = 'rejected';
      order.paymentMetadata.qrVerification.reviewedBy = req.user?.name || 'Admin';
      order.paymentMetadata.qrVerification.reviewedAt = new Date().toISOString();
      order.paymentMetadata.qrVerification.rejectionReason = reason;
    }

    // Add status history
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status: 'Cancelled',
      date: new Date(),
      note: `❌ QR Payment rejected by Admin. Reason: ${reason}`,
      updatedBy: req.user?.name || 'Admin'
    });

    await order.save();

    console.log(`❌ QR Payment rejected for order: ${order.orderNumber}`);

    return res.json({
      success: true,
      message: 'QR Payment rejected',
      data: order
    });

  } catch (error) {
    console.error('❌ Error rejecting QR payment:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error rejecting QR payment'
    });
  }
};
// ============================================
// ADMIN: RE-OPEN REJECTED QR PAYMENT ✅
// ============================================
adminReopenQRPayment = async (req, res) => {
  try {
    console.log('🔄 Admin re-opening QR payment');
    const { orderId } = req.params;
    const { adminNote } = req.body;

    const Order = require('../models/Order');
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log(`📦 Order found: ${order.orderNumber}`);
    console.log(`📦 Current status: ${order.status}, Payment: ${order.paymentStatus}`);

    // Check if it's a QR payment that was rejected
    if (order.paymentMethod !== 'QR') {
      return res.status(400).json({
        success: false,
        message: 'This is not a QR payment order'
      });
    }

    if (order.paymentStatus !== 'Failed') {
      return res.status(400).json({
        success: false,
        message: `Order is not in rejected state. Current status: ${order.paymentStatus}`
      });
    }

    // Re-open the order - Set back to Pending
    order.paymentStatus = 'Pending';
    order.status = 'Pending';
    order.cancelledAt = null;

    // Update QR verification metadata
    if (order.paymentMetadata?.qrVerification) {
      order.paymentMetadata.qrVerification.status = 'pending';
      order.paymentMetadata.qrVerification.reviewedBy = null;
      order.paymentMetadata.qrVerification.reviewedAt = null;
      order.paymentMetadata.qrVerification.rejectionReason = null;
      order.paymentMetadata.qrVerification.reopenedAt = new Date().toISOString();
      order.paymentMetadata.qrVerification.reopenedBy = req.user?.name || 'Admin';
      order.paymentMetadata.qrVerification.adminNote = adminNote || 'Reopened for verification';
    }

    // Add status history
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status: 'Pending',
      date: new Date(),
      note: `🔄 QR Payment reopened for verification by Admin. ${adminNote || ''}`,
      updatedBy: req.user?.name || 'Admin'
    });

    await order.save();

    console.log(`🔄 QR Payment reopened for order: ${order.orderNumber}`);

    return res.json({
      success: true,
      message: 'QR Payment reopened for verification',
      data: order
    });

  } catch (error) {
    console.error('❌ Error reopening QR payment:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error reopening QR payment'
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

      // Check authorization if user is logged in
      if (req.user && order.userId && order.userId.toString() !== req.user._id.toString()) {
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