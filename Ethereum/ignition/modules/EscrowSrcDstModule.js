// ignition/modules/EscrowSrcDstModule.js
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("EscrowSrcDstModule", (m) => {
  // Deploy the source‑chain escrow implementation
  const escrowSrc = m.contract("EscrowSrc");                                // :contentReference[oaicite:0]{index=0}

  // Deploy the destination‑chain escrow implementation
  const escrowDst = m.contract("EscrowDst");                                // :contentReference[oaicite:1]{index=1}

  // Deploy the factory with both implementation addresses for deterministic CREATE2 clones
  const factory   = m.contract("EscrowFactory", [escrowSrc, escrowDst]);     // :contentReference[oaicite:2]{index=2}

  return { escrowSrc, escrowDst, factory };
});
