CREATE TABLE IF NOT EXISTS user_credits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  remaining_credits INTEGER DEFAULT 20,
  used_credits INTEGER DEFAULT 0,
  purchased_credits INTEGER DEFAULT 0,
  reset_date TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 month'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_reset_date ON user_credits(reset_date);

-- Insert default credits for existing users
INSERT INTO user_credits (user_id, remaining_credits, reset_date)
SELECT id, 20, (CURRENT_TIMESTAMP + INTERVAL '1 month')
FROM users
WHERE id NOT IN (SELECT user_id FROM user_credits);
