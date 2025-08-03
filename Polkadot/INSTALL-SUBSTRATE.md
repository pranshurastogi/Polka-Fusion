# 🔧 Manual Substrate Installation Guide

If the automatic installation in the node startup scripts fails, you can install Substrate CLI manually using one of these methods.

## 🚀 Method 1: Install from Latest Master (Recommended)

```bash
# Install from latest master branch
cargo install substrate --git https://github.com/paritytech/substrate.git
```

## 🏷️ Method 2: Install with Specific Tag

```bash
# Try different available tags
cargo install substrate --git https://github.com/paritytech/substrate.git --tag polkadot-v1.6.0

# Or try these alternatives if the above fails
cargo install substrate --git https://github.com/paritytech/substrate.git --tag polkadot-v1.5.0
cargo install substrate --git https://github.com/paritytech/substrate.git --tag polkadot-v1.4.0
```

## 📦 Method 3: Install from Crates.io

```bash
# Install from crates.io (may be older version)
cargo install substrate
```

## 🔍 Method 4: Check Available Tags

If you want to see what tags are available:

```bash
# Clone the repository
git clone https://github.com/paritytech/substrate.git
cd substrate

# List available tags
git tag | grep polkadot | tail -10
```

## ✅ Verification

After installation, verify it works:

```bash
# Check version
substrate --version

# Check help
substrate --help
```

## 🐛 Troubleshooting

### Issue 1: Cargo not found
```bash
# Install Rust first
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

### Issue 2: Build fails
```bash
# Update Rust
rustup update

# Install build dependencies (Ubuntu/Debian)
sudo apt update
sudo apt install build-essential clang libssl-dev pkg-config

# Install build dependencies (macOS)
brew install openssl pkg-config
```

### Issue 3: Permission denied
```bash
# Make sure you have write permissions to cargo directory
ls -la ~/.cargo/bin/
chmod +x ~/.cargo/bin/substrate
```

### Issue 4: Network issues
```bash
# Use a different git protocol or mirror
cargo install substrate --git https://github.com/paritytech/substrate.git --verbose
```

## 🎯 After Installation

Once Substrate is installed, you can run the node startup scripts:

```bash
# Navigate to Polkadot directory
cd Polkadot

# Start node with simple configuration
npm run start-node-simple

# Or start with full configuration
npm run start-node-full
```

## 📋 System Requirements

### Minimum Requirements
- **Rust**: 1.70.0 or later
- **Cargo**: Latest version
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 10GB free space
- **OS**: Linux, macOS, or Windows (WSL)

### Recommended Requirements
- **RAM**: 16GB or more
- **Storage**: 50GB free space
- **CPU**: 4+ cores
- **Network**: Stable internet connection

## 🔄 Alternative: Use Pre-built Binaries

If compilation takes too long, you can download pre-built binaries:

```bash
# For Linux
wget https://github.com/paritytech/substrate/releases/latest/download/substrate-linux-x86_64.tar.gz
tar -xzf substrate-linux-x86_64.tar.gz
sudo mv substrate /usr/local/bin/

# For macOS
wget https://github.com/paritytech/substrate/releases/latest/download/substrate-macos-x86_64.tar.gz
tar -xzf substrate-macos-x86_64.tar.gz
sudo mv substrate /usr/local/bin/
```

## 🎉 Success!

Once Substrate is installed, you're ready to run your local Polkadot Fusion+ node! 🚀 