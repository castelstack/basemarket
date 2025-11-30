// SEO Keywords for different page types
export const seoKeywords = {
  home: [
    'entertainment predictions',
    'prediction games Nigeria',
    'prediction gaming platform',
    'entertainment betting',
    'predict show winners',
    'show outcome predictions',
    'Nigerian entertainment predictions',
    'stake on shows',
    'win money predictions',
    'entertainment competition predictions',
  ],
  
  polls: [
    'live predictions',
    'entertainment predictions today',
    'competition predictions',
    'event predictions',
    'current prediction pools',
    'voting predictions',
    'entertainment polls',
    'show predictions Nigeria',
    'entertainment polls Nigeria',
    'stake on entertainment',
  ],
  
  dashboard: [
    'prediction history',
    'gaming dashboard',
    'my predictions',
    'prediction winnings',
    'entertainment gaming account',
    'stake tracker',
    'prediction statistics',
    'gaming performance',
  ],
  
  auth: [
    'join prediction games',
    'prediction gaming sign up',
    'create prediction account',
    'gaming login',
    'ShowStakr registration',
    'start predicting',
    'prediction bonus',
    'welcome bonus',
  ],
};

// Meta descriptions for different pages
export const metaDescriptions = {
  home: 'Play prediction games on entertainment shows and events on ShowStakr! Join thousands of Nigerian players staking on outcomes and winning real money daily.',
  
  polls: 'Live predictions happening now! Stake on current entertainment events and competitions. Compete with other players and win big.',
  
  dashboard: 'Track your predictions, view winnings, and manage your stakes. See your performance history and compete on the leaderboard.',
  
  login: 'Sign in to ShowStakr and start playing prediction games. Access your dashboard, place stakes, and win money from your predictions.',
  
  register: 'Join ShowStakr today! Start predicting entertainment show outcomes and more. Nigeria\'s #1 prediction gaming platform.',
  
  wallet: 'Manage your ShowStakr wallet, deposit funds, and withdraw winnings from predictions. Fast, secure transactions for all your stakes.',
};

// Long-tail keywords for blog/content pages
export const longTailKeywords = [
  'how to play prediction games 2024',
  'entertainment show winner predictions',
  'competition prediction tips',
  'best strategy for prediction gaming',
  'entertainment predictions this week',
  'weekend entertainment predictions',
  'event winner predictions',
  'finale winner predictions',
  'most accurate predictions',
  'prediction platform Nigeria',
  'win money predicting shows',
  'prediction gaming sites in Nigeria',
  'legal prediction platform',
  'peer to peer prediction gaming',
  'prediction gaming community',
];

// Schema.org structured data for different content types
export const getStructuredData = (type: 'faq' | 'howto' | 'event', data: any) => {
  switch (type) {
    case 'faq':
      return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data.questions.map((q: any) => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: q.answer,
          },
        })),
      };
      
    case 'howto':
      return {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: data.title,
        description: data.description,
        step: data.steps.map((s: any, i: number) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: s.name,
          text: s.text,
        })),
      };
      
    case 'event':
      return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
        location: {
          '@type': 'VirtualLocation',
          url: 'https://showstakr.tournest.io',
        },
        organizer: {
          '@type': 'Organization',
          name: 'ShowStakr',
          url: 'https://showstakr.tournest.io',
        },
      };
      
    default:
      return {};
  }
};