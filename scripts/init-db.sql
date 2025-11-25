-- Create sequence for auto-incrementing registration numbers
CREATE SEQUENCE IF NOT EXISTS registration_number_seq START 1;

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY,
  registration_number INTEGER UNIQUE DEFAULT nextval('registration_number_seq'),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  roll_number VARCHAR(50) NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  alternative_contact_number VARCHAR(20),
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('boys', 'girls')),
  selected_games TEXT NOT NULL, -- JSON array of selected games
  team_members TEXT, -- JSON object: { gameName: [{ name, rollNumber, contactNumber }] }
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'online')),
  slip_id VARCHAR(50),
  transaction_id VARCHAR(255),
  screenshot_url TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending_cash' CHECK (status IN ('pending_cash', 'pending_online', 'paid', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create games_pricing table for reference
CREATE TABLE IF NOT EXISTS games_pricing (
  id SERIAL PRIMARY KEY,
  game_name VARCHAR(100) NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('boys', 'girls', 'both')),
  price DECIMAL(10, 2) NOT NULL,
  players INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Insert games pricing data
INSERT INTO games_pricing (game_name, gender, price, players) VALUES
-- Boys games
('Cricket', 'boys', 2200.00, 11),
('Football', 'boys', 2200.00, 11),
('Double Wicket', 'boys', 500.00, 2),
('Badminton Singles', 'boys', 200.00, 1),
('Badminton Doubles', 'boys', 400.00, 2),
('Table Tennis Singles', 'boys', 200.00, 1),
('Table Tennis Doubles', 'boys', 400.00, 2),
('Foosball Doubles', 'boys', 400.00, 2),
('Ludo Singles', 'boys', 150.00, 1),
('Ludo Doubles', 'boys', 300.00, 2),
('Carrom Singles', 'boys', 150.00, 1),
('Carrom Doubles', 'boys', 250.00, 2),
('Darts Singles', 'boys', 150.00, 1),
('Tug of War', 'boys', 1000.00, 10),
('Jenga', 'boys', 150.00, 1),
('Chess', 'boys', 150.00, 1),
('Arm Wrestling', 'boys', 150.00, 1),
('Pitho Gol Garam', 'boys', 1000.00, 6),
('Uno', 'boys', 100.00, 1),
('Tekken', 'boys', 300.00, 1),
('Fifa', 'boys', 300.00, 1),
-- Girls games
('Cricket', 'girls', 1200.00, 5),
('Football', 'girls', 1200.00, 6),
('Badminton Singles', 'girls', 200.00, 1),
('Badminton Doubles', 'girls', 200.00, 2),
('Table Tennis Doubles', 'girls', 400.00, 2),
('Foosball Doubles', 'girls', 400.00, 2),
('Ludo Singles', 'girls', 150.00, 1),
('Ludo Doubles', 'girls', 300.00, 2),
('Carrom Singles', 'girls', 150.00, 1),
('Carrom Doubles', 'girls', 250.00, 2),
('Darts Singles', 'girls', 150.00, 1),
('Tug of War', 'girls', 600.00, 6),
('Jenga', 'girls', 150.00, 1),
('Chess', 'girls', 150.00, 1),
('Tekken', 'girls', 300.00, 1),
('Fifa', 'girls', 300.00, 1)
ON CONFLICT DO NOTHING;

-- Create esports_settings table
CREATE TABLE IF NOT EXISTS esports_settings (
  id TEXT PRIMARY KEY DEFAULT '1',
  is_open BOOLEAN DEFAULT true NOT NULL,
  open_date TIMESTAMP,
  close_date TIMESTAMP,
  announcement TEXT,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create admin_sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Insert default esports settings
INSERT INTO esports_settings (id, is_open, announcement)
VALUES ('1', true, 'Esports matches will be held in OC on scheduled dates.')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_method ON registrations(payment_method);
CREATE INDEX IF NOT EXISTS idx_registrations_registration_number ON registrations(registration_number);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_games_pricing_game_gender ON games_pricing(game_name, gender);
