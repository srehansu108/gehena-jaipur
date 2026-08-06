// backend/controllers/paymentController.js
// COMPLETE PRODUCTION-READY PAYMENT CONTROLLER WITH QR CODE & CLOUDINARY SUPPORT ✅

const Order = require('../models/Order');
const crypto = require('crypto');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// ============================================
// CLOUDINARY CONFIGURATION
// ============================================
const USE_CLOUDINARY = process.env.USE_CLOUDINARY === 'true';

let cloudinary;
if (USE_CLOUDINARY) {
  cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary configured for production');
} else {
  console.log('📁 Using local file storage for development');
}

class PaymentController {
  // ============================================
  // HELPER: Upload screenshot to Cloudinary or Local
  // ============================================
  uploadScreenshot = async (file) => {
    try {
      if (USE_CLOUDINARY && cloudinary) {
        // ✅ Cloudinary Upload (Production)
        console.log('📸 Uploading to Cloudinary...');
        
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'jewellery/qr-screenshots',
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' }
          ],
          resource_type: 'image',
        });

        console.log('✅ Cloudinary upload success:', result.secure_url);
        
        // Clean up local file after Cloudinary upload
        try {
          fs.unlinkSync(file.path);
        } catch (e) {
          // Ignore cleanup errors
        }

        return {
          success: true,
          url: result.secure_url,
          publicId: result.public_id,
        };
      } else {
        // ✅ Local Storage (Development)
        console.log('📸 Saving locally...');
        
        const uploadDir = path.join(__dirname, '../uploads/screenshots');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filename = `qr-screenshot-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        const filePath = path.join(uploadDir, filename);
        
        // Move file to uploads folder
        fs.renameSync(file.path, filePath);

        const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        const screenshotUrl = `${baseUrl}/api/orders/payments/screenshot/${filename}`;

        return {
          success: true,
          url: screenshotUrl,
          path: filePath,
          filename: filename,
        };
      }
    } catch (error) {
      console.error('❌ Screenshot upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  // ============================================
  // HELPER: Delete screenshot from Cloudinary or Local
  // ============================================
  deleteScreenshot = async (publicIdOrPath) => {
    try {
      if (USE_CLOUDINARY && cloudinary && publicIdOrPath) {
        // ✅ Delete from Cloudinary
        const result = await cloudinary.uploader.destroy(publicIdOrPath);
        console.log('🗑️ Cloudinary delete result:', result);
        return result.result === 'ok';
      } else {
        // ✅ Delete from local
        if (publicIdOrPath && fs.existsSync(publicIdOrPath)) {
          fs.unlinkSync(publicIdOrPath);
          console.log('🗑️ Local file deleted:', publicIdOrPath);
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('❌ Delete screenshot error:', error);
      return false;
    }
  };

  // ============================================
  // SERVE SCREENSHOT (Local Development Only)
  // ============================================
  serveScreenshot = async (req, res) => {
    try {
      // If using Cloudinary, redirect to Cloudinary URL
      if (USE_CLOUDINARY) {
        // Find the order with this screenshot
        const { filename } = req.params;
        const order = await Order.findOne({
          'paymentMetadata.qrVerification.filename': filename,
        });

        if (order?.paymentMetadata?.qrVerification?.screenshotUrl) {
          return res.redirect(order.paymentMetadata.qrVerification.screenshotUrl);
        }

        return res.status(404).json({
          success: false,
          message: 'Screenshot not found in Cloudinary'
        });
      }

      // Local file serving
      const { filename } = req.params;
      
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid filename'
        });
      }

      const screenshotPath = path.join(__dirname, '../uploads/screenshots', filename);
      
      if (!fs.existsSync(screenshotPath)) {
        return res.status(404).json({
          success: false,
          message: 'Screenshot not found'
        });
      }

      res.sendFile(screenshotPath);
    } catch (error) {
      console.error('❌ Error serving screenshot:', error);
      res.status(500).json({
        success: false,
        message: 'Error serving screenshot'
      });
    }
  };

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

      const clientId = process.env.PHONEPE_CLIENT_ID;
      const apiKey = process.env.PHONEPE_API_KEY;

      if (!clientId || !apiKey) {
        console.error('❌ PhonePe credentials missing');
        return res.status(500).json({
          success: false,
          message: 'Payment gateway configuration error'
        });
      }

      const transactionId = `TXN_${Date.now()}_${order._id.toString().slice(-6)}`;

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

      const frontendUrl = process.env.FRONTEND_URL || 'https://gehena-jaipur.netlify.app';
      const backendUrl = process.env.BACKEND_URL || 'https://gehena-jaipur.onrender.com';

      const redirectUrl = `${frontendUrl}/order-success`;
      const callbackUrl = `${backendUrl}/api/orders/payments/phonepe/callback`;

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

      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
      
      const stringToHash = base64Payload + '/pg/v1/pay' + apiKey;
      const checksum = crypto
        .createHash('sha256')
        .update(stringToHash)
        .digest('hex');

      const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
      const xVerify = checksum + '###' + saltIndex;

      console.log('🔑 X-VERIFY:', xVerify);

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

      const upiId = process.env.UPI_ID || 'jewellery@phonepe';
      const upiString = `upi://pay?pa=${upiId}&am=${order.total}&cu=INR&tn=Payment%20for%20Order%20${order.orderNumber}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;

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
  // QR CODE PAYMENT - VERIFY (WITH CLOUDINARY SUPPORT) ✅
  // ============================================
  verifyQRPayment = async (req, res) => {
  try {
    console.log('🔐 verifyQRPayment called - Submitting for admin review');
    
    let screenshotUrl = null;
    let screenshotPath = null;
    let filename = null;
    let publicId = null;
    
    // Upload screenshot to Cloudinary or Local
    if (req.file) {
      console.log('📸 Processing screenshot upload...');
      const uploadResult = await this.uploadScreenshot(req.file);
      
      if (uploadResult.success) {
        screenshotUrl = uploadResult.url;
        screenshotPath = uploadResult.path || null;
        filename = uploadResult.filename || null;
        publicId = uploadResult.publicId || null;
        console.log('✅ Screenshot uploaded successfully:', screenshotUrl);
      } else {
        console.error('❌ Screenshot upload failed:', uploadResult.error);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload screenshot. Please try again.'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment screenshot is required for verification'
      });
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

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      if (publicId) {
        await this.deleteScreenshot(publicId);
      }
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log(`✅ Order found: ${order.orderNumber}`);

    // Update order - Set to "Pending Verification" status
    order.paymentStatus = 'Pending';
    order.paymentMethod = 'QR';
    order.paymentGateway = 'qr';
    order.transactionId = transactionId;
    order.gatewayPaymentId = transactionId;

    // ✅ Use the helper method instead of pushing directly
    order.addStatusHistory(
      'Pending',
      `📋 QR Payment details submitted for admin verification. Transaction: ${transactionId}`,
      'Customer'
    );

    // Store all verification details in metadata with Cloudinary support
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
        screenshotUrl: screenshotUrl,
        screenshotPath: screenshotPath,
        filename: filename,
        publicId: publicId,
        storageType: USE_CLOUDINARY ? 'cloudinary' : 'local',
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        rejectionReason: null
      }
    };

    await order.save();

    console.log(`✅ QR Payment details submitted for admin review: ${order.orderNumber}`);
    console.log(`📸 Screenshot URL: ${screenshotUrl}`);

    return res.json({
      success: true,
      message: 'Payment details submitted for verification. Please wait for admin approval.',
      data: {
        order: order,
        verificationStatus: 'pending',
        screenshotUrl: screenshotUrl
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

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log(`📦 Order found: ${order.orderNumber}`);
    console.log(`📦 Current status: ${order.status}, Payment: ${order.paymentStatus}`);

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
    order.shippingStatus = 'Processing';

    // Update QR verification metadata
    if (order.paymentMetadata?.qrVerification) {
      order.paymentMetadata.qrVerification.status = 'approved';
      order.paymentMetadata.qrVerification.reviewedBy = req.user?.name || 'Admin';
      order.paymentMetadata.qrVerification.reviewedAt = new Date().toISOString();
      order.paymentMetadata.qrVerification.adminNote = adminNote || 'Payment verified by admin';
    }

    // ✅ Use the helper method
    order.addStatusHistory(
      'Processing',
      `✅ QR Payment approved by Admin. Transaction: ${order.transactionId || 'N/A'}`,
      req.user?.name || 'Admin'
    );

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

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log(`📦 Order found: ${order.orderNumber}`);
    console.log(`📦 Current status: ${order.status}, Payment: ${order.paymentStatus}`);

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

    // Get publicId before deleting
    const publicId = order.paymentMetadata?.qrVerification?.publicId;

    // Delete screenshot from Cloudinary or local
    if (publicId) {
      await this.deleteScreenshot(publicId);
    }

    // Update order - Mark as Failed
    order.paymentStatus = 'Failed';
    order.cancelledAt = new Date();

    if (order.paymentMetadata?.qrVerification) {
      order.paymentMetadata.qrVerification.status = 'rejected';
      order.paymentMetadata.qrVerification.reviewedBy = req.user?.name || 'Admin';
      order.paymentMetadata.qrVerification.reviewedAt = new Date().toISOString();
      order.paymentMetadata.qrVerification.rejectionReason = reason;
    }

    // ✅ Use the helper method
    order.addStatusHistory(
      'Cancelled',
      `❌ QR Payment rejected by Admin. Reason: ${reason}`,
      req.user?.name || 'Admin'
    );

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

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log(`📦 Order found: ${order.orderNumber}`);
    console.log(`📦 Current status: ${order.status}, Payment: ${order.paymentStatus}`);

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
    order.cancelledAt = null;

    if (order.paymentMetadata?.qrVerification) {
      order.paymentMetadata.qrVerification.status = 'pending';
      order.paymentMetadata.qrVerification.reviewedBy = null;
      order.paymentMetadata.qrVerification.reviewedAt = null;
      order.paymentMetadata.qrVerification.rejectionReason = null;
      order.paymentMetadata.qrVerification.reopenedAt = new Date().toISOString();
      order.paymentMetadata.qrVerification.reopenedBy = req.user?.name || 'Admin';
      order.paymentMetadata.qrVerification.adminNote = adminNote || 'Reopened for verification';
    }

    // ✅ Use the helper method
    order.addStatusHistory(
      'Pending',
      `🔄 QR Payment reopened for verification by Admin. ${adminNote || ''}`,
      req.user?.name || 'Admin'
    );

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
  // ADMIN: GET PENDING QR PAYMENTS ✅
  // ============================================
  getPendingQRPayments = async (req, res) => {
    try {
      console.log('📋 Getting pending QR payments for admin');

      const pendingOrders = await Order.find({
        paymentMethod: 'QR',
        paymentStatus: 'Pending',
        status: 'Pending'
      })
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName email mobileNumber');

      console.log(`✅ Found ${pendingOrders.length} pending QR payments`);

      const formattedOrders = pendingOrders.map(order => {
        const qrVerification = order.paymentMetadata?.qrVerification || {};
        return {
          _id: order._id,
          orderNumber: order.orderNumber,
          user: order.userId ? {
            name: `${order.userId.firstName} ${order.userId.lastName}`,
            email: order.userId.email,
            phone: order.userId.mobileNumber
          } : null,
          total: order.total,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          status: order.status,
          createdAt: order.createdAt,
          qrVerification: qrVerification,
          screenshotUrl: qrVerification.screenshotUrl || null,
          transactionId: order.transactionId || qrVerification.transactionId,
          upiReferenceNumber: qrVerification.upiReferenceNumber || null,
          amount: qrVerification.amount || order.total,
          paymentDate: qrVerification.paymentDate || null,
          paymentTime: qrVerification.paymentTime || null,
          bankName: qrVerification.bankName || null,
          storageType: qrVerification.storageType || 'local'
        };
      });

      res.json({
        success: true,
        data: formattedOrders,
        count: formattedOrders.length
      });

    } catch (error) {
      console.error('❌ Error getting pending QR payments:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching pending QR payments'
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