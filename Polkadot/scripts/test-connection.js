#!/usr/bin/env node

const { ApiPromise, WsProvider } = require('@polkadot/api');

async function testConnection() {
    console.log('🔗 Testing AssetHub Westend connection...');
    
    const endpoints = [
        'wss://westend-assets-hub-rpc.polkadot.io',
        'wss://westend-assets-hub-rpc.dwellir.com',
        'wss://westend-assets-hub-rpc.parity.io'
    ];
    
    for (const endpoint of endpoints) {
        console.log(`\nTrying: ${endpoint}`);
        try {
            const provider = new WsProvider(endpoint);
            const api = await ApiPromise.create({ provider });
            
            const chain = await api.rpc.system.chain();
            console.log(`✅ Connected to: ${chain.toString()}`);
            
            await api.disconnect();
            return endpoint;
        } catch (error) {
            console.log(`❌ Failed: ${error.message}`);
        }
    }
    
    throw new Error('No endpoints working');
}

testConnection()
    .then(endpoint => {
        console.log(`\n🎉 Working endpoint: ${endpoint}`);
        process.exit(0);
    })
    .catch(error => {
        console.error(`\n❌ All endpoints failed: ${error.message}`);
        process.exit(1);
    }); 