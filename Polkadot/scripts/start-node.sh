#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
NODE_NAME="Polka-Fusion-Node"
CHAIN_SPEC="Development"
WS_PORT="9944"
RPC_PORT="9933"
PROMETHEUS_PORT="9615"

echo -e "${BLUE}🚀 Starting Local Substrate Node for Polkadot Fusion+${NC}"
echo -e "${BLUE}==================================================${NC}"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    local port=$1
    if port_in_use $port; then
        echo -e "${YELLOW}⚠️  Port $port is in use. Killing existing process...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to log with timestamp
log() {
    echo -e "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to install substrate with better error handling
install_substrate() {
    local install_success=false
    
    # Try different installation methods
    local install_methods=(
        "cargo install substrate --git https://github.com/paritytech/substrate.git --tag polkadot-v1.6.0"
        "cargo install substrate --git https://github.com/paritytech/substrate.git --tag polkadot-v1.5.0"
        "cargo install substrate --git https://github.com/paritytech/substrate.git --tag polkadot-v1.4.0"
        "cargo install substrate --git https://github.com/paritytech/substrate.git --tag polkadot-v1.3.0"
        "cargo install substrate --git https://github.com/paritytech/substrate.git --tag polkadot-v1.2.0"
        "cargo install substrate --git https://github.com/paritytech/substrate.git --tag polkadot-v1.1.0"
        "cargo install substrate --git https://github.com/paritytech/substrate.git --tag polkadot-v1.0.0"
        "cargo install substrate --git https://github.com/paritytech/substrate.git --branch master --rev 8c5e936"
        "cargo install substrate --git https://github.com/paritytech/substrate.git --branch master"
        "cargo install substrate"
    )
    
    for method in "${install_methods[@]}"; do
        echo -e "${YELLOW}Trying: $method${NC}"
        if eval "$method"; then
            echo -e "${GREEN}✅ Substrate installed successfully${NC}"
            install_success=true
            break
        else
            echo -e "${YELLOW}❌ Failed, trying next method...${NC}"
        fi
    done
    
    if [ "$install_success" = false ]; then
        echo -e "${RED}❌ All installation methods failed${NC}"
        echo -e "${YELLOW}Please try manual installation:${NC}"
        echo -e "  See INSTALL-SUBSTRATE.md for detailed instructions"
        return 1
    fi
    
    return 0
}

# Check if Substrate is installed
log "Checking Substrate installation..."
if ! command_exists substrate; then
    echo -e "${RED}❌ Substrate CLI not found!${NC}"
    echo -e "${YELLOW}Installing Substrate CLI...${NC}"
    
    # Try to install substrate
    if command_exists cargo; then
        echo -e "${YELLOW}Installing via cargo...${NC}"
        if ! install_substrate; then
            exit 1
        fi
    else
        echo -e "${RED}❌ Cargo not found. Please install Rust first:${NC}"
        echo -e "  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
        echo -e "  source ~/.cargo/env"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Substrate CLI found: $(substrate --version)${NC}"

# Check and kill existing processes on required ports
log "Checking port availability..."
kill_port $WS_PORT
kill_port $RPC_PORT
kill_port $PROMETHEUS_PORT

# Create logs directory
mkdir -p logs

# Generate unique node name
NODE_ID=$(date +%s)
NODE_NAME="${NODE_NAME}-${NODE_ID}"

# Display node configuration
echo -e "${BLUE}📋 Node Configuration:${NC}"
echo -e "${CYAN}  Node Name:${NC} $NODE_NAME"
echo -e "${CYAN}  Chain Spec:${NC} $CHAIN_SPEC"
echo -e "${CYAN}  WebSocket Port:${NC} $WS_PORT"
echo -e "${CYAN}  RPC Port:${NC} $RPC_PORT"
echo -e "${CYAN}  Prometheus Port:${NC} $PROMETHEUS_PORT"
echo -e "${CYAN}  Log File:${NC} logs/node-${NODE_ID}.log"

# Create startup script with proper escaping
STARTUP_SCRIPT="logs/startup-${NODE_ID}.sh"
cat > "$STARTUP_SCRIPT" << 'EOF'
#!/bin/bash
# Auto-generated startup script for Polka-Fusion node
# Generated on: $(date)

echo "Starting Substrate node with configuration:"
echo "  Node: $NODE_NAME"
echo "  Chain: $CHAIN_SPEC"
echo "  WS: ws://127.0.0.1:$WS_PORT"
echo "  RPC: http://127.0.0.1:$RPC_PORT"
echo "  Prometheus: http://127.0.0.1:$PROMETHEUS_PORT"

# Start the node
substrate \
    --dev \
    --tmp \
    --name "$NODE_NAME" \
    --ws-external \
    --rpc-external \
    --rpc-cors all \
    --rpc-methods unsafe \
    --prometheus-external \
    --unsafe-ws-external \
    --unsafe-rpc-external \
    --no-hardware-benchmarks \
    --no-mdns \
    --no-private-ipv4 \
    --validator \
    --base-path /tmp/substrate-${NODE_ID} \
    --chain $CHAIN_SPEC \
    --ws-port $WS_PORT \
    --rpc-port $RPC_PORT \
    --prometheus-port $PROMETHEUS_PORT \
    --telemetry-url "wss://telemetry.polkadot.io/submit/ 0" \
    --database RocksDb \
    --pruning 1000 \
    --keep-blocks 1000 \
    --max-runtime-instances 8 \
    --execution Wasm \
    --wasm-execution Compiled \
    --runtime-cache-size 64 \
    --state-cache-size 2 \
    --max-parallel-downloads 5 \
    --wasmtime-instantiation-strategy lazy
EOF

# Replace variables in the startup script
sed -i.bak "s/\$NODE_NAME/$NODE_NAME/g" "$STARTUP_SCRIPT"
sed -i.bak "s/\$CHAIN_SPEC/$CHAIN_SPEC/g" "$STARTUP_SCRIPT"
sed -i.bak "s/\$WS_PORT/$WS_PORT/g" "$STARTUP_SCRIPT"
sed -i.bak "s/\$RPC_PORT/$RPC_PORT/g" "$STARTUP_SCRIPT"
sed -i.bak "s/\$PROMETHEUS_PORT/$PROMETHEUS_PORT/g" "$STARTUP_SCRIPT"
sed -i.bak "s/\$NODE_ID/$NODE_ID/g" "$STARTUP_SCRIPT"
rm -f "${STARTUP_SCRIPT}.bak"

chmod +x "$STARTUP_SCRIPT"

# Display connection information
echo -e "${BLUE}🔗 Connection Information:${NC}"
echo -e "${CYAN}  WebSocket:${NC} ws://127.0.0.1:$WS_PORT"
echo -e "${CYAN}  HTTP RPC:${NC} http://127.0.0.1:$RPC_PORT"
echo -e "${CYAN}  Prometheus:${NC} http://127.0.0.1:$PROMETHEUS_PORT"
echo -e "${CYAN}  Polkadot.js Apps:${NC} https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:$WS_PORT"

# Display test accounts
echo -e "${BLUE}👥 Test Accounts (Pre-funded):${NC}"
echo -e "${CYAN}  Alice:${NC} 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
echo -e "${CYAN}  Bob:${NC}   5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"
echo -e "${CYAN}  Charlie:${NC} 5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mpw0h9pKd"

# Display next steps
echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "${GREEN}1.${NC} Node will start in development mode"
echo -e "${GREEN}2.${NC} Wait for 'Substrate listening for new connections' message"
echo -e "${GREEN}3.${NC} In another terminal, run: npm run visualize"
echo -e "${GREEN}4.${NC} Or deploy contracts: npm run deploy"

# Start the node
echo -e "${BLUE}🚀 Starting Substrate node...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the node${NC}"
echo -e "${BLUE}================================${NC}"

# Run the startup script with error handling
if [ -f "$STARTUP_SCRIPT" ]; then
    exec "$STARTUP_SCRIPT"
else
    echo -e "${RED}❌ Startup script not found: $STARTUP_SCRIPT${NC}"
    exit 1
fi 