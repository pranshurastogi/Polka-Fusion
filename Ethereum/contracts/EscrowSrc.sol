// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract EscrowSrc {
    address public maker;
    address public taker;
    address public token;
    uint256 public amount;
    uint256 public expiryTimestamp;
    bytes32 public merkleRoot;
    uint32 public partsCount;
    uint32 public partsClaimed;
    bool public refunded;

    event SrcCreated(
        address indexed maker,
        address indexed taker,
        bytes32 indexed merkleRoot,
        uint32 partsCount,
        uint256 expiryTimestamp
    );

    event PartClaimed(
        address indexed maker,
        address indexed taker,
        uint32 partIndex,
        bytes32 secret,
        uint256 amount
    );

    event Refunded(
        address indexed taker,
        uint256 amount
    );

    modifier onlyTaker() {
        require(msg.sender == taker, "not taker");
        _;
    }

    function init(
        address _maker,
        address _taker,
        address _token,
        uint256 _amount,
        bytes32 _merkleRoot,
        uint32 _partsCount,
        uint256 _expiryTimestamp
    ) external {
        require(maker == address(0), "initialized");
        maker = _maker;
        taker = _taker;
        token = _token;
        amount = _amount;
        merkleRoot = _merkleRoot;
        partsCount = _partsCount;
        expiryTimestamp = _expiryTimestamp;
        partsClaimed = 0;
        refunded = false;

        // Transfer tokens from maker to this contract
        require(IERC20(token).transferFrom(maker, address(this), amount), "transfer failed");

        emit SrcCreated(maker, taker, merkleRoot, partsCount, expiryTimestamp);
    }

    function claimPart(
        bytes32[] calldata proof,
        bytes32 secret,
        uint32 partIndex
    ) external onlyTaker {
        require(!refunded, "escrow refunded");
        require(block.timestamp < expiryTimestamp, "escrow expired");
        require(partIndex < partsCount, "invalid part index");
        require(partIndex == partsClaimed, "parts must be claimed in order");

        // Verify Merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(partIndex, secret));
        require(MerkleProof.verify(proof, merkleRoot, leaf), "invalid proof");

        // Calculate amount for this part
        uint256 amountPerPart = amount / partsCount;
        uint256 partAmount = (partIndex == partsCount - 1) 
            ? amount - (amountPerPart * (partsCount - 1)) // Last part gets remainder
            : amountPerPart;

        // Transfer amount to taker
        require(IERC20(token).transfer(taker, partAmount), "transfer failed");

        // Update parts claimed
        partsClaimed = partIndex + 1;

        emit PartClaimed(maker, taker, partIndex, secret, partAmount);
    }

    function refund() external onlyTaker {
        require(!refunded, "already refunded");
        require(block.timestamp >= expiryTimestamp, "not expired");

        refunded = true;

        // Calculate remaining balance
        uint256 remainingAmount = amount;
        if (partsClaimed > 0) {
            uint256 amountPerPart = amount / partsCount;
            uint256 claimedAmount = amountPerPart * partsClaimed;
            remainingAmount = amount - claimedAmount;
        }

        // Transfer remaining amount back to maker
        if (remainingAmount > 0) {
            require(IERC20(token).transfer(maker, remainingAmount), "transfer failed");
        }

        emit Refunded(taker, remainingAmount);
    }

    // View functions to match Polkadot interface
    function getMaker() external view returns (address) {
        return maker;
    }

    function getTaker() external view returns (address) {
        return taker;
    }

    function getMerkleRoot() external view returns (bytes32) {
        return merkleRoot;
    }

    function getPartsCount() external view returns (uint32) {
        return partsCount;
    }

    function getExpiryTimestamp() external view returns (uint256) {
        return expiryTimestamp;
    }

    function getPartsClaimed() external view returns (uint32) {
        return partsClaimed;
    }

    function getRefunded() external view returns (bool) {
        return refunded;
    }

    function getBalance() external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
}
