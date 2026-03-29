import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: {
    default: 'Aveo | AI Character Brand Platform',
    template: '%s | Aveo',
  },
  description:
    'Create AI character brands that produce publishable videos at scale. No HeyGen, no ElevenLabs, no editing. Just describe your character and Aveo builds everything.',
  keywords: [
    'AI character',
    'AI influencer',
    'AI video generation',
    'character brand',
    'AI UGC',
    'content automation',
    'AI avatar',
    'video at scale',
    'AI content creator',
  ],
  authors: [{ name: 'Aveo' }],
  creator: 'Aveo',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aveo.ai',
    siteName: 'Aveo',
    title: 'Aveo | AI Character Brand Platform',
    description:
      'Create AI character brands that produce publishable videos at scale. Describe your character, and Aveo handles the rest.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Aveo Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aveo | AI Character Brand Platform',
    description: 'Create AI character brands that produce publishable videos at scale.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://aveo.ai'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
