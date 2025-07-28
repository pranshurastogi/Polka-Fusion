# Polka-Fusion Ethereum Contracts

## Overview
This repo contains the Escrow and EscrowFactory smart contracts for the Polka-Fusion project. 

## Prerequisites
- Node.js >= 16
- npm or yarn or pnpm
- [Hardhat](https://hardhat.org/)
- Sepolia testnet account and RPC endpoint

## Setup

1. **Install dependencies:**
   ```bash
   cd Ethereum
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your values:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env`:
     ```env
     SEPOLIA_RPC_URL=YOUR_SEPOLIA_RPC_URL
     PRIVATE_KEY=YOUR_PRIVATE_KEY
     ```

## Deployment

### Deploy to Sepolia
```bash
npx hardhat run scripts/deploy-and-log.js --network <your-network>
```

### Deploy to Local Hardhat Node
```bash
npx hardhat node
# In another terminal:
npx hardhat ignition deploy --network hardhat ./ignition/modules/EscrowModule.js
```

The deployment script will print the deployed addresses for Escrow and EscrowFactory.

## Contracts
- `Escrow.sol`: The escrow contract logic.
- `EscrowFactory.sol`: Factory for deploying minimal proxy Escrow contracts.

## Environment Variables
See `.env.example` for required variables.

▶️ Escrow deployed at: 0x69FcCf60557a09b3ee7dEE419730E30633470ea6
▶️ EscrowFactory deployed at: 0x551734289977B41b952486e8f3B25a9D4ee701f9