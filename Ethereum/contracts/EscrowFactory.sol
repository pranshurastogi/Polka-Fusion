// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/proxy/Clones.sol";

/// @notice Deploys minimal‑proxy clones for both EscrowSrc and EscrowDst
contract EscrowFactory {
    address public immutable srcImpl;
    address public immutable dstImpl;

    event SrcCreated(address indexed esc, bytes32 salt);
    event DstCreated(address indexed esc, bytes32 salt);

    constructor(address _s, address _d) {
        srcImpl = _s;
        dstImpl = _d;
    }

    function createSrcEscrow(bytes32 salt) external returns (address esc) {
        esc = Clones.cloneDeterministic(srcImpl, salt);
        emit SrcCreated(esc, salt);
    }

    function createDstEscrow(bytes32 salt) external returns (address esc) {
        esc = Clones.cloneDeterministic(dstImpl, salt);
        emit DstCreated(esc, salt);
    }
}
