ALTER TABLE user_config
  ADD COLUMN IF NOT EXISTS node_daily_words_goal INT DEFAULT 400,
  ADD COLUMN IF NOT EXISTS node_daily_time_goal INT DEFAULT 5;
