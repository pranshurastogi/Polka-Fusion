/**
 * Merkle Tree Implementation for Polka Fusion
 * 
 * This utility demonstrates the Merkle tree functionality used in the smart contracts
 * for secure part-based claiming in cross-chain atomic swaps.
 */

import { ethers } from 'ethers'

export interface MerkleProof {
  proof: string[]
  leaf: string
  root: string
}

export class MerkleTree {
  private leaves: string[]
  private layers: string[][]

  constructor(leaves: string[]) {
    this.leaves = leaves
    this.layers = [leaves]
    this.buildTree()
  }

  /**
   * Build the Merkle tree from leaves
   */
  private buildTree(): void {
    let layer = this.leaves
    while (layer.length > 1) {
      const newLayer: string[] = []
      for (let i = 0; i < layer.length; i += 2) {
        if (i + 1 < layer.length) {
          newLayer.push(this.hashPair(layer[i], layer[i + 1]))
        } else {
          newLayer.push(layer[i])
        }
      }
      this.layers.push(newLayer)
      layer = newLayer
    }
  }

  /**
   * Hash a pair of values using Keccak-256
   */
  private hashPair(left: string, right: string): string {
    return ethers.keccak256(ethers.concat([left, right]))
  }

  /**
   * Get the Merkle root
   */
  getRoot(): string {
    return this.layers[this.layers.length - 1][0]
  }

  /**
   * Generate a Merkle proof for a given index
   */
  getProof(index: number): string[] {
    const proof: string[] = []
    let currentIndex = index
    
    for (let i = 0; i < this.layers.length - 1; i++) {
      const layer = this.layers[i]
      const isRightNode = currentIndex % 2 === 1
      const pairIndex = isRightNode ? currentIndex - 1 : currentIndex + 1
      
      if (pairIndex < layer.length) {
        proof.push(layer[pairIndex])
      }
      
      currentIndex = Math.floor(currentIndex / 2)
    }
    
    return proof
  }

  /**
   * Verify a Merkle proof
   */
  static verify(proof: string[], root: string, leaf: string): boolean {
    let currentHash = leaf
    
    for (const proofElement of proof) {
      // Determine if current hash is left or right child
      const isLeft = currentHash < proofElement
      
      if (isLeft) {
        currentHash = ethers.keccak256(ethers.concat([currentHash, proofElement]))
      } else {
        currentHash = ethers.keccak256(ethers.concat([proofElement, currentHash]))
      }
    }
    
    return currentHash === root
  }

  /**
   * Create a leaf from part index and secret
   */
  static createLeaf(partIndex: number, secret: string): string {
    return ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint32", "bytes32"],
        [partIndex, secret]
      )
    )
  }
}

/**
 * Generate secrets and Merkle tree for escrow
 */
export function generateEscrowMerkleTree(partsCount: number): {
  secrets: string[]
  merkleRoot: string
  proofs: string[][]
  leaves: string[]
} {
  // Generate random secrets for each part
  const secrets = Array.from({ length: partsCount }, () => 
    ethers.randomBytes(32)
  )

  // Create leaves from secrets and part indices
  const leaves = secrets.map((secret, index) => 
    MerkleTree.createLeaf(index, secret)
  )

  // Build Merkle tree
  const merkleTree = new MerkleTree(leaves)
  const merkleRoot = merkleTree.getRoot()

  // Generate proofs for each part
  const proofs = leaves.map((_, index) => 
    merkleTree.getProof(index)
  )

  return {
    secrets: secrets.map(secret => ethers.hexlify(secret)),
    merkleRoot,
    proofs,
    leaves: leaves.map(leaf => ethers.hexlify(leaf))
  }
}

/**
 * Verify a part claim with Merkle proof
 */
export function verifyPartClaim(
  partIndex: number,
  secret: string,
  proof: string[],
  merkleRoot: string
): boolean {
  const leaf = MerkleTree.createLeaf(partIndex, secret)
  return MerkleTree.verify(proof, merkleRoot, leaf)
}

/**
 * Simulate escrow creation and part claiming
 */
export function simulateEscrowWorkflow(partsCount: number = 4) {
  console.log(`🚀 Simulating escrow workflow with ${partsCount} parts...`)
  
  // Generate Merkle tree
  const { secrets, merkleRoot, proofs, leaves } = generateEscrowMerkleTree(partsCount)
  
  console.log('📋 Generated Merkle tree:')
  console.log(`   Root: ${merkleRoot}`)
  console.log(`   Parts: ${partsCount}`)
  console.log(`   Secrets: ${secrets.length}`)
  console.log(`   Proofs: ${proofs.length}`)
  
  // Simulate claiming each part
  console.log('\n🔓 Simulating part claims:')
  for (let i = 0; i < partsCount; i++) {
    const isValid = verifyPartClaim(i, secrets[i], proofs[i], merkleRoot)
    console.log(`   Part ${i + 1}: ${isValid ? '✅ Valid' : '❌ Invalid'}`)
  }
  
  // Test invalid claim
  const invalidSecret = ethers.randomBytes(32)
  const isValidInvalid = verifyPartClaim(0, invalidSecret, proofs[0], merkleRoot)
  console.log(`   Invalid claim: ${isValidInvalid ? '❌ Should be invalid' : '✅ Correctly invalid'}`)
  
  return {
    secrets,
    merkleRoot,
    proofs,
    leaves
  }
}

/**
 * Format hash for display
 */
export function formatHash(hash: string, length: number = 10): string {
  return `${hash.slice(0, length)}...${hash.slice(-8)}`
}

/**
 * Calculate amount per part
 */
export function calculatePartAmount(totalAmount: string, partIndex: number, partsCount: number): string {
  const amount = ethers.parseEther(totalAmount)
  const amountPerPart = amount / BigInt(partsCount)
  
  if (partIndex === partsCount - 1) {
    // Last part gets remainder
    const claimedAmount = amountPerPart * BigInt(partsCount - 1)
    return ethers.formatEther(amount - claimedAmount)
  } else {
    return ethers.formatEther(amountPerPart)
  }
}

// Example usage
if (typeof window === 'undefined') {
  // Node.js environment
  console.log('🌳 Merkle Tree Demo:')
  simulateEscrowWorkflow(4)
} 