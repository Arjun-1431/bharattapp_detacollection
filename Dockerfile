# Step 1: Use Node.js base image
FROM node:18-alpine as build

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Build the Next.js application
RUN npm run build

# Step 7: Expose port 3000
EXPOSE 3000

# Step 8: Define the command to run the app
CMD ["npm", "start"]