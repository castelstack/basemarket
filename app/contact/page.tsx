'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare, 
  HelpCircle,
  Headphones,
  Globe,
  Twitter,
  Instagram,
  Facebook
} from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      value: 'support@tournest.io',
      description: 'Get help via email',
      color: 'from-violet-500 to-purple-500',
      href: 'mailto:support@tournest.io'
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp',
      value: 'Join our community',
      description: 'Chat with us on WhatsApp',
      color: 'from-emerald-500 to-teal-500',
      href: 'https://chat.whatsapp.com/IdVjnthicD2Jp21ry8vMIC'
    },
    {
      icon: Globe,
      title: 'Website',
      value: 'tournest.io',
      description: 'Visit our main website',
      color: 'from-pink-500 to-rose-500',
      href: 'https://tournest.io'
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'Abuja, Nigeria',
      description: 'Tournest HQ',
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const faqs = [
    {
      question: 'How do I deposit funds?',
      answer: 'Go to your Wallet page and click on "Deposit". Follow the payment instructions.'
    },
    {
      question: 'How long do withdrawals take?',
      answer: 'Withdrawals are typically processed within 24-48 hours.'
    },
    {
      question: 'What is the minimum stake amount?',
      answer: 'The minimum stake amount is ₦100 per prediction.'
    },
    {
      question: 'How are winnings calculated?',
      answer: 'Winnings are based on your stake amount and the odds at the time of placing your stake.'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct email body
    const emailBody = `
Name: ${formData.name}
Email: ${formData.email}
Category: ${formData.category || 'Not specified'}
Subject: ${formData.subject}

Message:
${formData.message}
    `.trim();
    
    // Construct mailto link
    const mailtoLink = `mailto:support@tournest.io?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Reset form after a short delay
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: ''
      });
      toast.success('Email client opened! Please send the email to complete your submission.');
    }, 500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className='min-h-screen bg-black'>
      {/* Background Effects */}
      <div className='fixed inset-0 bg-gradient-to-br from-violet-950/20 via-black to-pink-950/20' />
      <div className='fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent' />

      <div className='relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16'>
        {/* Header */}
        <div className='text-center mb-12'>
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 mb-6'>
            <Headphones className='w-8 h-8 text-white' />
          </div>
          <h1 className='text-4xl sm:text-5xl font-black mb-4'>
            <span className='bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent'>
              Get in Touch
            </span>
          </h1>
          <p className='text-gray-400 text-lg max-w-2xl mx-auto'>
            Have questions or need help? We&apos;re here for you 24/7. 
            Reach out through any of our support channels.
          </p>
        </div>

        {/* Contact Methods */}
        <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12'>
          {contactMethods.map((method, index) => (
            <Card key={index} className='bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all group'>
              <CardContent className='p-6'>
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${method.color} mb-4`}>
                  <method.icon className='w-6 h-6 text-white' />
                </div>
                <h3 className='text-lg font-semibold text-white mb-1'>{method.title}</h3>
                <p className='text-violet-400 font-medium mb-1'>{method.value}</p>
                <p className='text-gray-500 text-sm'>{method.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='grid lg:grid-cols-3 gap-8'>
          {/* Contact Form */}
          <div className='lg:col-span-2'>
            <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
              <CardContent className='p-8'>
                <h2 className='text-2xl font-bold text-white mb-6'>Send us a Message</h2>
                
                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div className='grid sm:grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='name' className='text-gray-300'>Full Name</Label>
                      <Input
                        id='name'
                        name='name'
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className='bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-violet-500/50 focus:bg-white/10'
                        placeholder='John Doe'
                      />
                    </div>
                    <div>
                      <Label htmlFor='email' className='text-gray-300'>Email Address</Label>
                      <Input
                        id='email'
                        name='email'
                        type='email'
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className='bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-violet-500/50 focus:bg-white/10'
                        placeholder='john@example.com'
                      />
                    </div>
                  </div>

                  <div className='grid sm:grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='category' className='text-gray-300'>Category</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData({...formData, category: value})}
                      >
                        <SelectTrigger className='bg-white/5 border-white/10 text-white'>
                          <SelectValue placeholder='Select a category' />
                        </SelectTrigger>
                        <SelectContent className='bg-black border-white/10'>
                          <SelectItem value='general' className='text-white hover:bg-white/10'>General Inquiry</SelectItem>
                          <SelectItem value='technical' className='text-white hover:bg-white/10'>Technical Support</SelectItem>
                          <SelectItem value='account' className='text-white hover:bg-white/10'>Account Issues</SelectItem>
                          <SelectItem value='payment' className='text-white hover:bg-white/10'>Payment & Withdrawals</SelectItem>
                          <SelectItem value='feedback' className='text-white hover:bg-white/10'>Feedback</SelectItem>
                          <SelectItem value='partnership' className='text-white hover:bg-white/10'>Partnership</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor='subject' className='text-gray-300'>Subject</Label>
                      <Input
                        id='subject'
                        name='subject'
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className='bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-violet-500/50 focus:bg-white/10'
                        placeholder='Brief description'
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor='message' className='text-gray-300'>Message</Label>
                    <Textarea
                      id='message'
                      name='message'
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className='bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-violet-500/50 focus:bg-white/10 resize-none'
                      placeholder='Tell us how we can help you...'
                    />
                  </div>

                  <Button
                    type='submit'
                    className='w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 font-semibold'
                  >
                    <Send className='w-4 h-4 mr-2' />
                    Send via Email
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div>
            <Card className='bg-white/5 backdrop-blur-sm border-white/10 mb-6'>
              <CardContent className='p-6'>
                <div className='flex items-center gap-3 mb-4'>
                  <HelpCircle className='w-6 h-6 text-violet-400' />
                  <h3 className='text-xl font-bold text-white'>Quick Help</h3>
                </div>
                
                <div className='space-y-4'>
                  {faqs.map((faq, index) => (
                    <div key={index} className='pb-4 border-b border-white/10 last:border-0'>
                      <h4 className='text-sm font-semibold text-violet-400 mb-2'>{faq.question}</h4>
                      <p className='text-gray-400 text-sm'>{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className='bg-gradient-to-br from-violet-900/30 to-pink-900/30 border-white/10'>
              <CardContent className='p-6'>
                <h3 className='text-xl font-bold text-white mb-4'>Connect With Us</h3>
                <p className='text-gray-400 text-sm mb-4'>
                  Follow us on social media for updates, tips, and community discussions.
                </p>
                
                <div className='flex gap-3'>
                  <a 
                    href='https://twitter.com/tournest_io' 
                    target='_blank' 
                    rel='noreferrer'
                    className='p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-violet-500/20 hover:border-violet-500/30 transition-all'
                  >
                    <Twitter className='w-5 h-5 text-violet-400' />
                  </a>
                  <a 
                    href='https://www.instagram.com/tournest.io/' 
                    target='_blank' 
                    rel='noreferrer'
                    className='p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-pink-500/20 hover:border-pink-500/30 transition-all'
                  >
                    <Instagram className='w-5 h-5 text-pink-400' />
                  </a>
                  <a 
                    href='https://web.facebook.com/tournestfb' 
                    target='_blank' 
                    rel='noreferrer'
                    className='p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-500/20 hover:border-blue-500/30 transition-all'
                  >
                    <Facebook className='w-5 h-5 text-blue-400' />
                  </a>
                </div>

                <div className='mt-6 p-4 rounded-xl bg-white/5 border border-white/10'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Clock className='w-4 h-4 text-emerald-400' />
                    <span className='text-sm font-semibold text-emerald-400'>Response Time</span>
                  </div>
                  <p className='text-gray-400 text-sm'>
                    We typically respond within 2-4 hours during business hours, 
                    and within 24 hours on weekends.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}