// ignition/modules/EscrowModule.js
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("EscrowModule", (m) => {
  // 1. Deploy the Escrow implementation
  const escrow = m.contract("Escrow");

  // 2. Deploy the Factory, passing the Escrow address
  const factory = m.contract("EscrowFactory", [escrow]);

  // (Optional) If you need to call any initializer on factory, use m.call:
  // m.call(factory, "initialize", [/* args */], { id: "initFactory" });

  // Return handles for later use (or logging in a separate script)
  return { escrow, factory };
});
