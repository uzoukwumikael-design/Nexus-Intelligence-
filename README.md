# Nexus Intelligence - FULLY AUTOMATED Dual-Tier Briefing System

## 🎯 What This System Does

**100% AUTOMATION - No manual approval needed! Even if you're sleeping, briefings still send.**

### Daily Workflow (Fully Automated):

**6:00 AM EST - News Collection (Automated)**
- ✅ Automatically scrapes Google Finance, Yahoo Finance, MarketWatch, Seeking Alpha, Reddit
- ✅ Extracts 10-15 top headlines with descriptions
- ✅ Categorizes by topic (earnings, Fed, geopolitical, tech, energy)

**6:05 AM - Dual Briefing Generation (Automated)**
- ✅ OpenAI GPT-4o generates **FREE briefing** (600-800 words, basic analysis)
- ✅ OpenAI GPT-4o generates **PREMIUM briefing** (1,200-1,500 words, exact trade setups)
- ✅ Both saved to database
- ✅ **AUTO-PUBLISHED** (no approval needed!)

**7:00 AM - Automated Email Send**
- ✅ FREE users receive basic briefing
- ✅ PAID users receive premium briefing with trade setups
- ✅ Both versions posted to website (premium content paywalled)
- ✅ **You get summary email** with stats and preview

**ZERO manual work required!** 🎉

---

## 💰 COST BREAKDOWN (Using Your Existing OpenAI Credits!)

### Monthly Costs:

| Service | Cost | What It Does |
|---------|------|--------------|
| **OpenAI API** | **$0.90** | 2 briefings/day × $0.03 each = $0.90/month |
| **Hosting** | $0 | Vercel/Netlify free tier |
| **Database** | $0 | Supabase free tier (up to 500MB) |
| **Authentication** | $0 | Supabase built-in |
| **Email Sending** | $0 | SendGrid free tier (100 emails/day) |
| **News Scraping** | $0 | RSS feeds are free |
| **Domain** | $1 | (~$12/year for .com) |
| **TOTAL** | **~$2/month** | 🎉 **BASICALLY FREE!** |

**✅ You already have OpenAI credits from Make.com - use those!**

See full cost comparison: [docs/COST-COMPARISON.md](docs/COST-COMPARISON.md)

**With 100 subscribers (50 free, 50 paid):**
- Claude API: ~$1.20/month (30 days × 2 briefings × $0.02)
- Email: $0 (under free tier limit)
- Database: $0 (minimal storage)
- **Total: ~$10/month**

**With 500 subscribers (250 free, 250 paid):**
- Claude API: ~$1.20/month (same, only 2 briefings generated)
- Email: $0 (still under free tier)
- Database: $0 (still under free tier)
- **Total: ~$10/month** (scales beautifully!)

**With 2,000 subscribers:**
- Claude API: $1.20/month
- Email: $15/month (need paid tier, ~$0.0003 per email)
- Database: $0 (still free)
- **Total: ~$25/month**

---

## 📊 FREE vs PREMIUM Differences

### FREE VERSION (600-800 words):
- Executive Summary
- Top 3 Stories (basic analysis)
- 2-3 Stock Spotlights (NO exact levels)
- 1 Key Theme
- Market Sentiment
- Bottom Line
- **NO** exact entry/exit/stop points
- **NO** trade setups
- **NO** portfolio positioning
- **Upgrade CTA** at end

### PREMIUM VERSION (1,200-1,500 words):
- Executive Summary (detailed)
- Top 5 Stories (comprehensive)
- 5-8 Stock Spotlights **with exact technical levels**
- **3 Trade Setups** (Entry $X, Target $Y, Stop $Z)
- 2-3 Key Themes
- **Portfolio Positioning** (40% equity, 30% cash, etc.)
- **Exact price levels** ($SPY $665 support)
- **Specific times** (9:30 AM watch for...)
- Sector rotation strategy

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────┐
│  6:00 AM - AUTOMATED NEWS SCRAPER           │
│  ├─ Google Finance RSS                      │
│  ├─ Yahoo Finance RSS                       │
│  ├─ MarketWatch RSS                         │
│  ├─ Seeking Alpha                           │
│  └─ Reddit r/wallstreetbets API             │
│                                             │
│  Output: 10-15 formatted headlines          │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│  6:05 AM - CLAUDE API (2 CALLS)             │
│                                             │
│  Call 1: FREE PROMPT                        │
│  ├─ Input: Headlines + Free template        │
│  ├─ Output: 600-800 word basic briefing     │
│  └─ Cost: ~$0.01                            │
│                                             │
│  Call 2: PREMIUM PROMPT                     │
│  ├─ Input: Headlines + Premium template     │
│  ├─ Output: 1,200-1,500 word premium        │
│  └─ Cost: ~$0.02                            │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│  6:10 AM - SAVE TO DATABASE                 │
│  ├─ Store both versions                     │
│  ├─ Status: "Pending Review"                │
│  └─ Send notification to admin              │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│  6:15 AM - ADMIN REVIEWS (Manual)           │
│  ├─ Opens admin panel                       │
│  ├─ Reviews both versions side-by-side      │
│  ├─ Makes any edits needed                  │
│  └─ Clicks "Publish & Email"                │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│  7:00 AM - AUTOMATED EMAIL SEND             │
│                                             │
│  Query database for subscribers:            │
│  ├─ tier = 'free'  → Send FREE email        │
│  └─ tier = 'premium' → Send PREMIUM email   │
│                                             │
│  Post to website:                           │
│  ├─ Free content: Public                    │
│  └─ Premium content: Behind paywall         │
└─────────────────────────────────────────────┘
```

---

## 🚀 Setup Instructions

### Prerequisites:
1. Node.js installed (v18+)
2. GitHub account (free)
3. Anthropic API key ($10 credit)
4. Supabase account (free)
5. Vercel/Netlify account (free)

### Step-by-Step Setup:

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/nexus-intelligence.git
cd nexus-intelligence
npm install
```

#### 2. Environment Variables
Create `.env` file:
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=xxxxx
ADMIN_EMAIL=your@email.com
```

#### 3. Database Setup (Supabase)
Run this SQL in Supabase SQL editor:
```sql
-- Subscribers table
CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  tier TEXT DEFAULT 'free', -- 'free' or 'premium'
  stripe_customer_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Briefings table
CREATE TABLE briefings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TIMESTAMP NOT NULL,
  free_content TEXT NOT NULL,
  premium_content TEXT NOT NULL,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. Set Up Automated Cron Job

**Option A: Vercel Cron (Recommended - Free)**
Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/generate-briefing",
    "schedule": "0 6 * * *"
  }]
}
```

**Option B: GitHub Actions (Free)**
Create `.github/workflows/daily-briefing.yml`:
```yaml
name: Generate Daily Briefing
on:
  schedule:
    - cron: '0 6 * * *'  # 6 AM EST daily
  workflow_dispatch:  # Manual trigger

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: node automation/daily-briefing.js
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
```

#### 5. Deploy
```bash
# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod
```

#### 6. Test
```bash
# Run manually to test
node automation/daily-briefing.js
```

---

## 📧 Email Service Setup

### Option A: SendGrid (Recommended)
1. Create account at sendgrid.com
2. Free tier: 100 emails/day forever
3. Add API key to `.env`
4. Verified sender: your@nexusintelligence.com

### Option B: Mailgun
1. Create account at mailgun.com
2. Free tier: 1,000 emails/month
3. Add credentials to `.env`

### Option C: AWS SES (Cheapest at scale)
1. $0.10 per 1,000 emails
2. Requires AWS account
3. More setup but best for 10,000+ subscribers

---

## 🎨 Admin Panel Features

Access at: `https://nexusintelligence.com/admin`

**Dashboard:**
- View today's generated briefings (free vs premium)
- Edit content before publishing
- Preview both email versions
- Publish & send with one click
- View subscriber stats (free vs paid count)
- Revenue dashboard
- Performance metrics (open rates, click rates)

**Subscriber Management:**
- View all subscribers
- Filter by tier (free/premium)
- Manually add/remove
- Export to CSV

**Analytics:**
- Daily subscriber growth
- Conversion rate (free → premium)
- Churn rate
- Revenue trends

---

## 📈 Scaling Plan

### At 100 subscribers:
- Cost: $10/month
- Time: 10 min/day (review briefings)
- Everything automated

### At 500 subscribers:
- Cost: $15/month
- Consider: Better domain, branding
- Revenue: ~$2,500/month (50% paid = $10 × 250)

### At 1,000 subscribers:
- Cost: $25-30/month
- Revenue: ~$5,000/month
- Upgrade to better email service for analytics

### At 5,000+ subscribers:
- Cost: $100-150/month
- Revenue: ~$25,000/month
- Consider: Hiring editor, adding features

---

## 🔧 Customization Options

### Change News Sources:
Edit `config/news-sources.js`:
- Add new RSS feeds
- Remove sources
- Adjust priorities
- Change how many headlines per source

### Modify Prompts:
Edit `prompts/free-prompt.txt` and `prompts/premium-prompt.txt`:
- Change tone/style
- Add/remove sections
- Adjust word counts
- Modify structure

### Email Templates:
Edit `automation/daily-briefing.js`:
- Change email design
- Add social links
- Modify CTA buttons
- Customize branding

---

## 🐛 Troubleshooting

**Briefing not generating?**
- Check Claude API key valid
- Check credit balance ($10 minimum recommended)
- Check logs: `node automation/daily-briefing.js`

**Emails not sending?**
- Verify email service API key
- Check spam folder
- Confirm subscribers in database
- Check email service dashboard

**News scraper failing?**
- RSS feeds sometimes change URLs
- Check `config/news-sources.js` URLs
- Try manual test: `node automation/test-scraper.js`

---

## 💡 Pro Tips

1. **Test in development first**
   - Run `node automation/daily-briefing.js` manually
   - Check output before automating
   
2. **Monitor costs**
   - Anthropic console shows API usage
   - Set up billing alerts
   
3. **Backup content**
   - Database auto-backups daily
   - Export briefings weekly
   
4. **A/B test subject lines**
   - Try different email subjects
   - Track open rates
   - Optimize over time

---

## 📞 Support

Issues? Questions?
- GitHub Issues: [repo-url]/issues
- Email: admin@nexusintelligence.com
- Documentation: [repo-url]/wiki

---

**Built with ❤️ using Claude AI**
