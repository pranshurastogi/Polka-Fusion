#!/usr/bin/env tsx

/**
 * Run Polka Fusion Escrow Demo
 * 
 * This script demonstrates the complete escrow workflow and how the frontend
 * aligns with the actual smart contract functionality.
 */

import { EscrowDemo } from '../demo/escrow-demo'

async function main() {
  console.log("🚀 Starting Polka Fusion Escrow Demo")
  console.log("=".repeat(60))
  
  try {
    const demo = new EscrowDemo()
    await demo.run()
  } catch (error) {
    console.error("❌ Demo failed:", error)
    process.exit(1)
  }
}

main().catch(console.error) 