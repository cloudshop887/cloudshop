-- SQL Script to Create Admin User
-- Run this in your MySQL database or use Prisma Studio

-- First, let's create the admin user with a hashed password
-- The password "admin123" hashed with bcrypt is:
-- $2a$10$YourHashedPasswordHere

-- You can run this SQL directly in MySQL Workbench or phpMyAdmin:

INSERT INTO User (fullName, email, phone, password, role, createdAt, updatedAt)
VALUES (
  'Admin User',
  'admin@shop.com',
  '1234567890',
  '$2a$10$rOZKqVJQqJQqJQqJQqJQqOZKqVJQqJQqJQqJQqJQqOZKqVJQqJQqJQ',
  'ADMIN',
  NOW(),
  NOW()
);

-- OR if the user already exists, just update their role:
UPDATE User 
SET role = 'ADMIN' 
WHERE email = 'admin@shop.com';
