CREATE TABLE t_p66814254_swift_connect.news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  published_at VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);