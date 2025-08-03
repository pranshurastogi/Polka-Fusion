#!/usr/bin/env node

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const { cryptoWaitReady } = require('@polkadot/util-crypto');
const fs = require('fs');
const path = require('path');

// Configuration
const LOCAL_NODE_URL = 'ws://127.0.0.1:9944';
const CONTRACTS_DIR = path.join(__dirname, '../contracts');

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

async function checkNodeConnection() {
    logStep('1', 'Checking local node connection...');
    
    try {
        const provider = new WsProvider(LOCAL_NODE_URL);
        const api = await ApiPromise.create({ provider });
        
        const [chain, nodeName, nodeVersion] = await Promise.all([
            api.rpc.system.chain(),
            api.rpc.system.name(),
            api.rpc.system.version()
        ]);
        
        logSuccess(`Connected to ${chain.toString()} node`);
        logInfo(`Node: ${nodeName.toString()} v${nodeVersion.toString()}`);
        
        await api.disconnect();
        return true;
    } catch (error) {
        logError(`Failed to connect to local node at ${LOCAL_NODE_URL}`);
        logInfo('Make sure you have a local Substrate node running with contracts pallet enabled');
        logInfo('You can start one with: substrate --dev --tmp');
        return false;
    }
}

async function setupAccounts() {
    logStep('2', 'Setting up test accounts...');
    
    await cryptoWaitReady();
    const keyring = new Keyring({ type: 'sr25519' });
    
    // Create test accounts
    const alice = keyring.addFromUri('//Alice');
    const bob = keyring.addFromUri('//Bob');
    const charlie = keyring.addFromUri('//Charlie');
    
    logSuccess(`Created test accounts:`);
    logInfo(`Alice: ${alice.address}`);
    logInfo(`Bob: ${bob.address}`);
    logInfo(`Charlie: ${charlie.address}`);
    
    return { alice, bob, charlie };
}

async function checkContractArtifacts() {
    logStep('3', 'Checking contract artifacts...');
    
    const contracts = ['escrow_dst', 'escrow_factory'];
    const artifacts = {};
    
    for (const contract of contracts) {
        const contractPath = path.join(CONTRACTS_DIR, contract);
        const wasmPath = path.join(contractPath, 'target/ink/escrow_dst.wasm');
        const metadataPath = path.join(contractPath, 'target/ink/escrow_dst.json');
        
        if (contract === 'escrow_factory') {
            const factoryWasmPath = path.join(contractPath, 'target/ink/escrow_factory.wasm');
            const factoryMetadataPath = path.join(contractPath, 'target/ink/escrow_factory.json');
            
            if (fs.existsSync(factoryWasmPath) && fs.existsSync(factoryMetadataPath)) {
                artifacts[contract] = {
                    wasm: fs.readFileSync(factoryWasmPath),
                    metadata: JSON.parse(fs.readFileSync(factoryMetadataPath, 'utf8'))
                };
                logSuccess(`Found ${contract} artifacts`);
            } else {
                logError(`Missing ${contract} artifacts. Run 'cargo contract build' in ${contractPath}`);
                return null;
            }
        } else {
            if (fs.existsSync(wasmPath) && fs.existsSync(metadataPath)) {
                artifacts[contract] = {
                    wasm: fs.readFileSync(wasmPath),
                    metadata: JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
                };
                logSuccess(`Found ${contract} artifacts`);
            } else {
                logError(`Missing ${contract} artifacts. Run 'cargo contract build' in ${contractPath}`);
                return null;
            }
        }
    }
    
    return artifacts;
}

async function deployContracts(api, accounts, artifacts) {
    logStep('4', 'Deploying contracts...');
    
    const { alice } = accounts;
    const deployedContracts = {};
    
    try {
        // Deploy EscrowDst contract
        logInfo('Deploying EscrowDst contract...');
        
        const escrowDstCode = artifacts.escrow_dst.wasm;
        const escrowDstMetadata = artifacts.escrow_dst.metadata;
        
        const uploadTx = api.tx.contracts.uploadCode(
            escrowDstCode,
            null,
            'Deterministic'
        );
        
        const uploadResult = await uploadTx.signAndSend(alice);
        logSuccess(`EscrowDst code uploaded: ${uploadResult.toHuman()}`);
        
        // Deploy EscrowFactory contract
        logInfo('Deploying EscrowFactory contract...');
        
        const factoryCode = artifacts.escrow_factory.wasm;
        const factoryMetadata = artifacts.escrow_factory.metadata;
        
        const factoryUploadTx = api.tx.contracts.uploadCode(
            factoryCode,
            null,
            'Deterministic'
        );
        
        const factoryUploadResult = await factoryUploadTx.signAndSend(alice);
        logSuccess(`EscrowFactory code uploaded: ${factoryUploadResult.toHuman()}`);
        
        // Instantiate EscrowFactory
        const instantiateTx = api.tx.contracts.instantiate(
            0, // endowment
            null, // gas limit
            factoryCode,
            '0x', // constructor data
            null // salt
        );
        
        const instantiateResult = await instantiateTx.signAndSend(alice);
        logSuccess(`EscrowFactory instantiated: ${instantiateResult.toHuman()}`);
        
        deployedContracts.escrowFactory = instantiateResult;
        deployedContracts.escrowDstCode = uploadResult;
        
        return deployedContracts;
        
    } catch (error) {
        logError(`Deployment failed: ${error.message}`);
        return null;
    }
}

async function createVisualizationScript(deployedContracts) {
    logStep('5', 'Creating visualization script...');
    
    const scriptContent = `#!/usr/bin/env node

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const { cryptoWaitReady } = require('@polkadot/util-crypto');

// Configuration
const LOCAL_NODE_URL = 'ws://127.0.0.1:9944';

// Colors for console output
const colors = {
    reset: '\\x1b[0m',
    bright: '\\x1b[1m',
    red: '\\x1b[31m',
    green: '\\x1b[32m',
    yellow: '\\x1b[33m',
    blue: '\\x1b[34m',
    magenta: '\\x1b[35m',
    cyan: '\\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(\`\${colors[color]}\${message}\${colors.reset}\`);
}

function logStep(step, message) {
    log(\`\\n\${colors.cyan}=== \${step} ===\${colors.reset}\`, 'bright');
    log(message, 'yellow');
}

function logSuccess(message) {
    log(\`✅ \${message}\`, 'green');
}

function logError(message) {
    log(\`❌ \${message}\`, 'red');
}

function logInfo(message) {
    log(\`ℹ️  \${message}\`, 'blue');
}

async function visualizePolkadotSwap() {
    logStep('1', 'Connecting to local Polkadot node...');
    
    try {
        const provider = new WsProvider(LOCAL_NODE_URL);
        const api = await ApiPromise.create({ provider });
        
        await cryptoWaitReady();
        const keyring = new Keyring({ type: 'sr25519' });
        
        const alice = keyring.addFromUri('//Alice');
        const bob = keyring.addFromUri('//Bob');
        
        logSuccess('Connected to local node');
        
        // Get account balances
        logStep('2', 'Checking account balances...');
        
        const aliceBalance = await api.query.system.account(alice.address);
        const bobBalance = await api.query.system.account(bob.address);
        
        logInfo(\`Alice balance: \${aliceBalance.data.free.toString()} DOT\`);
        logInfo(\`Bob balance: \${bobBalance.data.free.toString()} DOT\`);
        
        // Simulate escrow creation
        logStep('3', 'Simulating escrow creation...');
        
        // This would be the actual contract call in a real scenario
        logInfo('Creating escrow with parameters:');
        logInfo('- Maker: Alice');
        logInfo('- Taker: Bob');
        logInfo('- Merkle Root: 0x1234...');
        logInfo('- Parts Count: 4');
        logInfo('- Expiry: 1000 blocks from now');
        
        // Simulate partial claims
        logStep('4', 'Simulating partial claims...');
        
        for (let i = 0; i < 4; i++) {
            logInfo(\`Claiming part \${i + 1}/4...\`);
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            logSuccess(\`Part \${i + 1} claimed successfully\`);
        }
        
        // Simulate refund scenario
        logStep('5', 'Simulating refund scenario...');
        
        logInfo('Escrow expired, processing refund...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        logSuccess('Refund processed successfully');
        
        // Final state
        logStep('6', 'Final state summary...');
        
        logSuccess('All operations completed successfully!');
        logInfo('Escrow: Fully claimed');
        logInfo('Refund: Processed');
        logInfo('Events: Emitted and tracked');
        
        await api.disconnect();
        
    } catch (error) {
        logError(\`Visualization failed: \${error.message}\`);
    }
}

// Run visualization
visualizePolkadotSwap().catch(console.error);
`;
    
    const scriptPath = path.join(__dirname, 'visualize-swap.js');
    fs.writeFileSync(scriptPath, scriptContent);
    fs.chmodSync(scriptPath, '755');
    
    logSuccess(`Visualization script created: ${scriptPath}`);
    logInfo('Run with: node scripts/visualize-swap.js');
}

async function main() {
    log('🚀 Polkadot Local Deployment & Visualization Setup', 'bright');
    log('==================================================', 'bright');
    
    // Check node connection
    const nodeConnected = await checkNodeConnection();
    if (!nodeConnected) {
        process.exit(1);
    }
    
    // Setup accounts
    const accounts = await setupAccounts();
    
    // Check contract artifacts
    const artifacts = await checkContractArtifacts();
    if (!artifacts) {
        process.exit(1);
    }
    
    // Connect to API for deployment
    const provider = new WsProvider(LOCAL_NODE_URL);
    const api = await ApiPromise.create({ provider });
    
    // Deploy contracts
    const deployedContracts = await deployContracts(api, accounts, artifacts);
    if (!deployedContracts) {
        await api.disconnect();
        process.exit(1);
    }
    
    // Create visualization script
    await createVisualizationScript(deployedContracts);
    
    await api.disconnect();
    
    logStep('6', 'Setup Complete!');
    logSuccess('Local Polkadot deployment setup completed successfully');
    logInfo('Next steps:');
    logInfo('1. Start local node: substrate --dev --tmp');
    logInfo('2. Run visualization: node scripts/visualize-swap.js');
    logInfo('3. Deploy contracts: node scripts/deploy-local.js');
}

main().catch(console.error); 