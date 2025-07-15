CREATE TABLE IF NOT EXISTS portfolios (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  theme VARCHAR(50) DEFAULT 'modern',
  resume_data JSONB NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  portfolio_url VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_portfolio_url ON portfolios(portfolio_url);
CREATE INDEX IF NOT EXISTS idx_portfolios_is_published ON portfolios(is_published);
