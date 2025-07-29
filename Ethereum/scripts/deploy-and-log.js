// scripts/deploy-and-log.js
const hre = require("hardhat");
const EscrowSrcDstModule = require("../ignition/modules/EscrowSrcDstModule");

async function main() {
  // 1. Deploy via Ignition
  const { escrowSrc, escrowDst, factory } = await hre.ignition.deploy(EscrowSrcDstModule);

  // 2. Log deployed addresses
  console.log("▶️ EscrowSrc deployed at:", await escrowSrc.getAddress());
  console.log("▶️ EscrowDst deployed at:", await escrowDst.getAddress());
  console.log("▶️ EscrowFactory deployed at:", await factory.getAddress());
}

main().catch(console.error);
