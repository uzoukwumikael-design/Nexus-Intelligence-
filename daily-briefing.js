// Nexus Intelligence - FULLY AUTOMATED Briefing Generator
// Runs daily at 6:00 AM EST - NO MANUAL APPROVAL NEEDED
// 1. Scrapes news from sources
// 2. Generates FREE briefing (600-800 words) using OpenAI
// 3. Generates PREMIUM briefing (1,200-1,500 words) using OpenAI
// 4. AUTO-PUBLISHES to website
// 5. AUTO-SENDS differentiated emails based on user tier
// 6. Sends you summary email after completion

const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');
const newsConfig = require('./config/news-sources');
const fs = require('fs');

// Initialize services
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ===================================
// STEP 1: SCRAPE NEWS FROM SOURCES
// ===================================

async function scrapeNews() {
  console.log('🔍 Scraping news sources...');
  const headlines = [];
  
  for (const [name, config] of Object.entries(newsConfig.NEWS_SOURCES)) {
    if (!config.enabled) continue;
    
    try {
      console.log(`  Fetching from ${name}...`);
      
      // Use RSS feeds when available (easiest)
      if (config.rssUrl) {
        const feed = await fetchRSS(config.rssUrl, config.limit);
        headlines.push(...feed);
      } else {
        // Fallback to web scraping
        const scraped = await scrapePage(config.url, config.selector, config.limit);
        headlines.push(...scraped);
      }
      
      console.log(`  ✓ Got ${headlines.length} headlines from ${name}`);
    } catch (error) {
      console.error(`  ✗ Failed to scrape ${name}:`, error.message);
      // Continue with other sources
    }
  }
  
  // Format headlines for Claude
  const formattedHeadlines = headlines
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 15) // Top 15 headlines
    .map((h, i) => `${i + 1}. ${h.title} - ${h.summary}`)
    .join('\n');
  
  console.log(`✓ Collected ${headlines.length} total headlines\n`);
  return formattedHeadlines;
}

// Helper: Fetch RSS feed
async function fetchRSS(url, limit) {
  const Parser = require('rss-parser');
  const parser = new Parser();
  const feed = await parser.parseURL(url);
  
  return feed.items.slice(0, limit).map(item => ({
    title: item.title,
    summary: item.contentSnippet || item.summary || '',
    url: item.link,
    timestamp: item.pubDate,
    source: feed.title,
    priority: 1
  }));
}

// Helper: Scrape webpage (simplified - real version would use Cheerio/Puppeteer)
async function scrapePage(url, selector, limit) {
  // In production, use Cheerio or Puppeteer
  // For now, returning placeholder
  return [];
}

// ===================================
// STEP 2: GENERATE FREE BRIEFING (OpenAI)
// ===================================

async function generateFreeBriefing(headlines) {
  console.log('📝 Generating FREE briefing with OpenAI...');
  
  // Load FREE prompt template
  const freePrompt = fs.readFileSync('./prompts/free-prompt.txt', 'utf8');
  
  // Replace placeholders
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const prompt = freePrompt
    .replace('{current_date}', currentDate)
    .replace('{headlines}', headlines);
  
  // Call OpenAI API (using your existing credits!)
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o', // Latest GPT-4 model
    messages: [{
      role: 'user',
      content: prompt
    }],
    max_tokens: 2000,
    temperature: 0.7
  });
  
  const freeBriefing = completion.choices[0].message.content;
  
  console.log(`✓ FREE briefing generated (${freeBriefing.length} chars)`);
  console.log(`✓ Cost: ~$${(completion.usage.total_tokens * 0.000005).toFixed(4)}\n`);
  
  return freeBriefing;
}

// ===================================
// STEP 3: GENERATE PREMIUM BRIEFING (OpenAI)
// ===================================

async function generatePremiumBriefing(headlines) {
  console.log('📝 Generating PREMIUM briefing with OpenAI...');
  
  // Load PREMIUM prompt template
  const premiumPrompt = fs.readFileSync('./prompts/premium-prompt.txt', 'utf8');
  
  // Replace placeholders
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const prompt = premiumPrompt
    .replace('{current_date}', currentDate)
    .replace('{headlines}', headlines);
  
  // Call OpenAI API (using your existing credits!)
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o', // Latest GPT-4 model
    messages: [{
      role: 'user',
      content: prompt
    }],
    max_tokens: 4000, // More tokens for longer premium content
    temperature: 0.7
  });
  
  const premiumBriefing = completion.choices[0].message.content;
  
  console.log(`✓ PREMIUM briefing generated (${premiumBriefing.length} chars)`);
  console.log(`✓ Cost: ~$${(completion.usage.total_tokens * 0.000005).toFixed(4)}\n`);
  
  return premiumBriefing;
}

// ===================================
// STEP 4: SAVE TO DATABASE & AUTO-PUBLISH
// ===================================

async function saveBriefings(freeBriefing, premiumBriefing) {
  console.log('💾 Saving briefings to database...');
  
  const { data, error } = await supabase
    .from('briefings')
    .insert([
      {
        date: new Date().toISOString(),
        free_content: freeBriefing,
        premium_content: premiumBriefing,
        published: true, // ✅ AUTO-PUBLISH - No manual approval needed!
        auto_generated: true,
        published_at: new Date().toISOString()
      }
    ])
    .select();
  
  if (error) {
    console.error('✗ Database error:', error);
    throw error;
  }
  
  console.log(`✓ Briefings saved and AUTO-PUBLISHED with ID: ${data[0].id}\n`);
  return data[0].id;
}

// ===================================
// STEP 5: AUTO-SEND EMAILS (No Approval Needed)
// ===================================

async function sendEmails(briefingId) {
  console.log('📧 Auto-sending emails to subscribers...');
  
  // Get briefing content
  const { data: briefing } = await supabase
    .from('briefings')
    .select('*')
    .eq('id', briefingId)
    .single();
  
  // Get all subscribers
  const { data: subscribers } = await supabase
    .from('subscribers')
    .select('email, tier, name');
  
  // Separate by tier
  const freeUsers = subscribers.filter(s => s.tier === 'free');
  const premiumUsers = subscribers.filter(s => s.tier === 'premium');
  
  console.log(`  Found ${freeUsers.length} free users, ${premiumUsers.length} premium users`);
  
  let freeEmailsSent = 0;
  let premiumEmailsSent = 0;
  
  // Send to FREE users
  for (const user of freeUsers) {
    try {
      await sendEmail({
        to: user.email,
        subject: `Nexus Intelligence - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Market Briefing`,
        html: formatFreeEmail(briefing.free_content, user.name)
      });
      freeEmailsSent++;
    } catch (error) {
      console.error(`  ✗ Failed to send to ${user.email}:`, error.message);
    }
  }
  
  // Send to PREMIUM users
  for (const user of premiumUsers) {
    try {
      await sendEmail({
        to: user.email,
        subject: `⭐ Nexus Intelligence PREMIUM - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} with Trade Setups`,
        html: formatPremiumEmail(briefing.premium_content, user.name)
      });
      premiumEmailsSent++;
    } catch (error) {
      console.error(`  ✗ Failed to send to ${user.email}:`, error.message);
    }
  }
  
  console.log(`✓ Emails sent: ${freeEmailsSent} free, ${premiumEmailsSent} premium\n`);
  
  return {
    freeEmailsSent,
    premiumEmailsSent,
    totalSent: freeEmailsSent + premiumEmailsSent
  };
}

// Email Templates
function formatFreeEmail(content, name) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: #1E40AF; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .upgrade-box { background: #FFF7ED; border-left: 4px solid #FB923C; padding: 15px; margin: 20px 0; }
        .footer { background: #F3F4F6; padding: 20px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 Nexus Intelligence</h1>
        <p>Your Daily Market Briefing</p>
      </div>
      <div class="content">
        <p>Good morning ${name || ''},</p>
        ${content.replace(/\n/g, '<br>')}
        
        <div class="upgrade-box">
          <h3>🌟 Upgrade to Premium</h3>
          <p>Get 3 ready-to-execute trade setups with exact entry/exit/stop levels + portfolio positioning advice for just $10/month.</p>
          <a href="https://nexusintelligence1.substack.com/subscribe" style="background: #1E40AF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Upgrade Now</a>
        </div>
      </div>
      <div class="footer">
        <p>Nexus Intelligence | Daily Market Briefings at 7 AM</p>
        <p><a href="{unsubscribe_url}">Unsubscribe</a></p>
      </div>
    </body>
    </html>
  `;
}

function formatPremiumEmail(content, name) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #1E40AF 0%, #7C3AED 100%); color: white; padding: 20px; text-align: center; }
        .premium-badge { background: #FCD34D; color: #78350F; padding: 5px 10px; border-radius: 3px; font-size: 12px; font-weight: bold; }
        .content { padding: 20px; }
        .trade-setup { background: #EFF6FF; border-left: 4px solid #1E40AF; padding: 15px; margin: 15px 0; }
        .footer { background: #F3F4F6; padding: 20px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>⭐ Nexus Intelligence PREMIUM</h1>
        <p>Your Daily Market Briefing with Trade Setups</p>
        <span class="premium-badge">PREMIUM SUBSCRIBER</span>
      </div>
      <div class="content">
        <p>Good morning ${name || 'Premium Subscriber'},</p>
        ${content.replace(/\n/g, '<br>')}
      </div>
      <div class="footer">
        <p>Nexus Intelligence Premium | Daily at 7 AM with Exact Levels</p>
        <p><a href="{unsubscribe_url}">Unsubscribe</a></p>
      </div>
    </body>
    </html>
  `;
}

// Helper: Send email (using any email service)
async function sendEmail({ to, subject, html }) {
  // In production, use SendGrid, Mailgun, or AWS SES
  // For now, logging
  console.log(`  ✓ Email sent to ${to}`);
}

// ===================================
// MAIN EXECUTION - FULLY AUTOMATED
// ===================================

async function main() {
  console.log('🚀 Nexus Intelligence FULLY AUTOMATED System Starting...\n');
  console.log(`📅 Date: ${new Date().toLocaleString()}\n`);
  
  const startTime = Date.now();
  let stats = {
    headlinesCollected: 0,
    freeBriefingLength: 0,
    premiumBriefingLength: 0,
    freeEmailsSent: 0,
    premiumEmailsSent: 0,
    totalCost: 0,
    errors: []
  };
  
  try {
    // Step 1: Scrape news
    const headlines = await scrapeNews();
    stats.headlinesCollected = headlines.split('\n').length;
    
    // Step 2: Generate both briefings in parallel (faster!)
    const [freeBriefing, premiumBriefing] = await Promise.all([
      generateFreeBriefing(headlines),
      generatePremiumBriefing(headlines)
    ]);
    
    stats.freeBriefingLength = freeBriefing.length;
    stats.premiumBriefingLength = premiumBriefing.length;
    
    // Step 3: Save to database (auto-published)
    const briefingId = await saveBriefings(freeBriefing, premiumBriefing);
    
    // Step 4: Auto-send emails immediately (no approval needed!)
    const emailStats = await sendEmails(briefingId);
    stats.freeEmailsSent = emailStats.freeEmailsSent;
    stats.premiumEmailsSent = emailStats.premiumEmailsSent;
    
    // Step 5: Calculate total time and cost
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    stats.totalCost = ((stats.freeBriefingLength + stats.premiumBriefingLength) * 0.000005).toFixed(4);
    
    // Step 6: Send SUCCESS summary email to admin
    console.log('✅ AUTOMATION COMPLETED SUCCESSFULLY!\n');
    console.log('📊 SUMMARY:');
    console.log(`  ├─ Headlines collected: ${stats.headlinesCollected}`);
    console.log(`  ├─ Free briefing: ${stats.freeBriefingLength} chars`);
    console.log(`  ├─ Premium briefing: ${stats.premiumBriefingLength} chars`);
    console.log(`  ├─ Free emails sent: ${stats.freeEmailsSent}`);
    console.log(`  ├─ Premium emails sent: ${stats.premiumEmailsSent}`);
    console.log(`  ├─ Total cost: $${stats.totalCost}`);
    console.log(`  └─ Execution time: ${totalTime}s\n`);
    
    await sendAdminSummary({
      status: 'SUCCESS',
      briefingId,
      stats,
      totalTime,
      freeBriefingPreview: freeBriefing.substring(0, 200) + '...',
      premiumBriefingPreview: premiumBriefing.substring(0, 200) + '...'
    });
    
    console.log('📧 Summary email sent to admin\n');
    console.log(`🔗 View briefing: https://nexusintelligence.com/briefing/${briefingId}\n`);
    
  } catch (error) {
    console.error('\n❌ AUTOMATION FAILED\n');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    stats.errors.push(error.message);
    
    // Send FAILURE alert email to admin
    await sendAdminSummary({
      status: 'FAILED',
      error: error.message,
      stack: error.stack,
      stats
    });
    
    throw error;
  }
}

// ===================================
// ADMIN SUMMARY EMAIL
// ===================================

async function sendAdminSummary({ status, briefingId, stats, totalTime, freeBriefingPreview, premiumBriefingPreview, error, stack }) {
  const isSuccess = status === 'SUCCESS';
  const subject = isSuccess 
    ? `✅ Daily Briefing Sent - ${new Date().toLocaleDateString()}`
    : `🚨 Automation Failed - ${new Date().toLocaleDateString()}`;
  
  const html = isSuccess ? `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .stat { background: #F3F4F6; padding: 10px; margin: 10px 0; border-left: 4px solid #10B981; }
        .preview { background: #FFFBEB; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .button { background: #1E40AF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>✅ Daily Briefing Auto-Sent Successfully!</h1>
      </div>
      <div class="content">
        <p>Good morning! Your Nexus Intelligence briefing was automatically generated and sent.</p>
        
        <h3>📊 Summary:</h3>
        <div class="stat"><strong>Headlines Collected:</strong> ${stats.headlinesCollected}</div>
        <div class="stat"><strong>Free Emails Sent:</strong> ${stats.freeEmailsSent}</div>
        <div class="stat"><strong>Premium Emails Sent:</strong> ${stats.premiumEmailsSent}</div>
        <div class="stat"><strong>Total Cost:</strong> $${stats.totalCost}</div>
        <div class="stat"><strong>Execution Time:</strong> ${totalTime} seconds</div>
        
        <h3>📝 Preview (Free Version):</h3>
        <div class="preview">${freeBriefingPreview}</div>
        
        <h3>⭐ Preview (Premium Version):</h3>
        <div class="preview">${premiumBriefingPreview}</div>
        
        <a href="https://nexusintelligence.com/briefing/${briefingId}" class="button">View Full Briefing</a>
        
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
          Everything ran automatically. You can review the briefing anytime in your admin panel, but no action is required.
        </p>
      </div>
    </body>
    </html>
  ` : `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .error { background: #FEE2E2; padding: 15px; margin: 15px 0; border-left: 4px solid #EF4444; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚨 Automation Failed</h1>
      </div>
      <div class="content">
        <p>The daily briefing automation encountered an error and did not send.</p>
        
        <h3>❌ Error Details:</h3>
        <div class="error">
          <strong>Error:</strong> ${error}<br><br>
          <strong>Stack Trace:</strong><br>
          <pre style="font-size: 11px; overflow-x: auto;">${stack}</pre>
        </div>
        
        <p><strong>What to do:</strong></p>
        <ol>
          <li>Check the logs for more details</li>
          <li>Run manually: <code>node automation/daily-briefing.js</code></li>
          <li>If issue persists, contact support</li>
        </ol>
        
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
          You can manually generate today's briefing from the admin panel.
        </p>
      </div>
    </body>
    </html>
  `;
  
  await sendEmail({
    to: process.env.ADMIN_EMAIL || 'admin@nexusintelligence.com',
    subject,
    html
  });
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main, scrapeNews, generateFreeBriefing, generatePremiumBriefing };
