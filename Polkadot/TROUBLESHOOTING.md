# 🐛 Troubleshooting Guide

This guide helps resolve common issues when setting up the Polkadot Fusion+ local development environment.

## 🚨 Common Issues

### Issue 1: `fflonk` Dependency Error

**Error Message:**
```
no matching package named `fflonk` found
location searched: Git repository https://github.com/w3f/fflonk
```

**Solutions:**

#### Solution A: Use Binary Installation (Recommended)
```bash
# Install pre-built binary (avoids compilation issues)
npm run install-substrate

# Or run directly
./scripts/install-substrate-binary.sh
```

#### Solution B: Use Older Stable Tags
```bash
# Try these stable versions
cargo install substrate --git https://github.com/paritytech/substrate.git --tag polkadot-v1.4.0
cargo install substrate --git https://github.com/paritytech/substrate.git --tag polkadot-v1.3.0
cargo install substrate --git https://github.com/paritytech/substrate.git --tag polkadot-v1.2.0
```

#### Solution C: Use Specific Commit
```bash
# Use a specific working commit
cargo install substrate --git https://github.com/paritytech/substrate.git --branch master --rev 8c5e936
```

#### Solution D: Install from Crates.io
```bash
# Install from crates.io (may be older but stable)
cargo install substrate
```

### Issue 2: Port Already in Use

**Error Message:**
```
Address already in use (os error 48)
```

**Solutions:**
```bash
# Kill processes on required ports
lsof -ti:9944 | xargs kill -9
lsof -ti:9933 | xargs kill -9

# Or use different ports
substrate --dev --tmp --ws-port 9945 --rpc-port 9934
```

### Issue 3: Permission Denied

**Error Message:**
```
Permission denied (os error 13)
```

**Solutions:**
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Check file permissions
ls -la scripts/

# Fix ownership if needed
sudo chown $(whoami) scripts/
```

### Issue 4: Cargo Not Found

**Error Message:**
```
cargo: command not found
```

**Solutions:**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Reload shell
source ~/.cargo/env

# Or restart terminal
```

### Issue 5: Build Dependencies Missing

**Error Message:**
```
error: failed to run custom build script for `openssl-sys`
```

**Solutions:**

#### macOS:
```bash
# Install with Homebrew
brew install openssl pkg-config

# Set environment variables
export OPENSSL_ROOT_DIR=$(brew --prefix openssl)
export OPENSSL_LIB_DIR=$(brew --prefix openssl)/lib
```

#### Ubuntu/Debian:
```bash
# Install dependencies
sudo apt update
sudo apt install build-essential clang libssl-dev pkg-config
```

#### CentOS/RHEL:
```bash
# Install dependencies
sudo yum groupinstall "Development Tools"
sudo yum install openssl-devel pkg-config
```

### Issue 6: Network Connection Issues

**Error Message:**
```
error: failed to fetch `https://github.com/paritytech/substrate.git`
```

**Solutions:**
```bash
# Use HTTPS instead of git
git config --global url."https://".insteadOf git://

# Or use SSH
git config --global url."git@github.com:".insteadOf https://github.com/

# Try with verbose output
cargo install substrate --git https://github.com/paritytech/substrate.git --verbose
```

### Issue 7: Memory Issues During Compilation

**Error Message:**
```
error: could not compile due to previous errors
```

**Solutions:**
```bash
# Increase swap space (Linux)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Use binary installation instead
npm run install-substrate
```

### Issue 8: Node Won't Start

**Error Message:**
```
Error: Substrate listening for new connections
```

**Solutions:**
```bash
# Check if node is already running
ps aux | grep substrate

# Kill existing processes
pkill -f substrate

# Try with minimal configuration
substrate --dev --tmp --name test-node
```

## 🔧 Quick Fixes

### Method 1: Binary Installation (Fastest)
```bash
cd Polkadot
npm run install-substrate
npm run start-node-simple
```

### Method 2: Manual Installation
```bash
# Install stable version
cargo install substrate --git https://github.com/paritytech/substrate.git --tag polkadot-v1.4.0

# Start node
cd Polkadot
npm run start-node-simple
```

### Method 3: Docker Alternative
```bash
# Use Docker if available
docker run -p 9944:9944 -p 9933:9933 paritytech/substrate:latest --dev --tmp --ws-external --rpc-external
```

## 🎯 Verification Steps

### Check Substrate Installation
```bash
# Verify installation
substrate --version

# Check help
substrate --help
```

### Check Node Connection
```bash
# Test WebSocket connection
curl -H "Content-Type: application/json" \
  -d '{"id":1, "jsonrpc":"2.0", "method": "system_name", "params":[]}' \
  http://localhost:9933
```

### Check Port Availability
```bash
# Check if ports are free
lsof -i :9944
lsof -i :9933
```

## 📋 System Requirements

### Minimum Requirements
- **RAM**: 4GB (8GB recommended)
- **Storage**: 10GB free space
- **CPU**: 2+ cores
- **OS**: Linux, macOS, Windows (WSL)

### Recommended Requirements
- **RAM**: 16GB or more
- **Storage**: 50GB free space
- **CPU**: 4+ cores
- **Network**: Stable internet connection

## 🆘 Getting Help

### Check Logs
```bash
# Check node logs
tail -f logs/node-*.log

# Check cargo build logs
cargo install substrate --git https://github.com/paritytech/substrate.git --verbose
```

### Common Commands
```bash
# List all available scripts
npm run

# Check script permissions
ls -la scripts/

# Test individual components
npm run test-contracts
npm run build-contracts
```

### Environment Variables
```bash
# Set for better performance
export RUSTFLAGS="-C target-cpu=native"
export CARGO_NET_GIT_FETCH_WITH_CLI=true
```

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. **Substrate Installation**: `✅ Substrate CLI found: substrate 0.1.0`
2. **Node Startup**: `📡 Substrate listening for new connections on 127.0.0.1:9944`
3. **Visualization**: Color-coded output showing the Fusion+ swap simulation
4. **Contracts**: Successful compilation and deployment

## 📞 Support

If you're still experiencing issues:

1. **Check the logs** in the `logs/` directory
2. **Try the binary installation** method first
3. **Use an older stable tag** for Substrate
4. **Ensure sufficient system resources** are available
5. **Check network connectivity** for downloads

---

**Happy Troubleshooting! 🔧**

Most issues can be resolved using the binary installation method or older stable tags. 