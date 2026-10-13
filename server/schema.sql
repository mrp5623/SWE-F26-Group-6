CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL, -- member or admin
  height_cm REAL,
  weight_kg REAL,
  age INTEGER,
  sex TEXT,
  goal TEXT, --gain/maintain/lose
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE foods (
  id SERIAL PRIMARY KEY,
  fdc_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  calories REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL
);

CREATE TABLE food_log_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_id INTEGER NOT NULL REFERENCES foods(id),
  grams REAL NOT NULL,
  logged_on DATE NOT NULL 
);

CREATE TABLE goals (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  calories INTEGER NOT NULL,
  protein INTEGER NOT NULL,
  carbs INTEGER NOT NULL,
  fat INTEGER NOT NULL
);