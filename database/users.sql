-- Create the users table if it does not exist
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(20) PRIMARY KEY,
    github_username VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add comments to the users table and its columns
ALTER TABLE users COMMENT 'Stores information about users';
ALTER TABLE users MODIFY COLUMN id varchar(20) COMMENT "The primary key of the users table. The User's Discord ID";
ALTER TABLE users MODIFY COLUMN github_username VARCHAR(255) COMMENT 'The GitHub username of the user';
ALTER TABLE users MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'The date and time the user was created';
