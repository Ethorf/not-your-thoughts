-- CREATE DATABASE authtodo;

CREATE TABLE users(
  id uuid DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  PRIMARY KEY(id)
);

--fake users data

insert into users (name, email, password) values ('gaycob', 'gaycob@gmail.com', 'kthl8822');