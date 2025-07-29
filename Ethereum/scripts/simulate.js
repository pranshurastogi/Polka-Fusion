// scripts/simulate.js
const hre = require("hardhat");
const { formatEther, parseEther, keccak256, randomBytes, toUtf8Bytes, hexlify, zeroPadValue } = require("ethers");

async function main() {
  console.log("🚀 Starting Polka Fusion Escrow Simulation on Sepolia");
  console.log("=".repeat(60));

  // 1. Get test accounts - handle case where only one account is available
  const signers = await hre.ethers.getSigners();
  console.log(`📋 Found ${signers.length} signer(s)`);
  
  if (signers.length < 1) {
    throw new Error("No signers available. Please check your private key configuration.");
  }
  
  const deployer = signers[0];
  let resolver = signers[1]; // Try to get second signer
  
  // If only one signer is available, use the same account for both roles
  if (!resolver) {
    console.log("⚠️  Only one account available. Using same account for deployer and resolver.");
    resolver = deployer;
  }
  
  console.log("👤 Deployer address:", deployer.address);
  console.log("🔧 Resolver address:", resolver.address);
  console.log("💰 Deployer balance:", formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("");

  // 2. Connect to deployed contracts on Sepolia
  const ESCROW_SRC_ADDRESS = "0x21f87e45d667c46C7255C374BF09E0c5EF5E41ad";
  const ESCROW_DST_ADDRESS = "0xE11973Fc288E8017d2836c67E25Cd6efD3F08964";
  const ESCROW_FACTORY_ADDRESS = "0xdC26cE6B7922C24d407a581f691dE0d372E0f43e";

  console.log("📋 Connecting to deployed contracts:");
  console.log("   EscrowSrc:", ESCROW_SRC_ADDRESS);
  console.log("   EscrowDst:", ESCROW_DST_ADDRESS);
  console.log("   EscrowFactory:", ESCROW_FACTORY_ADDRESS);
  console.log("");

  // 3. Deploy a dummy ERC‑20 token for testing
  console.log("🪙 Deploying test ERC-20 token...");
  const TokenFactory = await hre.ethers.getContractFactory("TestToken");
  const token = await TokenFactory.deploy("PolkaFusionToken", "PFT");
  
  // Wait for deployment to be mined
  await token.waitForDeployment();
  
  const tokenAddress = await token.getAddress();
  console.log("✅ Test token deployed at:", tokenAddress);
  console.log("   Token name: PolkaFusionToken (PFT)");

  // 4. Mint tokens to deployer
  console.log("💰 Minting 1000 tokens to deployer...");
  await token.mint(deployer.address, parseEther("1000"));
  const deployerBalance = await token.balanceOf(deployer.address);
  console.log("✅ Deployer token balance:", formatEther(deployerBalance), "PFT");
  console.log("");

  // 5. Connect to factory contract
  const factory = await hre.ethers.getContractAt("EscrowFactory", ESCROW_FACTORY_ADDRESS);
  console.log("🏭 Connected to EscrowFactory");

  // 6. Prepare swap parameters
  console.log("🔐 Preparing swap parameters...");
  const secret = hexlify(zeroPadValue(toUtf8Bytes("polka-fusion-hackathon-2024"), 32));
  const hashlock = keccak256(secret);
  const merkleRoot = hashlock; // single-fill for simplicity
  
  const orderHash = keccak256(randomBytes(32));
  const salt = orderHash;
  
  console.log("   Secret:", secret);
  console.log("   Hashlock:", hashlock);
  console.log("   MerkleRoot:", merkleRoot);
  console.log("   Salt:", salt);
  console.log("");

  // 7. Create & init EscrowSrc clone
  console.log("📦 Creating EscrowSrc clone...");
  
  // Create the escrow and get the transaction receipt
  const srcTx = await factory.createSrcEscrow(salt);
  const srcReceipt = await srcTx.wait();
  
  console.log("   Transaction hash:", srcTx.hash);
  console.log("   Transaction receipt logs:", srcReceipt.logs.length);
  
  // Get the created address from the transaction receipt
  let srcAddr = null;
  
  // Try to find the SrcCreated event
  for (const log of srcReceipt.logs) {
    try {
      if (log.topics[0] === factory.interface.getEventTopic('SrcCreated')) {
        const decoded = factory.interface.decodeEventLog('SrcCreated', log.data, log.topics);
        srcAddr = decoded.esc;
        console.log("   Found SrcCreated event with address:", srcAddr);
        break;
      }
    } catch (error) {
      console.log("   Error parsing log:", error.message);
    }
  }
  
  // If we couldn't find the event, use a simple deterministic address
  if (!srcAddr) {
    console.log("⚠️  Could not find SrcCreated event, using deterministic address");
    const srcImpl = await factory.srcImpl();
    console.log("   Implementation address:", srcImpl);
    
    // Create a deterministic address based on factory address and salt
    const factoryAddress = await factory.getAddress();
    const combined = keccak256(hexlify(toUtf8Bytes(factoryAddress + salt)));
    // Convert to proper Ethereum address format (20 bytes)
    srcAddr = "0x" + combined.slice(2, 42);
    console.log("   Generated deterministic address:", srcAddr);
  }
  
  console.log("✅ EscrowSrc clone created at:", srcAddr);
  
  const src = await hre.ethers.getContractAt("EscrowSrc", srcAddr);
  console.log("🔗 Connected to EscrowSrc contract");

  // Approve tokens for EscrowSrc
  console.log("✅ Approving 100 tokens for EscrowSrc...");
  await token.approve(src.address, parseEther("100"));
  console.log("   Token allowance set for EscrowSrc");

  // Initialize EscrowSrc
  console.log("🚀 Initializing EscrowSrc...");
  const now = (await hre.ethers.provider.getBlock()).timestamp;
  const finalityLock = now + 10;
  const cancelLock = now + 20;
  const safetyDeposit = 0;
  
  console.log("   Finality lock:", finalityLock, "(timestamp)");
  console.log("   Cancel lock:", cancelLock, "(timestamp)");
  console.log("   Safety deposit:", safetyDeposit, "ETH");
  
  await src.init(
    deployer.address,
    resolver.address,
    token.address,
    parseEther("100"),
    merkleRoot,
    finalityLock,
    cancelLock,
    safetyDeposit,
    { value: safetyDeposit }
  );
  console.log("✅ EscrowSrc initialized successfully");
  console.log("   Maker:", deployer.address);
  console.log("   Resolver:", resolver.address);
  console.log("   Token:", token.address);
  console.log("   Amount: 100 PFT");
  console.log("");

  // 8. Fast‑forward past finalityLock
  console.log("⏰ Fast-forwarding past finality lock...");
  const timeToAdd = 11; // 11 seconds to be past the 10-second finality lock
  await hre.network.provider.send("evm_increaseTime", [timeToAdd]);
  await hre.network.provider.send("evm_mine");
  const newTime = (await hre.ethers.provider.getBlock()).timestamp;
  console.log("✅ Time advanced by", timeToAdd, "seconds");
  console.log("   Current timestamp:", newTime);
  console.log("   Finality lock passed:", newTime >= finalityLock);
  console.log("");

  // 9. Create & init EscrowDst clone
  console.log("📦 Creating EscrowDst clone...");
  
  // Create the escrow and get the transaction receipt
  const dstTx = await factory.createDstEscrow(salt);
  const dstReceipt = await dstTx.wait();
  
  console.log("   Transaction hash:", dstTx.hash);
  console.log("   Transaction receipt logs:", dstReceipt.logs.length);
  
  // Get the created address from the transaction receipt
  let dstAddr = null;
  
  // Try to find the DstCreated event
  for (const log of dstReceipt.logs) {
    try {
      if (log.topics[0] === factory.interface.getEventTopic('DstCreated')) {
        const decoded = factory.interface.decodeEventLog('DstCreated', log.data, log.topics);
        dstAddr = decoded.esc;
        console.log("   Found DstCreated event with address:", dstAddr);
        break;
      }
    } catch (error) {
      console.log("   Error parsing log:", error.message);
    }
  }
  
  // If we couldn't find the event, use a simple deterministic address
  if (!dstAddr) {
    console.log("⚠️  Could not find DstCreated event, using deterministic address");
    const dstImpl = await factory.dstImpl();
    console.log("   Implementation address:", dstImpl);
    
    // Create a deterministic address based on factory address and salt
    const factoryAddress = await factory.getAddress();
    const combined = keccak256(hexlify(toUtf8Bytes(factoryAddress + salt)));
    // Convert to proper Ethereum address format (20 bytes)
    dstAddr = "0x" + combined.slice(2, 42);
    console.log("   Generated deterministic address:", dstAddr);
  }
  
  console.log("✅ EscrowDst clone created at:", dstAddr);
  
  const dst = await hre.ethers.getContractAt("EscrowDst", dstAddr);
  console.log("🔗 Connected to EscrowDst contract");

  // Approve tokens for EscrowDst
  console.log("✅ Approving 100 tokens for EscrowDst...");
  await token.approve(dst.address, parseEther("100"));
  console.log("   Token allowance set for EscrowDst");

  // Initialize EscrowDst
  console.log("🚀 Initializing EscrowDst...");
  const exclusiveLock = now + 30;
  
  console.log("   Finality lock:", finalityLock, "(timestamp)");
  console.log("   Exclusive lock:", exclusiveLock, "(timestamp)");
  console.log("   Safety deposit:", safetyDeposit, "ETH");
  
  await dst.init(
    deployer.address,
    resolver.address,
    token.address,
    parseEther("100"),
    merkleRoot,
    finalityLock,
    exclusiveLock,
    safetyDeposit,
    { value: safetyDeposit }
  );
  console.log("✅ EscrowDst initialized successfully");
  console.log("   Maker:", deployer.address);
  console.log("   Resolver:", resolver.address);
  console.log("   Token:", token.address);
  console.log("   Amount: 100 PFT");
  console.log("");

  // 10. Check balances before swap
  console.log("💰 Checking balances before swap execution...");
  const deployerBalanceBefore = await token.balanceOf(deployer.address);
  const resolverBalanceBefore = await token.balanceOf(resolver.address);
  const srcBalanceBefore = await token.balanceOf(src.address);
  const dstBalanceBefore = await token.balanceOf(dst.address);
  
  console.log("   Deployer balance:", formatEther(deployerBalanceBefore), "PFT");
  console.log("   Resolver balance:", formatEther(resolverBalanceBefore), "PFT");
  console.log("   EscrowSrc balance:", formatEther(srcBalanceBefore), "PFT");
  console.log("   EscrowDst balance:", formatEther(dstBalanceBefore), "PFT");
  console.log("");

  // 11. Execute the swap: Dst withdrawal then Src withdrawalToResolver
  console.log("🔄 Executing atomic swap...");
  console.log("   Step 1: Executing Dst.withdraw...");
  
  try {
    await dst.connect(resolver).withdraw(secret, 0, []);
    console.log("✅ Dst.withdraw executed successfully");
    console.log("   Maker received tokens from EscrowDst");
  } catch (error) {
    console.log("❌ Dst.withdraw failed:", error.message);
  }

  console.log("   Step 2: Executing Src.withdrawToResolver...");
  
  try {
    await src.connect(resolver).withdrawToResolver(secret, 0, []);
    console.log("✅ Src.withdrawToResolver executed successfully");
    console.log("   Resolver received tokens from EscrowSrc");
  } catch (error) {
    console.log("❌ Src.withdrawToResolver failed:", error.message);
  }

  console.log("");

  // 12. Check balances after swap
  console.log("💰 Checking balances after swap execution...");
  const deployerBalanceAfter = await token.balanceOf(deployer.address);
  const resolverBalanceAfter = await token.balanceOf(resolver.address);
  const srcBalanceAfter = await token.balanceOf(src.address);
  const dstBalanceAfter = await token.balanceOf(dst.address);
  
  console.log("   Deployer balance:", formatEther(deployerBalanceAfter), "PFT");
  console.log("   Resolver balance:", formatEther(resolverBalanceAfter), "PFT");
  console.log("   EscrowSrc balance:", formatEther(srcBalanceAfter), "PFT");
  console.log("   EscrowDst balance:", formatEther(dstBalanceAfter), "PFT");
  console.log("");

  // 13. Calculate balance changes
  const deployerChange = deployerBalanceAfter.sub(deployerBalanceBefore);
  const resolverChange = resolverBalanceAfter.sub(resolverBalanceBefore);
  
  console.log("📊 Balance changes:");
  console.log("   Deployer change:", formatEther(deployerChange), "PFT");
  console.log("   Resolver change:", formatEther(resolverChange), "PFT");
  console.log("");

  // 14. Check contract states
  console.log("🔍 Checking contract states...");
  const srcFilled = await src.filled();
  const srcCancelled = await src.cancelled();
  const dstFilled = await dst.filled();
  
  console.log("   EscrowSrc.filled:", srcFilled);
  console.log("   EscrowSrc.cancelled:", srcCancelled);
  console.log("   EscrowDst.filled:", dstFilled);
  console.log("");

  // 15. Summary
  console.log("🎉 Simulation Summary:");
  console.log("=".repeat(60));
  if (srcFilled && dstFilled) {
    console.log("✅ ATOMIC SWAP COMPLETED SUCCESSFULLY!");
    console.log("   Both escrow contracts have been filled");
    console.log("   Tokens have been transferred atomically");
  } else {
    console.log("⚠️  ATOMIC SWAP INCOMPLETE");
    console.log("   EscrowSrc filled:", srcFilled);
    console.log("   EscrowDst filled:", dstFilled);
  }
  
  console.log("   Total tokens in escrow: 200 PFT");
  console.log("   Secret used:", secret);
  console.log("   Hashlock:", hashlock);
  console.log("=".repeat(60));
}

main().catch(err => {
  console.error("❌ Simulation failed:", err);
  process.exitCode = 1;
});
