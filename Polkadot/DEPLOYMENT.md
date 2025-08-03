# 🚀 Polkadot Fusion+ Local Deployment Guide

This guide will help you set up and run the Polkadot Fusion+ atomic cross-chain swap locally with full visualization capabilities.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js 16+** - [Download here](https://nodejs.org/)
- **Rust & Cargo** - [Install here](https://rustup.rs/)
- **Substrate CLI** - For running local node
- **Git** - For cloning the repository

## 🛠️ Quick Setup

### 1. Install Dependencies

```bash
# Navigate to the Polkadot directory
cd Polkadot

# Run the setup script (automatically installs everything)
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Start Local Substrate Node

```bash
# Start a local Substrate development node
substrate --dev --tmp
```

This will start a local Polkadot node with:
- Contracts pallet enabled
- Development accounts (Alice, Bob, Charlie)
- WebSocket endpoint at `ws://127.0.0.1:9944`

### 3. Run Visualization

In a new terminal:

```bash
# Navigate to Polkadot directory
cd Polkadot

# Run the visualization script
npm run visualize
```

## 🎯 What You'll See

The visualization script demonstrates:

### 1. **Escrow Creation** 📄
- Contract deployment with parameters
- Maker and taker setup
- Merkle root configuration
- Expiry timestamp setting

### 2. **Partial Claims** 🌳
- Sequential claim processing
- Merkle proof verification
- Amount calculations
- Progress tracking
- Event emissions

### 3. **Refund Processing** ⏰
- Time-lock expiration
- Remaining balance calculation
- Refund transfer
- Event emission

### 4. **Final State** 📊
- Account balance updates
- Contract state summary
- Event log
- Cross-chain features

## 🔧 Manual Setup (Alternative)

If you prefer manual setup:

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install cargo-contract
cargo install cargo-contract --force
```

### 2. Build Contracts

```bash
# Build EscrowDst contract
cd contracts/escrow_dst
cargo contract build
cd ../..

# Build EscrowFactory contract
cd contracts/escrow_factory
cargo contract build
cd ../..
```

### 3. Test Contracts

```bash
# Test EscrowDst
cd contracts/escrow_dst
cargo test
cd ../..

# Test EscrowFactory
cd contracts/escrow_factory
cargo test
cd ../..
```

## 📁 Project Structure

```
Polkadot/
├── contracts/
│   ├── escrow_dst/          # Destination escrow contract
│   │   ├── lib.rs           # Core HTLC logic
│   │   ├── Cargo.toml       # Dependencies
│   │   └── target/ink/      # Compiled artifacts
│   └── escrow_factory/      # Factory contract
│       ├── lib.rs           # Deployment logic
│       ├── Cargo.toml       # Dependencies
│       └── target/ink/      # Compiled artifacts
├── scripts/
│   ├── deploy-local.js      # Deployment script
│   ├── visualize-swap.js    # Visualization script
│   └── setup.sh            # Setup script
├── package.json             # Node.js dependencies
└── DEPLOYMENT.md           # This file
```

## 🎮 Available Scripts

### NPM Scripts

```bash
# Deploy contracts to local node
npm run deploy

# Run visualization
npm run visualize

# Build all contracts
npm run build-contracts

# Test all contracts
npm run test-contracts

# Start local node
npm run start-node
```

### Direct Scripts

```bash
# Setup everything
./scripts/setup.sh

# Deploy contracts
node scripts/deploy-local.js

# Visualize swap
node scripts/visualize-swap.js
```

## 🔍 Understanding the Visualization

### Color Coding

- **🔵 Blue**: Information and status updates
- **🟢 Green**: Success messages
- **🔴 Red**: Error messages
- **🟡 Yellow**: Warnings and important notes
- **🟣 Magenta**: Contract function calls
- **🟢 Cyan**: Event emissions
- **⚪ White**: Balance information

### Key Features Demonstrated

1. **Atomic Cross-Chain Swap** 🔗
   - Trustless exchange between chains
   - Synchronized operations

2. **Merkle Tree Partial Fills** 🌳
   - Efficient partial claim verification
   - Sequential claim validation

3. **Time-lock Refunds** ⏰
   - Automatic refund after expiry
   - Security mechanism

4. **Keccak-256 Compatibility** 🔐
   - Cross-chain hashlock compatibility
   - Ethereum integration ready

5. **Deterministic Deployment** 🎯
   - CREATE2 equivalent functionality
   - Predictable contract addresses

## 🐛 Troubleshooting

### Common Issues

#### 1. Node Connection Failed
```bash
# Error: Failed to connect to local node
```
**Solution**: Make sure Substrate node is running:
```bash
substrate --dev --tmp
```

#### 2. Contract Build Failed
```bash
# Error: Missing contract artifacts
```
**Solution**: Build contracts first:
```bash
npm run build-contracts
```

#### 3. Dependencies Missing
```bash
# Error: Cannot find module '@polkadot/api'
```
**Solution**: Install dependencies:
```bash
npm install
```

#### 4. Cargo Contract Not Found
```bash
# Error: cargo-contract command not found
```
**Solution**: Install cargo-contract:
```bash
cargo install cargo-contract --force
```

### Debug Mode

For detailed debugging, run with verbose output:

```bash
# Verbose deployment
DEBUG=* npm run deploy

# Verbose visualization
DEBUG=* npm run visualize
```

## 🔗 Integration with Ethereum

This Polkadot implementation is designed to work with the Ethereum side:

- **Same Merkle Structure**: Compatible Merkle tree implementation
- **Hashlock Compatibility**: Keccak-256 for cross-chain verification
- **Synchronized Timestamps**: Coordinated expiry times
- **Event Monitoring**: Cross-chain event tracking

## 📈 Next Steps

After running the visualization:

1. **Deploy to Testnet**: Use Rococo testnet for real testing
2. **Integrate with Ethereum**: Connect with Ethereum contracts
3. **Add UI**: Build a web interface for easier interaction
4. **Security Audit**: Conduct thorough security review
5. **Production Deployment**: Deploy to mainnet

## 🤝 Contributing

To contribute to the Polkadot implementation:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review the logs for error messages
3. Ensure all prerequisites are installed
4. Verify the local node is running

---

**Happy Swapping! 🚀**

This implementation demonstrates the power of cross-chain atomic swaps with partial fills, providing a foundation for trustless asset exchange between Polkadot and Ethereum. 