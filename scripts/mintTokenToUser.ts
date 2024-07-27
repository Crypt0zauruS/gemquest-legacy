import {
  Program,
  AnchorProvider,
  web3,
  setProvider,
  Wallet,
  BN,
} from "@coral-xyz/anchor";
import { publicKey } from "@project-serum/anchor/dist/cjs/utils";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { clusterApiUrl, PublicKey, Connection, Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import "dotenv/config";

import {
  gemAddresses,
  gemMetadataAccounts,
  nftMetadata,
  ipfsGateway,
  tokenMetadataProgramId,
} from "../frontend/src/utils";

let wallet: any;
let program: Program;
let provider: AnchorProvider;

// GEM TOKEN
const mintTokenAccount = new PublicKey(
  "tbvf6yzmE1R9tDuURQBVELZk2ZvTgyw2jviGUhhuXEe"
);

async function main() {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const walletKP = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY));
  wallet = new Wallet(walletKP as any);
  console.log("Wallet:", wallet.publicKey.toBase58());

  provider = new AnchorProvider(connection as any, wallet, {
    preflightCommitment: "processed",
    commitment: "confirmed",
  });
  setProvider(provider);

  const idl = JSON.parse(
    require("fs").readFileSync("./target/idl/gemquest.json", "utf8")
  );
  program = new Program(idl, provider);
  console.log("Program ID:", program.programId.toBase58());

  await MintTokenToUser(provider.wallet.publicKey, 1000);
}

async function MintTokenToUser(to: PublicKey, amount: number) {
  // Derive the associated token address account for the mint and user.
  const associatedTokenAccountAddress = getAssociatedTokenAddressSync(
    mintTokenAccount,
    to
  );

  // Mint the tokens to the associated token account.
  const transactionSignature = await program.methods
    .mintTokensToUser(new BN(amount))
    .accounts({
      mintAuthority: provider.wallet.publicKey,
      recipient: to,
      mintAccount: mintTokenAccount,
      associatedTokenAccount: associatedTokenAccountAddress,

      // system
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  const postBalance = (
    await program.provider.connection.getTokenAccountBalance(
      associatedTokenAccountAddress
    )
  ).value.uiAmount;

  console.log(amount, "tokens minted to user: ", to.toBase58());
  console.log("User balance: ", postBalance);
}

main().then(
  () => process.exit(),
  (err) => {
    console.error(err);
    process.exit(-1);
  }
);
