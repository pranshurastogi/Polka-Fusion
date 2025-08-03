// scripts/deploy-and-log.js
const hre = require("hardhat");
const EscrowSrcModule = require("../ignition/modules/EscrowSrcModule");

async function main() {
  // 1. Deploy via Ignition
  const { escrowSrc, factory } = await hre.ignition.deploy(EscrowSrcModule);

  // 2. Log deployed addresses
  console.log("▶️ EscrowSrc deployed at:", await escrowSrc.getAddress());
  console.log("▶️ EscrowFactory deployed at:", await factory.getAddress());
}

main().catch(console.error);
