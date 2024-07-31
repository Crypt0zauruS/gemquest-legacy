use {
    anchor_lang::prelude::*,
    anchor_spl::{
        associated_token::AssociatedToken,
        metadata::{
            create_metadata_accounts_v3,
            mpl_token_metadata::types::DataV2, CreateMetadataAccountsV3,
            Metadata,
        },
        token::{mint_to, Mint, MintTo, Token, TokenAccount},
    },
};
use std::boxed::Box;

pub const INITIAL_PRICE: u64 = 200_000_000; 
pub const INITIAL_PRICE_SEED: &[u8] = b"initial_price";
pub const TICKET_STATUS_SEED: &[u8] = b"ticket_status";

// New enum added for ticket status
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum TicketStatus {
    Inactive = 0,
    Active = 1,
}

#[account]
pub struct InitialPriceAccount {
    pub price: u64,
}

pub fn initialize_initial_price(ctx: Context<InitializeInitialPrice>) -> Result<()> {
    ctx.accounts.initial_price_account.price = INITIAL_PRICE;
    Ok(())
}

pub fn update_initial_price(ctx: Context<UpdateInitialPrice>, new_price: u64) -> Result<()> {
    ctx.accounts.initial_price_account.price = new_price;
    Ok(())
}

pub fn get_initial_price(ctx: Context<GetInitialPrice>) -> Result<u64> {
    Ok(ctx.accounts.initial_price_account.price)
}

pub fn create_ticket_nft(
    ctx: Context<CreateTicketNFT>,
    nft_name: String,
    nft_symbol: String,
    nft_uri: String,
) -> Result<()> {
    let price = ctx.accounts.initial_price_account.price;

    if nft_name.is_empty() || nft_symbol.is_empty() || nft_uri.is_empty() {
        return Err(ErrorCode::InvalidInput.into());
    }

    // Transfer SOL from payer to admin
    anchor_lang::system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.payer.to_account_info(),
                to: ctx.accounts.admin.to_account_info(),
            },
        ),
        price,
    )?;

    // Mint the NFT
    mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint_nft_account.to_account_info(),
                to: ctx.accounts.associated_nft_token_account.to_account_info(),
                authority: ctx.accounts.admin.to_account_info(),
            },
        ),
        1, // NFTs typically have an amount of 1
    )?;

    // Create metadata for the NFT
    create_metadata_accounts_v3(
        CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata_account.to_account_info(),
                mint: ctx.accounts.mint_nft_account.to_account_info(),
                mint_authority: ctx.accounts.admin.to_account_info(),
                update_authority: ctx.accounts.admin.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        ),
        DataV2 {
            name: nft_name,
            symbol: nft_symbol,
            uri: nft_uri,
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        },
        true,  // Is mutable
        false, // Update authority is signer
        None,  // Collection details
    )?;

    // Set initial status to Inactive
    ctx.accounts.ticket_status_account.status = TicketStatus::Inactive;
    ctx.accounts.ticket_status_account.expiration = 0;

    Ok(())
}

// New function added to activate the ticket
pub fn activate_ticket(ctx: Context<ActivateTicket>) -> Result<()> {
    let clock = Clock::get()?;
    let current_time = clock.unix_timestamp;
    let expiration_time = current_time + 24 * 60 * 60; 
    ctx.accounts.ticket_status_account.status = TicketStatus::Active;
    ctx.accounts.ticket_status_account.expiration = expiration_time;
    Ok(())
}

// New function added to get the ticket status
pub fn get_ticket_status(ctx: Context<GetTicketStatus>) -> Result<(TicketStatus, i64)> {
    Ok((
        ctx.accounts.ticket_status_account.status.clone(),
        ctx.accounts.ticket_status_account.expiration
    ))
}

#[derive(Accounts)]
pub struct CreateTicketNFT<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    /// CHECK: This is the admin account that receives the payment
    pub admin: UncheckedAccount<'info>,

    #[account(seeds = [INITIAL_PRICE_SEED], bump)]
    pub initial_price_account: Box<Account<'info, InitialPriceAccount>>,
    
    /// CHECK: Validate address by deriving pda
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), mint_nft_account.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub metadata_account: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        mint::decimals = 0,
        mint::authority = admin.key(),
        mint::freeze_authority = admin.key(),
    )]
    pub mint_nft_account: Box<Account<'info, Mint>>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint_nft_account,
        associated_token::authority = payer,
    )]
    pub associated_nft_token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        payer = payer,
        space = 8 + 4 + 8, // discriminator + TicketStatus + expiration (i64)
        seeds = [TICKET_STATUS_SEED, mint_nft_account.key().as_ref()],
        bump
    )]
    pub ticket_status_account: Box<Account<'info, TicketStatusAccount>>,

    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct InitializeInitialPrice<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + 8, // 8 bytes for discriminator + 8 bytes for u64
        seeds = [INITIAL_PRICE_SEED],
        bump
    )]
    pub initial_price_account: Box<Account<'info, InitialPriceAccount>>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateInitialPrice<'info> {
    #[account(mut, seeds = [INITIAL_PRICE_SEED], bump)]
    pub initial_price_account: Box<Account<'info, InitialPriceAccount>>,
    #[account(mut)]
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetInitialPrice<'info> {
    #[account(seeds = [INITIAL_PRICE_SEED], bump)]
    pub initial_price_account: Box<Account<'info, InitialPriceAccount>>,
}

#[derive(Accounts)]
pub struct ActivateTicket<'info> {
    #[account(mut, seeds = [TICKET_STATUS_SEED, ticket_status_account.key().as_ref()], bump)]
    pub ticket_status_account: Box<Account<'info, TicketStatusAccount>>,
    #[account(mut)]
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetTicketStatus<'info> {
    #[account(seeds = [TICKET_STATUS_SEED, ticket_status_account.key().as_ref()], bump)]
    pub ticket_status_account: Box<Account<'info, TicketStatusAccount>>,
}

#[account]
pub struct TicketStatusAccount {
    pub status: TicketStatus,
    pub expiration: i64, 
}

impl Default for TicketStatus {
    fn default() -> Self {
        TicketStatus::Inactive
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid input provided.")]
    InvalidInput,
    #[msg("Invalid price provided.")]
    InvalidPrice,
    #[msg("Unauthorized access.")]
    Unauthorized,
}