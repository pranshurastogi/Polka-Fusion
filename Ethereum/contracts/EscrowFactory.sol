// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/proxy/Clones.sol";

/// @notice Deploys minimal‑proxy clones for EscrowSrc contracts
contract EscrowFactory {
    address public immutable srcImpl;

    event SrcCreated(address indexed esc, bytes32 salt);

    constructor(address _srcImpl) {
        srcImpl = _srcImpl;
    }

    function createSrcEscrow(bytes32 salt) external returns (address esc) {
        esc = Clones.cloneDeterministic(srcImpl, salt);
        emit SrcCreated(esc, salt);
    }

    function predictSrcEscrow(bytes32 salt) external view returns (address) {
        return Clones.predictDeterministicAddress(srcImpl, salt);
    }
}
