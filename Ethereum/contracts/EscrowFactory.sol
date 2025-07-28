// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/proxy/Clones.sol";

contract EscrowFactory {
    address public immutable escrowImplementation;
    event EscrowCreated(address indexed escrow, bytes32 indexed salt);

    constructor(address _impl) {
        escrowImplementation = _impl;
    }

    function createEscrow(bytes32 salt) external returns (address esc) {
        esc = Clones.cloneDeterministic(escrowImplementation, salt);
        emit EscrowCreated(esc, salt);
    }

    function predictEscrow(bytes32 salt) external view returns (address) {
        return Clones.predictDeterministicAddress(escrowImplementation, salt, address(this));
    }
}
