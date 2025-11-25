-- Migration script to update existing database to new schema
-- Run this if you have an existing database

-- Add new columns if they don't exist
DO $$ 
BEGIN
    -- Add registration_number sequence if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'registration_number_seq') THEN
        CREATE SEQUENCE registration_number_seq START 1;
    END IF;

    -- Add new columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'registration_number') THEN
        ALTER TABLE registrations ADD COLUMN registration_number INTEGER UNIQUE DEFAULT nextval('registration_number_seq');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'alternative_contact_number') THEN
        ALTER TABLE registrations ADD COLUMN alternative_contact_number VARCHAR(20);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'gender') THEN
        ALTER TABLE registrations ADD COLUMN gender VARCHAR(10) CHECK (gender IN ('boys', 'girls'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'selected_games') THEN
        ALTER TABLE registrations ADD COLUMN selected_games TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'total_amount') THEN
        ALTER TABLE registrations ADD COLUMN total_amount DECIMAL(10, 2);
    END IF;

    -- Remove old columns if they exist (optional - comment out if you want to keep them)
    -- ALTER TABLE registrations DROP COLUMN IF EXISTS department;
    -- ALTER TABLE registrations DROP COLUMN IF EXISTS semester;
    -- ALTER TABLE registrations DROP COLUMN IF EXISTS sport;
    -- ALTER TABLE registrations DROP COLUMN IF EXISTS esports_subcategory;
END $$;

-- Create games_pricing table if it doesn't exist
CREATE TABLE IF NOT EXISTS games_pricing (
  id SERIAL PRIMARY KEY,
  game_name VARCHAR(100) NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('boys', 'girls', 'both')),
  price DECIMAL(10, 2) NOT NULL,
  players INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Insert games pricing data (only if table is empty)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM games_pricing LIMIT 1) THEN
        INSERT INTO games_pricing (game_name, gender, price, players) VALUES
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
        ('Fifa', 'girls', 300.00, 1);
    END IF;
END $$;

-- Create index for registration_number if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_registrations_registration_number ON registrations(registration_number);
CREATE INDEX IF NOT EXISTS idx_games_pricing_game_gender ON games_pricing(game_name, gender);

