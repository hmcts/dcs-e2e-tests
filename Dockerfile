FROM mcr.microsoft.com/playwright:v1.58.2-noble

# Set working directory
WORKDIR /playwright/

# Copy only package files and install dependencies
COPY package.json yarn.lock ./
RUN corepack enable && yarn install --immutable

# Copy the rest of the project
COPY . .

# Install all Playwright-supported browsers + dependencies
RUN npx playwright install --with-deps

