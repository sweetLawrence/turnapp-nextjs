"use client"

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  Loader2,
  Download,
  Mail,
  Home,
  Ticket,
  Calendar,
  MapPin,
  Clock,
  User,
  Receipt
} from 'lucide-react'
import { toast } from 'sonner'
import { checkoutApi } from '@/lib/services/checkoutApi'

const SuccessPageInner = () => {
  const { saleId } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [orderData, setOrderData] = useState(null)
  const [tickets, setTickets] = useState([])
  const [downloadingAll, setDownloadingAll] = useState(false)
  const [downloadingTicket, setDownloadingTicket] = useState(null)

  useEffect(() => {
    if (saleId) {
      fetchOrderDetails()
    } else {
      const saleIdParam = searchParams.get('saleId')
      if (saleIdParam) {
        router.replace(`/tickets/${saleIdParam}`)
      } else {
        toast.error('No order information found')
        router.push('/')
      }
    }
  }, [saleId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await checkoutApi.getOrder(saleId)

      if (response.success && response.data) {
        setOrderData(response.data)
        setTickets(response.data.tickets || [])
      } else {
        toast.error('Order not found')
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      toast.error('Failed to load order details')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const downloadTicket = async ticketUuid => {
    try {
      setDownloadingTicket(ticketUuid)
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || 'https://api.turnapp.events/api'
      const downloadUrl = `${API_BASE_URL}/tickets/${ticketUuid}/download`
      window.open(downloadUrl, '_blank')
      toast.success('Ticket download started')
    } catch (error) {
      console.error('Error downloading ticket:', error)
      toast.error('Failed to download ticket')
    } finally {
      setDownloadingTicket(null)
    }
  }

  const downloadAllTickets = async () => {
    try {
      setDownloadingAll(true)
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || 'https://api.turnapp.events/api'
      const downloadUrl = `${API_BASE_URL}/sales/${saleId}/tickets/download`
      window.open(downloadUrl, '_blank')
      toast.success('All tickets download started')
    } catch (error) {
      console.error('Error downloading tickets:', error)
      toast.error('Failed to download tickets')
    } finally {
      setDownloadingAll(false)
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
  const transaction = orderData.transaction || {}

  const ticketsSummary = tickets.reduce((acc, ticket) => {
    const typeName = ticket.event_price?.name || 'Standard Ticket'
    const price = parseFloat(ticket.event_price?.price || 0)

    if (!acc[typeName]) {
      acc[typeName] = { count: 0, price: price, total: 0 }
    }
    acc[typeName].count += 1
    acc[typeName].total += price
    return acc
  }, {})

  const totalAmount = Object.values(ticketsSummary).reduce(
    (sum, item) => sum + item.total,
    0
  )

  return (
    <div className='min-h-screen bg-black'>
      <Navbar />

      <main className='container mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-28 pb-12 lg:pb-20'>
        <div className='max-w-5xl mx-auto mb-8 lg:mb-10'>
          <div className='glass rounded-2xl p-6 sm:p-8 lg:p-10 text-center border-0 relative overflow-hidden'>
            <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse'></div>

            <div className='flex justify-center mb-4 sm:mb-5'>
              <div className='relative'>
                <div className='absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse'></div>
                <div className='relative bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-4 sm:p-5 rounded-full border-2 border-emerald-500/30'>
                  <CheckCircle2
                    className='h-10 w-10 sm:h-14 sm:w-14 text-emerald-400'
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            </div>

            <h1 className='text-2xl sm:text-4xl lg:text-4xl font-bold text-white mb-2 sm:mb-3'>
              Purchase Successful!
            </h1>
            <p className='text-sm sm:text-base lg:text-lg text-white/60 mb-4 sm:mb-5 max-w-2xl mx-auto leading-relaxed'>
              Your tickets are ready for download. <br />
              We've also emailed you a copy.
            </p>
          </div>
        </div>

        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-6'>
            <div className='lg:col-span-2 space-y-5'>
              <div className='flex flex-row justify-between items-center gap-4 pb-1'>
                <div className='flex-1'>
                  <h3 className='text-xl lg:text-2xl font-bold text-white flex items-center gap-3 ml-2'>
                    Your Tickets
                  </h3>
                  <p className='hidden sm:block text-sm text-white/50 mt-1.5 ml-2'>
                    {tickets.length}{' '}
                    {tickets.length === 1 ? 'ticket' : 'tickets'} available
                  </p>
                </div>

                {tickets.length > 1 && (
                  <Button
                    onClick={downloadAllTickets}
                    disabled={downloadingAll}
                    className='bg-gradient-red hover:opacity-90 text-white font-bold red-glow smooth-transition px-4 h-9 shrink-0 text-xs'
                  >
                    {downloadingAll ? (
                      <>
                        <Loader2 className='h-3.5 w-3.5 mr-2 animate-spin' />
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download className='h-3.5 w-3.5 mr-2' />
                        <span>Download All</span>
                      </>
                    )}
                  </Button>
                )}
              </div>

              {tickets.length > 0 ? (
                <div className='space-y-3'>
                  {tickets.map((ticket, index) => (
                    <div
                      key={ticket.id}
                      className='glass rounded-xl p-5 lg:p-6 border-0 hover:bg-white/5 transition-all duration-300 group'
                    >
                      <div className='flex flex-col lg:flex-row justify-between gap-5 lg:gap-6'>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center justify-between gap-3 mb-4'>
                            <span className='bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-semibold border border-primary/20 whitespace-nowrap'>
                              Ticket #{index + 1}
                            </span>
                            <span className='bg-white/5 text-white px-2.5 py-1 rounded-full text-xs font-semibold border border-white/10 whitespace-nowrap'>
                              {ticket.event_price?.name || 'Standard Ticket'}
                            </span>
                          </div>

                          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 text-sm'>
                            <div className='flex items-center gap-2'>
                              <Ticket className='h-4 w-4 text-white/40 shrink-0' />
                              <span className='text-white/80 font-mono font-semibold tracking-wide text-sm truncate'>
                                {ticket.ticket_no}
                              </span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <User className='h-4 w-4 text-white/40 shrink-0' />
                              <span className='text-white truncate'>
                                {ticket.customer_name}
                              </span>
                            </div>
                            <div className='sm:col-span-2 lg:col-span-1 flex items-center gap-2'>
                              <Mail className='h-4 w-4 text-white/40 shrink-0' />
                              <span className='text-white/80 truncate'>
                                {ticket.customer_email}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className='flex items-end lg:items-center pt-3 lg:pt-0 border-t border-white/5 lg:border-0'>
                          <Button
                            onClick={() => downloadTicket(ticket.uuid)}
                            disabled={downloadingTicket === ticket.uuid}
                            className='w-full lg:w-auto bg-gradient-red hover:opacity-90 text-white font-bold h-9 px-3 red-glow smooth-transition text-xs sm:text-sm'
                          >
                            {downloadingTicket === ticket.uuid ? (
                              <Loader2 className='h-3.5 w-3.5 animate-spin' />
                            ) : (
                              <Download className='h-3.5 w-3.5' />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='glass rounded-xl p-8 sm:p-12 text-center border border-white/10'>
                  <Ticket className='h-12 w-12 sm:h-16 sm:w-16 text-white/20 mx-auto mb-4' />
                  <p className='text-white/40'>
                    No tickets found for this purchase.
                  </p>
                </div>
              )}

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-2'>
                <Button
                  variant='outline'
                  className='h-9 border-white/20 hover:bg-white/5 hover:border-white/30 text-white transition-all text-xs sm:text-sm'
                  onClick={() =>
                    (window.location.href = 'mailto:support@turnapp.events')
                  }
                >
                  <Mail className='h-3.5 w-3.5 mr-2' />
                  Contact Support
                </Button>
                <Button
                  variant='outline'
                  className='h-9 border-white/20 hover:bg-white/5 hover:border-white/30 text-white transition-all text-xs sm:text-sm'
                  onClick={() => router.push('/')}
                >
                  <Home className='h-3.5 w-3.5 mr-2' />
                  Back to Events
                </Button>
              </div>
            </div>

            <div className='order-last lg:order-none lg:col-span-1 mt-4 lg:mt-0'>
              <div className='glass rounded-2xl p-6 border-0 sticky top-24'>
                <div className='flex items-center gap-3 mb-6 pb-4 border-b border-white/10'>
                  <div className='p-2 bg-white/5 rounded-lg'>
                    <Receipt className='h-5 w-5 text-primary' />
                  </div>
                  <h4 className='text-lg lg:text-xl font-bold text-white'>
                    Order Summary
                  </h4>
                </div>

                {event.title && (
                  <div className='mb-6 pb-5 border-b border-white/10'>
                    <h5 className='text-white font-bold mb-3.5 text-base leading-tight'>
                      {event.title}
                    </h5>
                    <div className='space-y-3 text-sm'>
                      {event.date && (
                        <div className='flex items-start gap-3 text-white/60'>
                          <Calendar className='h-4 w-4 mt-0.5 shrink-0 text-white/40' />
                          <span className='leading-snug'>
                            {new Date(event.date).toLocaleDateString('en-KE', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                      {event.time && (
                        <div className='flex items-center gap-3 text-white/60'>
                          <Clock className='h-4 w-4 shrink-0 text-white/40' />
                          <span>{event.time?.substring(0, 5)}</span>
                        </div>
                      )}
                      {event.venue && (
                        <div className='flex items-start gap-3 text-white/60'>
                          <MapPin className='h-4 w-4 mt-0.5 shrink-0 text-white/40' />
                          <span className='line-clamp-2 leading-snug'>
                            {event.venue}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className='space-y-3 mb-6 pb-5 border-b border-white/10'>
                  <h5 className='text-white/40 font-semibold text-xs uppercase tracking-wider mb-1'>
                    Purchased Items
                  </h5>
                  {Object.entries(ticketsSummary).map(([typeName, data]) => (
                    <div
                      key={typeName}
                      className='flex justify-between items-start gap-4 py-1.5'
                    >
                      <div className='flex-1'>
                        <div className='text-white font-medium text-sm leading-tight'>
                          {data.count} x {typeName}
                        </div>
                        <div className='text-white/40 text-xs mt-1'>
                          KES {data.price.toLocaleString()} each
                        </div>
                      </div>
                      <div className='text-white font-semibold text-sm whitespace-nowrap'>
                        KES {data.total.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className='flex justify-between items-center py-2.5 mb-4 bg-white/5 rounded-lg px-4'>
                  <span className='text-white/80 font-semibold text-xs'>
                    Total Paid
                  </span>
                  <span className='text-white font-bold text-base'>
                    KES {totalAmount.toLocaleString()}
                  </span>
                </div>

                {orderData.token && (
                  <div className='flex justify-between items-center py-2.5 mb-4 bg-white/5 rounded-lg px-4'>
                    <span className='text-white/80 font-semibold text-xs'>
                      Order Reference
                    </span>
                    <span className='text-white font-bold text-sm font-mono tracking-wider'>
                      {orderData.token}
                    </span>
                  </div>
                )}

                {transaction && (
                  <div className='bg-white/[0.02] rounded-xl p-3.5 text-xs border border-white/5'>
                    <div className='space-y-2'>
                      {transaction.pay_method && (
                        <div className='flex justify-between items-center gap-3'>
                          <span className='text-white/40 text-xs uppercase tracking-wider'>
                            Method
                          </span>
                          <span className='text-white font-medium text-xs'>
                            {transaction.pay_method}
                          </span>
                        </div>
                      )}
                      {transaction.status && (
                        <div className='flex justify-between items-center gap-3'>
                          <span className='text-white/40 text-xs uppercase tracking-wider'>
                            Status
                          </span>
                          <span className='text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-400/10 rounded text-xs'>
                            {transaction.status.charAt(0).toUpperCase() +
                              transaction.status.slice(1)}
                          </span>
                        </div>
                      )}
                      {transaction.created_at && (
                        <div className='flex justify-between items-center gap-3 pt-2 mt-2 border-t border-white/5'>
                          <span className='text-white/40 text-xs uppercase tracking-wider'>
                            Date
                          </span>
                          <span className='text-white/60 text-xs font-medium'>
                            {new Date(
                              transaction.created_at
                            ).toLocaleDateString('en-KE', {
                              day: 'numeric',
                              month: 'short',
                              year: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

const SuccessPage = () => (
  <Suspense fallback={
    <div className='min-h-screen flex items-center justify-center bg-black'>
      <Loader2 className='h-12 w-12 animate-spin text-white' />
    </div>
  }>
    <SuccessPageInner />
  </Suspense>
)

export default SuccessPage