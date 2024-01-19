-- CREATE DATABASE authtodo;

CREATE TABLE users(
  user_id uuid DEFAULT uuid_generate_v4(),
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL UNIQUE,
  user_password VARCHAR(255) NOT NULL,
  PRIMARY KEY(user_id)
);

CREATE TABLE blog_posts(
  post_id SERIAL,
  title VARCHAR(255),
  content TEXT,
  date TEXT,
  PRIMARY KEY (post_id)
);


CREATE TABLE userstest(
  user_id uuid DEFAULT uuid_generate_v4(),
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL UNIQUE,
  user_password VARCHAR(255) NOT NULL,
  PRIMARY KEY(user_id)
);

CREATE TABLE events(
  id SERIAL,
  title VARCHAR(255),
  description TEXT, 
  event_start TEXT,
  event_end TEXT,
  is_cancelled BOOLEAN,
  PRIMARY KEY (post_id)
);



CREATE TABLE events(id SERIAL, title VARCHAR(255), description TEXT, eventstart TEXT, eventend TEXT, is_cancelled BOOLEAN, PRIMARY KEY (id));