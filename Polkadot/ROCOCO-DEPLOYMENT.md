# 🚀 Rococo Testnet Deployment Guide

This guide will help you deploy the Polkadot Fusion+ contracts to the Rococo testnet.

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js 16+** - [Download here](https://nodejs.org/)
- **Rust & Cargo** - [Install here](https://rustup.rs/)
- **Git** - For cloning the repository
- **A Polkadot account** with ROC tokens

## 🛠️ Quick Setup

### 1. Run the Setup Script

```bash
# Navigate to the Polkadot directory
cd Polkadot

# Run the Rococo setup script
chmod +x scripts/setup-roccoo.sh
./scripts/setup-roccoo.sh
```

This script will:
- Check and install all dependencies
- Build the contracts
- Set up the deployment environment

### 2. Get ROC Tokens

You need ROC tokens for deployment. Get them from:
- **Rococo Faucet**: https://rococo-faucet.polkadot.io/
- **Parity Faucet**: https://matrix.to/#/#rococo-faucet:matrix.org

**Minimum Required**: 10 ROC tokens (deployment costs ~5-10 ROC)

### 3. Set Your Deployment Account

```bash
# Set your mnemonic phrase (replace with your actual phrase)
export DEPLOYMENT_MNEMONIC="your twelve word mnemonic phrase here"
```

⚠️ **Important**: 
- Keep your mnemonic phrase secure
- Never share it with anyone
- Make sure your account has enough ROC tokens

### 4. Deploy to Rococo

```bash
# Run the deployment
npm run deploy-roccoo
```

## 📊 What Gets Deployed

The deployment script will deploy two contracts:

### 1. **EscrowDst Contract** 📄
- **Purpose**: Handles atomic cross-chain swaps
- **Features**: 
  - Merkle tree partial fills
  - Time-lock refunds
  - Keccak-256 compatibility
  - Cross-chain event tracking

### 2. **EscrowFactory Contract** 🏭
- **Purpose**: Factory for creating new escrow contracts
- **Features**:
  - Deterministic deployment
  - CREATE2 equivalent functionality
  - Contract management

## 🔍 Deployment Process

The deployment script performs these steps:

1. **Connect to Rococo** - Establishes connection to testnet
2. **Setup Account** - Creates deployment account from mnemonic
3. **Check Balance** - Verifies sufficient ROC tokens
4. **Verify Artifacts** - Ensures contracts are built
5. **Deploy Contracts** - Deploys both contracts sequentially
6. **Verify Deployment** - Confirms contracts are deployed
7. **Save Information** - Stores deployment details

## 📁 Output Files

After successful deployment, the script creates:

### `deployment-roccoo.json`
```json
{
  "network": "Rococo Testnet",
  "deployedAt": "2024-01-15T10:30:00.000Z",
  "contracts": {
    "escrow_dst": "5F...",
    "escrow_factory": "5F..."
  },
  "rpcUrl": "wss://rococo-rpc.polkadot.io",
  "explorer": "https://rococo.subscan.io/"
}
```

## 🔗 Useful Links

### Network Information
- **RPC URL**: `wss://rococo-rpc.polkadot.io`
- **Explorer**: https://rococo.subscan.io/
- **Polkadot.js Apps**: https://polkadot.js.org/apps/?rpc=wss://rococo-rpc.polkadot.io

### Faucets
- **Rococo Faucet**: https://rococo-faucet.polkadot.io/
- **Parity Matrix**: https://matrix.to/#/#rococo-faucet:matrix.org

## 🎮 Available Commands

### NPM Scripts

```bash
# Setup for Rococo deployment
npm run setup-roccoo

# Deploy to Rococo testnet
npm run deploy-roccoo

# Build contracts
npm run build-contracts

# Test contracts locally
npm run test-contracts

# Deploy to local node
npm run deploy
```

### Direct Scripts

```bash
# Setup everything
./scripts/setup-roccoo.sh

# Deploy to Rococo
node scripts/deploy-roccoo.js
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Insufficient Balance
```
❌ Failed to deploy: 1014: Priority is too low
```
**Solution**: Get more ROC tokens from the faucet

#### 2. Connection Failed
```
❌ Failed to connect to Rococo testnet
```
**Solution**: Check your internet connection and try again

#### 3. Missing Artifacts
```
❌ WASM file not found for escrow_dst
```
**Solution**: Run `npm run build-contracts` first

#### 4. Invalid Mnemonic
```
❌ Failed to create account from mnemonic
```
**Solution**: Check your mnemonic phrase is correct

#### 5. Gas Estimation Failed
```
❌ Gas estimation failed
```
**Solution**: Increase gas limit or check contract code

### Debug Mode

For detailed debugging:

```bash
# Verbose deployment
DEBUG=* npm run deploy-roccoo

# Check logs
tail -f logs/deployment.log
```

## 🔐 Security Considerations

### Before Deployment
- ✅ Test contracts locally first
- ✅ Review contract code thoroughly
- ✅ Ensure sufficient ROC balance
- ✅ Backup your mnemonic phrase

### After Deployment
- ✅ Verify contract addresses
- ✅ Test contract functionality
- ✅ Save deployment information
- ✅ Monitor for any issues

## 📈 Next Steps

After successful deployment:

1. **Test the Contracts** - Verify all functionality works
2. **Integrate with Frontend** - Connect your UI to the contracts
3. **Monitor Performance** - Watch for any issues
4. **Prepare for Mainnet** - Plan production deployment

## 🤝 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review the deployment logs
3. Ensure all prerequisites are met
4. Verify your account has sufficient balance

## 📞 Getting Help

- **GitHub Issues**: Create an issue in the repository
- **Documentation**: Check the main README.md
- **Community**: Join Polkadot Discord/Matrix channels

---

**Happy Deploying! 🚀**

This deployment will give you a fully functional atomic cross-chain swap system on the Rococo testnet, ready for testing and integration. 