// Application configuration
export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://show-stackr.onrender.com',
  
  // App URL for SEO and sharing
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://showstakr.tournest.io',
  
  // Images
  logoUrl: 'https://res.cloudinary.com/dnvsfxlan/image/upload/v1754824130/Group_1000001891_2_tybmb9.svg',
  ogImageUrl: 'https://res.cloudinary.com/dnvsfxlan/image/upload/v1754824146/Screenshot_2025-08-10_at_8.50.36_AM_pqxy9i.png',
  
  // App metadata
  appName: 'ShowStakr',
  appDescription: 'Predict entertainment show outcomes. Stake on your favorites and win real money!',
  
  // Social media
  social: {
    twitter: '@showstakr',
    instagram: '@showstakr',
    facebook: 'showstakr',
  },
  
  // SEO defaults
  seo: {
    defaultTitle: 'ShowStakr - Entertainment Predictions & Gaming',
    titleTemplate: '%s | ShowStakr',
    defaultDescription: 'Predict entertainment show outcomes. Join thousands staking and winning real money daily!',
    defaultKeywords: [
      'entertainment predictions',
      'prediction games',
      'entertainment gaming',
      'prediction platform',
      'Nigerian entertainment',
      'ShowStakr',
    ],
  },
  
  // Features flags
  features: {
    notifications: true,
    wallet: true,
    admin: true,
    referrals: false,
    leaderboard: true,
  },
  
  // Payment configuration
  payment: {
    minDeposit: 100,
    maxDeposit: 1000000,
    minWithdrawal: 500,
    maxWithdrawal: 500000,
    withdrawalFee: 50,
    platformFee: 0.05, // 5%
  },
  
  // Staking configuration
  staking: {
    minStake: 100,
    maxStake: 100000,
  },
};

export default config;