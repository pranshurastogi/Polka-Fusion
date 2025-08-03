#!/usr/bin/env node

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const { cryptoWaitReady } = require('@polkadot/util-crypto');
const fs = require('fs');
const path = require('path');

// Configuration
const WESTEND_NODE_URL = 'wss://westend-assets-hub-rpc.parity.io';
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

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

async function checkWestendConnection() {
    logStep('1', 'Connecting to AssetHub Westend testnet...');
    
    try {
        const provider = new WsProvider(WESTEND_NODE_URL);
        const api = await ApiPromise.create({ provider });
        
        const [chain, nodeName, nodeVersion] = await Promise.all([
            api.rpc.system.chain(),
            api.rpc.system.name(),
            api.rpc.system.version()
        ]);
        
        logSuccess(`Connected to ${chain.toString()} testnet`);
        logInfo(`Node: ${nodeName.toString()} v${nodeVersion.toString()}`);
        
        return api;
    } catch (error) {
        logError(`Failed to connect to AssetHub Westend testnet at ${WESTEND_NODE_URL}`);
        logError(`Error: ${error.message}`);
        throw error;
    }
}

async function setupDeploymentAccount() {
    logStep('2', 'Setting up deployment account...');
    
    await cryptoWaitReady();
    const keyring = new Keyring({ type: 'sr25519' });
    
    // Check if mnemonic is provided via environment variable
    const mnemonic = process.env.DEPLOYMENT_MNEMONIC;
    
    if (!mnemonic) {
        logError('DEPLOYMENT_MNEMONIC environment variable is required');
        logInfo('Please set your deployment account mnemonic:');
        logInfo('export DEPLOYMENT_MNEMONIC="your twelve word mnemonic phrase here"');
        logWarning('Make sure your account has enough WND tokens for deployment');
        throw new Error('Deployment mnemonic not provided');
    }
    
    try {
        const account = keyring.addFromMnemonic(mnemonic);
        logSuccess(`Deployment account: ${account.address}`);
        return account;
    } catch (error) {
        logError(`Failed to create account from mnemonic: ${error.message}`);
        throw error;
    }
}

async function checkAccountBalance(api, account) {
    logStep('3', 'Checking account balance...');
    
    try {
        const { data: balance } = await api.query.system.account(account.address);
        const freeBalance = balance.free.toNumber() / 1e10; // Convert from planck to WND
        
        logInfo(`Account balance: ${freeBalance.toFixed(4)} WND`);
        
        if (freeBalance < 5) {
            logWarning('Low balance detected. You need at least 5 WND for deployment');
            logInfo('Get WND tokens from: https://assethub-westend.subscan.io/');
        } else {
            logSuccess('Sufficient balance for deployment');
        }
        
        return balance;
    } catch (error) {
        logError(`Failed to check balance: ${error.message}`);
        throw error;
    }
}

async function checkContractArtifacts() {
    logStep('4', 'Checking contract artifacts...');
    
    const contracts = ['escrow_dst', 'escrow_factory'];
    const artifacts = {};
    
    for (const contract of contracts) {
        const contractPath = path.join(CONTRACTS_DIR, contract);
        const wasmPath = path.join(contractPath, `target/ink/${contract}.wasm`);
        const metadataPath = path.join(contractPath, `target/ink/${contract}.json`);
        
        if (!fs.existsSync(wasmPath)) {
            logError(`WASM file not found for ${contract}: ${wasmPath}`);
            logInfo('Please build contracts first: npm run build-contracts');
            throw new Error(`Missing WASM file for ${contract}`);
        }
        
        if (!fs.existsSync(metadataPath)) {
            logError(`Metadata file not found for ${contract}: ${metadataPath}`);
            logInfo('Please build contracts first: npm run build-contracts');
            throw new Error(`Missing metadata file for ${contract}`);
        }
        
        artifacts[contract] = {
            wasm: fs.readFileSync(wasmPath),
            metadata: JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
        };
        
        logSuccess(`Found artifacts for ${contract}`);
    }
    
    return artifacts;
}

async function deployContract(api, account, contractName, artifacts) {
    logStep(`5.${contractName === 'escrow_dst' ? '1' : '2'}`, `Deploying ${contractName} contract...`);
    
    try {
        const { wasm, metadata } = artifacts[contractName];
        
        // Create contract deployment transaction
        const tx = api.tx.contracts.instantiateWithCode(
            0, // endowment (0 for now, will be set by contract)
            1000000000000, // gas limit (1 WND)
            null, // code hash (null for instantiateWithCode)
            wasm, // wasm code
            metadata.abi.constructors[0].args, // constructor arguments
            metadata.abi.constructors[0].selector // constructor selector
        );
        
        // Sign and send transaction
        const hash = await tx.signAndSend(account, { nonce: -1 });
        
        logInfo(`Transaction submitted: ${hash.toHex()}`);
        
        // Wait for transaction to be included in a block
        const { events, status } = await new Promise((resolve, reject) => {
            const unsubscribe = hash.signAndSend(account, { nonce: -1 }, ({ events, status }) => {
                if (status.isInBlock) {
                    unsubscribe();
                    resolve({ events, status });
                }
            });
        });
        
        logSuccess(`Transaction included in block: ${status.asInBlock.toHex()}`);
        
        // Extract contract address from events
        let contractAddress = null;
        events.forEach(({ event }) => {
            if (event.section === 'contracts' && event.method === 'Instantiated') {
                contractAddress = event.data[1].toString();
            }
        });
        
        if (!contractAddress) {
            throw new Error('Contract address not found in events');
        }
        
        logSuccess(`${contractName} deployed at: ${contractAddress}`);
        return contractAddress;
        
    } catch (error) {
        logError(`Failed to deploy ${contractName}: ${error.message}`);
        throw error;
    }
}

async function verifyDeployment(api, deployedContracts) {
    logStep('6', 'Verifying deployment...');
    
    try {
        for (const [contractName, address] of Object.entries(deployedContracts)) {
            const contractInfo = await api.query.contracts.contractInfoOf(address);
            
            if (contractInfo.isSome) {
                logSuccess(`${contractName} contract verified at ${address}`);
            } else {
                logError(`${contractName} contract not found at ${address}`);
            }
        }
    } catch (error) {
        logError(`Failed to verify deployment: ${error.message}`);
        throw error;
    }
}

async function saveDeploymentInfo(deployedContracts) {
    logStep('7', 'Saving deployment information...');
    
    const deploymentInfo = {
        network: 'AssetHub Westend Testnet',
        deployedAt: new Date().toISOString(),
        contracts: deployedContracts,
        rpcUrl: WESTEND_NODE_URL,
        explorer: 'https://assethub-westend.subscan.io/'
    };
    
    const deploymentFile = path.join(__dirname, '../deployment-westend.json');
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    logSuccess(`Deployment info saved to: ${deploymentFile}`);
    
    // Display deployment summary
    log('\n' + '='.repeat(60), 'cyan');
    log('🚀 DEPLOYMENT SUMMARY', 'bright');
    log('='.repeat(60), 'cyan');
    log(`Network: ${deploymentInfo.network}`, 'blue');
    log(`Deployed at: ${deploymentInfo.deployedAt}`, 'blue');
    log(`RPC URL: ${deploymentInfo.rpcUrl}`, 'blue');
    log(`Explorer: ${deploymentInfo.explorer}`, 'blue');
    log('\n📋 Contract Addresses:', 'cyan');
    
    for (const [contractName, address] of Object.entries(deployedContracts)) {
        log(`${contractName}: ${address}`, 'green');
    }
    
    log('\n🔗 Useful Links:', 'cyan');
    log(`- Explorer: ${deploymentInfo.explorer}`, 'blue');
    log(`- Polkadot.js Apps: https://polkadot.js.org/apps/?rpc=${encodeURIComponent(WESTEND_NODE_URL)}`, 'blue');
    
    log('\n⚠️  Important Notes:', 'yellow');
    log('- Keep your mnemonic phrase secure', 'yellow');
    log('- Save the deployment info for future reference', 'yellow');
    log('- Test the contracts before mainnet deployment', 'yellow');
}

async function main() {
    try {
        log('🚀 Starting AssetHub Westend Testnet Deployment', 'bright');
        log('==============================================', 'bright');
        
        // Step 1: Connect to AssetHub Westend
        const api = await checkWestendConnection();
        
        // Step 2: Setup deployment account
        const account = await setupDeploymentAccount();
        
        // Step 3: Check account balance
        await checkAccountBalance(api, account);
        
        // Step 4: Check contract artifacts
        const artifacts = await checkContractArtifacts();
        
        // Step 5: Deploy contracts
        const deployedContracts = {};
        
        // Deploy escrow_dst first
        deployedContracts.escrow_dst = await deployContract(api, account, 'escrow_dst', artifacts);
        
        // Deploy escrow_factory
        deployedContracts.escrow_factory = await deployContract(api, account, 'escrow_factory', artifacts);
        
        // Step 6: Verify deployment
        await verifyDeployment(api, deployedContracts);
        
        // Step 7: Save deployment info
        await saveDeploymentInfo(deployedContracts);
        
        log('\n🎉 Deployment completed successfully!', 'green');
        
    } catch (error) {
        logError(`Deployment failed: ${error.message}`);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

// Run the deployment
if (require.main === module) {
    main();
}

module.exports = { main }; 