use anchor_lang::prelude::*;
use anchor_spl::token;
use anchor_spl::token::{Token, MintTo, Transfer, Burn, Mint, TokenAccount};

pub fn burn_token_transfer_nft(ctx: Context<TransferToken>, nft_price: u64) -> Result<()> {
    if nft_price == 0 {
        return Err(ErrorCode::InvalidPrice.into());
    }

    if ctx.accounts.associated_token_account.amount < nft_price {
        return Err(ErrorCode::InsufficientBalance.into());
    }

    // Burn tokens before transferring the NFT
    let burn_cpi_accounts = Burn {
        mint: ctx.accounts.mint_token_account.to_account_info(),
        from: ctx.accounts.associated_token_account.to_account_info(),
        authority: ctx.accounts.from_authority.to_account_info(),
    };
    let burn_cpi_program = ctx.accounts.token_program.to_account_info();
    let burn_cpi_ctx = CpiContext::new(burn_cpi_program, burn_cpi_accounts);
    token::burn(burn_cpi_ctx, nft_price)?;

    let special_key = Pubkey::new_from_array([1; 32]);
    if ctx.accounts.to.key() != special_key {
        // Create the Transfer struct for our context
        let transfer_instruction = Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.from_authority.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        // Create the Context for our Transfer request
        let cpi_ctx = CpiContext::new(cpi_program, transfer_instruction);

        // Execute anchor's helper function to transfer tokens
        anchor_spl::token::transfer(cpi_ctx, 1)?;
    }

    Ok(())
}

#[derive(Accounts)]
pub struct TransferToken<'info> {
    #[account(mut)]
    pub associated_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub mint_token_account: Account<'info, Mint>,

    /// CHECK: The associated token account that we are transferring the token from
    #[account(mut)]
    pub from: UncheckedAccount<'info>,

    /// CHECK: The associated token account that we are transferring the token to
    /// This account can be optionally not provided by checking if it's default
    #[account(mut)]
    pub to: AccountInfo<'info>,

    pub from_authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid input provided.")]
    InvalidInput,
    #[msg("Invalid price provided.")]
    InvalidPrice,
    #[msg("Insufficient balance.")]
    InsufficientBalance,
    #[msg("Unauthorized access.")]
    Unauthorized,
}
