'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertCircle, FileText, Scale, Users, Globe, Ban, Mail } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  const sections = [
    {
      icon: Shield,
      title: 'Acceptance of Terms',
      content: `By accessing and using ShowStakr, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.`
    },
    {
      icon: Users,
      title: 'Eligibility',
      content: `You must be at least 18 years old to use ShowStakr. By using our platform, you represent and warrant that you are of legal age to form a binding contract and are not a person barred from using our services under the laws of Nigeria or other applicable jurisdiction.`
    },
    {
      icon: FileText,
      title: 'Account Registration',
      content: `When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.`
    },
    {
      icon: Scale,
      title: 'Staking Rules',
      content: `All stakes are final once confirmed. The minimum stake amount is ₦100. Maximum stake limits may apply. ShowStakr reserves the right to void any stakes that violate our terms or are placed on events with errors.`
    },
    {
      icon: Globe,
      title: 'Prohibited Uses',
      content: `You may not use ShowStakr for any illegal or unauthorized purpose, to violate any laws in your jurisdiction, to infringe upon or violate our intellectual property rights or the rights of others, or to transmit any malicious code or viruses.`
    },
    {
      icon: Ban,
      title: 'Account Suspension',
      content: `We reserve the right to suspend or terminate your account if you violate these Terms of Service, engage in fraudulent activity, or for any other reason at our sole discretion.`
    }
  ];

  return (
    <div className='min-h-screen bg-black'>
      {/* Background Effects */}
      <div className='fixed inset-0 bg-gradient-to-br from-violet-950/20 via-black to-pink-950/20' />
      <div className='fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent' />

      <div className='relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16'>
        {/* Header */}
        <div className='text-center mb-12'>
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 mb-6'>
            <Shield className='w-8 h-8 text-white' />
          </div>
          <h1 className='text-4xl sm:text-5xl font-black mb-4'>
            <span className='bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent'>
              Terms of Service
            </span>
          </h1>
          <p className='text-gray-400 text-lg'>
            Last updated: January 1, 2025
          </p>
        </div>

        {/* Important Notice */}
        <Card className='bg-amber-500/10 border-amber-500/30 mb-8'>
          <CardContent className='p-6'>
            <div className='flex items-start gap-4'>
              <AlertCircle className='w-6 h-6 text-amber-400 flex-shrink-0 mt-1' />
              <div>
                <h3 className='text-amber-400 font-semibold mb-2'>Important Notice</h3>
                <p className='text-gray-300 text-sm'>
                  Please read these Terms of Service carefully before using ShowStakr. These terms govern your use of our platform and constitute a legally binding agreement between you and ShowStakr (operated by Tournest).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className='space-y-8'>
          {sections.map((section, index) => (
            <Card key={index} className='bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all'>
              <CardContent className='p-6'>
                <div className='flex items-start gap-4'>
                  <div className='p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20'>
                    <section.icon className='w-6 h-6 text-violet-400' />
                  </div>
                  <div className='flex-1'>
                    <h2 className='text-xl font-bold text-white mb-3'>{section.title}</h2>
                    <p className='text-gray-400 leading-relaxed'>{section.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Additional Terms */}
          <Card className='bg-gradient-to-br from-violet-900/30 to-pink-900/30 border-white/10'>
            <CardContent className='p-8'>
              <h2 className='text-2xl font-bold text-white mb-6'>Additional Terms</h2>
              
              <div className='space-y-6'>
                <div>
                  <h3 className='text-lg font-semibold text-violet-400 mb-2'>1. Intellectual Property</h3>
                  <p className='text-gray-400'>
                    All content on ShowStakr, including text, graphics, logos, and software, is the property of ShowStakr or its licensors and is protected by intellectual property laws.
                  </p>
                </div>

                <div>
                  <h3 className='text-lg font-semibold text-violet-400 mb-2'>2. Privacy</h3>
                  <p className='text-gray-400'>
                    Your use of ShowStakr is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the Site and informs users of our data collection practices.
                  </p>
                </div>

                <div>
                  <h3 className='text-lg font-semibold text-violet-400 mb-2'>3. Winnings and Payouts</h3>
                  <p className='text-gray-400'>
                    Winnings are calculated based on the stake amount and the odds at the time of placing the stake. Payouts are processed within 24-48 hours after event resolution. A 5% platform fee applies to all winnings.
                  </p>
                </div>

                <div>
                  <h3 className='text-lg font-semibold text-violet-400 mb-2'>4. Dispute Resolution</h3>
                  <p className='text-gray-400'>
                    Any disputes arising from the use of ShowStakr shall be resolved through binding arbitration in accordance with the laws of Nigeria.
                  </p>
                </div>

                <div>
                  <h3 className='text-lg font-semibold text-violet-400 mb-2'>5. Limitation of Liability</h3>
                  <p className='text-gray-400'>
                    ShowStakr shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the platform.
                  </p>
                </div>

                <div>
                  <h3 className='text-lg font-semibold text-violet-400 mb-2'>6. Modifications</h3>
                  <p className='text-gray-400'>
                    We reserve the right to modify these Terms of Service at any time. We will notify users of any changes by posting the new Terms of Service on this page.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className='bg-white/5 border-white/10'>
            <CardContent className='p-6'>
              <div className='flex items-center gap-4'>
                <Mail className='w-6 h-6 text-violet-400' />
                <div>
                  <h3 className='text-white font-semibold mb-1'>Questions about our Terms?</h3>
                  <p className='text-gray-400 text-sm'>
                    Contact us at{' '}
                    <a href='mailto:legal@showstakr.com' className='text-violet-400 hover:text-violet-300 transition-colors'>
                      legal@showstakr.com
                    </a>
                    {' '}or visit our{' '}
                    <Link href='/contact' className='text-violet-400 hover:text-violet-300 transition-colors'>
                      Contact Page
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}