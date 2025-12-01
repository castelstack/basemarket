import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SafeArea } from '@coinbase/onchainkit/minikit';
import { minikitConfig } from '../minikit.config';
import { RootProvider } from './rootProvider';
import Navbar from '@/components/Layout/Navbar';
import BottomNav from '@/components/Layout/BottomNav';
import Footer from '@/components/Layout/Footer';
import { RQProvider } from '@/layouts/RQProvider';
import { Toaster } from 'sonner';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(minikitConfig.miniapp.homeUrl),
    title: {
      default: `${minikitConfig.miniapp.name} - Entertainment Prediction Game`,
      template: `%s | ${minikitConfig.miniapp.name}`,
    },
    description: minikitConfig.miniapp.description,
    openGraph: {
      title: minikitConfig.miniapp.ogTitle || minikitConfig.miniapp.name,
      description: minikitConfig.miniapp.ogDescription || minikitConfig.miniapp.description,
      url: minikitConfig.miniapp.homeUrl,
      siteName: minikitConfig.miniapp.name,
      images: [
        {
          url: minikitConfig.miniapp.ogImageUrl,
          width: 1200,
          height: 630,
          alt: minikitConfig.miniapp.name,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: minikitConfig.miniapp.name,
      description: minikitConfig.miniapp.description,
      images: [minikitConfig.miniapp.ogImageUrl],
    },
    other: {
      'fc:frame': JSON.stringify({
        version: minikitConfig.miniapp.version,
        imageUrl: minikitConfig.miniapp.heroImageUrl,
        button: {
          title: `Open ${minikitConfig.miniapp.name}`,
          action: {
            name: `Launch ${minikitConfig.miniapp.name}`,
            type: 'launch_frame',
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: minikitConfig.miniapp.name,
    description: minikitConfig.miniapp.description,
    url: minikitConfig.miniapp.homeUrl,
    applicationCategory: 'EntertainmentApplication',
    operatingSystem: 'Any',
  };

  return (
    <html lang='en' className='dark'>
      <head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <RootProvider>
          <RQProvider>
            <Suspense>
              <SafeArea>
                <Navbar />
                <Toaster
                  position='top-center'
                  toastOptions={{
                    style: {
                      background: 'rgba(0, 0, 0, 0.9)',
                      color: '#fff',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                    },
                  }}
                />
                <main className='min-h-screen pb-24 md:pb-0'>{children}</main>
                <Footer />
                <BottomNav />
              </SafeArea>
            </Suspense>
          </RQProvider>
        </RootProvider>
      </body>
    </html>
  );
}
