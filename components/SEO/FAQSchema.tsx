'use client';

import Head from 'next/head';

const faqData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I predict entertainment show outcomes on ShowStakr?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Simply sign up on ShowStakr, browse active polls, select your prediction for events, and place your stake. If your prediction is correct, you win a share of the pool based on your stake amount.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I bet on entertainment show competitions?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! ShowStakr offers predictions for various entertainment events including competitions, eliminations, tasks, and weekly challenges. You can stake on any active poll.',
      },
    },
    {
      '@type': 'Question',
      name: 'What entertainment shows can I predict on ShowStakr?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ShowStakr covers various popular Nigerian entertainment shows. We add new shows based on popularity and demand from our community.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much can I win predicting on ShowStakr?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Your winnings depend on your stake amount and the total pool. Winners share 100% of the pool proportionally based on their stakes. The more you stake and the fewer winners, the more you win!',
      },
    },
    {
      '@type': 'Question',
      name: 'Is ShowStakr legal in Nigeria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, ShowStakr operates as a peer-to-peer prediction platform where users compete against each other, not against the house. This is legal entertainment gaming in Nigeria.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I withdraw my prediction winnings?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Withdrawals are processed within 24-48 hours directly to your Nigerian bank account. Simply go to your wallet, click withdraw, enter the amount, and provide your bank details.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is ShowStakr free to join?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! ShowStakr is completely free to join. You can start by depositing any amount you\'re comfortable with to begin predicting entertainment shows.',
      },
    },
    {
      '@type': 'Question',
      name: 'When are predictions settled?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Predictions are settled immediately after the official announcement during live shows. Winnings are credited to your wallet instantly.',
      },
    },
  ],
};

export default function FAQSchema() {
  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
    </Head>
  );
}