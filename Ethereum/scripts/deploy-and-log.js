// scripts/deploy-and-log.js
const hre = require("hardhat");
const EscrowModule = require("../ignition/modules/EscrowModule");

async function main() {
  // 1. Deploy via Ignition
  const { escrow, factory } = await hre.ignition.deploy(EscrowModule);

  // 2. Log deployed addresses
  console.log("▶️ Escrow deployed at:", await escrow.getAddress());
  console.log("▶️ EscrowFactory deployed at:", await factory.getAddress());
}

main().catch(console.error);
