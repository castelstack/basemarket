'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, AlertTriangle, Clock, Users, Shield, Phone, HelpCircle, Ban, Calculator, Brain } from 'lucide-react';
import Link from 'next/link';

export default function ResponsibleGamingPage() {
  const warningSigns = [
    'Spending more money than you can afford',
    'Chasing losses with bigger stakes',
    'Neglecting work, family, or social obligations',
    'Feeling anxious or depressed about your staking',
    'Lying about your staking activities',
    'Borrowing money to stake'
  ];

  const tools = [
    {
      icon: Calculator,
      title: 'Deposit Limits',
      description: 'Set daily, weekly, or monthly deposit limits to control your spending.'
    },
    {
      icon: Clock,
      title: 'Time Limits',
      description: 'Set session time reminders to manage how long you spend on the platform.'
    },
    {
      icon: Ban,
      title: 'Self-Exclusion',
      description: 'Take a break from staking with temporary or permanent self-exclusion options.'
    },
    {
      icon: Shield,
      title: 'Reality Checks',
      description: 'Receive regular notifications about your staking activity and spending.'
    }
  ];

  const helpResources = [
    {
      name: 'National Responsible Gambling Helpline',
      phone: '0800-XXX-XXXX',
      hours: '24/7 Support'
    },
    {
      name: 'Gamblers Anonymous Nigeria',
      website: 'www.ga-nigeria.org',
      email: 'help@ga-nigeria.org'
    },
    {
      name: 'Mental Health Foundation',
      phone: '0800-XXX-XXXX',
      hours: 'Mon-Fri, 9AM-5PM'
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
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-6'>
            <Heart className='w-8 h-8 text-white' />
          </div>
          <h1 className='text-4xl sm:text-5xl font-black mb-4'>
            <span className='bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent'>
              Responsible Gaming
            </span>
          </h1>
          <p className='text-gray-400 text-lg max-w-2xl mx-auto'>
            We&apos;re committed to providing a safe and enjoyable experience for all our users. 
            Gaming should be fun, not a source of stress.
          </p>
        </div>

        {/* Our Commitment */}
        <Card className='bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-emerald-500/20 mb-8'>
          <CardContent className='p-8'>
            <h2 className='text-2xl font-bold text-white mb-4'>Our Commitment to You</h2>
            <p className='text-gray-300 leading-relaxed mb-4'>
              At ShowStakr, we believe in responsible gaming. While predicting outcomes and staking can be entertaining, 
              we want to ensure it remains a fun activity and doesn&apos;t become a problem. We provide tools and resources 
              to help you stay in control of your gaming activities.
            </p>
            <p className='text-emerald-400 font-semibold'>
              Remember: Never stake more than you can afford to lose.
            </p>
          </CardContent>
        </Card>

        {/* Stay in Control */}
        <Card className='bg-white/5 backdrop-blur-sm border-white/10 mb-8'>
          <CardContent className='p-8'>
            <div className='flex items-center gap-3 mb-6'>
              <Brain className='w-8 h-8 text-violet-400' />
              <h2 className='text-2xl font-bold text-white'>Stay in Control</h2>
            </div>
            
            <div className='space-y-4'>
              <div className='p-4 rounded-xl bg-violet-500/10 border border-violet-500/20'>
                <h3 className='text-violet-400 font-semibold mb-2'>Set a Budget</h3>
                <p className='text-gray-400 text-sm'>
                  Decide how much you can afford to spend before you start. Never exceed this amount.
                </p>
              </div>
              
              <div className='p-4 rounded-xl bg-pink-500/10 border border-pink-500/20'>
                <h3 className='text-pink-400 font-semibold mb-2'>Set Time Limits</h3>
                <p className='text-gray-400 text-sm'>
                  Decide how long you want to play and stick to it. Take regular breaks.
                </p>
              </div>
              
              <div className='p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20'>
                <h3 className='text-emerald-400 font-semibold mb-2'>Don&apos;t Chase Losses</h3>
                <p className='text-gray-400 text-sm'>
                  Accept that losing is part of gaming. Never try to win back losses with bigger stakes.
                </p>
              </div>
              
              <div className='p-4 rounded-xl bg-amber-500/10 border border-amber-500/20'>
                <h3 className='text-amber-400 font-semibold mb-2'>Balance Your Life</h3>
                <p className='text-gray-400 text-sm'>
                  Make sure gaming doesn&apos;t interfere with your daily responsibilities and relationships.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warning Signs */}
        <Card className='bg-red-500/10 border-red-500/30 mb-8'>
          <CardContent className='p-8'>
            <div className='flex items-center gap-3 mb-6'>
              <AlertTriangle className='w-8 h-8 text-red-400' />
              <h2 className='text-2xl font-bold text-white'>Warning Signs</h2>
            </div>
            <p className='text-gray-300 mb-4'>
              If you experience any of these signs, it might be time to seek help:
            </p>
            <ul className='space-y-3'>
              {warningSigns.map((sign, index) => (
                <li key={index} className='flex items-start gap-3'>
                  <span className='text-red-400 mt-1'>⚠</span>
                  <span className='text-gray-400'>{sign}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Self-Help Tools */}
        <div className='mb-8'>
          <h2 className='text-2xl font-bold text-white mb-6'>Self-Help Tools</h2>
          <div className='grid sm:grid-cols-2 gap-4'>
            {tools.map((tool, index) => (
              <Card key={index} className='bg-white/5 border-white/10 hover:bg-white/10 transition-all'>
                <CardContent className='p-6'>
                  <div className='flex items-start gap-4'>
                    <div className='p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20'>
                      <tool.icon className='w-6 h-6 text-violet-400' />
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold text-white mb-2'>{tool.title}</h3>
                      <p className='text-gray-400 text-sm'>{tool.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Get Help */}
        <Card className='bg-gradient-to-br from-violet-900/30 to-pink-900/30 border-white/10 mb-8'>
          <CardContent className='p-8'>
            <div className='flex items-center gap-3 mb-6'>
              <Phone className='w-8 h-8 text-violet-400' />
              <h2 className='text-2xl font-bold text-white'>Get Help & Support</h2>
            </div>
            
            <p className='text-gray-300 mb-6'>
              If you or someone you know needs help with problem gambling, these organizations can provide support:
            </p>
            
            <div className='space-y-4'>
              {helpResources.map((resource, index) => (
                <div key={index} className='p-4 rounded-xl bg-white/5 border border-white/10'>
                  <h3 className='text-lg font-semibold text-white mb-2'>{resource.name}</h3>
                  <div className='space-y-1 text-sm'>
                    {resource.phone && (
                      <p className='text-gray-400'>
                        Phone: <span className='text-violet-400 font-semibold'>{resource.phone}</span>
                      </p>
                    )}
                    {resource.hours && (
                      <p className='text-gray-400'>Hours: {resource.hours}</p>
                    )}
                    {resource.website && (
                      <p className='text-gray-400'>
                        Website: <span className='text-violet-400'>{resource.website}</span>
                      </p>
                    )}
                    {resource.email && (
                      <p className='text-gray-400'>
                        Email: <span className='text-violet-400'>{resource.email}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Self-Assessment */}
        {/* <Card className='bg-white/5 border-white/10 mb-8'>
          <CardContent className='p-8'>
            <div className='flex items-center gap-3 mb-6'>
              <HelpCircle className='w-8 h-8 text-violet-400' />
              <h2 className='text-2xl font-bold text-white'>Self-Assessment</h2>
            </div>
            
            <p className='text-gray-300 mb-6'>
              Not sure if you have a problem? Take our confidential self-assessment to evaluate your gaming habits.
            </p>
            
            <div className='flex flex-col sm:flex-row gap-4'>
              <Button className='bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600'>
                Take Assessment
              </Button>
              <Button variant='outline' className='border-white/20 text-white hover:bg-white/10'>
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card> */}

        {/* Underage Gaming */}
        <Card className='bg-amber-500/10 border-amber-500/30'>
          <CardContent className='p-6'>
            <div className='flex items-start gap-4'>
              <Users className='w-6 h-6 text-amber-400 flex-shrink-0 mt-1' />
              <div>
                <h3 className='text-xl font-bold text-amber-400 mb-2'>Underage Gaming Prevention</h3>
                <p className='text-gray-300 mb-3'>
                  ShowStakr is strictly for users aged 18 and above. We have measures in place to prevent underage gaming:
                </p>
                <ul className='space-y-2 text-gray-400 text-sm'>
                  <li>• Age verification during registration</li>
                  <li>• Regular account checks</li>
                  <li>• Immediate account suspension for underage users</li>
                  <li>• Cooperation with parental control software</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <div className='mt-12 text-center'>
          <p className='text-gray-400 mb-4'>
            Need immediate assistance with responsible gaming settings?
          </p>
          <Link href='/contact'>
            <Button className='bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'>
              Contact Support Team
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}