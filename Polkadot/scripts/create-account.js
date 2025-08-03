#!/usr/bin/env node

const { Keyring } = require('@polkadot/keyring');
const { cryptoWaitReady, mnemonicGenerate } = require('@polkadot/util-crypto');
const { ApiPromise, WsProvider } = require('@polkadot/api');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

async function generateNewAccount() {
    log('🔐 Generating new Polkadot account...', 'bright');
    
    await cryptoWaitReady();
    const keyring = new Keyring({ type: 'sr25519' });
    
    // Generate a new mnemonic
    const mnemonic = mnemonicGenerate(12);
    const account = keyring.addFromMnemonic(mnemonic);
    
    logSuccess('New account generated successfully!');
    log('\n📋 Account Details:', 'cyan');
    log(`Address: ${account.address}`, 'green');
    log(`Mnemonic: ${mnemonic}`, 'yellow');
    
    // Save account details to file
    const accountInfo = {
        address: account.address,
        mnemonic: mnemonic,
        createdAt: new Date().toISOString(),
        network: 'Rococo Testnet'
    };
    
    const accountFile = path.join(__dirname, '../account-info.json');
    fs.writeFileSync(accountFile, JSON.stringify(accountInfo, null, 2));
    
    logSuccess(`Account details saved to: ${accountFile}`);
    
    return { account, mnemonic };
}

async function checkBalance(api, address) {
    try {
        const { data: balance } = await api.query.system.account(address);
        const freeBalance = balance.free.toNumber() / 1e10; // Convert from planck to ROC
        
        logInfo(`Current balance: ${freeBalance.toFixed(4)} ROC`);
        return freeBalance;
    } catch (error) {
        logError(`Failed to check balance: ${error.message}`);
        return 0;
    }
}

async function attemptFaucetFunding(address) {
    log('\n🚰 Attempting to get funding from Rococo faucet...', 'bright');
    
    try {
        // Try the web faucet approach
        logInfo('Please visit the Rococo faucet to fund your account:');
        log(`🌐 https://rococo-faucet.polkadot.io/`, 'blue');
        log(`📧 Enter your address: ${address}`, 'green');
        
        // Also try Matrix faucet
        logInfo('Alternative: Join Matrix channel for faucet:');
        log(`💬 https://matrix.to/#/#rococo-faucet:matrix.org`, 'blue');
        log(`📧 Send: !drip ${address}`, 'green');
        
        logWarning('Note: Faucet funding may take a few minutes to appear');
        
    } catch (error) {
        logError(`Faucet request failed: ${error.message}`);
    }
}

async function monitorBalance(api, address, initialBalance) {
    log('\n👀 Monitoring balance for changes...', 'bright');
    logInfo('Waiting for faucet funding (this may take a few minutes)...');
    
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes with 10-second intervals
    
    const checkInterval = setInterval(async () => {
        attempts++;
        const currentBalance = await checkBalance(api, address);
        
        if (currentBalance > initialBalance) {
            logSuccess(`🎉 Funding received! New balance: ${currentBalance.toFixed(4)} ROC`);
            clearInterval(checkInterval);
            return;
        }
        
        if (attempts >= maxAttempts) {
            logWarning('No funding detected after 5 minutes');
            logInfo('You may need to manually request funding from the faucet');
            clearInterval(checkInterval);
            return;
        }
        
        logInfo(`Checking balance... (${attempts}/${maxAttempts})`);
    }, 10000); // Check every 10 seconds
}

async function main() {
    try {
        log('🚀 Creating new Rococo testnet account', 'bright');
        log('=====================================', 'bright');
        
        // Step 1: Generate new account
        const { account, mnemonic } = await generateNewAccount();
        
        // Step 2: Connect to Rococo
        log('\n🔗 Connecting to Rococo testnet...', 'bright');
        const provider = new WsProvider('wss://rococo-rpc.polkadot.io');
        const api = await ApiPromise.create({ provider });
        
        logSuccess('Connected to Rococo testnet');
        
        // Step 3: Check initial balance
        const initialBalance = await checkBalance(api, account.address);
        
        if (initialBalance > 0) {
            logSuccess(`Account already has ${initialBalance.toFixed(4)} ROC`);
        } else {
            logWarning('Account has no balance');
            
            // Step 4: Attempt faucet funding
            await attemptFaucetFunding(account.address);
            
            // Step 5: Monitor for funding
            await monitorBalance(api, account.address, initialBalance);
        }
        
        // Step 6: Final balance check
        const finalBalance = await checkBalance(api, account.address);
        
        log('\n' + '='.repeat(60), 'cyan');
        log('📊 ACCOUNT SUMMARY', 'bright');
        log('='.repeat(60), 'cyan');
        log(`Address: ${account.address}`, 'green');
        log(`Balance: ${finalBalance.toFixed(4)} ROC`, 'green');
        log(`Network: Rococo Testnet`, 'blue');
        log(`Explorer: https://rococo.subscan.io/account/${account.address}`, 'blue');
        
        log('\n🔐 IMPORTANT SECURITY NOTES:', 'yellow');
        log('- Save your mnemonic phrase securely', 'yellow');
        log('- Never share your mnemonic with anyone', 'yellow');
        log('- Keep the account-info.json file safe', 'yellow');
        
        log('\n🚀 NEXT STEPS:', 'cyan');
        log('1. Fund the account if needed', 'blue');
        log('2. Set the deployment mnemonic:', 'blue');
        log(`   export DEPLOYMENT_MNEMONIC="${mnemonic}"`, 'green');
        log('3. Run deployment: npm run deploy-roccoo', 'blue');
        
        await api.disconnect();
        
    } catch (error) {
        logError(`Account creation failed: ${error.message}`);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { main }; 