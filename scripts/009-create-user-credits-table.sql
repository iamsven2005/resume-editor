CREATE TABLE IF NOT EXISTS user_credits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    remaining_credits INTEGER NOT NULL DEFAULT 20,
    used_credits INTEGER NOT NULL DEFAULT 0,
    purchased_credits INTEGER NOT NULL DEFAULT 0,
    reset_date TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 month'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);

-- Insert sample data for existing users
INSERT INTO user_credits (user_id, remaining_credits, reset_date)
SELECT id, 20, (CURRENT_TIMESTAMP + INTERVAL '1 month')
FROM users
WHERE id NOT IN (SELECT user_id FROM user_credits);
