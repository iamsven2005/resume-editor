CREATE TABLE IF NOT EXISTS portfolio_analytics (
  id SERIAL PRIMARY KEY,
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  visitor_ip VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  session_duration INTEGER DEFAULT 0,
  pages_viewed INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_portfolio_id ON portfolio_analytics(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_created_at ON portfolio_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_visitor_ip ON portfolio_analytics(visitor_ip);

-- Create a view for analytics summary
CREATE OR REPLACE VIEW portfolio_analytics_summary AS
SELECT 
  portfolio_id,
  COUNT(*) as total_views,
  COUNT(DISTINCT visitor_ip) as unique_visitors,
  AVG(session_duration) as avg_session_duration,
  AVG(pages_viewed) as avg_pages_viewed,
  COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as views_last_7_days,
  COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as views_last_30_days,
  COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '90 days' THEN 1 END) as views_last_90_days
FROM portfolio_analytics
GROUP BY portfolio_id;
