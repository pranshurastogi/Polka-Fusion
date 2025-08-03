# Polkadot Fusion+ Atomic Cross-Chain Swap

This directory contains the Polkadot side implementation of the Fusion+ atomic cross-chain swap using ink! smart contracts on a Substrate contracts chain.

## Overview

The Polkadot implementation consists of two main contracts:

1. **EscrowFactory**: Deploys EscrowDst instances deterministically using a salt (equivalent to CREATE2)
2. **EscrowDst**: Implements the destination-chain side of the atomic cross-chain swap with:
   - Maker & taker AccountIds
   - Merkle root of N+1 secrets
   - Parts count and expiry timestamp
   - Sequential partial-fill unlocks
   - Keccak-256 hashing for cross-chain compatibility
   - Structured events for off-chain monitoring

## Prerequisites

### Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

### Install cargo-contract
```bash
cargo install cargo-contract --force
```

### Install Node.js and npm
```bash
# On macOS
brew install node

# On Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Setup

### 1. Clone and Setup the Project
```bash
cd Polkadot/contracts
```

### 2. Build Contracts
```bash
# Build EscrowFactory
cd escrow_factory
cargo contract build

# Build EscrowDst
cd ../escrow_dst
cargo contract build
```

### 3. Run Local Contracts Node

#### Option A: Using Substrate Contracts Node
```bash
# Install Substrate
cargo install --git https://github.com/paritytech/substrate.git --tag v0.9.42 substrate

# Run local contracts node
substrate --dev --ws-external --rpc-external --rpc-cors=all --unsafe-ws-external --unsafe-rpc-external
```

#### Option B: Using Rococo Testnet
```bash
# Connect to Rococo testnet
# Use Polkadot-JS Apps: https://polkadot.js.org/apps/?rpc=wss://rococo-rpc.polkadot.io
```

### 4. Deploy Contracts

#### Deploy EscrowDst Contract
```bash
# Upload EscrowDst code
cargo contract upload --suri //Alice --url ws://localhost:9944 target/ink/escrow_dst.wasm

# Note the code hash from the output
```

#### Deploy EscrowFactory Contract
```bash
# Upload EscrowFactory code
cargo contract upload --suri //Alice --url ws://localhost:9944 target/ink/escrow_factory.wasm

# Instantiate EscrowFactory with EscrowDst code hash
cargo contract instantiate --suri //Alice --url ws://localhost:9944 target/ink/escrow_factory.wasm --constructor new --args <ESCROW_DST_CODE_HASH>
```

## Testing

### Run Unit Tests
```bash
# Test EscrowFactory
cd escrow_factory
cargo test

# Test EscrowDst
cd ../escrow_dst
cargo test
```

### Run E2E Tests
```bash
# Make sure local node is running
cargo test --features e2e-tests
```

## Contract Interaction

### Via Polkadot-JS Apps

1. **Connect to Network**:
   - Local: `ws://localhost:9944`
   - Rococo: `wss://rococo-rpc.polkadot.io`

2. **Upload Contracts**:
   - Go to Developer → Contracts → Upload
   - Upload the compiled `.wasm` files

3. **Instantiate Contracts**:
   - Use the instantiate function with required parameters
   - For EscrowFactory: provide EscrowDst code hash
   - For EscrowDst: provide maker, taker, merkle_root, parts_count, expiry_timestamp

4. **Interact with Contracts**:
   - Call `deploy_escrow` on EscrowFactory
   - Call `claim_part` on EscrowDst with Merkle proof
   - Call `refund` on EscrowDst after expiry

### Via CLI

#### Deploy EscrowDst
```bash
# Upload code
cargo contract upload --suri //Alice --url ws://localhost:9944 target/ink/escrow_dst.wasm

# Instantiate with parameters
cargo contract instantiate \
  --suri //Alice \
  --url ws://localhost:9944 \
  target/ink/escrow_dst.wasm \
  --constructor new \
  --args <MAKER_ACCOUNT_ID> <TAKER_ACCOUNT_ID> <MERKLE_ROOT> <PARTS_COUNT> <EXPIRY_TIMESTAMP>
```

#### Deploy EscrowFactory
```bash
# Upload code
cargo contract upload --suri //Alice --url ws://localhost:9944 target/ink/escrow_factory.wasm

# Instantiate with EscrowDst code hash
cargo contract instantiate \
  --suri //Alice \
  --url ws://localhost:9944 \
  target/ink/escrow_factory.wasm \
  --constructor new \
  --args <ESCROW_DST_CODE_HASH>
```

#### Deploy Escrow via Factory
```bash
# Call deploy_escrow on factory
cargo contract call \
  --suri //Alice \
  --url ws://localhost:9944 \
  <FACTORY_CONTRACT_ADDRESS> \
  --message deploy_escrow \
  --args <SALT> <MAKER> <TAKER> <MERKLE_ROOT> <PARTS_COUNT> <EXPIRY_TIMESTAMP>
```

## Contract Functions

### EscrowFactory

- `new(escrow_dst_code_hash: Hash)`: Constructor
- `deploy_escrow(salt: Hash, maker: AccountId, taker: AccountId, merkle_root: Hash, parts_count: u32, expiry_timestamp: u64)`: Deploy new escrow
- `get_deployed_escrow(salt: Hash)`: Get deployed escrow address
- `get_escrow_dst_code_hash()`: Get EscrowDst code hash

### EscrowDst

- `new(maker: AccountId, taker: AccountId, merkle_root: Hash, parts_count: u32, expiry_timestamp: u64)`: Constructor
- `claim_part(proof: Vec<Hash>, secret: Hash, part_index: u32)`: Claim a part using Merkle proof
- `refund()`: Refund remaining balance to taker after expiry
- `get_escrow_details()`: Get escrow details

## Events

### EscrowFactory Events
- `EscrowDeployed`: Emitted when a new escrow is deployed

### EscrowDst Events
- `DstCreated`: Emitted when escrow is created
- `PartClaimed`: Emitted when a part is claimed
- `Refunded`: Emitted when escrow is refunded

## Error Handling

### EscrowFactory Errors
- `EscrowAlreadyExists`: Escrow with this salt already exists
- `DeploymentFailed`: Contract deployment failed

### EscrowDst Errors
- `EscrowRefunded`: Escrow has been refunded
- `EscrowExpired`: Escrow has expired
- `EscrowNotExpired`: Escrow has not expired yet
- `EscrowAlreadyRefunded`: Escrow already refunded
- `InvalidPartIndex`: Part index is invalid
- `PartAlreadyClaimed`: Part already claimed
- `InvalidMerkleProof`: Invalid Merkle proof
- `TransferFailed`: Transfer operation failed

## Testing Scenarios

The contracts include comprehensive tests covering:

1. **Full-fill scenario**: All parts claimed successfully
2. **Partial-fill scenario**: Only some parts claimed
3. **Out-of-order secret**: Attempting to claim parts out of sequence
4. **Refund scenario**: Refunding after expiry
5. **Error conditions**: Invalid inputs, expired escrows, etc.

## Integration with Ethereum

This Polkadot implementation works in conjunction with the Ethereum contracts to provide atomic cross-chain swaps:

1. **Announcement Phase**: Both sides agree on parameters
2. **Deposit Phase**: Maker deposits on Ethereum, taker deposits on Polkadot
3. **Withdrawal Phase**: Sequential partial-fill unlocks on both chains
4. **Recovery Phase**: Refund mechanisms if needed

## Troubleshooting

### Common Issues

1. **Contract upload fails**:
   - Ensure local node is running
   - Check account has sufficient balance
   - Verify wasm file is properly compiled

2. **Instantiation fails**:
   - Verify constructor arguments are correct
   - Check account permissions
   - Ensure sufficient balance for instantiation

3. **Tests fail**:
   - Run `cargo clean` and rebuild
   - Check ink! version compatibility
   - Verify test environment setup

### Debug Commands

```bash
# Check contract storage
cargo contract call --dry-run

# View contract events
# Use Polkadot-JS Apps → Developer → Events

# Check account balance
# Use Polkadot-JS Apps → Accounts
```

## Security Considerations

1. **Merkle Proof Verification**: Uses Keccak-256 for cross-chain compatibility
2. **Sequential Claims**: Enforces order to prevent out-of-order attacks
3. **Expiry Handling**: Proper time-lock refund mechanisms
4. **Balance Tracking**: Accurate partial-fill calculations
5. **Event Emission**: Structured events for off-chain monitoring

## Next Steps

1. Deploy to Rococo testnet for integration testing
2. Implement relayer for cross-chain communication
3. Add PSP22 token support for non-native assets
4. Integrate with Ethereum side for end-to-end testing
5. Add monitoring and alerting systems 