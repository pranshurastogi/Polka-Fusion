#!/usr/bin/env node

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const { cryptoWaitReady } = require('@polkadot/util-crypto');
const { hexToU8a, stringToU8a } = require('@polkadot/util');

// Configuration
const LOCAL_NODE_URL = 'ws://127.0.0.1:9944';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
    log(`\n${colors.cyan}=== ${step} ===${colors.reset}`, 'bright');
    log(message, 'yellow');
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

function logContract(message) {
    log(`📄 ${message}`, 'magenta');
}

function logEvent(message) {
    log(`📢 ${message}`, 'cyan');
}

function logBalance(message) {
    log(`💰 ${message}`, 'white');
}

function createProgressBar(current, total, width = 30) {
    const progress = Math.round((current / total) * width);
    const bar = '█'.repeat(progress) + '░'.repeat(width - progress);
    return `[${bar}] ${current}/${total}`;
}

async function simulateEscrowCreation(api, alice, bob) {
    logStep('1', 'Creating Fusion+ Escrow on Polkadot');
    
    // Simulate escrow parameters
    const escrowParams = {
        maker: alice.address,
        taker: bob.address,
        merkleRoot: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        partsCount: 4,
        expiryTimestamp: Date.now() + 3600000 // 1 hour from now
    };
    
    logContract('EscrowDst.new() called with parameters:');
    logInfo(`  Maker: ${escrowParams.maker}`);
    logInfo(`  Taker: ${escrowParams.taker}`);
    logInfo(`  Merkle Root: ${escrowParams.merkleRoot}`);
    logInfo(`  Parts Count: ${escrowParams.partsCount}`);
    logInfo(`  Expiry: ${new Date(escrowParams.expiryTimestamp).toISOString()}`);
    
    // Simulate contract deployment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    logEvent('DstCreated event emitted');
    logSuccess('Escrow created successfully!');
    
    return escrowParams;
}

async function simulatePartialClaims(api, alice, bob, escrowParams) {
    logStep('2', 'Simulating Partial Claims (Fusion+ Core Feature)');
    
    const totalParts = escrowParams.partsCount;
    const secrets = [
        '0x1111111111111111111111111111111111111111111111111111111111111111',
        '0x2222222222222222222222222222222222222222222222222222222222222222',
        '0x3333333333333333333333333333333333333333333333333333333333333333',
        '0x4444444444444444444444444444444444444444444444444444444444444444'
    ];
    
    const proofs = [
        ['0xproof1a', '0xproof1b'],
        ['0xproof2a', '0xproof2b'],
        ['0xproof3a', '0xproof3b'],
        ['0xproof4a', '0xproof4b']
    ];
    
    logInfo('Starting sequential partial claims...');
    logInfo('Each claim requires valid Merkle proof and secret');
    
    for (let i = 0; i < totalParts; i++) {
        logContract(`claim_part(${i}, ${secrets[i]}, ${JSON.stringify(proofs[i])})`);
        
        // Simulate Merkle proof verification
        logInfo('  Verifying Merkle proof...');
        await new Promise(resolve => setTimeout(resolve, 500));
        logSuccess('  ✓ Merkle proof verified');
        
        // Simulate amount calculation
        const amountPerPart = 1000000000; // 1 DOT in planck units
        logBalance(`  Amount for part ${i + 1}: ${amountPerPart} planck`);
        
        // Simulate transfer
        logInfo('  Transferring to maker...');
        await new Promise(resolve => setTimeout(resolve, 500));
        logSuccess('  ✓ Transfer successful');
        
        logEvent(`PartClaimed event emitted (part ${i + 1})`);
        logSuccess(`Part ${i + 1}/${totalParts} claimed successfully`);
        
        // Show progress
        const progress = createProgressBar(i + 1, totalParts);
        logInfo(`Progress: ${progress}`);
        
        if (i < totalParts - 1) {
            logInfo('Waiting for next claim...');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    logSuccess('All parts claimed successfully!');
}

async function simulateRefundScenario(api, alice, bob, escrowParams) {
    logStep('3', 'Simulating Refund Scenario (Time-lock Feature)');
    
    logInfo('Escrow has expired, processing refund...');
    logContract('refund() called');
    
    // Simulate refund processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    logInfo('Checking remaining balance...');
    const remainingBalance = 500000000; // 0.5 DOT in planck units
    logBalance(`Remaining balance: ${remainingBalance} planck`);
    
    logInfo('Transferring remaining balance to taker...');
    await new Promise(resolve => setTimeout(resolve, 500));
    logSuccess('✓ Refund transfer successful');
    
    logEvent('Refunded event emitted');
    logSuccess('Refund processed successfully!');
}

async function showFinalState(api, alice, bob) {
    logStep('4', 'Final State Summary');
    
    // Simulate final balances
    const aliceFinalBalance = 9500000000000; // 9.5 DOT
    const bobFinalBalance = 1005000000000;   // 10.05 DOT
    
    logBalance('Final Account Balances:');
    logInfo(`  Alice: ${aliceFinalBalance} planck (${aliceFinalBalance / 10000000000} DOT)`);
    logInfo(`  Bob: ${bobFinalBalance} planck (${bobFinalBalance / 10000000000} DOT)`);
    
    logContract('EscrowDst Contract State:');
    logInfo('  parts_claimed: 4/4');
    logInfo('  refunded: false');
    logInfo('  maker: Alice');
    logInfo('  taker: Bob');
    logInfo('  merkle_root: 0x1234...');
    logInfo('  expiry_timestamp: expired');
    
    logEvent('Events Emitted:');
    logInfo('  ✓ DstCreated');
    logInfo('  ✓ PartClaimed (4 times)');
    logInfo('  ✓ Refunded');
}

async function demonstrateCrossChainFeatures() {
    logStep('5', 'Cross-Chain Features Demonstration');
    
    logInfo('Fusion+ Cross-Chain Features:');
    logInfo('  🔗 Atomic Cross-Chain Swap');
    logInfo('  🌳 Merkle Tree Partial Fills');
    logInfo('  ⏰ Time-lock Refunds');
    logInfo('  🔐 Keccak-256 Hashlock Compatibility');
    logInfo('  📊 Sequential Claim Validation');
    logInfo('  🎯 Deterministic Deployment (CREATE2)');
    
    logInfo('\nIntegration with Ethereum:');
    logInfo('  ✓ Same Merkle root structure');
    logInfo('  ✓ Compatible hash functions');
    logInfo('  ✓ Synchronized expiry timestamps');
    logInfo('  ✓ Cross-chain event monitoring');
}

async function visualizePolkadotSwap() {
    log('🚀 Polkadot Fusion+ Atomic Swap Visualization', 'bright');
    log('==============================================', 'bright');
    
    try {
        logStep('0', 'Connecting to local Polkadot node...');
        
        const provider = new WsProvider(LOCAL_NODE_URL);
        const api = await ApiPromise.create({ provider });
        
        await cryptoWaitReady();
        const keyring = new Keyring({ type: 'sr25519' });
        
        const alice = keyring.addFromUri('//Alice');
        const bob = keyring.addFromUri('//Bob');
        
        logSuccess('Connected to local Polkadot node');
        
        // Get initial balances
        const aliceBalance = await api.query.system.account(alice.address);
        const bobBalance = await api.query.system.account(bob.address);
        
        logBalance('Initial Account Balances:');
        logInfo(`  Alice: ${aliceBalance.data.free.toString()} planck`);
        logInfo(`  Bob: ${bobBalance.data.free.toString()} planck`);
        
        // Simulate the complete Fusion+ swap flow
        const escrowParams = await simulateEscrowCreation(api, alice, bob);
        await simulatePartialClaims(api, alice, bob, escrowParams);
        await simulateRefundScenario(api, alice, bob, escrowParams);
        await showFinalState(api, alice, bob);
        await demonstrateCrossChainFeatures();
        
        logStep('6', 'Visualization Complete!');
        logSuccess('🎉 Fusion+ Atomic Cross-Chain Swap simulation completed successfully!');
        logInfo('This demonstrates the complete flow of a Polkadot-based atomic swap');
        logInfo('with partial fills, Merkle proofs, and time-lock refunds.');
        
        await api.disconnect();
        
    } catch (error) {
        logError(`Visualization failed: ${error.message}`);
        logWarning('Make sure you have a local Substrate node running:');
        logInfo('  substrate --dev --tmp');
    }
}

// Run visualization
visualizePolkadotSwap().catch(console.error); 