// src/components/payment/CardPayment.jsx
import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Lock, 
  Shield, 
  Check, 
  X,
  Loader,
  Sparkles,
  Banknote,
  Calendar,
  User
} from 'lucide-react';
import { usePayment } from '../../hooks/usePayment';
import CardForm from './CardForm';
import CardPreview from './CardPreview';
import PaymentSuccess from './PaymentSuccess';
import { toast } from 'react-hot-toast';

export default function CardPayment({ 
  order, 
  token, 
  onSuccess, 
  onCancel,
  onBack 
}) {
  const { 
    loading, 
    paymentSuccess,
    initiatePayment,
    verifyPayment,
    resetPayment,
    setPaymentSuccess
  } = usePayment();

  const [step, setStep] = useState(1); // 1: Card Form, 2: Processing, 3: Success
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });
  const [paymentResponse, setPaymentResponse] = useState(null);

  // ✅ Reset state when component unmounts
  useEffect(() => {
    return () => {
      resetPayment();
    };
  }, [resetPayment]);

  /**
   * Handle card form submission
   */
  const handleCardSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Validate card details
    if (!validateCardDetails()) {
      return;
    }

    setStep(2); // Processing step

    try {
      // ✅ Initiate payment with Razorpay
      const result = await initiatePayment(order, token);
      
      if (result.success) {
        setPaymentResponse(result);
        setStep(3); // Success step
        setPaymentSuccess(true);
        
        // ✅ Notify parent component
        if (onSuccess) {
          onSuccess({
            success: true,
            paymentId: result.paymentId,
            orderId: result.orderId,
            signature: result.signature,
          });
        }
        
        toast.success('Payment successful! 🎉');
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
      setStep(1); // Back to form
      setPaymentSuccess(false);
    }
  };

  /**
   * Validate card details
   */
  const validateCardDetails = () => {
    // Basic validation
    if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length < 16) {
      toast.error('Please enter a valid 16-digit card number');
      return false;
    }

    if (!cardDetails.cardHolder || cardDetails.cardHolder.length < 3) {
      toast.error('Please enter the card holder name');
      return false;
    }

    if (!cardDetails.expiryMonth || !cardDetails.expiryYear) {
      toast.error('Please enter card expiry date');
      return false;
    }

    // Check expiry date
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    const expMonth = parseInt(cardDetails.expiryMonth);
    const expYear = parseInt(cardDetails.expiryYear);

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      toast.error('Card has expired');
      return false;
    }

    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      toast.error('Please enter a valid CVV');
      return false;
    }

    return true;
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    resetPayment();
    if (onCancel) {
      onCancel();
    }
    setStep(1);
  };

  /**
   * Render processing state
   */
  if (step === 2) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="w-8 h-8 text-pink-600 animate-pulse" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mt-6">Processing Payment</h3>
        <p className="text-gray-500 mt-2 text-center max-w-sm">
          Please don't close this window. We're securely processing your payment...
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
          <Shield className="w-4 h-4" />
          Secured by Razorpay
        </div>
      </div>
    );
  }

  /**
   * Render success state
   */
  if (step === 3 && paymentSuccess) {
    return (
      <PaymentSuccess 
        order={order}
        paymentResponse={paymentResponse}
        onContinue={onSuccess}
      />
    );
  }

  /**
   * Render card form
   */
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-white" />
            <h2 className="text-lg font-semibold text-white">Pay with Card</h2>
          </div>
          <div className="flex items-center gap-2">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1200px-Visa_Inc._logo.svg.png"
              alt="Visa"
              className="h-6 w-auto"
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1200px-Mastercard-logo.svg.png"
              alt="Mastercard"
              className="h-6 w-auto"
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/RuPay_logo.svg/1200px-RuPay_logo.svg.png"
              alt="RuPay"
              className="h-6 w-auto"
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid md:grid-cols-5 gap-6">
          {/* Card Form - Left */}
          <div className="md:col-span-3">
            <CardForm 
              cardDetails={cardDetails}
              setCardDetails={setCardDetails}
              onSubmit={handleCardSubmit}
              loading={loading}
              onCancel={handleCancel}
            />
          </div>

          {/* Card Preview - Right */}
          <div className="md:col-span-2 hidden md:block">
            <CardPreview cardDetails={cardDetails} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              256-bit SSL Encryption
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              PCI DSS Compliant
            </span>
          </div>
          <div>
            <span>Powered by </span>
            <span className="font-semibold text-pink-600">Razorpay</span>
          </div>
        </div>
      </div>
    </div>
  );
}