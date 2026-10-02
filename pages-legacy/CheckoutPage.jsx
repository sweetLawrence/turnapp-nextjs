"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import {
  logCheckoutEvent,
  logClientError,
} from '@/lib/utils/errorLogger';

import {
  CreditCard,
  Smartphone,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Ticket,
  QrCode,
  Download,
  Mail,
  MessageSquare,
  Tag,
  Sparkles,
  Shield,
  Clock,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { checkoutApi } from '@/lib/services/checkoutApi';

const CheckoutPage = () => {
  const router = useRouter();
  const [checkoutData, setCheckoutData] = useState(null);
  const { event, selectedTickets, total } = checkoutData || {};

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    confirmEmail: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('mpesa-stk');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [showManualPayment, setShowManualPayment] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [cart, setCart] = useState(null);
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const [paybillNumber, setPaybillNumber] = useState('4181929');
  const [manualPaymentReference, setManualPaymentReference] = useState('');
  const [saleId, setSaleId] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [emailSuggestion, setEmailSuggestion] = useState('');
  const [confirmEmailError, setConfirmEmailError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptPromotions, setAcceptPromotions] = useState(false);

  // Load checkout state from sessionStorage on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('checkout_state');
      if (raw) setCheckoutData(JSON.parse(raw));
    } catch (e) {
      console.error('Failed to parse checkout state:', e);
    }

    // Check for DPO payment success on return from gateway
    checkForDPOPaymentSuccess();
  }, []);

  // Initialize cart once we have event data
  useEffect(() => {
    if (event && selectedTickets) {
      initializeCart();
    }
  }, [event, selectedTickets]);

  const checkForDPOPaymentSuccess = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const companyToken = urlParams.get('CompanyToken');
    const transactionToken = urlParams.get('TransactionToken');
    const isDPOReturn = companyToken || transactionToken || window.location.search.includes('dpo');

    const pendingPayment = localStorage.getItem('dpoPaymentPending');

    if (isDPOReturn && pendingPayment) {
      try {
        const paymentData = JSON.parse(pendingPayment);
        const paymentAge = Date.now() - paymentData.timestamp;

        if (paymentAge > 3600000) {
          localStorage.removeItem('dpoPaymentPending');
          return;
        }

        localStorage.removeItem('dpoPaymentPending');
        checkoutApi.clearCart();
        toast.success('Card payment successful! Processing your tickets...');

        setTimeout(() => {
          if (paymentData.saleId) {
            router.push(`/tickets/${paymentData.saleId}`);
          }
        }, 2000);
      } catch (error) {
        console.error('Error parsing DPO payment data:', error);
        localStorage.removeItem('dpoPaymentPending');
      }
    }
  };

  const initializeCart = async () => {
    try {
      const token = localStorage.getItem('cart_token');

      logCheckoutEvent({
        action: 'checkout_page_initialize',
        eventId: event?.id,
        cartToken: token,
      });

      if (!token) {
        throw new Error('Missing cart token');
      }

      const cartData = await checkoutApi.getCart();

      logCheckoutEvent({
        action: 'checkout_page_cart_loaded',
        eventId: event?.id,
        cartToken: token,
        success: cartData?.success ?? null,
        data: { cart_data: cartData },
      });

      if (cartData.success) {
        setCart(cartData.data);
      } else {
        throw new Error(cartData.message || 'Failed to load cart');
      }
    } catch (error) {
      logClientError({
        eventId: event?.id,
        error,
        extra: {
          action: 'checkout_page_initialize_error',
          cart_token: localStorage.getItem('cart_token'),
          response: error.response?.data || null,
        },
      });

      console.error('Error loading cart:', error);
      toast.error('Failed to load your cart');
    }
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          toast.success('Copied to clipboard!');
        })
        .catch(() => {
          fallbackCopy(text);
        });
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy');
    }
    document.body.removeChild(textArea);
  };

  if (!event || !selectedTickets) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">No checkout data found</h1>
            <Button onClick={() => router.push('/')}>Back to Events</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const discount = appliedPromo ? appliedPromo.discount_amount : 0;
  const finalTotal = total - discount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'email') {
      if (value.trim()) {
        const validation = validateEmail(value);
        setEmailError(validation.isValid ? '' : validation.message);
        setEmailSuggestion(validation.suggestion || '');

        if (formData.confirmEmail && value !== formData.confirmEmail) {
          setConfirmEmailError('Emails do not match');
        } else if (formData.confirmEmail) {
          setConfirmEmailError('');
        }
      } else {
        setEmailError('');
        setEmailSuggestion('');
      }
    }

    if (name === 'confirmEmail') {
      if (value.trim()) {
        if (value !== formData.email) {
          setConfirmEmailError('Emails do not match');
        } else {
          setConfirmEmailError('');
        }
      } else {
        setConfirmEmailError('');
      }
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email) {
      return { isValid: false, message: 'Email is required' };
    }

    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }

    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const domain = email.split('@')[1]?.toLowerCase();

    if (domain) {
      const typoPatterns = {
        'gmial.com': 'gmail.com',
        'gmai.com': 'gmail.com',
        'gmil.com': 'gmail.com',
        'yahooo.com': 'yahoo.com',
        'yaho.com': 'yahoo.com',
        'hotmial.com': 'hotmail.com',
        'hotmal.com': 'hotmail.com',
        'outlok.com': 'outlook.com'
      };

      if (typoPatterns[domain]) {
        return {
          isValid: false,
          message: `Did you mean ${email.split('@')[0]}@${typoPatterns[domain]}?`,
          suggestion: `${email.split('@')[0]}@${typoPatterns[domain]}`
        };
      }
    }

    if ((email.match(/@/g) || []).length > 1) {
      return { isValid: false, message: 'Email cannot contain multiple @ symbols' };
    }

    if (email.includes(' ')) {
      return { isValid: false, message: 'Email cannot contain spaces' };
    }

    if (email.includes('..')) {
      return { isValid: false, message: 'Email cannot contain consecutive dots' };
    }

    return { isValid: true, message: '' };
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.confirmEmail || !formData.phone) {
      toast.error('Please fill in all contact details');
      return false;
    }

    if (!/^[0-9]{10}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      toast.error(emailValidation.message);
      return false;
    }

    if (formData.email !== formData.confirmEmail) {
      toast.error('Email addresses do not match');
      return false;
    }

    return true;
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setApplyingPromo(true);
    try {
      const response = await checkoutApi.applyPromoCode(promoCode, event.id);
      if (response.success) {
        setAppliedPromo(response.data);
        toast.success(`Promo code applied! You saved KES ${response.data.discount_amount.toLocaleString()}`);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Invalid promo code';
      toast.error(errorMsg);
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemovePromoCode = async () => {
    try {
      await checkoutApi.removePromoCode();
      setAppliedPromo(null);
      setPromoCode('');
      toast.success('Promo code removed');
    } catch (error) {
      toast.error('Failed to remove promo code');
    }
  };

  // Helper to save manual payment state and navigate
  const goToManualPayment = (saleIdToUse) => {
    sessionStorage.setItem('manual_payment_state', JSON.stringify({
      paymentDetails: {
        amount: finalTotal,
        event: event,
        reference: manualPaymentReference || `SALE-${saleIdToUse}`
      }
    }));
    router.push(`/manual-payment/${saleIdToUse}`);
  };

  const handleMpesaSTKPush = async () => {
    if (!validateForm()) return;

    if (!/^[0-9]{10}$/.test(mpesaPhone.replace(/[\s-]/g, ''))) {
      toast.error('Please enter a valid M-PESA phone number');
      return;
    }

    setPaymentStatus('processing');
    const loadingToast = toast.loading('Sending STK Push to your phone...');

    try {
      const ticketDetails = selectedTickets.map(ticket => ({
        event_price_id: ticket.id,
        quantity: ticket.quantity,
        attendee_name: formData.fullName,
        attendee_email: formData.email,
        attendee_phone: formData.phone
      }));

      const paymentData = {
        eventId: event.uuid,
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        paymentMethod: 'mpesa',
        phoneNumber: mpesaPhone.replace(/[\s-]/g, ''),
        ticketDetails: ticketDetails,
        promoCodeId: appliedPromo?.id,
        acceptPromotions: acceptPromotions
      };

      console.log('Sending payment request:', paymentData);
      const response = await checkoutApi.processPayment(paymentData);
      console.log('Payment response:', response);

      toast.dismiss(loadingToast);

      if (response && response.success) {
        toast.success('Payment request sent to your phone. Please enter your M-PESA PIN to complete the transaction.');
        setPollingAttempts(0);

        const responseSaleId = response.sale_token
          || response.data?.sale_token
          || response.transaction?.sale_id
          || response.data?.sale_id
          || response.sale_id
          || response.data?.saleId
          || response.saleId;

        if (responseSaleId) {
          console.log('Sale token found:', responseSaleId);
          setSaleId(responseSaleId);
          setManualPaymentReference(responseSaleId);
        } else {
          console.warn('No sale ID in response, using event-based reference');
          console.warn('Full response:', response);
          setManualPaymentReference(`EVT${event.id}${new Date().getFullYear()}`);
        }

        const transactionId = response.transaction?.transId
          || response.data?.transaction_id
          || response.transaction?.transaction_id
          || response.checkout_request_id;

        if (transactionId) {
          console.log('Starting polling with transaction ID:', transactionId);
          console.log('Full transaction object:', response.transaction);
          console.log('Full response data:', response.data);
          pollPaymentStatus(transactionId);
        } else {
          console.error('No transaction ID in response:', response);
          toast.info('Redirecting to manual payment...');
          const saleIdToUse = responseSaleId || saleId || `temp-${Date.now()}`;
          goToManualPayment(saleIdToUse);
          setPaymentStatus('idle');
        }
      } else {
        console.error('Backend error response:', response);

        const responseSaleId = response?.sale_token
          || response?.data?.sale_token
          || response?.transaction?.sale_id
          || response?.data?.sale_id
          || response?.sale_id
          || response?.data?.saleId
          || response?.saleId;

        if (responseSaleId) {
          setSaleId(responseSaleId);
          setManualPaymentReference(responseSaleId);
        } else {
          setManualPaymentReference(`EVT${event.id}${new Date().getFullYear()}`);
        }

        const errorMessage = response?.message || 'Unable to initiate M-PESA payment. Redirecting to manual payment...';
        toast.info(errorMessage);
        const saleIdToUse = responseSaleId || saleId || `temp-${Date.now()}`;
        goToManualPayment(saleIdToUse);
        setPaymentStatus('idle');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Payment error (catch block):', error);
      console.error('Error response:', error.response);

      const responseSaleId = error.response?.data?.sale_token
        || error.response?.data?.data?.sale_token
        || error.response?.data?.transaction?.sale_id
        || error.response?.data?.sale_id
        || error.response?.data?.data?.sale_id
        || error.response?.data?.saleId;

      if (responseSaleId) {
        setSaleId(responseSaleId);
        setManualPaymentReference(responseSaleId);
      } else {
        setManualPaymentReference(`EVT${event.id}${new Date().getFullYear()}`);
      }

      const errorMsg = error.response?.data?.message || 'Unable to connect to payment service. Redirecting to manual payment...';
      toast.info(errorMsg);
      const saleIdToUse = responseSaleId || saleId || `temp-${Date.now()}`;
      goToManualPayment(saleIdToUse);
      setPaymentStatus('idle');
    }
  };

  const pollPaymentStatus = async (transactionId, attempts = 0) => {
    const maxAttempts = 30;

    setPollingAttempts(attempts);

    console.log(`Polling attempt ${attempts + 1}/${maxAttempts} for transaction:`, transactionId);

    if (attempts >= maxAttempts) {
      console.log('Polling timeout reached');

      let saleIdToUse = saleId;
      if (!saleIdToUse) {
        try {
          const response = await checkoutApi.verifyPayment(transactionId);
          const responseSaleId = response.sale_token
            || response.data?.sale_token
            || response.transaction?.sale_token
            || response.transaction?.sale_id
            || response.data?.sale_id
            || response.sale_id;

          if (responseSaleId) {
            console.log('Sale token extracted from timeout response:', responseSaleId);
            setSaleId(responseSaleId);
            setManualPaymentReference(responseSaleId);
            saleIdToUse = responseSaleId;
          }
        } catch (err) {
          console.error('Could not fetch sale ID:', err);
        }
      }

      toast.info('Payment verification timed out. Redirecting to manual payment...');
      const finalSaleId = saleIdToUse || `temp-${Date.now()}`;
      goToManualPayment(finalSaleId);
      setPaymentStatus('idle');
      setPollingAttempts(0);
      return;
    }

    if (attempts > 0 && attempts % 10 === 0) {
      toast.info(`Still waiting for payment confirmation... (${Math.floor(attempts * 2)}s)`, {
        duration: 2000
      });
    }

    try {
      const response = await checkoutApi.verifyPayment(transactionId);
      console.log(`Polling response (attempt ${attempts + 1}):`, response);

      const status = response.status || response.data?.status;
      const isSuccessful = response.is_successful || response.data?.is_successful || status === 'successful' || status === 'completed';
      const isFailed = response.is_failed || response.data?.is_failed || status === 'failed';
      const needsManualPayment = status === 'awaiting_manual_payment' || status === 'cancelled' || status === 'timeout';

      if (response.success && isSuccessful) {
        console.log('Payment completed successfully:', response);
        const saleIdFromResponse = response.sale_token
          || response.data?.sale_token
          || response.transaction?.sale_token
          || response.transaction?.sale_id
          || response.data?.sale_id
          || response.sale_id
          || saleId;

        setOrderDetails(response.transaction || response.data);
        setPaymentStatus('success');
        setPollingAttempts(0);
        toast.success('Payment verified successfully!');
        checkoutApi.clearCart();

        if (saleIdFromResponse) {
          router.push(`/tickets/${saleIdFromResponse}`);
        }
      } else if (isFailed || needsManualPayment) {
        console.log('Payment failed or needs manual payment:', response);

        let saleIdToUse = saleId;
        if (!saleIdToUse) {
          const responseSaleId = response.sale_token
            || response.data?.sale_token
            || response.transaction?.sale_token
            || response.transaction?.sale_id
            || response.data?.sale_id
            || response.sale_id;

          if (responseSaleId) {
            console.log('Sale token extracted from failed payment:', responseSaleId);
            setSaleId(responseSaleId);
            setManualPaymentReference(responseSaleId);
            saleIdToUse = responseSaleId;
          }
        }

        let message;
        if (needsManualPayment) {
          message = 'Payment was not completed on your phone.';
        } else {
          message = 'Payment could not be processed.';
        }
        toast.info(message + ' Redirecting to manual payment...');
        const finalSaleId = saleIdToUse || `temp-${Date.now()}`;
        goToManualPayment(finalSaleId);
        setPaymentStatus('idle');
        setPollingAttempts(0);
      } else {
        console.log('Payment still pending, continuing to poll...');
        setTimeout(() => pollPaymentStatus(transactionId, attempts + 1), 2000);
      }
    } catch (error) {
      console.error('Polling error (will retry):', error);
      setTimeout(() => pollPaymentStatus(transactionId, attempts + 1), 2000);
    }
  };

  const handleManualPayment = async () => {
    setPaymentStatus('processing');
    toast.info('Starting payment verification. This may take a few minutes...');

    if (saleId) {
      const referenceToCheck = manualPaymentReference || `SALE-${saleId}`;
      pollManualPaymentStatus(referenceToCheck, 0);
    } else {
      toast.error('No payment reference found. Please try again or contact support.');
      setPaymentStatus('idle');
    }
  };

  const pollManualPaymentStatus = async (reference, attempts = 0) => {
    const maxAttempts = 60;

    setPollingAttempts(attempts);

    console.log(`Polling manual payment attempt ${attempts + 1}/${maxAttempts} for reference:`, reference);

    if (attempts >= maxAttempts) {
      console.log('Manual payment polling timeout reached');
      toast.error('Payment verification timed out. Please contact support if you have already paid.');
      setPaymentStatus('idle');
      setPollingAttempts(0);
      return;
    }

    if (attempts > 0 && attempts % 10 === 0) {
      toast.info(`Still checking for payment... (${Math.floor(attempts * 5)}s)`, {
        duration: 3000
      });
    }

    try {
      const response = await checkoutApi.getOrder(saleId);
      console.log(`Manual payment polling response (attempt ${attempts + 1}):`, response);

      if (response.success && response.data) {
        const order = response.data;

        if (order.status === 'completed' || order.payment_status === 'paid') {
          console.log('Manual payment confirmed:', response);
          setOrderDetails(order);
          setPaymentStatus('success');
          setPollingAttempts(0);
          toast.success('Payment confirmed successfully!');
          checkoutApi.clearCart();

          router.push(`/tickets/${saleId}`);
          return;
        }
      }

      setTimeout(() => pollManualPaymentStatus(reference, attempts + 1), 5000);

    } catch (error) {
      console.error('Manual payment polling error (will retry):', error);
      setTimeout(() => pollManualPaymentStatus(reference, attempts + 1), 5000);
    }
  };

  const handleCardPayment = async () => {
    if (!validateForm()) return;

    setPaymentStatus('processing');
    const loadingToast = toast.loading('Processing card payment...');

    try {
      const ticketDetails = selectedTickets.map(ticket => ({
        event_price_id: ticket.id,
        quantity: ticket.quantity,
        attendee_name: formData.fullName,
        attendee_email: formData.email,
        attendee_phone: formData.phone
      }));

      const paymentData = {
        eventId: event.uuid,
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        paymentMethod: 'card',
        ticketDetails: ticketDetails,
        promoCodeId: appliedPromo?.id,
        acceptPromotions: acceptPromotions
      };

      console.log('Processing card payment with data:', paymentData);
      console.log('Current cart token:', checkoutApi.getCartToken());

      const response = await checkoutApi.processPayment(paymentData);
      console.log('Card payment response:', response);
      console.log('Response structure:', {
        hasData: !!response.data,
        hasPaymentUrl: !!response.payment_url,
        dataPaymentUrl: response.data?.payment_url,
        directPaymentUrl: response.payment_url
      });

      toast.dismiss(loadingToast);

      const paymentUrl = response.payment_url || response.data?.payment_url;
      const transactionData = response.transaction || response.data?.transaction;
      const transactionId = response.transaction_id || response.data?.transaction_id;

      if (response.success && paymentUrl) {
        localStorage.setItem('dpoPaymentPending', JSON.stringify({
          saleId: transactionData?.sale_id || saleId,
          transactionId: transactionId,
          amount: finalTotal,
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          timestamp: Date.now()
        }));

        toast.success('Redirecting to secure payment gateway...');
        console.log('Redirecting to:', paymentUrl);
        window.location.href = paymentUrl;
      } else {
        console.error('No payment URL in response:', response);
        toast.error(response.message || 'Failed to initialize card payment');
        setPaymentStatus('idle');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Card payment error:', error);
      const errorMsg = error.response?.data?.message || 'Card payment failed';
      toast.error(errorMsg);
      setPaymentStatus('idle');
    }
  };

  if (paymentStatus === 'success' && orderDetails) {
    const saleIdToUse = orderDetails.sale_id || saleId;
    if (saleIdToUse) {
      router.push(`/tickets/${saleIdToUse}`);
      return null;
    }
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="max-w-2xl mx-auto">
            <div className="glass rounded-2xl p-8 sm:p-12 text-center space-y-8 animate-fadeIn border-2 border-white/10">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-8 rounded-full border-2 border-emerald-500/30 animate-scaleIn">
                    <CheckCircle2 className="h-24 w-24 text-emerald-400" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl font-bold text-white tracking-tight">Payment Successful!</h1>
                <p className="text-muted-foreground text-lg">
                  Your tickets have been confirmed and sent to your email
                </p>
              </div>

              <div className="glass-light rounded-xl p-6 sm:p-8 text-left space-y-5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-white">Order Details</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Order Reference</span>
                    <span className="font-mono font-bold text-white text-lg">
                      {orderDetails?.token || saleId || '—'}
                    </span>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Event</span>
                    <span className="font-semibold text-white text-right max-w-[200px]">{event.title}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Total Tickets</span>
                    <span className="font-semibold text-white text-lg">
                      {selectedTickets.reduce((sum, t) => sum + t.quantity, 0)}
                    </span>
                  </div>

                  {orderDetails?.transaction_id && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Transaction ID</span>
                      <span className="font-mono text-sm text-white">{orderDetails.transaction_id}</span>
                    </div>
                  )}

                  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-white font-semibold">Total Paid</span>
                    <span className="font-bold text-white text-2xl">
                      KES {(orderDetails?.total_amount || finalTotal).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative inline-block">
                <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl"></div>
                <div className="relative bg-white p-10 rounded-2xl shadow-2xl">
                  <QrCode className="h-36 w-36 text-black" strokeWidth={1.5} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Scan this QR code at the venue entrance</p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  className="flex-1 bg-white hover:bg-white/90 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Tickets
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-white/20 hover:bg-white/5"
                  size="lg"
                  onClick={() => router.push('/')}
                >
                  Back to Events
                </Button>
              </div>

              <div className="glass-light p-5 rounded-xl border border-white/10">
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <div className="p-1.5 bg-emerald-500/20 rounded-full">
                      <Mail className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Email Sent</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <div className="p-1.5 bg-emerald-500/20 rounded-full">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <span className="font-medium">SMS Sent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <Button
          variant="ghost"
          className="mb-8 hover:bg-white/5 transition-all duration-300 group"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Event
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 order-1 lg:order-1">
            <div className="glass rounded-2xl p-6 border-0 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Ticket className="h-5 w-5 text-white" />
                <h2 className="text-xl lg:text-2xl font-bold text-white">Order Summary</h2>
              </div>

              <div className="mb-6 pb-6">
                <div className="relative overflow-hidden rounded-xl mb-4 group">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <h3 className="font-semibold text-white mb-2 text-base lg:text-lg">{event.title}</h3>
                <div className="space-y-2">
                  <p className="text-sm text-white/20 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(event.date).toLocaleDateString('en-KE', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })} • {event.time?.substring(0, 5)}
                  </p>
                  <p className="text-sm text-white/20 flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.venue}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6 pb-6">
                <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Tickets</h3>
                {selectedTickets.map((ticket, index) => (
                  <div key={index} className="flex justify-between text-sm items-center py-2 px-3 rounded-lg transition-colors">
                    <span className="text-white/20">
                      <span className="font-semibold text-white">{ticket.quantity}x</span> {ticket.name}
                    </span>
                    <span className="text-white font-semibold">
                      KES {(ticket.price * ticket.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mb-6 pb-6">
                {appliedPromo ? (
                  <div className="glass-light p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 animate-fadeIn">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-500/20 rounded-full">
                          <Tag className="h-4 w-4 text-emerald-400" />
                        </div>
                        <span className="text-white font-semibold">{appliedPromo.code}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemovePromoCode}
                        className="text-xs text-muted-foreground hover:text-white h-auto py-1 px-2"
                      >
                        Remove
                      </Button>
                    </div>
                    <p className="text-xs text-emerald-400 font-medium">
                      -{appliedPromo.discount_type === 'percentage'
                        ? `${appliedPromo.discount_value}%`
                        : `KES ${appliedPromo.discount_value}`} discount applied
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="bg-black border border-white/10 focus:border-white/20 focus:ring-0 text-sm transition-all duration-300 h-12 text-white placeholder:text-white/30"
                    />
                    <Button
                      onClick={handleApplyPromoCode}
                      disabled={applyingPromo || !promoCode.trim()}
                      className="whitespace-nowrap bg-gradient-red hover:opacity-90 text-white border-0"
                    >
                      {applyingPromo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {discount > 0 && (
                  <>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-white/20">Subtotal</span>
                      <span className="text-white font-medium">KES {total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-emerald-400">Discount</span>
                      <span className="text-emerald-400 font-medium">-KES {discount.toLocaleString()}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-white font-semibold text-sm lg:text-base">Total</span>
                  <span className="text-white font-bold text-base lg:text-lg">KES {finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 order-2 lg:order-2 space-y-6">
            <div className="glass rounded-2xl p-6 sm:p-8 border-0 shadow-2xl animate-slideInRight">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="h-5 w-5 text-white" />
                <h2 className="text-xl lg:text-2xl font-bold text-white">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="bg-black border border-white/10 focus:border-white/20 focus:ring-0 transition-all duration-300 h-12 text-white text-sm placeholder:text-white/30"
                  />
                </div>
                <div>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="bg-black border border-white/10 focus:border-white/20 focus:ring-0 transition-all duration-300 h-12 text-white text-sm placeholder:text-white/30"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`bg-black border border-white/10 focus:border-white/20 focus:ring-0 transition-all duration-300 h-12 text-white text-sm placeholder:text-white/30 ${
                      emailError ? 'ring-2 ring-red-500/50' : formData.email && !emailError ? 'ring-2 ring-emerald-500/50' : ''
                    }`}
                  />
                  {emailError && (
                    <p className="text-xs text-red-400 flex items-center gap-1 animate-fadeIn">
                      <span className="inline-block w-1 h-1 bg-red-400 rounded-full"></span>
                      {emailError}
                    </p>
                  )}
                  {emailSuggestion && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, email: emailSuggestion });
                        setEmailError('');
                        setEmailSuggestion('');
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors animate-fadeIn"
                    >
                      <span className="inline-block w-1 h-1 bg-emerald-400 rounded-full"></span>
                      Click to use: {emailSuggestion}
                    </button>
                  )}
                  {formData.email && !emailError && !emailSuggestion && (
                    <p className="text-xs text-emerald-400 flex items-center gap-1 animate-fadeIn">
                      <span className="inline-block w-1 h-1 bg-emerald-400 rounded-full"></span>
                      Valid email address
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Input
                    id="confirmEmail"
                    name="confirmEmail"
                    type="email"
                    placeholder="Confirm Email Address"
                    value={formData.confirmEmail}
                    onChange={handleInputChange}
                    className={`bg-black border border-white/10 focus:border-white/20 focus:ring-0 transition-all duration-300 h-12 text-white text-sm placeholder:text-white/30 ${
                      confirmEmailError ? 'ring-2 ring-red-500/50' : formData.confirmEmail && !confirmEmailError && formData.email === formData.confirmEmail ? 'ring-2 ring-emerald-500/50' : ''
                    }`}
                  />
                  {confirmEmailError && (
                    <p className="text-xs text-red-400 flex items-center gap-1 animate-fadeIn">
                      <span className="inline-block w-1 h-1 bg-red-400 rounded-full"></span>
                      {confirmEmailError}
                    </p>
                  )}
                  {formData.confirmEmail && !confirmEmailError && formData.email === formData.confirmEmail && (
                    <p className="text-xs text-emerald-400 flex items-center gap-1 animate-fadeIn">
                      <span className="inline-block w-1 h-1 bg-emerald-400 rounded-full"></span>
                      Emails match
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 sm:p-8 border-0 shadow-2xl animate-slideInRight" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="h-5 w-5 text-white" />
                <h2 className="text-xl lg:text-2xl font-bold text-white">Payment Details</h2>
              </div>

              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-4">
                  <div className="rounded-xl p-5 cursor-pointer transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="mpesa-stk" id="mpesa-stk" className="border-white/30" />
                      <Label htmlFor="mpesa-stk" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-semibold text-white">M-PESA</p>
                          </div>
                        </div>
                      </Label>
                    </div>

                    {paymentMethod === 'mpesa-stk' && (
                      <div className="mt-5 pt-5 space-y-4 animate-fadeIn">
                        <div>
                          <Input
                            id="mpesa-phone"
                            placeholder="M-PESA Phone Number"
                            value={mpesaPhone}
                            onChange={(e) => setMpesaPhone(e.target.value)}
                            className="bg-black border border-white/10 focus:border-white/20 focus:ring-0 transition-all duration-300 h-12 text-white text-sm placeholder:text-white/30"
                          />
                        </div>

                        {paymentStatus === 'processing' && pollingAttempts > 0 && (
                          <div className="space-y-2 animate-fadeIn">
                            <div className="flex justify-between text-xs text-white/20">
                              <span>Checking payment status...</span>
                              <span>{pollingAttempts}/30</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-400 h-full transition-all duration-500 ease-out"
                                style={{ width: `${(pollingAttempts / 30) * 100}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-center text-white/20">
                              Please complete the payment on your phone
                            </p>
                          </div>
                        )}

                        {showManualPayment && (
                          <div className="mt-4 p-5 glass rounded-xl space-y-5 animate-fadeIn border border-white/10">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <Smartphone className="h-6 w-6 text-emerald-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white text-lg">Complete Payment via M-PESA</h3>
                                <p className="text-xs text-white/60">Follow these steps to pay via M-PESA Pay Bill</p>
                              </div>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 p-5 rounded-xl border-2 border-emerald-500/30">
                              <div className="flex items-center gap-2 mb-3">
                                <Shield className="h-5 w-5 text-emerald-400" />
                                <h4 className="text-sm font-semibold text-white uppercase tracking-wide">Payment Details</h4>
                              </div>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                                  <span className="text-white/60 text-sm">Pay Bill Number:</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-white font-bold text-xl font-mono">{paybillNumber}</span>
                                    <button
                                      onClick={() => copyToClipboard(paybillNumber)}
                                      className="p-1.5 hover:bg-white/10 rounded transition-colors text-emerald-400 text-xs"
                                    >
                                      Copy
                                    </button>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                                  <span className="text-white/60 text-sm">Account Number:</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-emerald-400 font-bold text-lg font-mono">
                                      {manualPaymentReference || `EVT${event.id}2024`}
                                    </span>
                                    <button
                                      onClick={() => copyToClipboard(manualPaymentReference || `EVT${event.id}2024`)}
                                      className="p-1.5 hover:bg-white/10 rounded transition-colors text-emerald-400 text-xs"
                                    >
                                      Copy
                                    </button>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg border-t-2 border-emerald-500/30">
                                  <span className="text-white font-semibold">Amount to Pay:</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-white font-bold text-2xl">KES {finalTotal.toLocaleString()}</span>
                                    <button
                                      onClick={() => copyToClipboard(finalTotal.toString())}
                                      className="p-1.5 hover:bg-white/10 rounded transition-colors text-emerald-400 text-xs"
                                    >
                                      Copy
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h4 className="text-white font-semibold text-sm uppercase tracking-wide">
                                Step-by-Step Instructions
                              </h4>

                              {[
                                { n: 1, t: 'Open M-PESA Menu', d: 'Go to M-PESA on your phone and select "Lipa Na M-PESA"' },
                                { n: 2, t: 'Select Pay Bill', d: 'Choose "Pay Bill" option from the menu' },
                                { n: 3, t: 'Enter Business Number', d: `Enter Pay Bill: ${paybillNumber}` },
                                { n: 4, t: 'Enter Account Number', d: `Use reference: ${manualPaymentReference || `EVT${event.id}2024`}` },
                                { n: 5, t: 'Enter Amount', d: `Amount: KES ${finalTotal.toLocaleString()}` },
                                { n: 6, t: 'Enter M-PESA PIN', d: 'Complete the transaction with your PIN' },
                                { n: 7, t: 'Wait for Confirmation', d: 'You will receive an M-PESA confirmation SMS' },
                              ].map(({ n, t, d }) => (
                                <div key={n} className="flex gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-emerald-500/30 transition-colors">
                                  <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg">
                                      {n}
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="text-white font-semibold mb-1">{t}</h5>
                                    <p className="text-sm text-white/60">{d}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                              <h5 className="text-white font-semibold text-sm mb-2">Important Notes</h5>
                              <ul className="text-xs text-white/60 space-y-1.5">
                                <li className="flex items-start gap-2">
                                  <span className="text-emerald-400 mt-0.5">•</span>
                                  <span>Use the <strong className="text-white">exact reference number</strong> provided above as your account number</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-emerald-400 mt-0.5">•</span>
                                  <span>Payment confirmation is <strong className="text-white">automatic</strong> and usually takes 1-3 minutes</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-emerald-400 mt-0.5">•</span>
                                  <span>After payment, click <strong className="text-white">"I Have Paid"</strong> button below to start verification</span>
                                </li>
                              </ul>
                            </div>

                            <div className="space-y-2 pt-2">
                              <Label htmlFor="confirmation-code" className="text-white font-medium">
                                M-PESA Confirmation Code <span className="text-white/40 text-xs">(Optional)</span>
                              </Label>
                              <Input
                                id="confirmation-code"
                                placeholder="e.g., QGX1A2B3C4"
                                value={confirmationCode}
                                onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
                                className="bg-black border border-white/10 focus:border-white/20 focus:ring-0 font-mono h-12 text-white"
                              />
                              <p className="text-xs text-white/40">
                                Enter the confirmation code from your M-PESA SMS to verify payment immediately
                              </p>
                            </div>

                            <Button
                              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-12 shadow-lg transition-all duration-300"
                              onClick={handleManualPayment}
                              disabled={paymentStatus === 'processing'}
                            >
                              {paymentStatus === 'processing' ? (
                                <>
                                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                  Verifying Payment...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-5 w-5 mr-2" />
                                  I Have Paid - Verify Now
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl p-5 cursor-pointer transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="card" id="card" className="border-white/30" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-white">Credit/Debit Card</p>
                            <p className="text-xs text-white/60 mt-1">Secure payment via DPO Gateway</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="glass rounded-2xl p-6 sm:p-8 border-0 shadow-2xl animate-slideInRight" style={{animationDelay: '0.2s'}}>
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black accent-red-500 focus:ring-red-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-xs text-white/60 cursor-pointer">
                    I have read and understood the{' '}
                    <a href="/terms" target="_blank" className="text-primary hover:text-primary/80 underline">
                      Terms and Conditions
                    </a>
                    {' '}associated with this purchase.
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="promotions"
                    checked={acceptPromotions}
                    onChange={(e) => setAcceptPromotions(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black accent-red-500 focus:ring-red-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <label htmlFor="promotions" className="text-xs text-white/60 cursor-pointer">
                    I agree to receive offers or promotions from TurnApp by Email, Text, or Phone.
                  </label>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-red hover:opacity-90 text-white font-bold text-base lg:text-lg h-12 shadow-lg hover:shadow-xl transition-all duration-300 red-glow-strong disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={paymentMethod === 'card' ? handleCardPayment : handleMpesaSTKPush}
                disabled={
                  paymentStatus === 'processing' ||
                  !formData.fullName ||
                  !formData.email ||
                  !formData.confirmEmail ||
                  !formData.phone ||
                  (paymentMethod === 'mpesa-stk' && !mpesaPhone) ||
                  !acceptedTerms ||
                  emailError !== '' ||
                  confirmEmailError !== ''
                }
              >
                {paymentStatus === 'processing' ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>
                      {paymentMethod === 'card'
                        ? 'Redirecting to payment gateway...'
                        : pollingAttempts > 0
                          ? `Verifying payment... (${pollingAttempts * 2}s)`
                          : 'Waiting for confirmation...'}
                    </span>
                  </div>
                ) : (
                  `PAY KES ${finalTotal.toLocaleString()}`
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;