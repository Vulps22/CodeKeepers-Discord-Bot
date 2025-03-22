-- Create the secrets table if it does not exist
CREATE TABLE IF NOT EXISTS secrets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    url VARCHAR(255) NOT NULL,
    secret VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints to the secrets table
ALTER TABLE secrets ADD CONSTRAINT fk_userId FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add comments to the secrets table and its columns
ALTER TABLE secrets COMMENT 'Stores secrets for users';
ALTER TABLE secrets MODIFY COLUMN id INT AUTO_INCREMENT COMMENT 'The primary key of the secrets table';
ALTER TABLE secrets MODIFY COLUMN user_id VARCHAR(20) COMMENT 'The user ID of the user who owns the secret';
ALTER TABLE secrets MODIFY COLUMN url VARCHAR(255) COMMENT 'The URL of the secret';
ALTER TABLE secrets MODIFY COLUMN secret VARCHAR(255) COMMENT 'The secret value';
ALTER TABLE secrets MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'The date and time the secret was created';