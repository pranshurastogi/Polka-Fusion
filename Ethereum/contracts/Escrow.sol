// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Escrow {
    address public maker;
    address public resolver;
    address public token;
    uint256 public amount;
    bytes32 public merkleRoot;
    uint256 public finalityLock;
    uint256 public exclusiveLock;
    uint256 public cancelLock;
    uint256 public safetyDeposit;
    bool public filled;
    bool public cancelled;

    event Filled(bytes32 indexed secret, uint256 indexed index);
    event Cancelled(address indexed byResolver);
    event Rescue(address indexed caller);

    modifier onlyResolver() {
        require(msg.sender == resolver, "not resolver");
        _;
    }

    function init(
        address _maker,
        address _resolver,
        address _token,
        uint256 _amount,
        bytes32 _merkleRoot,
        uint256[3] calldata locks,        // [finalityLock, exclusiveLock, cancelLock]
        uint256 _safetyDeposit
    ) external payable {
        require(maker == address(0), "already init");
        maker = _maker;
        resolver = _resolver;
        token = _token;
        amount = _amount;
        merkleRoot = _merkleRoot;
        finalityLock = locks[0];
        exclusiveLock = locks[1];
        cancelLock = locks[2];
        safetyDeposit = _safetyDeposit;
        require(msg.value == _safetyDeposit, "wrong deposit");
    }

    function fill(bytes32 secret, uint256 index, bytes32[] calldata proof) external onlyResolver {
        require(!filled && !cancelled, "done");
        require(block.timestamp >= finalityLock, "too early");
        require(block.timestamp < exclusiveLock, "exclusive period over");

        // Verify Merkle proof: leaf = keccak256(abi.encodePacked(index, secret))
        bytes32 leaf = keccak256(abi.encodePacked(index, secret));
        require(MerkleProof.verify(proof, merkleRoot, leaf), "invalid proof");

        filled = true;
        IERC20(token).transfer(maker, amount);
        payable(resolver).transfer(safetyDeposit);
        emit Filled(secret, index);
    }

    function publicFill(bytes32 secret, uint256 index, bytes32[] calldata proof) external {
        require(!filled && !cancelled, "done");
        require(block.timestamp >= exclusiveLock, "exclusive period");
        // same proof logic...
        bytes32 leaf = keccak256(abi.encodePacked(index, secret));
        require(MerkleProof.verify(proof, merkleRoot, leaf), "invalid proof");

        filled = true;
        IERC20(token).transfer(maker, amount);
        payable(msg.sender).transfer(safetyDeposit);
        emit Filled(secret, index);
    }

    function cancel() external onlyResolver {
        require(!filled && !cancelled, "done");
        require(block.timestamp >= cancelLock, "cancel too early");
        cancelled = true;
        IERC20(token).transfer(resolver, amount);
        payable(resolver).transfer(safetyDeposit);
        emit Cancelled(resolver);
    }

    function publicRescue() external {
        require(!filled && cancelled, "not cancelled");
        // after rescue window (not shown), allow maker to get funds back
        IERC20(token).transfer(maker, amount);
        payable(msg.sender).transfer(safetyDeposit);
        emit Rescue(msg.sender);
    }
}
