// News Sources Configuration for Automated Headline Collection
// This runs at 6:00 AM daily to gather market news

const NEWS_SOURCES = {
  // Google Finance - Top market movers
  googleFinance: {
    url: 'https://www.google.com/finance',
    enabled: true,
    selector: '.article-title', // CSS selector for headlines
    limit: 5, // Top 5 headlines
    priority: 1 // Highest priority
  },

  // Yahoo Finance - Breaking news
  yahooFinance: {
    url: 'https://finance.yahoo.com',
    enabled: true,
    rssUrl: 'https://finance.yahoo.com/news/rssindex', // RSS feed alternative
    limit: 5,
    priority: 1
  },

  // MarketWatch - Market analysis
  marketWatch: {
    url: 'https://www.marketwatch.com',
    enabled: true,
    rssUrl: 'https://www.marketwatch.com/rss/topstories',
    limit: 3,
    priority: 2
  },

  // Seeking Alpha - Stock-specific news
  seekingAlpha: {
    url: 'https://seekingalpha.com/market-news',
    enabled: true,
    limit: 3,
    priority: 2
  },

  // Reddit - r/wallstreetbets sentiment
  reddit: {
    url: 'https://www.reddit.com/r/wallstreetbets/hot.json',
    enabled: true,
    limit: 2, // Top 2 trending discussions
    priority: 3,
    filter: 'upvotes > 1000' // Only high-engagement posts
  }
};

// Scraping Schedule
const SCHEDULE = {
  dailyRun: '06:00', // 6:00 AM daily
  timezone: 'America/New_York', // EST
  retryAttempts: 3,
  timeout: 30000 // 30 seconds per source
};

// Headline Processing Rules
const PROCESSING = {
  minHeadlineLength: 20, // Minimum characters
  maxHeadlineLength: 200, // Maximum characters
  excludeKeywords: [
    'sponsored',
    'advertisement',
    'promoted'
  ],
  
  // Extract key information
  extractPatterns: {
    stockTickers: /\$[A-Z]{1,5}/g, // Extract $AAPL, $MSFT, etc.
    percentages: /[-+]?\d+\.?\d*%/g, // Extract +5.2%, -3.1%
    dollarAmounts: /\$\d+\.?\d*[BMK]?/g // Extract $100B, $5M, etc.
  },

  // Categorize headlines
  categories: {
    earnings: ['earnings', 'EPS', 'revenue', 'quarter', 'Q1', 'Q2', 'Q3', 'Q4'],
    fed: ['Fed', 'Powell', 'FOMC', 'rate', 'inflation', 'CPI', 'PPI'],
    geopolitical: ['war', 'Iran', 'China', 'Russia', 'conflict', 'trade'],
    tech: ['AI', 'tech', 'semiconductor', 'chip', 'software'],
    energy: ['oil', 'gas', 'energy', 'crude', 'Brent', 'WTI']
  }
};

// Output Format
const OUTPUT = {
  format: 'json',
  structure: {
    date: 'ISO 8601',
    headlines: [
      {
        title: 'string',
        source: 'string',
        url: 'string',
        timestamp: 'ISO 8601',
        category: 'string',
        tickers: ['array of $TICKERS'],
        summary: 'string (first 200 chars of article)',
        priority: 'number (1-3)'
      }
    ]
  },
  
  // Example output
  example: {
    date: '2026-03-26T06:00:00Z',
    headlines: [
      {
        title: 'Iran Rejects US Peace Plan, Demands Hormuz Sovereignty',
        source: 'MarketWatch',
        url: 'https://...',
        timestamp: '2026-03-26T05:45:00Z',
        category: 'geopolitical',
        tickers: ['$XLE', '$USO'],
        summary: 'Tehran formally rejected Trump administration 15-point proposal...',
        priority: 1
      },
      {
        title: 'Jobless Claims Fall to 205K, Beating Estimates',
        source: 'Yahoo Finance',
        url: 'https://...',
        timestamp: '2026-03-26T05:30:00Z',
        category: 'fed',
        tickers: ['$SPY'],
        summary: 'Weekly unemployment filings fell 8,000 to 205,000...',
        priority: 1
      }
    ]
  }
};

// Error Handling
const ERROR_HANDLING = {
  onSourceFailure: 'continue', // Continue with other sources if one fails
  fallbackSources: ['Yahoo Finance RSS', 'Google News API'],
  notificationEmail: 'admin@nexusintelligence.com', // Alert on failures
  maxConsecutiveFailures: 3 // Alert after 3 days of failures
};

// API Keys (if needed)
const API_KEYS = {
  googleNews: process.env.GOOGLE_NEWS_API_KEY || null,
  alphaVantage: process.env.ALPHA_VANTAGE_KEY || null, // For stock data
  reddit: process.env.REDDIT_CLIENT_ID || null
};

module.exports = {
  NEWS_SOURCES,
  SCHEDULE,
  PROCESSING,
  OUTPUT,
  ERROR_HANDLING,
  API_KEYS
};
