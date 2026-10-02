// // app/layout.jsx
// import { Toaster } from '@/components/ui/sonner'
// import './globals.css'

// export const metadata = {
//   title: {
//     default: 'TurnApp - Discover Events',
//     template: '%s',
//   },
//   description: 'Create, Discover, Experience.',
//   metadataBase: new URL(
//     process.env.NEXT_PUBLIC_SITE_URL || 'https://turnapp.events'
//   ),
//   openGraph: {
//     siteName: 'TurnApp',
//     locale: 'en_KE',
//     type: 'website',
//   },
// }

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en" className="dark">
//       <body className="min-h-screen bg-background text-foreground antialiased">
//         {children}
//         <Toaster position="top-center" richColors expand />
//       </body>
//     </html>
//   )
// }









// app/layout.jsx
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000')

export const metadata = {
  title: {
    default: 'TurnApp - Discover Events',
    template: '%s',
  },
  description: 'Create, Discover, Experience.',
  metadataBase: new URL(siteUrl),
  openGraph: {
    siteName: 'TurnApp',
    locale: 'en_KE',
    type: 'website',
  },
  icons: {
    icon: [{ url: '/turnuplogo.png', type: 'image/png' }],
    shortcut: '/turnuplogo.png',
    apple: '/turnuplogo.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Toaster position="top-center" richColors expand />
      </body>
    </html>
  )
}