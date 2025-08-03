#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Installing Substrate Binary (Alternative Method)${NC}"
echo -e "${BLUE}==================================================${NC}"

# Check if Substrate is already installed
if command -v substrate &> /dev/null; then
    echo -e "${GREEN}✅ Substrate CLI already found: $(substrate --version)${NC}"
    exit 0
fi

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

echo -e "${YELLOW}Detected OS: $OS, Architecture: $ARCH${NC}"

# Set download URL based on OS and architecture
if [[ "$OS" == "darwin" ]]; then
    if [[ "$ARCH" == "x86_64" ]]; then
        DOWNLOAD_URL="https://github.com/paritytech/substrate/releases/latest/download/substrate-macos-x86_64.tar.gz"
        BINARY_NAME="substrate-macos-x86_64"
    elif [[ "$ARCH" == "arm64" ]]; then
        DOWNLOAD_URL="https://github.com/paritytech/substrate/releases/latest/download/substrate-macos-aarch64.tar.gz"
        BINARY_NAME="substrate-macos-aarch64"
    else
        echo -e "${RED}❌ Unsupported architecture: $ARCH${NC}"
        exit 1
    fi
elif [[ "$OS" == "linux" ]]; then
    if [[ "$ARCH" == "x86_64" ]]; then
        DOWNLOAD_URL="https://github.com/paritytech/substrate/releases/latest/download/substrate-linux-x86_64.tar.gz"
        BINARY_NAME="substrate-linux-x86_64"
    else
        echo -e "${RED}❌ Unsupported architecture: $ARCH${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Unsupported OS: $OS${NC}"
    exit 1
fi

echo -e "${YELLOW}Downloading Substrate binary...${NC}"
echo -e "${CYAN}URL: $DOWNLOAD_URL${NC}"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

# Download the binary
if curl -L -o substrate.tar.gz "$DOWNLOAD_URL"; then
    echo -e "${GREEN}✅ Download successful${NC}"
else
    echo -e "${RED}❌ Download failed${NC}"
    echo -e "${YELLOW}Trying alternative download method...${NC}"
    
    # Try alternative URLs
    ALTERNATIVE_URLS=(
        "https://github.com/paritytech/substrate/releases/download/v0.1.0/$BINARY_NAME.tar.gz"
        "https://github.com/paritytech/substrate/releases/download/v0.0.1/$BINARY_NAME.tar.gz"
    )
    
    for alt_url in "${ALTERNATIVE_URLS[@]}"; do
        echo -e "${YELLOW}Trying: $alt_url${NC}"
        if curl -L -o substrate.tar.gz "$alt_url"; then
            echo -e "${GREEN}✅ Alternative download successful${NC}"
            break
        fi
    done
    
    if [ ! -f substrate.tar.gz ]; then
        echo -e "${RED}❌ All download attempts failed${NC}"
        echo -e "${YELLOW}Please install manually using cargo:${NC}"
        echo -e "  cargo install substrate --git https://github.com/paritytech/substrate.git --tag polkadot-v1.4.0"
        exit 1
    fi
fi

# Extract the binary
echo -e "${YELLOW}Extracting binary...${NC}"
if tar -xzf substrate.tar.gz; then
    echo -e "${GREEN}✅ Extraction successful${NC}"
else
    echo -e "${RED}❌ Extraction failed${NC}"
    exit 1
fi

# Find the substrate binary
SUBSTRATE_BIN=$(find . -name "substrate" -type f 2>/dev/null | head -1)

if [ -z "$SUBSTRATE_BIN" ]; then
    echo -e "${RED}❌ Substrate binary not found in archive${NC}"
    exit 1
fi

# Make it executable
chmod +x "$SUBSTRATE_BIN"

# Install to system
INSTALL_DIR="$HOME/.local/bin"
if [ ! -d "$INSTALL_DIR" ]; then
    mkdir -p "$INSTALL_DIR"
fi

echo -e "${YELLOW}Installing to $INSTALL_DIR...${NC}"
cp "$SUBSTRATE_BIN" "$INSTALL_DIR/substrate"

# Add to PATH if not already there
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo -e "${YELLOW}Adding $INSTALL_DIR to PATH...${NC}"
    echo "export PATH=\"$INSTALL_DIR:\$PATH\"" >> ~/.bashrc
    echo "export PATH=\"$INSTALL_DIR:\$PATH\"" >> ~/.zshrc
    export PATH="$INSTALL_DIR:$PATH"
fi

# Clean up
cd /
rm -rf "$TEMP_DIR"

# Verify installation
if command -v substrate &> /dev/null; then
    echo -e "${GREEN}✅ Substrate installed successfully: $(substrate --version)${NC}"
    echo -e "${BLUE}🎉 Installation complete!${NC}"
    echo -e "${YELLOW}Note: You may need to restart your terminal or run:${NC}"
    echo -e "  source ~/.bashrc  # or source ~/.zshrc"
else
    echo -e "${RED}❌ Installation verification failed${NC}"
    echo -e "${YELLOW}Please try manually:${NC}"
    echo -e "  export PATH=\"$INSTALL_DIR:\$PATH\""
    echo -e "  substrate --version"
fi 