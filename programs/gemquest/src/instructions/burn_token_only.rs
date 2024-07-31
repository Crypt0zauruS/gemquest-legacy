use anchor_lang::prelude::*;
use anchor_spl::token;
use anchor_spl::token::{Token, Burn, Mint, TokenAccount};

pub fn burn_token(ctx: Context<BurnToken>, amount: u64) -> Result<()> {
    if amount == 0 {
        return Err(ErrorCode::InvalidAmount.into());
    }

    if ctx.accounts.token_account.amount < amount {
        return Err(ErrorCode::InsufficientBalance.into());
    }

    let burn_cpi_accounts = Burn {
        mint: ctx.accounts.mint.to_account_info(),
        from: ctx.accounts.token_account.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
    };
    let burn_cpi_program = ctx.accounts.token_program.to_account_info();
    let burn_cpi_ctx = CpiContext::new(burn_cpi_program, burn_cpi_accounts);
    token::burn(burn_cpi_ctx, amount)?;

    Ok(())
}

#[derive(Accounts)]
pub struct BurnToken<'info> {
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}