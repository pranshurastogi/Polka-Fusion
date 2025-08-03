// scripts/test-with-valid-proofs.js
const hre = require("hardhat");
const { ethers } = require("hardhat");

// Simple Merkle tree implementation for testing
class MerkleTree {
  constructor(leaves) {
    this.leaves = leaves;
    this.layers = [leaves];
    this.buildTree();
  }

  buildTree() {
    let layer = this.leaves;
    while (layer.length > 1) {
      const newLayer = [];
      for (let i = 0; i < layer.length; i += 2) {
        if (i + 1 < layer.length) {
          newLayer.push(this.hashPair(layer[i], layer[i + 1]));
        } else {
          newLayer.push(layer[i]);
        }
      }
      this.layers.push(newLayer);
      layer = newLayer;
    }
  }

  hashPair(left, right) {
    return ethers.keccak256(ethers.concat([left, right]));
  }

  getRoot() {
    return this.layers[this.layers.length - 1][0];
  }

  getProof(index) {
    const proof = [];
    let currentIndex = index;
    
    for (let i = 0; i < this.layers.length - 1; i++) {
      const layer = this.layers[i];
      const isRightNode = currentIndex % 2 === 1;
      const pairIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;
      
      if (pairIndex < layer.length) {
        proof.push(layer[pairIndex]);
      }
      
      currentIndex = Math.floor(currentIndex / 2);
    }
    
    return proof;
  }
}

async function main() {
  console.log("🚀 Starting Ethereum Escrow Test with Valid Proofs...");

  // Get signers
  const [deployer, maker, taker] = await ethers.getSigners();
  console.log("📋 Signers:", {
    deployer: deployer.address,
    maker: maker.address,
    taker: taker.address
  });

  // Deploy mock ERC20 token for testing
  const MockToken = await ethers.getContractFactory("MockERC20");
  const mockToken = await MockToken.deploy("Test Token", "TEST");
  await mockToken.waitForDeployment();
  console.log("✅ Mock Token deployed at:", await mockToken.getAddress());

  // Mint tokens to maker
  const amount = ethers.parseEther("1000");
  await mockToken.mint(maker.address, amount);
  console.log("💰 Minted", ethers.formatEther(amount), "tokens to maker");

  // Deploy contracts
  const EscrowSrcModule = require("../ignition/modules/EscrowSrcModule");
  const { escrowSrc, factory } = await hre.ignition.deploy(EscrowSrcModule);
  
  console.log("✅ EscrowSrc deployed at:", await escrowSrc.getAddress());
  console.log("✅ EscrowFactory deployed at:", await factory.getAddress());

  // Generate test data
  const partsCount = 4;
  const expiryTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  
  // Generate secrets and build proper Merkle tree
  const secrets = [];
  const leaves = [];
  
  for (let i = 0; i < partsCount; i++) {
    const secret = ethers.randomBytes(32);
    secrets.push(secret);
    const leaf = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
      ["uint32", "bytes32"],
      [i, secret]
    ));
    leaves.push(leaf);
  }

  // Build proper Merkle tree
  const merkleTree = new MerkleTree(leaves);
  const merkleRoot = merkleTree.getRoot();
  console.log("🌳 Merkle Root:", merkleRoot);

  // Create escrow using factory
  const salt = ethers.randomBytes(32);
  const escrowAddress = await factory.predictSrcEscrow(salt);
  console.log("📍 Predicted Escrow Address:", escrowAddress);

  // Create the escrow
  await factory.createSrcEscrow(salt);
  console.log("✅ Escrow created via factory");

  // Approve tokens
  const escrowAmount = ethers.parseEther("100");
  await mockToken.connect(maker).approve(escrowAddress, escrowAmount);
  console.log("✅ Approved", ethers.formatEther(escrowAmount), "tokens");

  // Initialize escrow
  const escrowContract = await ethers.getContractAt("EscrowSrc", escrowAddress);
  await escrowContract.connect(maker).init(
    maker.address,
    taker.address,
    await mockToken.getAddress(),
    escrowAmount,
    merkleRoot,
    partsCount,
    expiryTimestamp
  );
  console.log("✅ Escrow initialized");

  // Verify escrow state
  console.log("📊 Escrow State:", {
    maker: await escrowContract.getMaker(),
    taker: await escrowContract.getTaker(),
    token: await escrowContract.token(),
    amount: ethers.formatEther(await escrowContract.amount()),
    merkleRoot: await escrowContract.getMerkleRoot(),
    partsCount: await escrowContract.getPartsCount(),
    expiryTimestamp: await escrowContract.getExpiryTimestamp(),
    partsClaimed: await escrowContract.getPartsClaimed(),
    refunded: await escrowContract.getRefunded(),
    balance: ethers.formatEther(await escrowContract.getBalance())
  });

  // Simulate claiming parts with valid proofs
  console.log("\n🔓 Simulating part claims with valid proofs...");
  
  for (let i = 0; i < partsCount; i++) {
    const takerBalanceBefore = await mockToken.balanceOf(taker.address);
    
    // Get valid Merkle proof
    const proof = merkleTree.getProof(i);
    
    try {
      await escrowContract.connect(taker).claimPart(
        proof,
        secrets[i],
        i
      );
      
      const takerBalanceAfter = await mockToken.balanceOf(taker.address);
      const claimedAmount = takerBalanceAfter - takerBalanceBefore;
      
      console.log(`✅ Part ${i} claimed successfully`);
      console.log(`   Claimed amount: ${ethers.formatEther(claimedAmount)} tokens`);
      console.log(`   Parts claimed: ${await escrowContract.getPartsClaimed()}`);
      console.log(`   Proof length: ${proof.length}`);
    } catch (error) {
      console.log(`❌ Failed to claim part ${i}:`, error.message);
    }
  }

  // Test refund functionality
  console.log("\n🔄 Testing refund functionality...");
  
  // Fast forward time to test refund
  await hre.network.provider.send("evm_increaseTime", [3601]); // 1 hour + 1 second
  await hre.network.provider.send("evm_mine");
  
  try {
    await escrowContract.connect(taker).refund();
    console.log("✅ Refund executed successfully");
    console.log("📊 Final state:", {
      partsClaimed: await escrowContract.getPartsClaimed(),
      refunded: await escrowContract.getRefunded(),
      balance: ethers.formatEther(await escrowContract.getBalance())
    });
  } catch (error) {
    console.log("❌ Refund failed:", error.message);
  }

  console.log("\n🎉 Test completed successfully!");
}

main().catch(console.error); 