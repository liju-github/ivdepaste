-- Grant SELECT access to the 'anon' role
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant INSERT, UPDATE, DELETE access to 'authenticated' role
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Ensure future tables have the same permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

-- Create the WELCOME table
CREATE TABLE "WELCOME" (
    "NAME" text
);

-- Insert a sample record into the WELCOME table
INSERT INTO "WELCOME" (NAME) VALUES ('Hello, World!');

-- Verify that the record was inserted
SELECT * FROM "WELCOME";

DROP TABLE "paste"
