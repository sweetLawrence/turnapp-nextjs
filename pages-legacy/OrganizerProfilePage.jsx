"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { EventCard } from '@/components/EventCard';
import { organizerApi } from '@/lib/services/organizerApi';
import { 
  Loader2, Calendar, Facebook, Twitter, Instagram, Globe, 
  ArrowLeft, User, MapPin, Users, Ticket, TrendingUp, 
  CalendarDays, Clock, Star, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { EventImagePlaceholder } from '@/components/EventImagePlaceholder';

const OrganizerProfilePage = () => {
  const { identifier } = useParams();
  const router = useRouter();
  const [organizerData, setOrganizerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    loadOrganizerProfile();
  }, [identifier]);

  useEffect(() => {
    if (organizerData) {
      document.title = `${organizerData.organizer.name} - Organizer Profile | TurnApp`;
    }
  }, [organizerData]);

  // const loadOrganizerProfile = async () => {
  //   setLoading(true);
  //   setImageError(false);
  //   try {
  //     const response = await organizerApi.getOrganizerProfile(identifier);
      
  //     if (response.success) {
  //       console.log('📊 Organizer Profile Data:', response.data);
        
  //       if (response.data.upcoming_events) {
  //         response.data.upcoming_events.forEach((event, index) => {
  //           console.log(`🖼️ Upcoming Event ${index + 1}:`, {
  //             title: event.title,
  //             image: event.image,
  //             images: event.images,
  //             cover_image_index: event.cover_image_index,
  //             poster_url: event.poster_url,
  //             folder: event.folder,
  //             filename: event.filename
  //           });
  //         });
  //       }
        
  //       if (response.data.past_events) {
  //         response.data.past_events.forEach((event, index) => {
  //           console.log(`🖼️ Past Event ${index + 1}:`, {
  //             title: event.title,
  //             image: event.image,
  //             images: event.images,
  //             cover_image_index: event.cover_image_index,
  //             poster_url: event.poster_url,
  //             folder: event.folder,
  //             filename: event.filename
  //           });
  //         });
  //       }
        
  //       setOrganizerData(response.data);
  //     } else {
  //       toast.error('Organizer not found');
  //       router.push('/');
  //     }
  //   } catch (error) {
  //     console.error('Error loading organizer profile:', error);
  //     toast.error('Failed to load organizer profile');
  //     router.push('/');
  //   } finally {
  //     setLoading(false);
  //   }
  // };




  const loadOrganizerProfile = async () => {
  setLoading(true);
  setImageError(false);
  try {
    console.log('🔍 Fetching organizer profile for:', identifier);
    const response = await organizerApi.getOrganizerProfile(identifier);
    
    console.log('📦 Full API Response:', response);
    
    if (response.success) {
      console.log('📊 Organizer Profile Data:', response.data);
      console.log('📊 Statistics:', response.data.statistics);
      console.log('📊 Upcoming Events Count:', response.data.upcoming_events?.length || 0);
      console.log('📊 Past Events Count:', response.data.past_events?.length || 0);
      
      // Log each event with details
      if (response.data.upcoming_events) {
        console.log('📋 Upcoming Events:');
        response.data.upcoming_events.forEach((event, index) => {
          console.log(`  ${index + 1}. ${event.title} (${event.status}) - ${event.from}`);
        });
      }
      
      if (response.data.past_events) {
        console.log('📋 Past Events:');
        response.data.past_events.forEach((event, index) => {
          console.log(`  ${index + 1}. ${event.title} (${event.status}) - ${event.from}`);
        });
      }
      
      setOrganizerData(response.data);
    } else {
      console.error('❌ API returned error:', response);
      toast.error('Organizer not found');
      router.push('/');
    }
  } catch (error) {
    console.error('❌ Error loading organizer profile:', error);
    toast.error('Failed to load organizer profile');
    router.push('/');
  } finally {
    setLoading(false);
  }
};



  const getSocialIcon = (platform) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="h-5 w-5" />;
      case 'twitter':
        return <Twitter className="h-5 w-5" />;
      case 'instagram':
        return <Instagram className="h-5 w-5" />;
      case 'website':
        return <Globe className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-zinc-400">Loading organizer profile...</p>
        </div>
      </div>
    );
  }

  if (!organizerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Organizer not found</h1>
          <Button onClick={() => router.push('/')}>Back to Events</Button>
        </div>
      </div>
    );
  }

  const { organizer, statistics, upcoming_events, past_events } = organizerData;

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      <Navbar />

      <div className="pt-16">
        {/* ========== HERO SECTION - CLEAN BANNER ========== */}
        <div className="relative">
          {/* Cover Image - Full width, no glassmorph */}
          <div className="relative w-full h-[320px] md:h-[420px] bg-zinc-900 overflow-hidden">
            {organizer.cover_image && !imageError ? (
              <img
                src={organizer.cover_image}
                alt={`${organizer.name} cover`}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-500 text-sm">Event Organizer</p>
                </div>
              </div>
            )}
            
            {/* Gradient Overlay - Darker at bottom for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          </div>

          {/* Profile Info - Overlay on Cover */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative -mt-20 sm:-mt-24 pb-8">
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                {/* Avatar - Clean border */}
                <div className="flex-shrink-0">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-zinc-800 border-4 border-zinc-900 shadow-2xl overflow-hidden ring-2 ring-white/10">
                    {organizer.profile_photo_url ? (
                      <img
                        src={organizer.profile_photo_url}
                        alt={organizer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <User className="h-14 w-14 sm:h-20 sm:w-20 text-primary" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Name & Info */}
                <div className="flex-1 min-w-0 text-white pb-4">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                      {organizer.name}
                    </h1>
                    {statistics?.total_events > 0 && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">
                        <Star className="h-3 w-3 fill-emerald-400" />
                        Active Organizer
                      </span>
                    )}
                  </div>

                  {/* Location */}
                  {organizer.location && (
                    <div className="flex items-center gap-2 text-zinc-300 mb-3">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm">{organizer.location}</span>
                    </div>
                  )}

                  {/* Bio - Clean text */}
                  {organizer.bio && (
                    <p className="text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed mb-4">
                      {organizer.bio}
                    </p>
                  )}

                  {/* Social Links - Clean buttons */}
                  {organizer.social_links && Object.keys(organizer.social_links).length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(organizer.social_links).map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 text-white transition-all hover:scale-105 active:scale-95"
                        >
                          {getSocialIcon(platform)}
                          <span className="text-sm capitalize font-medium hidden sm:inline">
                            {platform}
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Back Button */}
                <div className="flex-shrink-0 md:self-start">
                  <Button 
                    variant="ghost" 
                    className="text-white hover:bg-white/10 transition-all duration-300 group"
                    onClick={() => router.push(-1)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== STATISTICS SECTION ========== */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Events',
                value: statistics?.total_events || 0,
                icon: CalendarDays,
                color: 'text-blue-400',
                bg: 'bg-blue-500/10'
              },
              {
                label: 'Upcoming',
                value: statistics?.upcoming_events || 0,
                icon: Calendar,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10'
              },
              {
                label: 'Past Events',
                value: statistics?.past_events || 0,
                icon: Clock,
                color: 'text-zinc-400',
                bg: 'bg-zinc-500/10'
              },
              {
                label: 'Attendees',
                value: statistics?.total_tickets_sold || 0,
                icon: Users,
                color: 'text-purple-400',
                bg: 'bg-purple-500/10'
              }
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-zinc-900/50 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-all rounded-xl p-4 md:p-5 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.bg} group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <TrendingUp className={`h-4 w-4 opacity-30 ${stat.color}`} />
                </div>
                <p className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  {formatNumber(stat.value)}
                </p>
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ========== EVENTS SECTION ========== */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Events
              </h2>
              <span className="text-sm text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full border border-white/5">
                Total: {statistics?.total_events || 0}
              </span>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full sm:w-auto grid-cols-2 mb-8 bg-white/5 p-1 rounded-xl">
                <TabsTrigger 
                  value="upcoming" 
                  className="text-base data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all"
                >
                  <Calendar className="h-4 w-4 mr-2 inline" />
                  Upcoming ({upcoming_events?.length || 0})
                </TabsTrigger>
                <TabsTrigger 
                  value="past" 
                  className="text-base data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all"
                >
                  <Clock className="h-4 w-4 mr-2 inline" />
                  Past ({past_events?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="mt-0">
                {upcoming_events && upcoming_events.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcoming_events.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-10 w-10 text-zinc-600 opacity-50" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      No Upcoming Events
                    </h3>
                    <p className="text-zinc-500 max-w-md mx-auto">
                      This organizer doesn't have any upcoming events at the moment. Check back later!
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="past" className="mt-0">
                {past_events && past_events.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {past_events.map((event) => (
                      <EventCard key={event.id} event={event} isPast={true} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-10 w-10 text-zinc-600 opacity-50" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      No Past Events
                    </h3>
                    <p className="text-zinc-500 max-w-md mx-auto">
                      This organizer hasn't created any events yet.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrganizerProfilePage;