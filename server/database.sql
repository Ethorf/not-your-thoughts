-- CREATE DATABASE 
-- This is basically just where we will sketch out the queries, databases are created via routes


CREATE TABLE users(
  id uuid DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  PRIMARY KEY(id)
);

CREATE TABLE test_users(
  id uuid DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  PRIMARY KEY(id)
);



--fake users data

insert into test_users (name, email, password) values ('gaycob', 'gaycob@gmail.com', 'kthl8822');