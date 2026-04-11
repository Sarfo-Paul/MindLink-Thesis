# MindLink — Setup Commands

## Step 1: Migrate the database schema (adds username + passwordHash columns)
cd server && npx prisma db push

## Step 2: Install auth dependencies  
npm install bcryptjs jsonwebtoken @types/bcryptjs @types/jsonwebtoken

## Step 3: Restart the backend server (stop existing one first with Ctrl+C)
npm run dev
