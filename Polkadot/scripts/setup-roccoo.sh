#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Rococo Testnet Deployment Setup${NC}"
echo -e "${BLUE}===================================${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js
echo -e "${CYAN}Checking Node.js...${NC}"
if ! command_exists node; then
    echo -e "${RED}❌ Node.js not found!${NC}"
    echo -e "${YELLOW}Please install Node.js 16+ from: https://nodejs.org/${NC}"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${RED}❌ Node.js version too old!${NC}"
    echo -e "${YELLOW}Please upgrade to Node.js 16+${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) found${NC}"

# Check Rust
echo -e "${CYAN}Checking Rust...${NC}"
if ! command_exists cargo; then
    echo -e "${RED}❌ Rust/Cargo not found!${NC}"
    echo -e "${YELLOW}Installing Rust...${NC}"
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
    echo -e "${GREEN}✅ Rust installed${NC}"
else
    echo -e "${GREEN}✅ Rust $(cargo --version) found${NC}"
fi

# Check cargo-contract
echo -e "${CYAN}Checking cargo-contract...${NC}"
if ! command_exists cargo-contract; then
    echo -e "${YELLOW}Installing cargo-contract...${NC}"
    cargo install cargo-contract --force
    echo -e "${GREEN}✅ cargo-contract installed${NC}"
else
    echo -e "${GREEN}✅ cargo-contract found${NC}"
fi

# Install Node.js dependencies
echo -e "${CYAN}Installing Node.js dependencies...${NC}"
cd "$(dirname "$0")/.."
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Build contracts
echo -e "${CYAN}Building contracts...${NC}"
npm run build-contracts
echo -e "${GREEN}✅ Contracts built${NC}"

# Make deployment script executable
chmod +x scripts/deploy-roccoo.js

echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo -e ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "${GREEN}1.${NC} Get ROC tokens from: https://rococo-faucet.polkadot.io/"
echo -e "${GREEN}2.${NC} Set your deployment mnemonic:"
echo -e "   export DEPLOYMENT_MNEMONIC=\"your twelve word mnemonic phrase here\""
echo -e "${GREEN}3.${NC} Run deployment:"
echo -e "   npm run deploy-roccoo"
echo -e ""
echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo -e "- Keep your mnemonic phrase secure"
echo -e "- Make sure you have at least 10 ROC tokens"
echo -e "- The deployment will cost approximately 5-10 ROC"
echo -e "- Save the deployment addresses for future use"
echo -e ""
echo -e "${BLUE}🔗 Useful Links:${NC}"
echo -e "- Rococo Faucet: https://rococo-faucet.polkadot.io/"
echo -e "- Rococo Explorer: https://rococo.subscan.io/"
echo -e "- Polkadot.js Apps: https://polkadot.js.org/apps/?rpc=wss://rococo-rpc.polkadot.io" 