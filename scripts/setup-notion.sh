#!/bin/bash

echo "🔧 Notion API Setup Script"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 This script will help you set up Notion API integration${NC}"
echo ""

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ Error: backend/.env file not found${NC}"
    exit 1
fi

echo -e "${YELLOW}📝 Step 1: Create Notion Integration${NC}"
echo "1. Go to: https://www.notion.so/my-integrations"
echo "2. Click 'New integration'"
echo "3. Name: 'Research Base API'"
echo "4. Click 'Submit'"
echo "5. Copy the 'Internal Integration Token' (starts with 'secret_')"
echo ""

read -p "Enter your Notion API Token (starts with 'secret_'): " notion_token

if [[ ! $notion_token =~ ^secret_ ]]; then
    echo -e "${RED}❌ Error: Token must start with 'secret_'${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📝 Step 2: Create Database in Notion${NC}"
echo "1. Open Notion in your browser"
echo "2. Create a new page or select existing one"
echo "3. Add a Database (/ -> Table)"
echo "4. Set up columns (see NOTION_SETUP.md for details)"
echo "5. Share the database with your integration"
echo ""

read -p "Enter your Database ID (from the URL): " database_id

if [ -z "$database_id" ]; then
    echo -e "${RED}❌ Error: Database ID cannot be empty${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📝 Updating .env file...${NC}"

# Update .env file
sed -i.bak "s/NOTION_API_KEY=your_notion_api_token_here/NOTION_API_KEY=$notion_token/" backend/.env
sed -i.bak "s/NOTION_DATABASE_ID=your_database_id_here/NOTION_DATABASE_ID=$database_id/" backend/.env

echo -e "${GREEN}✅ .env file updated successfully${NC}"

echo ""
echo -e "${YELLOW}🧪 Testing Notion API...${NC}"

# Test the API
response=$(curl -s -X POST http://localhost:3001/api/notion/test)
echo "Response: $response"

if [[ $response == *"success\":true"* ]]; then
    echo -e "${GREEN}✅ Notion API configured correctly!${NC}"
else
    echo -e "${RED}❌ Notion API test failed. Please check your configuration.${NC}"
    echo "Response: $response"
fi

echo ""
echo -e "${GREEN}🎉 Notion setup completed!${NC}"
echo "Your research files will now be automatically added to Notion."
