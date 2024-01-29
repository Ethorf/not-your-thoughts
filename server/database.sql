-- CREATE DATABASE 
-- This is basically just where we will sketch out the queries, databases are created via routes


CREATE TABLE users (
  id uuid DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  entries_ids INT[] DEFAULT (ARRAY[]::INT[]),
  is_first_login BOOLEAN DEFAULT true,
  PRIMARY KEY(id),
  journal_config INT,
  CONSTRAINT fk_users_journal_config,
  FOREIGN KEY (journal_config),
  REFERENCES user_journal_config(id);
);

ALTER TABLE users
  ADD CONSTRAINT fk_entries_ids,
  ADD FOREIGN KEY (entries_ids),
  ADD REFERENCES entries(entry_id);

-- ALTER TABLE users
--   ADD CONSTRAINT fk_entries_ids FOREIGN KEY (entries_ids) REFERENCES entries(entry_id);


CREATE TABLE user_journal_config (
  id serial PRIMARY KEY,
  user_id uuid UNIQUE REFERENCES users(id),
  progress_audio_enabled BOOLEAN DEFAULT true,
  wpm_enabled BOOLEAN DEFAULT false,
  timer_enabled BOOLEAN DEFAULT false,
  goal_preference VARCHAR(255) DEFAULT 'words',
  daily_time_goal INT DEFAULT 5,
  daily_words_goal INT DEFAULT 400,
  custom_prompts_ids INT[] DEFAULT (ARRAY[]::INT[]),
  tracked_phrases_ids INT[] DEFAULT (ARRAY[]::INT[]),
  custom_prompts_enabled BOOLEAN DEFAULT false,
  last_day_completed VARCHAR(255) DEFAULT NULL,
  consecutive_days_completed INT DEFAULT 0,
  total_days_completed INT DEFAULT 0,
);

CREATE TYPE entry_type_enum AS ENUM ('node', 'journal');

CREATE TABLE entries (
  entry_id SERIAL PRIMARY KEY,
  user_id uuid REFERENCES users(id) NOT,
  content TEXT NOT NULL,
  type entry_type_enum DEFAULT,
  date TIMESTAMP NOT NULL,
  total_time_taken INT NOT NULL,
  wpm INT DEFAULT 1,
  num_of_words INT DEFAULT 1,
  pd_emotion_analysis TEXT;
);

ALTER TABLE entries
  ALTER COLUMN num_of_words INT DEFAULT 0
  ALTER COLUMN wpm INT DEFAULT 0,
  ALTER COLUMN total_time_taken INT DEFAULT 0,
  ALTER COLUMN type SET DEFAULT 'journal';





CREATE TABLE custom_prompts (
  id SERIAL PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  content TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
);