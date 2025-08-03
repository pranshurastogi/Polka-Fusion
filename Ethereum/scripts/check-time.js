const hre = require("hardhat");

async function main() {
  const currentBlock = await hre.ethers.provider.getBlock("latest");
  console.log("Current block timestamp:", currentBlock.timestamp);
  console.log("Current time:", Math.floor(Date.now() / 1000));
}

main().catch(console.error); 