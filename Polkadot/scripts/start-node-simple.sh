#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Local Substrate Node for Polkadot Fusion+${NC}"
echo -e "${BLUE}==================================================${NC}"

# Check if Substrate is installed
if ! command -v substrate &> /dev/null; then
    echo -e "${RED}❌ Substrate CLI not found!${NC}"
    echo -e "${YELLOW}Installing Substrate CLI...${NC}"
    
    if command -v cargo &> /dev/null; then
        echo -e "${YELLOW}Installing via cargo...${NC}"
        # Try different installation methods to avoid dependency issues
        if cargo install substrate --git https://github.com/paritytech/substrate.git --tag polkadot-v1.4.0; then
            echo -e "${GREEN}✅ Substrate installed successfully with tag polkadot-v1.4.0${NC}"
        elif cargo install substrate --git https://github.com/paritytech/substrate.git --tag polkadot-v1.3.0; then
            echo -e "${GREEN}✅ Substrate installed successfully with tag polkadot-v1.3.0${NC}"
        elif cargo install substrate --git https://github.com/paritytech/substrate.git --tag polkadot-v1.2.0; then
            echo -e "${GREEN}✅ Substrate installed successfully with tag polkadot-v1.2.0${NC}"
        elif cargo install substrate --git https://github.com/paritytech/substrate.git --tag polkadot-v1.1.0; then
            echo -e "${GREEN}✅ Substrate installed successfully with tag polkadot-v1.1.0${NC}"
        elif cargo install substrate --git https://github.com/paritytech/substrate.git --tag polkadot-v1.0.0; then
            echo -e "${GREEN}✅ Substrate installed successfully with tag polkadot-v1.0.0${NC}"
        elif cargo install substrate --git https://github.com/paritytech/substrate.git --branch master --rev 8c5e936; then
            echo -e "${GREEN}✅ Substrate installed successfully from specific commit${NC}"
        elif cargo install substrate --git https://github.com/paritytech/substrate.git --branch master; then
            echo -e "${GREEN}✅ Substrate installed successfully from master branch${NC}"
        else
            echo -e "${RED}❌ Failed to install Substrate${NC}"
            echo -e "${YELLOW}Please try manual installation:${NC}"
            echo -e "  cargo install substrate --git https://github.com/paritytech/substrate.git --tag polkadot-v1.4.0"
            echo -e "  or"
            echo -e "  cargo install substrate --git https://github.com/paritytech/substrate.git --branch master --rev 8c5e936"
            echo -e "  or"
            echo -e "  cargo install substrate"
            echo -e ""
            echo -e "${YELLOW}See INSTALL-SUBSTRATE.md for detailed instructions${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Cargo not found. Please install Rust first:${NC}"
        echo -e "  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Substrate CLI found: $(substrate --version)${NC}"

# Kill existing processes on ports
echo -e "${YELLOW}Checking for existing processes...${NC}"
lsof -ti:9944 | xargs kill -9 2>/dev/null
lsof -ti:9933 | xargs kill -9 2>/dev/null
sleep 2

# Create logs directory
mkdir -p logs

# Generate unique node name
NODE_ID=$(date +%s)
NODE_NAME="Polka-Fusion-Node-${NODE_ID}"

echo -e "${BLUE}📋 Node Configuration:${NC}"
echo -e "${CYAN}  Node Name:${NC} $NODE_NAME"
echo -e "${CYAN}  WebSocket:${NC} ws://127.0.0.1:9944"
echo -e "${CYAN}  HTTP RPC:${NC} http://127.0.0.1:9933"
echo -e "${CYAN}  Log File:${NC} logs/node-${NODE_ID}.log"

echo -e "${BLUE}👥 Test Accounts (Pre-funded):${NC}"
echo -e "${CYAN}  Alice:${NC} 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
echo -e "${CYAN}  Bob:${NC}   5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"
echo -e "${CYAN}  Charlie:${NC} 5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mpw0h9pKd"

echo -e "${BLUE}🔗 Polkadot.js Apps:${NC}"
echo -e "${CYAN}  https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:9944${NC}"

echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "${GREEN}1.${NC} Wait for 'Substrate listening for new connections' message"
echo -e "${GREEN}2.${NC} In another terminal, run: npm run visualize"
echo -e "${GREEN}3.${NC} Or deploy contracts: npm run deploy"

echo -e "${BLUE}🚀 Starting Substrate node...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the node${NC}"
echo -e "${BLUE}================================${NC}"

# Start the node with basic configuration
substrate \
    --dev \
    --tmp \
    --name "$NODE_NAME" \
    --ws-external \
    --rpc-external \
    --rpc-cors all \
    --unsafe-ws-external \
    --unsafe-rpc-external \
    --validator \
    --base-path /tmp/substrate-${NODE_ID} 