export const mockEvents = [
  {
    id: 4,
    title: "Discover Events",
    shortDescription: "Find events & unique experiences happening near you",
    description: "Find events & unique experiences happening near you",
    mobileDescription: "Find events happening near you",
    date: "2025-02-14",
    time: "24/7",
    venue: "Online Platform",
    location: "Nationwide",
    category: "platform",
    image: "https://static.prod-images.emergentagent.com/jobs/66bf2df9-c484-4bfb-9ac3-44c2aab3fdf2/images/1d6ef6dd2c710a1c992f19e91dbe5618b3a3e221136ffca3d41ba402a6532450.png",
    featured: true,
    tickets: [],
    lineup: [],
    highlights: [
      "Easy search",
      "Secure payments",
      "Instant tickets"
    ],
    cta: {
      primary: { text: "Explore Events ->", action: "events" },
      secondary: null
    }
  },
  {
    id: 2,
    title: "Host Experiences",
    shortDescription: "Bring your ideas to life. Create & manage events with powerful organizer tools ",
    description: "Bring your ideas to life. Create & manage events with powerful organizer tools ",
    mobileDescription: "Create & manage events seamlessly",
    date: "2024-12-22",
    time: "24/7",
    venue: "Your Venue",
    location: "Anywhere in Kenya",
    category: "platform",
    image: "https://static.prod-images.emergentagent.com/jobs/66bf2df9-c484-4bfb-9ac3-44c2aab3fdf2/images/f366e6e17dac744b4c8b7ee778577e13ef0b3fa9397aebfbc3281c89deb5dd35.png",
    // image: "https://static.prod-images.emergentagent.com/jobs/66bf2df9-c484-4bfb-9ac3-44c2aab3fdf2/images/1d6ef6dd2c710a1c992f19e91dbe5618b3a3e221136ffca3d41ba402a6532450.png",
    featured: true,
    tickets: [],
    lineup: [],
    highlights: [
      "Easy management",
      "Instant updates",
      "Live analytics"
    ],
    cta: {
      primary: { text: "Create an Experience ->", action: "admin", url: "https://turnapp.events/admin" },
      secondary: null
    }
  },
  {
    id: 1,
    title: "Sell Tickets",
    shortDescription: "Launch ticket sales fast with real time tracking & secure payments",
    description: "Launch ticket sales fast with real time tracking & secure payments",
    mobileDescription: "Reliable ticket sales & secure payments",
    date: "2024-12-28",
    time: "24/7",
    venue: "Online Platform",
    location: "Anywhere in Kenya",
    category: "platform",
    image: "https://static.prod-images.emergentagent.com/jobs/66bf2df9-c484-4bfb-9ac3-44c2aab3fdf2/images/90e984b97c8a1a226aa01951de6572fe46a66b54796793d96753370b2384148a.png",
    featured: true,
    tickets: [],
    lineup: [],
    highlights: [
      "Quick setup",
      "Real-time tracking",
      "Secure payments"
    ],
    cta: {
      primary: { text: "Get Started -> ", action: "create", url: "https://turnapp.events/admin/events/create" },
      secondary: null
    }
  },
  {
    id: 3,
    title: "Become an affiliate",
    shortDescription: "Share events & earn commissions by promoting the experiences you love",
    description: "Share events & earn commissions by promoting the experiences you love",
    mobileDescription: "Share events & earn commissions",
    date: "2024-12-30",
    time: "24/7",
    venue: "Online Platform",
    location: "Anywhere in Kenya",
    category: "platform",
    image: "https://static.prod-images.emergentagent.com/jobs/66bf2df9-c484-4bfb-9ac3-44c2aab3fdf2/images/be9696848a78ed9dee172461785eed7d2b1d92965a60b01e6e5d4efa0cc3f0a5.png",
    featured: true,
    tickets: [],
    lineup: [],
    highlights: [
      "Earn commissions",
      "Track performance",
      "Auto payouts"
    ],
    cta: {
      primary: { text: "Learn More ->", action: "affiliate", url: "/affiliate/learn-more" },
      secondary: null
    }
  },

  
];

export const getEventById = (id) => {
  return mockEvents.find(event => event.id === parseInt(id));
};

export const getFeaturedEvents = () => {
  return mockEvents.filter(event => event.featured);
};

export const getUpcomingEvents = () => {
  return mockEvents.slice(0, 9);
};