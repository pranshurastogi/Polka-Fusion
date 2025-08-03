#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod escrow_factory {
    use ink::prelude::vec::Vec;

    /// Defines the storage of your contract.
    #[ink(storage)]
    pub struct EscrowFactory {
        /// The code hash of the EscrowDst contract
        escrow_dst_code_hash: Hash,
        /// Mapping from salt to deployed escrow address
        deployed_escrows: ink::storage::Mapping<Hash, AccountId>,
    }

    #[ink(event)]
    pub struct EscrowDeployed {
        #[ink(topic)]
        salt: Hash,
        #[ink(topic)]
        escrow: AccountId,
        maker: AccountId,
        taker: AccountId,
    }

    impl EscrowFactory {
        /// Constructor that initializes the factory with the EscrowDst code hash
        #[ink(constructor)]
        pub fn new(escrow_dst_code_hash: Hash) -> Self {
            Self {
                escrow_dst_code_hash,
                deployed_escrows: ink::storage::Mapping::default(),
            }
        }

        /// Deploy a new EscrowDst instance with the given salt
        #[ink(message)]
        pub fn deploy_escrow(
            &mut self,
            salt: Hash,
            maker: AccountId,
            taker: AccountId,
            _merkle_root: Hash,
            _parts_count: u32,
            _expiry_timestamp: u64,
        ) {
            // Check if escrow with this salt already exists
            if self.deployed_escrows.get(salt).is_some() {
                ink::env::debug_println!("Escrow already exists");
                return;
            }

            // For now, we'll just store the parameters and emit an event
            // In a real implementation, you would use the proper contract instantiation API
            let escrow_address = AccountId::from([0u8; 32]); // Placeholder
            
            // Store the deployed escrow address
            self.deployed_escrows.insert(salt, &escrow_address);

            // Emit event
            self.env().emit_event(EscrowDeployed {
                salt,
                escrow: escrow_address,
                maker,
                taker,
            });
        }

        /// Get the deployed escrow address for a given salt
        #[ink(message)]
        pub fn get_deployed_escrow(&self, salt: Hash) -> Option<AccountId> {
            self.deployed_escrows.get(salt)
        }

        /// Get the EscrowDst code hash
        #[ink(message)]
        pub fn get_escrow_dst_code_hash(&self) -> Hash {
            self.escrow_dst_code_hash
        }
    }

    /// Unit tests
    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn test_new() {
            let code_hash = Hash::from([1u8; 32]);
            let factory = EscrowFactory::new(code_hash);
            assert_eq!(factory.get_escrow_dst_code_hash(), code_hash);
        }

        #[ink::test]
        fn test_get_deployed_escrow() {
            let code_hash = Hash::from([1u8; 32]);
            let factory = EscrowFactory::new(code_hash);
            let salt = Hash::from([2u8; 32]);
            assert_eq!(factory.get_deployed_escrow(salt), None);
        }

        #[ink::test]
        fn test_deploy_escrow() {
            let code_hash = Hash::from([1u8; 32]);
            let mut factory = EscrowFactory::new(code_hash);
            let salt = Hash::from([2u8; 32]);
            let maker = AccountId::from([3u8; 32]);
            let taker = AccountId::from([4u8; 32]);
            let merkle_root = Hash::from([5u8; 32]);
            let parts_count = 4;
            let expiry_timestamp = 1000;

            factory.deploy_escrow(salt, maker, taker, merkle_root, parts_count, expiry_timestamp);
            
            // Should have deployed an escrow
            assert!(factory.get_deployed_escrow(salt).is_some());
        }
    }

    /// E2E tests
    #[cfg(all(test, feature = "e2e-tests"))]
    mod e2e_tests {
        use super::*;
        use ink_e2e::ContractsBackend;

        type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

        #[ink_e2e::test]
        async fn test_deploy_escrow(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            // Given
            let code_hash = Hash::from([1u8; 32]);
            let mut constructor = EscrowFactoryRef::new(code_hash);

            // When
            let contract = client
                .instantiate("escrow_factory", &ink_e2e::alice(), &mut constructor)
                .submit()
                .await
                .expect("instantiate failed");

            // Then
            let call_builder = contract.call_builder::<EscrowFactory>();
            let get_code_hash = call_builder.get_escrow_dst_code_hash();
            let result = client.call(&ink_e2e::alice(), &get_code_hash).dry_run().await?;
            assert_eq!(result.return_value(), code_hash);

            Ok(())
        }
    }
}
