// scripts/simulate.js
const hre = require("hardhat"); // :contentReference[oaicite:0]{index=0}

async function main() {
  // 1. Get test accounts
  const [deployer, resolver] = await hre.ethers.getSigners(); // :contentReference[oaicite:1]{index=1}

  // 2. Deploy a dummy ERC‑20 token
  const TokenFactory = await hre.ethers.getContractFactory("ERC20PresetMinterPauser"); // :contentReference[oaicite:2]{index=2}
  const token = await TokenFactory.deploy("DummyToken", "DUM"); // :contentReference[oaicite:3]{index=3}
  await token.deployed();
  console.log("DummyToken deployed at:", token.address);

  // 3. Mint 1 000 tokens to deployer
  await token.mint(deployer.address, hre.ethers.utils.parseEther("1000")); // :contentReference[oaicite:4]{index=4}

  // 4. Deploy Escrow implementations
  const EscrowSrcFactory = await hre.ethers.getContractFactory("EscrowSrc"); // :contentReference[oaicite:5]{index=5}
  const srcImpl = await EscrowSrcFactory.deploy(); // :contentReference[oaicite:6]{index=6}
  await srcImpl.deployed();
  console.log("EscrowSrc impl at:", srcImpl.address);

  const EscrowDstFactory = await hre.ethers.getContractFactory("EscrowDst"); // :contentReference[oaicite:7]{index=7}
  const dstImpl = await EscrowDstFactory.deploy(); // :contentReference[oaicite:8]{index=8}
  await dstImpl.deployed();
  console.log("EscrowDst impl at:", dstImpl.address);

  // 5. Deploy the clone‑factory
  const Factory = await hre.ethers.getContractFactory("EscrowFactory"); // :contentReference[oaicite:9]{index=9}
  const factory = await Factory.deploy(srcImpl.address, dstImpl.address); // :contentReference[oaicite:10]{index=10}
  await factory.deployed();
  console.log("Factory at:", factory.address);

  // 6. Prepare swap parameters
  const secret = hre.ethers.utils.formatBytes32String("hackathon"); // :contentReference[oaicite:11]{index=11}
  const hashlock = hre.ethers.utils.keccak256(secret); // :contentReference[oaicite:12]{index=12}
  const merkleRoot = hashlock; // single‑fill

  const orderHash = hre.ethers.utils.keccak256(hre.ethers.utils.randomBytes(32)); // :contentReference[oaicite:13]{index=13}
  const salt = orderHash;

  // 7. Create & init EscrowSrc clone
  await factory.createSrcEscrow(salt); // :contentReference[oaicite:14]{index=14}
  const srcAddr = await factory.predictSrcEscrow(salt); // :contentReference[oaicite:15]{index=15}
  const src = await EscrowSrcFactory.attach(srcAddr); // :contentReference[oaicite:16]{index=16}

  // approve & initialize
  await token.approve(src.address, hre.ethers.utils.parseEther("100")); // :contentReference[oaicite:17]{index=17}
  const now = (await hre.ethers.provider.getBlock()).timestamp; // :contentReference[oaicite:18]{index=18}
  await src.init(
    deployer.address,
    resolver.address,
    token.address,
    hre.ethers.utils.parseEther("100"),
    merkleRoot,
    now + 10,    // finalityLock
    now + 20,    // cancelLock
    0,           // safetyDeposit
    { value: 0 }
  ); // :contentReference[oaicite:19]{index=19}
  console.log("EscrowSrc init at:", src.address);

  // 8. Fast‑forward past finalityLock
  await hre.network.provider.send("evm_increaseTime", [11]); // :contentReference[oaicite:20]{index=20}
  await hre.network.provider.send("evm_mine");           // :contentReference[oaicite:21]{index=21}

  // 9. Create & init EscrowDst clone
  await factory.createDstEscrow(salt);    // :contentReference[oaicite:22]{index=22}
  const dstAddr = await factory.predictDstEscrow(salt); // :contentReference[oaicite:23]{index=23}
  const dst = await EscrowDstFactory.attach(dstAddr);   // :contentReference[oaicite:24]{index=24}

  await token.approve(dst.address, hre.ethers.utils.parseEther("100")); // :contentReference[oaicite:25]{index=25}
  await dst.init(
    deployer.address,
    resolver.address,
    token.address,
    hre.ethers.utils.parseEther("100"),
    merkleRoot,
    now + 10,  // finalityLock
    now + 30,  // exclusiveLock
    0,
    { value: 0 }
  ); // :contentReference[oaicite:26]{index=26}
  console.log("EscrowDst init at:", dst.address);

  // 10. Execute the swap: Dst withdrawal then Src withdrawalToResolver
  await dst.connect(resolver).withdraw(secret, 0, []);            // :contentReference[oaicite:27]{index=27}
  console.log("Dst.withdraw executed—maker got tokens");
  await src.connect(resolver).withdrawToResolver(secret, 0, []);  // :contentReference[oaicite:28]{index=28}
  console.log("Src.withdrawToResolver executed—resolver got tokens");
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
