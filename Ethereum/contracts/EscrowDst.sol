// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract EscrowDst {
    address public maker;
    address public resolver;
    address public token;
    uint256 public amount ; 
    uint256 public finalityLock ; 
    uint256 public exclusiveLock ;
    uint256 public safetyDeposit;
    bytes32 public merkleRoot;
    bool public filled;

    event Withdrawn(bytes32 secret, uint256 index);

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
        uint256 _finalityLock,
        uint256 _exclusiveLock,
        uint256 _safetyDeposit
    ) external payable {
        require(maker == address(0), "initialized");
        maker = _maker; resolver = _resolver; token = _token;
        amount = _amount; merkleRoot = _merkleRoot;
        finalityLock = _finalityLock; exclusiveLock = _exclusiveLock;
        safetyDeposit = _safetyDeposit;
        require(msg.value == _safetyDeposit, "wrong deposit");
    }

    function withdraw(
        bytes32 secret,
        uint256 index,
        bytes32[] calldata proof
    ) external onlyResolver {
        require(!filled, "done");
        require(block.timestamp >= finalityLock && block.timestamp < exclusiveLock, "timelock");
        bytes32 leaf = keccak256(abi.encodePacked(index, secret));
        require(MerkleProof.verify(proof, merkleRoot, leaf), "invalid proof");
        filled = true;
        IERC20(token).transfer(maker, amount);
        payable(resolver).transfer(safetyDeposit);
        emit Withdrawn(secret, index);
    }

    function publicWithdraw(
        bytes32 secret,
        uint256 index,
        bytes32[] calldata proof
    ) external {
        require(!filled && block.timestamp >= exclusiveLock, "too early/public");
        bytes32 leaf = keccak256(abi.encodePacked(index, secret));
        require(MerkleProof.verify(proof, merkleRoot, leaf), "invalid proof");
        filled = true;
        IERC20(token).transfer(maker, amount);
        payable(msg.sender).transfer(safetyDeposit);
        emit Withdrawn(secret, index);
    }
}
