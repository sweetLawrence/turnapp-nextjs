// scripts/create-app-shims.mjs
import fs from 'node:fs'
import path from 'node:path'

// Map: app route path → page component name (in pages-legacy/)
const ROUTES = {
  'app/page.jsx': 'LandingPage',
  'app/events/page.jsx': 'EventsPage',
  'app/checkout/page.jsx': 'CheckoutPage',
  'app/success/[saleId]/page.jsx': 'SuccessPage',
  'app/tickets/[saleId]/page.jsx': 'SuccessPage',
  'app/manual-payment/[saleId]/page.jsx': 'ManualPaymentPage',
  'app/organizer/[identifier]/page.jsx': 'OrganizerProfilePage',
  'app/login/page.jsx': 'LoginPage',
  'app/register/page.jsx': 'RegisterPage',
  'app/auth/callback/page.jsx': 'OAuthCallback',
  'app/dashboard/page.jsx': 'DashboardPage',
  'app/dashboard/events/page.jsx': 'EventsManagementPage',
  'app/dashboard/events/create/page.jsx': 'CreateEventPage',
  'app/dashboard/events/[identifier]/page.jsx': 'ShowEventPage',
  'app/dashboard/events/[id]/edit/page.jsx': 'EditEventPage',
  'app/dashboard/promo-codes/page.jsx': 'PromoCodesPage',
  'app/dashboard/affiliate/page.jsx': 'CampaignsPage',
  'app/dashboard/campaigns/[id]/enrollments/page.jsx': 'CampaignEnrollmentsPage',
  'app/dashboard/campaigns/[id]/analytics/page.jsx': 'CampaignAnalyticsPage',
  'app/dashboard/orders/page.jsx': 'OrdersPage',
  'app/dashboard/sold-tickets/page.jsx': 'SoldTicketsPage',
  'app/dashboard/customers/page.jsx': 'CustomersPage',
  'app/dashboard/complimentary/page.jsx': 'ComplimentaryTicketsPage',
  'app/dashboard/wallet/page.jsx': 'WalletPage',
  'app/dashboard/profile/page.jsx': 'ProfilePage',
  'app/dashboard/notifications/page.jsx': 'NotificationsPage',
  'app/dashboard/affiliate-management/campaigns/[campaignId]/enrollments/page.jsx': 'OrganizerAffiliateEnrollmentsPage',
  'app/affiliate/notifications/page.jsx': 'NotificationsPage',
  'app/affiliate/learn-more/page.jsx': 'AffiliateLearnMorePage',
  'app/affiliate/register/page.jsx': 'AffiliateRegisterPage',
  'app/affiliate/dashboard/page.jsx': 'AffiliateDashboardPage',
  'app/affiliate/campaigns/page.jsx': 'AffiliateBrowseCampaignsPage',
  'app/affiliate/my-campaigns/page.jsx': 'AffiliateMyCampaignsPage',
  'app/affiliate/earnings/page.jsx': 'AffiliateEarningsPage',
  'app/affiliate/withdrawals/page.jsx': 'AffiliateWithdrawalsPage',
  'app/admin/withdrawals/page.jsx': 'AdminWithdrawalsPage',
}

for (const [route, component] of Object.entries(ROUTES)) {
  const full = route
  fs.mkdirSync(path.dirname(full), { recursive: true })

  const content = `import ${component} from '@/pages-legacy/${component}'\n\nexport default function Page() {\n  return <${component} />\n}\n`

  fs.writeFileSync(full, content, 'utf8')
  console.log(`✅ ${route} → ${component}`)
}

console.log(`\n📝 ${Object.keys(ROUTES).length} page shims created.`)