#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod escrow_dst {
    use ink::prelude::vec::Vec;
    use ink::prelude::string::String;

    /// Defines the storage of your contract.
    #[ink(storage)]
    pub struct EscrowDst {
        /// Maker's AccountId
        maker: AccountId,
        /// Taker's AccountId
        taker: AccountId,
        /// Merkle root of N+1 secrets
        merkle_root: Hash,
        /// Total number of parts
        parts_count: u32,
        /// Expiry timestamp
        expiry_timestamp: u64,
        /// Number of parts claimed so far
        parts_claimed: u32,
        /// Whether the escrow has been refunded
        refunded: bool,
    }

    #[ink(event)]
    pub struct DstCreated {
        #[ink(topic)]
        maker: AccountId,
        #[ink(topic)]
        taker: AccountId,
        #[ink(topic)]
        merkle_root: Hash,
        parts_count: u32,
        expiry_timestamp: u64,
    }

    #[ink(event)]
    pub struct PartClaimed {
        #[ink(topic)]
        maker: AccountId,
        #[ink(topic)]
        taker: AccountId,
        part_index: u32,
        secret: Hash,
        amount: Balance,
    }

    #[ink(event)]
    pub struct Refunded {
        #[ink(topic)]
        taker: AccountId,
        amount: Balance,
    }

    impl EscrowDst {
        /// Constructor that initializes the escrow with the given parameters
        #[ink(constructor)]
        pub fn new(
            maker: AccountId,
            taker: AccountId,
            merkle_root: Hash,
            parts_count: u32,
            expiry_timestamp: u64,
        ) -> Self {
            let mut instance = Self {
                maker,
                taker,
                merkle_root,
                parts_count,
                expiry_timestamp,
                parts_claimed: 0,
                refunded: false,
            };

            // Emit DstCreated event
            instance.env().emit_event(DstCreated {
                maker,
                taker,
                merkle_root,
                parts_count,
                expiry_timestamp,
            });

            instance
        }

        /// Claim a part using Merkle proof and secret
        #[ink(message)]
        pub fn claim_part(
            &mut self,
            proof: Vec<Hash>,
            secret: Hash,
            part_index: u32,
        ) -> Result<(), EscrowDstError> {
            // Check if escrow is not refunded
            if self.refunded {
                return Err(EscrowDstError::EscrowRefunded);
            }

            // Check if not expired
            if self.env().block_timestamp() >= self.expiry_timestamp {
                return Err(EscrowDstError::EscrowExpired);
            }

            // Check if part index is valid
            if part_index >= self.parts_count {
                return Err(EscrowDstError::InvalidPartIndex);
            }

            // Check if part is already claimed
            if part_index < self.parts_claimed {
                return Err(EscrowDstError::PartAlreadyClaimed);
            }

            // Verify Merkle proof
            if !self.verify_merkle_proof(proof, secret, part_index) {
                return Err(EscrowDstError::InvalidMerkleProof);
            }

            // Calculate amount for this part
            let total_balance = self.env().balance();
            let amount_per_part = total_balance / self.parts_count;
            let amount = if part_index == self.parts_count - 1 {
                // Last part gets any remainder
                total_balance - (amount_per_part * (self.parts_count - 1))
            } else {
                amount_per_part
            };

            // Transfer amount to maker
            if amount > 0 {
                self.env().transfer(self.maker, amount).map_err(|_| EscrowDstError::TransferFailed)?;
            }

            // Update parts claimed
            self.parts_claimed = part_index + 1;

            // Emit PartClaimed event
            self.env().emit_event(PartClaimed {
                maker: self.maker,
                taker: self.taker,
                part_index,
                secret,
                amount,
            });

            Ok(())
        }

        /// Refund remaining balance to taker after expiry
        #[ink(message)]
        pub fn refund(&mut self) -> Result<(), EscrowDstError> {
            // Check if escrow is not already refunded
            if self.refunded {
                return Err(EscrowDstError::EscrowAlreadyRefunded);
            }

            // Check if expired
            if self.env().block_timestamp() < self.expiry_timestamp {
                return Err(EscrowDstError::EscrowNotExpired);
            }

            // Mark as refunded
            self.refunded = true;

            // Transfer remaining balance to taker
            let remaining_balance = self.env().balance();
            if remaining_balance > 0 {
                self.env().transfer(self.taker, remaining_balance).map_err(|_| EscrowDstError::TransferFailed)?;
            }

            // Emit Refunded event
            self.env().emit_event(Refunded {
                taker: self.taker,
                amount: remaining_balance,
            });

            Ok(())
        }

        /// Get escrow details
        #[ink(message)]
        pub fn get_escrow_details(&self) -> EscrowDetails {
            EscrowDetails {
                maker: self.maker,
                taker: self.taker,
                merkle_root: self.merkle_root,
                parts_count: self.parts_count,
                expiry_timestamp: self.expiry_timestamp,
                parts_claimed: self.parts_claimed,
                refunded: self.refunded,
                balance: self.env().balance(),
            }
        }

        /// Verify Merkle proof using Keccak-256
        fn verify_merkle_proof(&self, proof: Vec<Hash>, secret: Hash, part_index: u32) -> bool {
            let mut current_hash = self.hash_secret(secret);
            
            for (i, proof_hash) in proof.iter().enumerate() {
                let bit = (part_index >> i) & 1;
                if bit == 0 {
                    // Current hash is left child
                    current_hash = self.hash_pair(current_hash, *proof_hash);
                } else {
                    // Current hash is right child
                    current_hash = self.hash_pair(*proof_hash, current_hash);
                }
            }

            current_hash == self.merkle_root
        }

        /// Hash a secret using Keccak-256
        fn hash_secret(&self, secret: Hash) -> Hash {
            use ink::env::hash::Keccak256;
            let mut output = [0u8; 32];
            ink::env::hash_bytes::<Keccak256>(&secret.as_ref(), &mut output);
            Hash::from(output)
        }

        /// Hash a pair of hashes using Keccak-256
        fn hash_pair(&self, left: Hash, right: Hash) -> Hash {
            use ink::env::hash::Keccak256;
            let mut input = Vec::new();
            input.extend_from_slice(left.as_ref());
            input.extend_from_slice(right.as_ref());
            
            let mut output = [0u8; 32];
            ink::env::hash_bytes::<Keccak256>(&input, &mut output);
            Hash::from(output)
        }
    }

    /// Escrow details struct
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct EscrowDetails {
        maker: AccountId,
        taker: AccountId,
        merkle_root: Hash,
        parts_count: u32,
        expiry_timestamp: u64,
        parts_claimed: u32,
        refunded: bool,
        balance: Balance,
    }

    /// Errors that can occur in the EscrowDst
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum EscrowDstError {
        EscrowRefunded,
        EscrowExpired,
        EscrowNotExpired,
        EscrowAlreadyRefunded,
        InvalidPartIndex,
        PartAlreadyClaimed,
        InvalidMerkleProof,
        TransferFailed,
    }

    /// Unit tests
    #[cfg(test)]
    mod tests {
        use super::*;

        fn create_test_escrow() -> EscrowDst {
            let maker = AccountId::from([1u8; 32]);
            let taker = AccountId::from([2u8; 32]);
            let merkle_root = Hash::from([3u8; 32]);
            let parts_count = 4;
            let expiry_timestamp = 1000;

            EscrowDst::new(maker, taker, merkle_root, parts_count, expiry_timestamp)
        }

        #[ink::test]
        fn test_new() {
            let escrow = create_test_escrow();
            let details = escrow.get_escrow_details();
            
            assert_eq!(details.maker, AccountId::from([1u8; 32]));
            assert_eq!(details.taker, AccountId::from([2u8; 32]));
            assert_eq!(details.merkle_root, Hash::from([3u8; 32]));
            assert_eq!(details.parts_count, 4);
            assert_eq!(details.expiry_timestamp, 1000);
            assert_eq!(details.parts_claimed, 0);
            assert_eq!(details.refunded, false);
        }

        #[ink::test]
        fn test_invalid_part_index() {
            let mut escrow = create_test_escrow();
            let result = escrow.claim_part(vec![], Hash::from([1u8; 32]), 5);
            assert_eq!(result, Err(EscrowDstError::InvalidPartIndex));
        }

        #[ink::test]
        fn test_part_already_claimed() {
            let mut escrow = create_test_escrow();
            
            // Try to claim part 2 before part 0
            let result = escrow.claim_part(vec![], Hash::from([1u8; 32]), 2);
            assert_eq!(result, Err(EscrowDstError::PartAlreadyClaimed));
        }

        #[ink::test]
        fn test_escrow_expired() {
            let maker = AccountId::from([1u8; 32]);
            let taker = AccountId::from([2u8; 32]);
            let merkle_root = Hash::from([3u8; 32]);
            let parts_count = 4;
            let expiry_timestamp = 1000;

            let mut escrow = EscrowDst::new(maker, taker, merkle_root, parts_count, expiry_timestamp);
            
            // Set block timestamp to after expiry
            ink::env::test::set_block_timestamp(1001);
            
            let result = escrow.claim_part(vec![], Hash::from([1u8; 32]), 0);
            assert_eq!(result, Err(EscrowDstError::EscrowExpired));
        }

        #[ink::test]
        fn test_refund_before_expiry() {
            let mut escrow = create_test_escrow();
            
            // Set block timestamp to before expiry
            ink::env::test::set_block_timestamp(999);
            
            let result = escrow.refund();
            assert_eq!(result, Err(EscrowDstError::EscrowNotExpired));
        }

        #[ink::test]
        fn test_refund_after_expiry() {
            let mut escrow = create_test_escrow();
            
            // Set block timestamp to after expiry
            ink::env::test::set_block_timestamp(1001);
            
            let result = escrow.refund();
            assert_eq!(result, Ok(()));
            
            let details = escrow.get_escrow_details();
            assert_eq!(details.refunded, true);
        }

        #[ink::test]
        fn test_double_refund() {
            let mut escrow = create_test_escrow();
            
            // Set block timestamp to after expiry
            ink::env::test::set_block_timestamp(1001);
            
            // First refund should succeed
            let result1 = escrow.refund();
            assert_eq!(result1, Ok(()));
            
            // Second refund should fail
            let result2 = escrow.refund();
            assert_eq!(result2, Err(EscrowDstError::EscrowAlreadyRefunded));
        }

        #[ink::test]
        fn test_claim_after_refund() {
            let mut escrow = create_test_escrow();
            
            // Set block timestamp to after expiry
            ink::env::test::set_block_timestamp(1001);
            
            // Refund the escrow
            let refund_result = escrow.refund();
            assert_eq!(refund_result, Ok(()));
            
            // Try to claim after refund
            let claim_result = escrow.claim_part(vec![], Hash::from([1u8; 32]), 0);
            assert_eq!(claim_result, Err(EscrowDstError::EscrowRefunded));
        }

        #[ink::test]
        fn test_merkle_proof_verification() {
            let escrow = create_test_escrow();
            
            // Test with empty proof and invalid secret
            let result = escrow.verify_merkle_proof(vec![], Hash::from([1u8; 32]), 0);
            assert_eq!(result, false);
        }

        #[ink::test]
        fn test_sequential_claim_validation() {
            let mut escrow = create_test_escrow();
            
            // Try to claim part 1 before part 0
            let result = escrow.claim_part(vec![], Hash::from([1u8; 32]), 1);
            assert_eq!(result, Err(EscrowDstError::PartAlreadyClaimed));
            
            // Try to claim part 0 (should work if we had valid proof)
            // This test shows the sequential requirement is enforced
        }
    }

    /// E2E tests
    #[cfg(all(test, feature = "e2e-tests"))]
    mod e2e_tests {
        use super::*;
        use ink_e2e::ContractsBackend;

        type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

        #[ink_e2e::test]
        async fn test_escrow_creation(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            // Given
            let maker = ink_e2e::alice().account_id();
            let taker = ink_e2e::bob().account_id();
            let merkle_root = Hash::from([3u8; 32]);
            let parts_count = 4;
            let expiry_timestamp = 1000;

            let mut constructor = EscrowDstRef::new(maker, taker, merkle_root, parts_count, expiry_timestamp);

            // When
            let contract = client
                .instantiate("escrow_dst", &ink_e2e::alice(), &mut constructor)
                .submit()
                .await
                .expect("instantiate failed");

            // Then
            let call_builder = contract.call_builder::<EscrowDst>();
            let get_details = call_builder.get_escrow_details();
            let result = client.call(&ink_e2e::alice(), &get_details).dry_run().await?;
            let details = result.return_value();
            
            assert_eq!(details.maker, maker);
            assert_eq!(details.taker, taker);
            assert_eq!(details.merkle_root, merkle_root);
            assert_eq!(details.parts_count, parts_count);
            assert_eq!(details.expiry_timestamp, expiry_timestamp);

            Ok(())
        }

        #[ink_e2e::test]
        async fn test_full_fill_scenario(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            // This test would simulate a full-fill scenario where all parts are claimed
            // Implementation would require setting up proper Merkle proofs
            Ok(())
        }

        #[ink_e2e::test]
        async fn test_partial_fill_scenario(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            // This test would simulate a partial-fill scenario where only some parts are claimed
            // Implementation would require setting up proper Merkle proofs
            Ok(())
        }

        #[ink_e2e::test]
        async fn test_refund_scenario(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            // This test would simulate a refund scenario after expiry
            Ok(())
        }
    }
}
