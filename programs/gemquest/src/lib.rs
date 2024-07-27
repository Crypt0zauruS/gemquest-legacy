
use anchor_lang::prelude::*;
declare_id!("4MUuZnYgakTqerEBjsD783s4QP2trwyy2KWZ9SXJdffZ");

pub mod instructions;

use instructions::*;

#[program]
pub mod gemquest {
    use super::*;

    pub fn initialize_program(ctx: Context<InitializeProgram>) -> Result<()> {
        instructions::initialize_program::initialize_program(ctx)
    }

    pub fn initialize_user_account(ctx: Context<InitializeUserAccount>) -> Result<()> {
        instructions::initialize_user_account::initialize_user_account(ctx)
    }

    pub fn create_token(
        ctx: Context<CreateToken>,
        token_name: String,
        token_symbol: String,
        token_uri: String,
    ) -> Result<()> {
         instructions::create_token::create_token(ctx, token_name, token_symbol, token_uri)
    }

    pub fn mint_tokens_to_user(ctx: Context<MintTokensToUser>, amount: u64) -> Result<()> {
        instructions::mint_tokens_to_user::mint_tokens_to_user(ctx, amount)
    }

    pub fn create_nft(
        ctx: Context<CreateNFT>,
        nft_name: String,
        nft_symbol: String,
        nft_uri: String,
        amount: u64,
    ) -> Result<()> {
        instructions::create_nft::create_nft(ctx, nft_name, nft_symbol, nft_uri, amount)
    }

    pub fn approve_token(ctx: Context<ApproveToken>, amount: u64) -> Result<()> {
        instructions::approve_token::approve_token(ctx, amount)
    }

    pub fn burn_token_transfer_nft(ctx: Context<TransferToken>, nft_price: u64) -> Result<()> {
        instructions::burn_token_transfer_nft::burn_token_transfer_nft(ctx, nft_price)
    }
}