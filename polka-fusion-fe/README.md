# Polka Fusion Frontend

A realistic cross-chain atomic swap interface that simulates the complete escrow system between Ethereum and Polkadot networks.

## 🚀 Features

### Smart Contract Integration
- **Ethereum EscrowSrc**: Factory-based deployment with Merkle tree verification
- **Polkadot EscrowDst**: Ink! smart contract for cross-chain completion
- **Part-based Claiming**: Sequential claiming with unique secrets and Merkle proofs
- **Time-locked Refunds**: Automatic refund mechanism after expiry

### Frontend Functionality
- **Realistic Escrow Simulation**: Complete workflow from setup to completion
- **Merkle Tree Generation**: Dynamic generation of secrets and proofs
- **Part-by-Part Claiming**: Sequential claiming interface with validation
- **Cross-chain Bridge Simulation**: Realistic network bridging process
- **Contract State Display**: Real-time escrow state visualization

## 🏗️ Architecture

### Smart Contracts
```
Ethereum/
├── EscrowFactory.sol     # Factory for deploying EscrowSrc contracts
├── EscrowSrc.sol         # Source escrow with Merkle tree verification
└── MockERC20.sol         # Test token for development

Polkadot/
├── escrow_factory/       # Factory for deploying EscrowDst contracts
└── escrow_dst/          # Destination escrow for cross-chain completion
```

### Frontend Components
```
polka-fusion-fe/
├── app/
│   └── page.tsx         # Main application with escrow interface
├── components/
│   └── ui/              # Reusable UI components
└── lib/
    └── utils.ts         # Utility functions
```

## 🔄 Workflow

### 1. Setup Phase
- User connects wallet (simulated)
- Selects network (Ethereum/Polkadot)
- Views contract architecture overview

### 2. Lock Phase
- Escrow contract deployment simulation
- Merkle tree generation with secrets
- Token locking with verification
- Contract state initialization

### 3. Cross-chain Phase
- Network bridging simulation
- Cross-chain verification process
- Progress tracking with realistic timing

### 4. Claim Phase
- Part-by-part claiming interface
- Secret input validation
- Merkle proof verification
- Sequential claiming enforcement

### 5. Success Phase
- Completion confirmation
- Transaction details display
- Cross-chain balance updates

## 🛠️ Technical Details

### Merkle Tree Implementation
```typescript
interface EscrowState {
  maker: string
  taker: string
  amount: string
  partsCount: number
  expiryTimestamp: number
  merkleRoot: string
  secrets: string[]
  proofs: string[][]
  partsClaimed: number
  refunded: boolean
  balance: string
}
```

### Key Features
- **Deterministic Addresses**: Factory-based deployment with CREATE2
- **Merkle Proof Verification**: Secure part claiming with cryptographic proofs
- **Sequential Claiming**: Parts must be claimed in order
- **Time-locked Refunds**: Automatic refund after expiry
- **Cross-chain Atomicity**: Ensures both chains complete or fail together

## 🎨 UI Components

### Network Tabs
- Ethereum and Polkadot network selection
- Real-time network status indicators

### Progress Stepper
- Visual progress through lock → cross → claim phases
- Step-by-step validation and completion

### Contract State Display
- Real-time escrow contract information
- Merkle tree details and verification status
- Part claiming progress

### Interactive Elements
- Copy-to-clipboard functionality for hashes and addresses
- Real-time validation and error handling
- Responsive design for all screen sizes

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- yarn (recommended) or npm

### Installation
```bash
cd polka-fusion-fe
yarn install
```

### Development
```bash
yarn dev
```

The application will be available at `http://localhost:3000`

### Building for Production
```bash
yarn build
yarn start
```

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_ETHEREUM_RPC_URL=your_ethereum_rpc_url
NEXT_PUBLIC_POLKADOT_RPC_URL=your_polkadot_rpc_url
```

### Smart Contract Addresses
The frontend currently uses simulated contract addresses. For production:
- Update contract addresses in the state
- Integrate with actual blockchain networks
- Add wallet connection functionality

## 🧪 Testing

### Smart Contract Testing
```bash
# Ethereum contracts
cd Ethereum
npm test

# Polkadot contracts
cd Polkadot/contracts/escrow_dst
cargo test
```

### Frontend Testing
```bash
cd polka-fusion-fe
yarn test
```

## 📊 Features in Detail

### Escrow Creation
1. **Factory Deployment**: Uses EscrowFactory to deploy new escrow instances
2. **Merkle Tree Generation**: Creates cryptographic tree for part verification
3. **Token Locking**: Transfers tokens to escrow contract
4. **State Initialization**: Sets up maker, taker, amount, and expiry

### Cross-chain Bridge
1. **Network Verification**: Validates escrow on source chain
2. **Bridge Deployment**: Deploys corresponding escrow on destination
3. **State Synchronization**: Ensures both contracts are ready
4. **Progress Tracking**: Real-time bridge status updates

### Part Claiming
1. **Secret Validation**: Verifies unique secret for each part
2. **Merkle Proof**: Validates cryptographic proof
3. **Sequential Enforcement**: Ensures parts are claimed in order
4. **Token Transfer**: Transfers claimed amount to taker

### Refund Mechanism
1. **Expiry Check**: Validates time-based conditions
2. **Balance Calculation**: Determines remaining unclaimed amount
3. **Refund Transfer**: Returns tokens to maker
4. **State Update**: Marks escrow as refunded

## 🔒 Security Features

- **Merkle Tree Verification**: Cryptographic proof validation
- **Sequential Claiming**: Prevents out-of-order claims
- **Time-locked Refunds**: Automatic refund after expiry
- **Factory Pattern**: Deterministic contract deployment
- **Cross-chain Atomicity**: Ensures both chains complete

## 🎯 Future Enhancements

- [ ] Real wallet integration (MetaMask, Polkadot.js)
- [ ] Actual blockchain network integration
- [ ] Real-time transaction monitoring
- [ ] Advanced Merkle tree visualization
- [ ] Multi-token support
- [ ] Bridge relay integration
- [ ] Mobile app development

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check the smart contract READMEs
- **Community**: Join our Discord for discussions

---

**Built with ❤️ by [@pranshurastogii](https://x.com/pranshurastogii)**

Powered by **1inch+ Fusion** - Cross-chain atomic swaps between Ethereum and Polkadot 