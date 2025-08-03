#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up Polkadot Fusion+ Local Deployment${NC}"
echo -e "${BLUE}================================================${NC}"

# Check if Node.js is installed
echo -e "${YELLOW}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 16+ first.${NC}"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${RED}❌ Node.js version 16+ is required. Current version: $(node --version)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) is installed${NC}"

# Check if npm is installed
echo -e "${YELLOW}Checking npm installation...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm --version) is installed${NC}"

# Check if cargo-contract is installed
echo -e "${YELLOW}Checking cargo-contract installation...${NC}"
if ! command -v cargo-contract &> /dev/null; then
    echo -e "${YELLOW}⚠️  cargo-contract not found. Installing...${NC}"
    cargo install cargo-contract --force
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install cargo-contract${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ cargo-contract is installed${NC}"

# Install npm dependencies
echo -e "${YELLOW}Installing npm dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install npm dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm dependencies installed${NC}"

# Build contracts
echo -e "${YELLOW}Building contracts...${NC}"
npm run build-contracts
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to build contracts${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Contracts built successfully${NC}"

# Test contracts
echo -e "${YELLOW}Testing contracts...${NC}"
npm run test-contracts
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Contract tests failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Contract tests passed${NC}"

# Make scripts executable
echo -e "${YELLOW}Making scripts executable...${NC}"
chmod +x scripts/deploy-local.js
chmod +x scripts/visualize-swap.js

echo -e "${GREEN}✅ Scripts made executable${NC}"

echo -e "${BLUE}🎉 Setup completed successfully!${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "${GREEN}1. Start local Substrate node:${NC}"
echo -e "   substrate --dev --tmp"
echo -e ""
echo -e "${GREEN}2. In another terminal, run visualization:${NC}"
echo -e "   npm run visualize"
echo -e ""
echo -e "${GREEN}3. To deploy contracts:${NC}"
echo -e "   npm run deploy"
echo -e ""
echo -e "${GREEN}4. To test contracts:${NC}"
echo -e "   npm run test-contracts"
echo -e ""
echo -e "${BLUE}Happy swapping! 🚀${NC}" 