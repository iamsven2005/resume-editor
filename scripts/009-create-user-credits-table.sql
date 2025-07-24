-- Create user_credits table for tracking resume credits
CREATE TABLE IF NOT EXISTS user_credits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    remaining_credits INTEGER NOT NULL DEFAULT 20,
    used_credits INTEGER NOT NULL DEFAULT 0,
    purchased_credits INTEGER NOT NULL DEFAULT 0,
    reset_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_reset_date ON user_credits(reset_date);

-- Insert default credits for existing users
INSERT INTO user_credits (user_id, remaining_credits, used_credits, purchased_credits, reset_date)
SELECT 
    id, 
    20, 
    0, 
    0, 
    CURRENT_DATE + INTERVAL '30 days'
FROM users 
WHERE id NOT IN (SELECT user_id FROM user_credits);
