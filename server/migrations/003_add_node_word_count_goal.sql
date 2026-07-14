ALTER TABLE user_config
  ADD COLUMN IF NOT EXISTS node_word_count_goal INT DEFAULT 500;
