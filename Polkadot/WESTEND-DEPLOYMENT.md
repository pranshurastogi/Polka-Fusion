# 🚀 AssetHub Westend Testnet Deployment Guide

This guide will help you deploy the Polkadot Fusion+ contracts to the AssetHub Westend testnet.

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js 16+** - [Download here](https://nodejs.org/)
- **Rust & Cargo** - [Install here](https://rustup.rs/)
- **Git** - For cloning the repository
- **A Polkadot account** with WND tokens

## 🛠️ Quick Setup

### 1. Run the Setup Script

```bash
# Navigate to the Polkadot directory
cd Polkadot

# Run the setup script
npm run setup-roccoo
```

This script will:
- Check and install all dependencies
- Build the contracts
- Set up the deployment environment

### 2. Your Funded Account

Your account is already funded and ready for deployment:

- **Address**: `5FgansF6kwgVn24YFY4c8xrREa3iArCDZvUUJW6X8e9mMrkN`
- **Balance**: 10.0000 WND
- **Network**: AssetHub Westend Testnet
- **Transaction**: [View on Explorer](https://assethub-westend.subscan.io/extrinsic/0x05a388a02c1ed36662365afc3bf61ad359d2e13b88aa68329eda369e1acb6619)

### 3. Set Your Deployment Account

```bash
# Set your mnemonic phrase
export DEPLOYMENT_MNEMONIC="soul crack pistol harbor find glass slow tip rebel indicate recall opinion"
```

### 4. Deploy to AssetHub Westend

```bash
# Run the deployment
npm run deploy-westend
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

1. **Connect to AssetHub Westend** - Establishes connection to testnet
2. **Setup Account** - Creates deployment account from mnemonic
3. **Check Balance** - Verifies sufficient WND tokens
4. **Verify Artifacts** - Ensures contracts are built
5. **Deploy Contracts** - Deploys both contracts sequentially
6. **Verify Deployment** - Confirms contracts are deployed
7. **Save Information** - Stores deployment details

## 📁 Output Files

After successful deployment, the script creates:

### `deployment-westend.json`
```json
{
  "network": "AssetHub Westend Testnet",
  "deployedAt": "2025-08-03T18:30:00.000Z",
  "contracts": {
    "escrow_dst": "5F...",
    "escrow_factory": "5F..."
  },
  "rpcUrl": "wss://westend-assets-hub-rpc.polkadot.io",
  "explorer": "https://assethub-westend.subscan.io/"
}
```

## 🔗 Useful Links

### Network Information
- **RPC URL**: `wss://westend-assets-hub-rpc.polkadot.io`
- **Explorer**: https://assethub-westend.subscan.io/
- **Polkadot.js Apps**: https://polkadot.js.org/apps/?rpc=wss://westend-assets-hub-rpc.polkadot.io

### Your Account
- **Address**: `5FgansF6kwgVn24YFY4c8xrREa3iArCDZvUUJW6X8e9mMrkN`
- **Explorer**: https://assethub-westend.subscan.io/account/5FgansF6kwgVn24YFY4c8xrREa3iArCDZvUUJW6X8e9mMrkN
- **Balance**: 10.0000 WND

## 🎮 Available Commands

### NPM Scripts

```bash
# Deploy to AssetHub Westend testnet
npm run deploy-westend

# Create new Westend account
npm run create-westend-account

# Build contracts
npm run build-contracts

# Test contracts locally
npm run test-contracts

# Deploy to local node
npm run deploy
```

### Direct Scripts

```bash
# Deploy to Westend
node scripts/deploy-westend.js

# Create new account
node scripts/create-westend-account.js
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Insufficient Balance
```
❌ Failed to deploy: 1014: Priority is too low
```
**Solution**: Your account has 10 WND, which should be sufficient

#### 2. Connection Failed
```
❌ Failed to connect to AssetHub Westend testnet
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
**Solution**: Use the correct mnemonic: `soul crack pistol harbor find glass slow tip rebel indicate recall opinion`

### Debug Mode

For detailed debugging:

```bash
# Verbose deployment
DEBUG=* npm run deploy-westend

# Check logs
tail -f logs/deployment.log
```

## 🔐 Security Considerations

### Before Deployment
- ✅ Your account is already funded
- ✅ Test contracts locally first
- ✅ Review contract code thoroughly
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

Your account is ready with 10 WND tokens. The deployment should proceed smoothly on AssetHub Westend testnet. 