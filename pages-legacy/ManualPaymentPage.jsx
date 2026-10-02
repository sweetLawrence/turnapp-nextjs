'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import {
  Smartphone,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Info,
  Copy
} from 'lucide-react'
import { toast } from 'sonner'
import { checkoutApi } from '@/lib/services/checkoutApi'

const ManualPaymentPage = () => {
  const { saleId } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [orderData, setOrderData] = useState(null)
  const [pollingAttempts, setPollingAttempts] = useState(0)
  const [paymentDetails, setPaymentDetails] = useState(null)

  const paybillNumber = '4181929'

  // Load payment details from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('manual_payment_state')
      if (raw) {
        const parsed = JSON.parse(raw)
        setPaymentDetails(parsed.paymentDetails || null)
      }
    } catch (e) {
      console.error('Failed to parse manual payment state:', e)
    }
  }, [])

  useEffect(() => {
    if (saleId) {
      fetchOrderDetails()
    } else {
      toast.error('No payment information found')
      router.push('/')
    }
  }, [saleId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await checkoutApi.getOrder(saleId)

      if (response.success && response.data) {
        setOrderData(response.data)

        if (
          response.data.payment_status === 'paid' ||
          response.data.status === 'completed'
        ) {
          toast.success('Payment already completed!')
          router.push(`/tickets/${saleId}`)
        }
      } else {
        toast.error('Order not found')
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      toast.error('Failed to load payment details')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = text => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          toast.success('Copied to clipboard!')
        })
        .catch(() => {
          fallbackCopy(text)
        })
    } else {
      fallbackCopy(text)
    }
  }

  const fallbackCopy = text => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      toast.success('Copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy')
    }
    document.body.removeChild(textArea)
  }

  const handleVerifyPayment = async () => {
    setVerifying(true)
    setPollingAttempts(0)
    toast.info('Starting payment verification. This may take a few minutes...')
    pollManualPaymentStatus(0)
  }

  const pollManualPaymentStatus = async attempts => {
    const maxAttempts = 60

    setPollingAttempts(attempts)

    if (attempts >= maxAttempts) {
      toast.error(
        'Payment verification timed out. Please contact support if you have already paid.'
      )
      setVerifying(false)
      setPollingAttempts(0)
      return
    }

    if (attempts > 0 && attempts % 10 === 0) {
      toast.info(
        `Still checking for payment... (${Math.floor(attempts * 5)}s)`,
        { duration: 3000 }
      )
    }

    try {
      const response = await checkoutApi.getOrder(saleId)

      if (response.success && response.data) {
        const order = response.data

        if (
          order.status?.toLowerCase() === 'complete' ||
          order.payment_status === 'successful'
        ) {
          setVerifying(false)
          setPollingAttempts(0)
          toast.success('Payment confirmed successfully!')
          router.push(`/tickets/${saleId}`)
          return
        }
      }

      setTimeout(() => pollManualPaymentStatus(attempts + 1), 5000)
    } catch (error) {
      console.error('Manual payment polling error:', error)
      setTimeout(() => pollManualPaymentStatus(attempts + 1), 5000)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-black'>
        <div className='text-center'>
          <Loader2 className='h-12 w-12 animate-spin text-white mx-auto mb-4' />
        </div>
      </div>
    )
  }

  if (!orderData) {
    return null
  }

  const event = orderData.event || {}
  const totalAmount = orderData.total_amount || paymentDetails?.amount || 0
  const reference = orderData.token || saleId

  return (
    <div className='min-h-screen bg-black'>
      <Navbar />

      <main className='container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20'>
        <Button
          variant='ghost'
          className='mb-8 hover:bg-white/5 transition-all duration-300 group'
          onClick={() => router.back()}
        >
          <ArrowLeft className='h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform' />
          Back
        </Button>

        <div className='max-w-4xl mx-auto'>
          <div className='glass rounded-2xl p-6 sm:p-8 border-0 mb-8'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='p-3 bg-white/10 rounded-lg'>
                <Smartphone className='h-5 w-5 sm:h-6 sm:w-6 text-white' />
              </div>
              <div>
                <h1 className='text-lg sm:text-xl lg:text-2xl font-bold text-white'>
                  Complete Payment via M-PESA
                </h1>
                <p className='text-xs sm:text-sm text-white/60'>
                  Follow the steps below to complete your payment
                </p>
              </div>
            </div>
          </div>

          <div className='glass rounded-2xl p-6 sm:p-8 border-0 mb-8'>
            {event.title && (
              <div className='mb-6 p-3 sm:p-4 rounded-lg'>
                <h3 className='text-white font-semibold mb-2 text-sm sm:text-base lg:text-lg'>
                  {event.title}
                </h3>
                <p className='text-white/60 text-xs'>
                  {event.date &&
                    new Date(event.date).toLocaleDateString('en-KE', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  {event.venue && ` • ${event.venue}`}
                </p>
              </div>
            )}

            <div className='space-y-3 mb-6'>
              <h3 className='text-white font-semibold text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2'>
                <Info className='h-4 w-4 text-white' />
                Step-by-Step Instructions
              </h3>

              {[
                {
                  step: 1,
                  title: 'Open M-PESA Menu',
                  desc: 'Go to M-PESA on your phone and select "Lipa Na M-PESA"'
                },
                {
                  step: 2,
                  title: 'Select Pay Bill',
                  desc: 'Choose "Pay Bill" option from the menu'
                },
                {
                  step: 3,
                  title: 'Enter Business Number',
                  desc: 'Enter Pay Bill:',
                  value: paybillNumber,
                  copyable: true
                },
                {
                  step: 4,
                  title: 'Enter Account Number',
                  desc: 'Use reference:',
                  value: reference,
                  copyable: true
                },
                {
                  step: 5,
                  title: 'Enter Amount',
                  desc: 'Amount:',
                  value: `KES ${totalAmount.toLocaleString()}`,
                  copyable: true
                },
                {
                  step: 6,
                  title: 'Enter M-PESA PIN',
                  desc: 'Complete the transaction with your PIN'
                },
                {
                  step: 7,
                  title: 'Wait for Confirmation',
                  desc: 'You will receive an M-PESA confirmation SMS'
                }
              ].map(item => (
                <div
                  key={item.step}
                  className='flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-colors'
                >
                  <div className='flex-shrink-0'>
                    <div className='w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-white to-white/80 flex items-center justify-center text-black font-bold text-xs sm:text-sm'>
                      {item.step}
                    </div>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h5 className='text-white font-semibold text-xs sm:text-sm mb-1'>
                      {item.title}
                    </h5>
                    <div className='text-xs text-white/60'>
                      {item.desc}
                      {item.copyable && (
                        <div className='flex items-center gap-2 mt-1'>
                          <span className='text-red-500 font-bold font-mono break-all'>
                            {item.value}
                          </span>
                          <button
                            onClick={() => copyToClipboard(item.value)}
                            className='p-1.5 hover:bg-white/10 rounded transition-colors flex-shrink-0'
                            title='Copy to clipboard'
                          >
                            <Copy className='h-3.5 w-3.5 text-red-500' />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className='bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 sm:p-4 mb-6'>
              <div className='flex gap-2 sm:gap-3'>
                <Info className='h-4 w-4 sm:h-5 sm:w-5 text-blue-400 flex-shrink-0 mt-0.5' />
                <div className='flex-1'>
                  <h5 className='text-white font-semibold text-xs sm:text-sm mb-2'>
                    Important Notes
                  </h5>
                  <ul className='text-xs text-white/60 space-y-1.5'>
                    <li>
                      • Use the exact reference number provided above as your
                      account number
                    </li>
                    <li>
                      • Payment confirmation is automatic and usually takes 1-3
                      minutes
                    </li>
                    <li>
                      • You will receive a confirmation SMS from M-PESA once
                      payment is successful
                    </li>
                    <li>
                      • After payment, click "I Have Paid" button below to start
                      verification
                    </li>
                    <li>
                      • Your tickets will be generated automatically once
                      payment is confirmed
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              className='w-full bg-gradient-red hover:opacity-90 text-white font-bold text-sm sm:text-base lg:text-lg h-12 shadow-lg hover:shadow-xl transition-all duration-300 red-glow-strong disabled:opacity-50'
              onClick={handleVerifyPayment}
              disabled={verifying}
            >
              {verifying ? (
                <div className='flex items-center justify-center gap-2'>
                  <Loader2 className='h-4 w-4 sm:h-5 sm:w-5 animate-spin' />
                  <span>Verifying Payment... ({pollingAttempts * 5}s)</span>
                </div>
              ) : (
                <>
                  <CheckCircle2 className='h-4 w-4 sm:h-5 sm:w-5 mr-2' />I Have
                  Paid - Verify Now
                </>
              )}
            </Button>

            {verifying && pollingAttempts > 0 && (
              <div className='mt-4 space-y-2 animate-fadeIn'>
                <div className='flex justify-between text-xs text-white/20'>
                  <span>Checking payment status...</span>
                  <span>{pollingAttempts}/60</span>
                </div>
                <div className='w-full bg-white/10 rounded-full h-1.5 overflow-hidden'>
                  <div
                    className='bg-emerald-400 h-full transition-all duration-500 ease-out'
                    style={{ width: `${(pollingAttempts / 60) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ManualPaymentPage