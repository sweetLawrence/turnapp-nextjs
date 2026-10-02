"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { authService } from '@/lib/services/authService'
import {
  LayoutDashboard,
  Calendar,
  Tag,
  Users,
  Wallet,
  Ticket,
  Gift,
  UserCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Search,
  Bell,
  Sparkles,
  Loader2,
  Shield,
  Target,
  DollarSign,
  MousePointerClick,
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  UserPlus
} from 'lucide-react'
import { Button } from './ui/button'
import { toast } from 'sonner'
import api from '@/lib/services/apiClient'
import { notificationApi } from '@/lib/services/notificationApi'

export const DashboardLayout = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchRef = useRef(null)
  const notificationRef = useRef(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const user = authService.getUser()

  // Dashboard mode state - auto-detect from current path
  const isAffiliatePath = pathname.startsWith('/affiliate')
  const [dashboardMode, setDashboardMode] = useState(
    isAffiliatePath ? 'affiliate' : 'organizer'
  )

  // Update dashboard mode when path changes
  useEffect(() => {
    setDashboardMode(isAffiliatePath ? 'affiliate' : 'organizer')
  }, [isAffiliatePath])

  const handleLogout = async () => {
    try {
      await authService.logout()
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed')
    }
  }

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search function
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery)
      } else {
        setSearchResults(null)
        setShowSearchResults(false)
      }
    }, 300)

    return () => clearTimeout(delaySearch)
  }, [searchQuery])

  // Notification helpers
  const timeAgo = date => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return new Date(date).toLocaleDateString()
  }

  const getNotificationIcon = type => {
    switch (type) {
      case 'enrollment_approved':
        return <CheckCircle2 className='h-5 w-5 text-emerald-500' />
      case 'enrollment_rejected':
        return <XCircle className='h-5 w-5 text-red-500' />
      case 'new_enrollment_request':
        return <UserPlus className='h-5 w-5 text-blue-500' />
      case 'withdrawal_approved':
        return <DollarSign className='h-5 w-5 text-emerald-500' />
      case 'withdrawal_rejected':
        return <DollarSign className='h-5 w-5 text-red-500' />
      default:
        return <Bell className='h-5 w-5 text-zinc-400' />
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationApi.getUnreadCount()
      setUnreadCount(data.data?.count ?? data.count ?? 0)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  const fetchNotifications = async () => {
    setNotificationsLoading(true)
    try {
      const data = await notificationApi.getNotifications({
        page: 1,
        per_page: 10
      })
      setNotifications(data.data ?? data.notifications ?? [])
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setNotificationsLoading(false)
    }
  }

useEffect(() => {
  // Only poll when we actually have an auth token
  if (!authService.getToken()) return

  fetchUnreadCount()
  const interval = setInterval(fetchUnreadCount, 30000)
  return () => clearInterval(interval)
}, [])

  // useEffect(() => {
  //   if (showNotifications) {
  //     fetchNotifications()
  //   }
  // }, [showNotifications])


  useEffect(() => {
  if (showNotifications && authService.getToken()) {
    fetchNotifications()
  }
}, [showNotifications])

  useEffect(() => {
    const handleNotificationClickOutside = event => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleNotificationClickOutside)
    return () =>
      document.removeEventListener('mousedown', handleNotificationClickOutside)
  }, [])

  const handleMarkAsRead = async notification => {
    try {
      if (!notification.read_at) {
        await notificationApi.markAsRead(notification.id)
        setUnreadCount(prev => Math.max(0, prev - 1))
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id
              ? { ...n, read_at: new Date().toISOString() }
              : n
          )
        )
      }
      if (notification.action_url) {
        setShowNotifications(false)
        router.push(notification.action_url)
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      setUnreadCount(0)
      setNotifications(prev =>
        prev.map(n => ({
          ...n,
          read_at: n.read_at || new Date().toISOString()
        }))
      )
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const performSearch = async query => {
    setIsSearching(true)
    try {
      const response = await api.get('/dashboard/search', {
        params: { query, limit: 5 }
      })

      if (response.data.success) {
        setSearchResults(response.data.data)
        setShowSearchResults(true)
      }
    } catch (error) {
      console.error('Search error:', error)
      if (error.response?.status !== 400) {
        toast.error('Search failed')
      }
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchResultClick = (type, id) => {
    setShowSearchResults(false)
    setSearchQuery('')

    switch (type) {
      case 'event':
        router.push(`/dashboard/events/${id}`)
        break
      case 'order':
        router.push(`/dashboard/orders`)
        break
      case 'customer':
        router.push(`/dashboard/customers`)
        break
      default:
        break
    }
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'Events', path: '/dashboard/events' },
    { icon: Ticket, label: 'Orders', path: '/dashboard/orders' },
    { icon: Gift, label: 'Tickets Sold', path: '/dashboard/sold-tickets' },
    {
      icon: Sparkles,
      label: 'Complimentary',
      path: '/dashboard/complimentary'
    },
    { icon: Tag, label: 'Promotions', path: '/dashboard/promo-codes' },
    { icon: Users, label: 'Affiliates', path: '/dashboard/affiliate' },
    { icon: Wallet, label: 'Wallet', path: '/dashboard/wallet' },
    { icon: Users, label: 'Customers', path: '/dashboard/customers' }
  ]

  const affiliateMenuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/affiliate/dashboard' },
    { icon: Target, label: 'Browse Campaigns', path: '/affiliate/campaigns' },
    {
      icon: MousePointerClick,
      label: 'My Campaigns',
      path: '/affiliate/my-campaigns'
    },
    { icon: DollarSign, label: 'Earnings', path: '/affiliate/earnings' },
    { icon: Wallet, label: 'Withdrawals', path: '/affiliate/withdrawals' }
  ]

  const adminMenuItems = [
    { icon: Shield, label: 'Withdrawals', path: '/admin/withdrawals' }
  ]

  const isAdmin = user?.user_type?.toLowerCase() === 'admin'

  const isActive = path => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(path)
  }

  const handleDashboardSwitch = () => {
    const newMode = dashboardMode === 'organizer' ? 'affiliate' : 'organizer'
    setDashboardMode(newMode)

    if (newMode === 'affiliate') {
      router.push('/affiliate/dashboard')
    } else {
      router.push('/dashboard')
    }

    setSidebarOpen(false)
  }

  return (
    <div className='h-screen flex bg-zinc-950 text-white font-sans selection:bg-red-500/30 relative overflow-hidden'>
      <div className='fixed inset-0 z-0 pointer-events-none'>
        <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/5 blur-[120px]' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[120px]' />
      </div>

      {sidebarOpen && (
        <div
          className='fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
        fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50
        w-72 bg-zinc-950/80 backdrop-blur-xl border-r border-white/5
        transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        <div className='flex flex-col h-full'>
          <div className='h-20 flex items-center justify-between px-6 border-b border-white/5 flex-shrink-0'>
            <Link
              href={
                dashboardMode === 'organizer'
                  ? '/dashboard'
                  : '/affiliate/dashboard'
              }
              className='flex items-center gap-3 group'
            >
              <div className='h-9 w-9 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-600/20 group-hover:scale-105 transition-transform duration-300'>
                <Sparkles className='h-5 w-5 text-white' fill='white' />
              </div>
              <div>
                <span className='text-lg font-bold text-white tracking-tight block leading-none'>
                  TURN APP
                </span>
                <span className='text-[10px] text-zinc-500 font-medium tracking-wider uppercase'>
                  {dashboardMode === 'organizer' ? 'Organizer' : 'Affiliate'}
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className='lg:hidden p-2 text-zinc-500 hover:text-white transition-colors'
            >
              <X className='h-5 w-5' />
            </button>
          </div>

          <div className='px-4 pt-4 pb-2 flex-shrink-0'>
            <button
              onClick={handleDashboardSwitch}
              className='w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-zinc-900/50 border border-white/10 hover:bg-zinc-800/50 hover:border-white/20 transition-all group'
            >
              <div className='flex items-center gap-3'>
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                    dashboardMode === 'organizer'
                      ? 'bg-red-500/20 text-red-500'
                      : 'bg-blue-500/20 text-blue-500'
                  }`}
                >
                  {dashboardMode === 'organizer' ? (
                    <Calendar className='h-4 w-4' />
                  ) : (
                    <Target className='h-4 w-4' />
                  )}
                </div>
                <div className='text-left'>
                  <p className='text-xs text-zinc-500 font-medium'>Switch to</p>
                  <p className='text-sm font-semibold text-white'>
                    {dashboardMode === 'organizer' ? 'Affiliate' : 'Organizer'}
                  </p>
                </div>
              </div>
              <ArrowLeftRight className='h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors' />
            </button>
          </div>

          <nav className='flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-hide'>
            {dashboardMode === 'organizer' &&
              menuItems.map(item => {
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                    transition-all duration-200 border
                    ${
                      active
                        ? 'bg-zinc-800/50 border-white/10 text-white shadow-[0_0_20px_rgba(0,0,0,0.2)]'
                        : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                    }
                  `}
                  >
                    <item.icon
                      className={`h-5 w-5 transition-colors ${
                        active
                          ? 'text-red-500'
                          : 'text-zinc-600 group-hover:text-zinc-400'
                      }`}
                      strokeWidth={2}
                    />
                    <span>{item.label}</span>
                    {active && (
                      <div className='ml-auto w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' />
                    )}
                  </Link>
                )
              })}

            {dashboardMode === 'affiliate' &&
              affiliateMenuItems.map(item => {
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                    transition-all duration-200 border
                    ${
                      active
                        ? 'bg-zinc-800/50 border-white/10 text-white shadow-[0_0_20px_rgba(0,0,0,0.2)]'
                        : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                    }
                  `}
                  >
                    <item.icon
                      className={`h-5 w-5 transition-colors ${
                        active
                          ? 'text-red-500'
                          : 'text-zinc-600 group-hover:text-zinc-400'
                      }`}
                      strokeWidth={2}
                    />
                    <span>{item.label}</span>
                    {active && (
                      <div className='ml-auto w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' />
                    )}
                  </Link>
                )
              })}

            {isAdmin && (
              <>
                <div className='pt-4 pb-2 px-4'>
                  <div className='flex items-center gap-2 text-xs font-bold text-zinc-600 uppercase tracking-wider'>
                    <Shield className='h-3.5 w-3.5' />
                    <span>Admin</span>
                  </div>
                </div>
                {adminMenuItems.map(item => {
                  const active = isActive(item.path)
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                        transition-all duration-200 border
                        ${
                          active
                            ? 'bg-zinc-800/50 border-white/10 text-white shadow-[0_0_20px_rgba(0,0,0,0.2)]'
                            : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                        }
                      `}
                    >
                      <item.icon
                        className={`h-5 w-5 transition-colors ${
                          active
                            ? 'text-red-500'
                            : 'text-zinc-600 group-hover:text-zinc-400'
                        }`}
                        strokeWidth={2}
                      />
                      <span>{item.label}</span>
                      {active && (
                        <div className='ml-auto w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' />
                      )}
                    </Link>
                  )
                })}
              </>
            )}
          </nav>

          <div className='p-4 border-t border-white/5 bg-zinc-900/30 space-y-2 flex-shrink-0'>
            <Link
              href='/dashboard/profile'
              onClick={() => setSidebarOpen(false)}
              className='flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-white/5 group hover:border-white/10 hover:bg-zinc-800/50 transition-all cursor-pointer'
            >
              <div className='h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 border border-white/10 shadow-inner overflow-hidden bg-gradient-to-tr from-zinc-700 to-zinc-600'>
                {user?.profile_photo_url ? (
                  <img
                    src={user.profile_photo_url}
                    alt={user.name || 'User'}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <span className='text-white text-sm font-bold'>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>

              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold text-white truncate group-hover:text-primary transition-colors'>
                  {user?.name || 'User'}
                </p>
                <p className='text-xs text-zinc-500 truncate font-medium'>
                  Organizer Account
                </p>
              </div>
              <UserCircle className='h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors' />
            </Link>

            <Button
              onClick={handleLogout}
              variant='ghost'
              className='w-full justify-start text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
            >
              <LogOut className='h-4 w-4 mr-2' />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      <div className='flex-1 flex flex-col min-w-0 relative z-10 h-screen overflow-hidden'>
        <header className='flex-shrink-0 h-20 bg-zinc-950/70 backdrop-blur-xl border-b border-white/5 z-30'>
          <div className='flex items-center justify-between px-6 h-full max-w-[1600px] mx-auto w-full'>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => setSidebarOpen(true)}
                className='lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors'
              >
                <Menu className='h-6 w-6' />
              </button>

              <div className='hidden md:flex items-center text-sm text-zinc-500'>
                <span className='hover:text-zinc-300 transition-colors cursor-pointer'>
                  Dashboard
                </span>
                <ChevronRight className='h-4 w-4 mx-2 text-zinc-700' />
                <span className='text-white font-medium capitalize bg-white/5 px-2 py-0.5 rounded border border-white/5'>
                  {pathname.split('/')[2] || 'Overview'}
                </span>
              </div>
            </div>

            <div
              className='hidden md:block flex-1 max-w-md mx-4'
              ref={searchRef}
            >
              <div className='relative group'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-hover:text-zinc-400 transition-colors' />
                <input
                  type='text'
                  placeholder='Search events, orders, or customers...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults && setShowSearchResults(true)}
                  className='w-full bg-zinc-900/50 border border-white/5 text-sm text-white rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:border-white/10 focus:bg-zinc-900 transition-all placeholder:text-zinc-600'
                />
                {isSearching && (
                  <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 animate-spin' />
                )}

                {showSearchResults && searchResults && (
                  <div className='absolute top-full mt-2 w-full bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto'>
                    {searchResults.events.length > 0 && (
                      <div className='border-b border-white/5'>
                        <div className='px-4 py-2 bg-zinc-800/50 text-xs font-semibold text-zinc-400 uppercase tracking-wider'>
                          Events
                        </div>
                        {searchResults.events.map(event => (
                          <button
                            key={event.id}
                            onClick={() =>
                              handleSearchResultClick('event', event.id)
                            }
                            className='w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0'
                          >
                            <div className='flex items-center gap-3'>
                              <Calendar className='h-4 w-4 text-red-500 flex-shrink-0' />
                              <div className='flex-1 min-w-0'>
                                <p className='text-sm font-medium text-white truncate'>
                                  {event.title}
                                </p>
                                <p className='text-xs text-zinc-500 truncate'>
                                  {new Date(
                                    event.event_date
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.orders.length > 0 && (
                      <div className='border-b border-white/5'>
                        <div className='px-4 py-2 bg-zinc-800/50 text-xs font-semibold text-zinc-400 uppercase tracking-wider'>
                          Orders
                        </div>
                        {searchResults.orders.map(order => (
                          <button
                            key={order.id}
                            onClick={() =>
                              handleSearchResultClick('order', order.id)
                            }
                            className='w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0'
                          >
                            <div className='flex items-center gap-3'>
                              <Ticket className='h-4 w-4 text-blue-500 flex-shrink-0' />
                              <div className='flex-1 min-w-0'>
                                <p className='text-sm font-medium text-white truncate'>
                                  Order: {order.order_number}
                                </p>
                                <p className='text-xs text-zinc-500 truncate'>
                                  {order.email} • KES {order.total_amount}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.customers.length > 0 && (
                      <div>
                        <div className='px-4 py-2 bg-zinc-800/50 text-xs font-semibold text-zinc-400 uppercase tracking-wider'>
                          Customers
                        </div>
                        {searchResults.customers.map(customer => (
                          <button
                            key={customer.id}
                            onClick={() =>
                              handleSearchResultClick('customer', customer.id)
                            }
                            className='w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0'
                          >
                            <div className='flex items-center gap-3'>
                              <Users className='h-4 w-4 text-green-500 flex-shrink-0' />
                              <div className='flex-1 min-w-0'>
                                <p className='text-sm font-medium text-white truncate'>
                                  {customer.email}
                                </p>
                                <p className='text-xs text-zinc-500 truncate'>
                                  {customer.total_orders} orders • KES{' '}
                                  {customer.total_spent}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.events.length === 0 &&
                      searchResults.orders.length === 0 &&
                      searchResults.customers.length === 0 && (
                        <div className='px-4 py-8 text-center text-zinc-500'>
                          <Search className='h-8 w-8 mx-auto mb-2 opacity-50' />
                          <p className='text-sm'>
                            No results found for "{searchQuery}"
                          </p>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <div className='relative' ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(prev => !prev)}
                  className='relative p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/5'
                >
                  <Bell className='h-5 w-5' />
                  {unreadCount > 0 && (
                    <span className='absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1 border-2 border-zinc-950'>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className='absolute right-0 top-full mt-2 w-80 sm:w-96 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50'>
                    <div className='flex items-center justify-between px-4 py-3 border-b border-white/5 bg-zinc-800/50'>
                      <h3 className='text-sm font-semibold text-white'>
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className='text-xs text-red-400 hover:text-red-300 font-medium transition-colors'
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className='max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent'>
                      {notificationsLoading ? (
                        <div className='flex items-center justify-center py-10'>
                          <Loader2 className='h-5 w-5 text-zinc-500 animate-spin' />
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className='flex flex-col items-center justify-center py-10 text-zinc-500'>
                          <Bell className='h-8 w-8 mb-2 opacity-50' />
                          <p className='text-sm'>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map(notification => (
                          <button
                            key={notification.id}
                            onClick={() => handleMarkAsRead(notification)}
                            className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex gap-3 ${
                              !notification.read_at
                                ? 'border-l-2 border-l-red-500'
                                : 'border-l-2 border-l-transparent'
                            }`}
                          >
                            <div className='flex-shrink-0 mt-0.5'>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className='flex-1 min-w-0'>
                              <p
                                className={`text-sm font-medium truncate ${
                                  !notification.read_at
                                    ? 'text-white'
                                    : 'text-zinc-400'
                                }`}
                              >
                                {notification.title}
                              </p>
                              <p className='text-xs text-zinc-500 truncate mt-0.5'>
                                {notification.message}
                              </p>
                              <p className='text-[10px] text-zinc-600 mt-1'>
                                {timeAgo(notification.created_at)}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    <div className='border-t border-white/5 bg-zinc-800/30'>
                      <Link
                        href={
                          dashboardMode === 'organizer'
                            ? '/dashboard/notifications'
                            : '/affiliate/notifications'
                        }
                        onClick={() => setShowNotifications(false)}
                        className='block w-full text-center py-2.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors'
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className='h-6 w-px bg-white/10 mx-1 hidden sm:block' />

              <Link href='/' target='_blank'>
                <Button
                  variant='outline'
                  size='sm'
                  className='hidden sm:flex border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white hover:border-white/20'
                >
                  Visit Website
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent'>
          <div className='p-4 lg:p-8'>
            <div className='max-w-[1600px] mx-auto w-full'>{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}