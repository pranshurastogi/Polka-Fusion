# 🚀 Local Substrate Node Startup Guide

This guide provides multiple ways to start a local Substrate node for testing the Polkadot Fusion+ atomic cross-chain swap.

## 📋 Quick Start

### Method 1: Simple Node Startup (Recommended)
```bash
# Navigate to Polkadot directory
cd Polkadot

# Start node with simple configuration
npm run start-node-simple
```

### Method 2: Full Node Startup (Advanced)
```bash
# Start node with full configuration
npm run start-node-full
```

### Method 3: Basic Node Startup
```bash
# Start node with minimal configuration
npm run start-node
```

## 🔧 Script Details

### 1. Simple Node Script (`start-node-simple.sh`)
- ✅ **Automatic Substrate installation** if not found
- ✅ **Port conflict resolution** - kills existing processes
- ✅ **Basic configuration** for development
- ✅ **Pre-funded test accounts** (Alice, Bob, Charlie)
- ✅ **WebSocket and RPC endpoints**

**Features:**
- WebSocket: `ws://127.0.0.1:9944`
- HTTP RPC: `http://127.0.0.1:9933`
- Development mode with temporary database
- Contracts pallet enabled
- CORS enabled for web apps

### 2. Full Node Script (`start-node.sh`)
- ✅ **Advanced configuration** with all optimizations
- ✅ **Prometheus metrics** endpoint
- ✅ **Telemetry integration**
- ✅ **Performance optimizations**
- ✅ **Detailed logging**

**Features:**
- WebSocket: `ws://127.0.0.1:9944`
- HTTP RPC: `http://127.0.0.1:9933`
- Prometheus: `http://127.0.0.1:9615`
- Telemetry: Connected to Polkadot telemetry
- Performance: Optimized for development

### 3. Basic Node Script (`start-node`)
- ✅ **Minimal configuration**
- ✅ **Standard Substrate defaults**
- ✅ **Quick startup**

## 🎯 What You'll See

When you run any of the scripts, you'll see:

```
🚀 Starting Local Substrate Node for Polkadot Fusion+
==================================================

✅ Substrate CLI found: substrate 0.1.0
Checking for existing processes...

📋 Node Configuration:
  Node Name: Polka-Fusion-Node-1691088000
  WebSocket: ws://127.0.0.1:9944
  HTTP RPC: http://127.0.0.1:9933
  Log File: logs/node-1691088000.log

👥 Test Accounts (Pre-funded):
  Alice: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
  Bob:   5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty
  Charlie: 5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mpw0h9pKd

🔗 Polkadot.js Apps:
  https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:9944

📋 Next Steps:
1. Wait for 'Substrate listening for new connections' message
2. In another terminal, run: npm run visualize
3. Or deploy contracts: npm run deploy

🚀 Starting Substrate node...
Press Ctrl+C to stop the node
================================
```

## 🔗 Connection Information

### WebSocket Endpoints
- **Simple/Full**: `ws://127.0.0.1:9944`
- **Basic**: `ws://127.0.0.1:9944`

### HTTP RPC Endpoints
- **Simple/Full**: `http://127.0.0.1:9933`
- **Basic**: `http://127.0.0.1:9933`

### Prometheus Metrics (Full only)
- **Full**: `http://127.0.0.1:9615`

### Polkadot.js Apps
- **All**: `https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:9944`

## 👥 Test Accounts

All scripts provide pre-funded test accounts:

| Account | Address | Balance |
|---------|---------|---------|
| Alice | `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY` | 1000 DOT |
| Bob | `5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty` | 1000 DOT |
| Charlie | `5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mpw0h9pKd` | 1000 DOT |

## 🎮 Available Commands

### NPM Scripts
```bash
# Simple node startup (recommended)
npm run start-node-simple

# Full node startup (advanced)
npm run start-node-full

# Basic node startup
npm run start-node

# Run visualization
npm run visualize

# Deploy contracts
npm run deploy
```

### Direct Scripts
```bash
# Simple node
./scripts/start-node-simple.sh

# Full node
./scripts/start-node.sh

# Basic node
substrate --dev --tmp
```

## 🔍 Node Status Verification

### Check if Node is Running
```bash
# Check WebSocket connection
curl -H "Content-Type: application/json" \
  -d '{"id":1, "jsonrpc":"2.0", "method": "system_name", "params":[]}' \
  http://localhost:9933

# Check RPC connection
curl -H "Content-Type: application/json" \
  -d '{"id":1, "jsonrpc":"2.0", "method": "system_chain", "params":[]}' \
  http://localhost:9933
```

### Expected Response
```json
{
  "jsonrpc": "2.0",
  "result": "Substrate Node",
  "id": 1
}
```

## 🐛 Troubleshooting

### Issue 1: Substrate not found
```bash
# Install Substrate CLI
cargo install substrate --git https://github.com/paritytech/substrate.git --tag polkadot-v1.7.0
```

### Issue 2: Port already in use
```bash
# Kill processes on ports
lsof -ti:9944 | xargs kill -9
lsof -ti:9933 | xargs kill -9
```

### Issue 3: Permission denied
```bash
# Make scripts executable
chmod +x scripts/start-node.sh scripts/start-node-simple.sh
```

### Issue 4: Node won't start
```bash
# Check Rust installation
rustc --version
cargo --version

# Update Rust if needed
rustup update
```

## 📊 Node Features

### Development Mode
- ✅ **Contracts Pallet**: For smart contract deployment
- ✅ **Development Accounts**: Pre-funded test accounts
- ✅ **Temporary Database**: Cleared on restart
- ✅ **Block Production**: Automatic block creation
- ✅ **Genesis State**: Pre-configured for development

### Network Features
- ✅ **WebSocket API**: For JavaScript connections
- ✅ **HTTP RPC API**: For HTTP requests
- ✅ **CORS Enabled**: For web applications
- ✅ **External Connections**: Allowed from any IP

### Performance Features (Full only)
- ✅ **Prometheus Metrics**: Performance monitoring
- ✅ **Telemetry**: Connected to Polkadot network
- ✅ **Optimized Caching**: Better performance
- ✅ **Parallel Downloads**: Faster synchronization

## 🎯 Next Steps After Node Startup

1. **Wait for Connection Message**
   ```
   📡 Substrate listening for new connections on 127.0.0.1:9944.
   ```

2. **Run Visualization** (in another terminal)
   ```bash
   npm run visualize
   ```

3. **Deploy Contracts** (optional)
   ```bash
   npm run deploy
   ```

4. **Open Polkadot.js Apps**
   ```
   https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:9944
   ```

## 🔄 Complete Workflow

```bash
# Terminal 1: Start node
cd Polkadot
npm run start-node-simple

# Terminal 2: Run visualization
cd Polkadot
npm run visualize

# Terminal 3: Deploy contracts (optional)
cd Polkadot
npm run deploy
```

## 📝 Log Files

Logs are stored in the `logs/` directory:
- `logs/node-{timestamp}.log` - Node logs
- `logs/startup-{timestamp}.sh` - Generated startup scripts

## 🚀 Performance Tips

### For Development
- Use `start-node-simple.sh` for quick testing
- Use temporary database (`--tmp`) for clean state
- Restart node frequently to clear state

### For Testing
- Use `start-node-full.sh` for comprehensive testing
- Monitor metrics at `http://127.0.0.1:9615`
- Use Polkadot.js Apps for manual testing

---

**Happy Node Running! 🚀**

Your local Substrate node is now ready for Polkadot Fusion+ development and testing! 