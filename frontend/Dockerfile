FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies.
# Tremor currently declares a React 18 peer while this app uses React 19,
# so we install from the lockfile and bypass peer-resolution failures here.
RUN npm ci --legacy-peer-deps

# Copy rest of the source
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
