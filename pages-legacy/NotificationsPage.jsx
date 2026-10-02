"use client"

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout';
import { notificationApi } from '@/lib/services/notificationApi';
import {
  Bell,
  DollarSign,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check,
  Trash2,
  Eye,
  Calendar,
  Ticket,
  Users,
  Settings,
  Inbox
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// --- Filter Components ---

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  const categories = [
    { id: 'all', label: 'All', icon: Bell },
    { id: 'sale', label: 'Sales', icon: Ticket },
    { id: 'withdrawal', label: 'Withdrawals', icon: DollarSign },
    { id: 'event', label: 'Events', icon: Calendar },
    { id: 'affiliate', label: 'Affiliates', icon: Users },
    { id: 'system', label: 'System', icon: Settings },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = selectedCategory === category.id;

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${
                isActive
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                  : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent hover:border-zinc-700/50'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            <span>{category.label}</span>

            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            )}
          </button>
        );
      })}
    </div>
  );
};

// --- Notification Card Component ---

const NotificationCard = ({
  notification,
  onMarkRead,
  onDelete,
  onNavigate
}) => {
  const isUnread = !notification.read_at;

  const getIcon = (type) => {
    switch (type) {
      case 'sale':
        return <Ticket className="h-5 w-5 text-emerald-500" />;
      case 'withdrawal':
        return <DollarSign className="h-5 w-5 text-blue-500" />;
      case 'event':
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case 'affiliate':
        return <Users className="h-5 w-5 text-amber-500" />;
      case 'system':
        return <Settings className="h-5 w-5 text-zinc-400" />;
      default:
        return <Bell className="h-5 w-5 text-zinc-500" />;
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return new Date(date).toLocaleDateString();
  };

  const handleClick = () => {
    if (isUnread) {
      onMarkRead(notification.id);
    }

    if (notification.link) {
      onNavigate(notification.link);
    }
  };

  return (
    <div
      className="
        group relative
        bg-black
        border border-zinc-800/80
        rounded-xl
        p-4
        transition-all duration-200
        hover:border-zinc-700
        hover:bg-zinc-900/50
        shadow-lg
      "
    >
      <div className="flex items-start gap-4">

        {/* Icon */}
        <div
          className={`
            flex-shrink-0
            w-10 h-10
            rounded-lg
            flex items-center justify-center
            ${isUnread ? 'bg-red-500/10' : 'bg-zinc-800/30'}
          `}
        >
          {getIcon(notification.type)}
        </div>

        {/* Content */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={handleClick}
        >
          <div className="flex items-start justify-between gap-4">

            {/* Main Content */}
            <div className="flex-1 min-w-0">

              <div className="flex items-center gap-2 flex-wrap">

                <h4
                  className={`
                    text-sm font-medium truncate
                    ${isUnread ? 'text-white' : 'text-zinc-400'}
                  `}
                >
                  {notification.title}
                </h4>

              </div>

              <p
                className={`
                  text-sm mt-0.5 line-clamp-2
                  ${isUnread ? 'text-zinc-300' : 'text-zinc-500'}
                `}
              >
                {notification.message}
              </p>

              {/* Notification Data */}
              {notification.data &&
                Object.keys(notification.data).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">

                    {notification.data.amount && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-800/60 text-xs text-emerald-400">
                        <DollarSign className="h-3 w-3" />
                        KES {notification.data.amount.toLocaleString()}
                      </span>
                    )}

                    {notification.data.event_name && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-800/60 text-xs text-purple-400">
                        <Calendar className="h-3 w-3" />
                        {notification.data.event_name}
                      </span>
                    )}

                    {notification.data.ticket_count && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-800/60 text-xs text-blue-400">
                        <Ticket className="h-3 w-3" />
                        {notification.data.ticket_count} tickets
                      </span>
                    )}

                    {notification.data.customer_name && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-800/60 text-xs text-amber-400">
                        <Users className="h-3 w-3" />
                        {notification.data.customer_name}
                      </span>
                    )}

                  </div>
                )}
            </div>

            {/* Right Side */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">

              {/* Time + Unread */}
              <div className="flex items-center gap-3">

                <span className="text-xs text-zinc-500 whitespace-nowrap">
                  {timeAgo(notification.created_at)}
                </span>

                {isUnread && (
                  <span className="text-[10px] font-bold tracking-widest text-red-500">
                    UNREAD
                  </span>
                )}

              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">

                {isUnread && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkRead(notification.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-zinc-700/50 text-zinc-400 hover:text-white transition-colors"
                    title="Mark as read"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// --- Empty State Component ---

const EmptyState = ({ category }) => {
  const messages = {
    all: "You're all caught up! No notifications to show.",
    sale: "No sales notifications yet. When customers buy tickets, you'll see them here.",
    withdrawal:
      "No withdrawal notifications. You'll be notified when you request or receive withdrawals.",
    event:
      "No event notifications. You'll be notified about your event status changes.",
    affiliate:
      "No affiliate notifications. You'll be notified when affiliates join or make sales.",
    system:
      "No system notifications. We'll keep you updated about important account events."
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
        <Inbox className="h-10 w-10 text-zinc-600" />
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">
        No notifications
      </h3>

      <p className="text-sm text-zinc-500 max-w-md">
        {messages[category] || messages.all}
      </p>
    </div>
  );
};

// --- Main Page Component ---

const NotificationsPage = () => {
  const router = useRouter();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  });

  const [stats, setStats] = useState({
    unread: 0,
    total: 0
  });

  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const fetchNotifications = useCallback(
    async (page = 1) => {
      setLoading(true);

      try {
        const params = {
          page,
          per_page: 20
        };

        if (selectedCategory !== 'all') {
          params.type = selectedCategory;
        }

        const data = await notificationApi.getNotifications(params);

        const items = data.data || data.notifications || [];

        setNotifications(items);

        setPagination({
          current_page:
            data.current_page || data.meta?.current_page || 1,
          last_page:
            data.last_page || data.meta?.last_page || 1,
          per_page:
            data.per_page || data.meta?.per_page || 20,
          total: data.total || data.meta?.total || 0
        });
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    },
    [selectedCategory]
  );

  const fetchStats = useCallback(async () => {
    try {
      const data = await notificationApi.getStats();
      setStats(data.data || data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [fetchNotifications, fetchStats]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );

      setStats((prev) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }));

      toast.success('Marked as read');
    } catch (error) {
      console.error('Failed to mark as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);

    try {
      await notificationApi.markAllAsRead();

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read_at: n.read_at || new Date().toISOString()
        }))
      );

      setStats((prev) => ({
        ...prev,
        unread: 0
      }));

      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this notification?')) return;

    try {
      await notificationApi.deleteNotification(id);

      setNotifications((prev) => prev.filter((n) => n.id !== id));

      setStats((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        unread:
          prev.unread -
          (notifications.find(
            (n) => n.id === id && !n.read_at
          )
            ? 1
            : 0)
      }));

      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleDeleteAllRead = async () => {
    if (!confirm('Delete all read notifications?')) return;

    setIsDeletingAll(true);

    try {
      await notificationApi.deleteAllRead();

      setNotifications((prev) => prev.filter((n) => !n.read_at));

      toast.success('All read notifications deleted');
    } catch (error) {
      console.error('Failed to delete read notifications:', error);
      toast.error('Failed to delete read notifications');
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleNavigate = (link) => {
    if (link) {
      router.push(link);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    fetchNotifications(1);
  };

  const handlePageChange = (page) => {
    fetchNotifications(page);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-12 space-y-6 animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Bell className="h-7 w-7 text-red-500" />
              Notifications

              {stats.unread > 0 && (
                <span className="text-sm font-medium bg-red-500/20 text-red-400 px-3 py-1 rounded-full border border-red-500/20">
                  {stats.unread} unread
                </span>
              )}
            </h1>

            <p className="text-sm text-zinc-400 mt-1">
              Stay updated on your event activity, sales, and account status
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAll}
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                {isMarkingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}

                Mark all read
              </Button>
            )}

            {notifications.some((n) => n.read_at) && (
              <Button
                onClick={handleDeleteAllRead}
                disabled={isDeletingAll}
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
              >
                {isDeletingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}

                Clear read
              </Button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Stats Bar */}
        <div className="flex flex-wrap items-center gap-4 px-1">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-zinc-500">
              Total:{' '}
              <span className="text-white font-medium">
                {stats.total}
              </span>
            </span>

            <span className="text-zinc-500">
              Unread:{' '}
              <span className="text-red-400 font-medium">
                {stats.unread}
              </span>
            </span>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          )}
        </div>

        {/* Notifications List */}
        {loading && notifications.length === 0 ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 animate-pulse"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-950" />

                  <div className="flex-1">
                    <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-zinc-800 rounded w-1/2" />
                  </div>

                  <div className="w-16 h-3 bg-zinc-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState category={selectedCategory} />
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkAsRead}
                onDelete={handleDelete}
                onNavigate={handleNavigate}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-zinc-800/60">
            <div className="text-sm text-zinc-500">
              Showing {notifications.length} of {pagination.total} notifications
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                disabled={pagination.current_page <= 1}
                onClick={() =>
                  handlePageChange(pagination.current_page - 1)
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-sm text-zinc-400 px-3">
                {pagination.current_page} / {pagination.last_page}
              </span>

              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                disabled={
                  pagination.current_page >= pagination.last_page
                }
                onClick={() =>
                  handlePageChange(pagination.current_page + 1)
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
