// import * as anchor from "@coral-xyz/anchor";
// import { Program, web3, BN } from "@coral-xyz/anchor";
// import { getAssociatedTokenAddressSync } from "@solana/spl-token";
// import { clusterApiUrl, PublicKey, Connection, Keypair } from "@solana/web3.js";
// import {
//   TOKEN_PROGRAM_ID,
//   ASSOCIATED_TOKEN_PROGRAM_ID,
// } from "@solana/spl-token";
// import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
// import bs58 from "bs58";
// import "dotenv/config";
// import fs from "fs";
// import path from "path";

// const SEED_METADATA = "metadata";
// const TOKEN_METADATA_PROGRAM_ID = new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID);
// const initialAmount = new BN(1);
// const initialPrice = new BN(200000000); // 0.2 SOL in lamports
// let wallet: anchor.Wallet;
// let program: Program;
// let ticketMetadata: any;
// let ticketType: PublicKey;
// let metaData: any;

// async function main() {
//   const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

//   const walletKPSecretKey = bs58.decode(process.env.PRIVATE_KEY);
//   const walletKP = Keypair.fromSecretKey(walletKPSecretKey);

//   wallet = new anchor.Wallet(walletKP as any);
//   console.log("Wallet:", wallet.publicKey.toBase58());

//   const provider = new anchor.AnchorProvider(connection as any, wallet, {
//     preflightCommitment: "processed",
//     commitment: "confirmed",
//   });
//   anchor.setProvider(provider);

//   const idl = JSON.parse(
//     require("fs").readFileSync("./target/idl/gemquest.json", "utf8")
//   );
//   program = new Program(idl, provider);
//   console.log("Program ID:", program.programId.toBase58());

//   async function convertIpfsToHttp(ipfsUrl: string) {
//     const httpMetadataUri = ipfsUrl.replace(
//       "ipfs://",
//       "https://fuchsia-varying-camel-696.mypinata.cloud/ipfs/"
//     );
//     const response = await fetch(httpMetadataUri);
//     const fetched = (await response.json()) as {
//       symbol: string;
//       name: string;
//       properties: any;
//     };
//     return {
//       name: fetched.name,
//       symbol: fetched.symbol,
//       uri: ipfsUrl,
//     };
//   }

//   const metadataGQTCK = await convertIpfsToHttp(
//     "ipfs://QmeqjN9FsMiabCagjWftcuzAaxMiXFgV55Sre23EeF3wcY"
//   );
//   await CreateTicketType(metadataGQTCK);
//   // await CreateTicketNFT();

//   // Create ticket.js file
//   const ticketContent = `export const ticketMetadata = ${JSON.stringify(
//     ticketMetadata,
//     null,
//     2
//   )};`;

//   fs.writeFileSync(path.join(__dirname, "util3TicketType.js"), ticketContent);
//   console.log("ticket.js file created successfully.");
// }

// async function CreateTicketType(metadata: any) {
//   const ticketTypeKeypair = new Keypair();

//   await program.methods
//     .createTicketType(
//       metadata.name,
//       metadata.symbol,
//       metadata.uri,
//       initialPrice
//     )
//     .accounts({
//       admin: wallet.publicKey,
//       ticketType: ticketTypeKeypair.publicKey,
//       systemProgram: web3.SystemProgram.programId,
//     })
//     .signers([ticketTypeKeypair])
//     .rpc();
//   ticketType = ticketTypeKeypair.publicKey;
//   console.log("Ticket Type created:", ticketType.toBase58());
//   // console.log("Ticket Type Keypair:", ticketTypeKeypair.secretKey);
//   console.log("Ticket Type Metadata:", metadata);
//   ticketMetadata = {
//     name: metadata.name,
//     symbol: metadata.symbol,
//     uri: metadata.uri,
//     ticketTypeAddress: ticketType.toBase58(),
//     // ticketTypeKeypair: ticketTypeKeypair.secretKey,
//     price: initialPrice.toString(),
//   };
// }

///////////////////////////////////////////////////// NEVER USED ///////////////////////////////////////////////////////
// async function CreateTicketNFT() {
//   const mintTicketTokenAccount = new Keypair();

//   const associatedTicketTokenAccountAddress = getAssociatedTokenAddressSync(
//     mintTicketTokenAccount.publicKey,
//     wallet.publicKey
//   );

//   const [metadataAccount] = await PublicKey.findProgramAddress(
//     [
//       Buffer.from(SEED_METADATA),
//       TOKEN_METADATA_PROGRAM_ID.toBuffer(),
//       mintTicketTokenAccount.publicKey.toBuffer(),
//     ],
//     TOKEN_METADATA_PROGRAM_ID
//   );

//   await program.methods
//     .createTicketNft(initialAmount)
//     .accounts({
//       payer: wallet.publicKey,
//       admin: wallet.publicKey, // Assuming the wallet is also the admin
//       ticketType,
//       mintNftAccount: mintTicketTokenAccount.publicKey,
//       associatedNftTokenAccount: associatedTicketTokenAccountAddress,
//       metadataAccount: metadataAccount,
//       tokenProgram: TOKEN_PROGRAM_ID,
//       tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
//       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
//       systemProgram: web3.SystemProgram.programId,
//       rent: web3.SYSVAR_RENT_PUBKEY,
//     })
//     .signers([mintTicketTokenAccount])
//     .rpc();
//   console.log(
//     Number(initialAmount.toString()),
//     "Ticket(s) NFT created at:",
//     mintTicketTokenAccount.publicKey.toBase58()
//   );
//   console.log(
//     "Associated Token Account:",
//     associatedTicketTokenAccountAddress.toBase58()
//   );
//   console.log("Metadata Account:", metadataAccount.toBase58());

//   ticketMetadata = {
//     name: metaData.name,
//     symbol: metaData.symbol,
//     address: mintTicketTokenAccount.publicKey.toBase58(),
//     metadataAccount: metadataAccount.toBase58(),
//     uri: metaData.uri,
//     ticketType: ticketType.toBase58(),
//   };
// }
///////////////////////////////////////////////////// NEVER USED ///////////////////////////////////////////////////////

// main().then(
//   () => process.exit(),
//   (err) => {
//     console.error(err);
//     process.exit(-1);
//   }
// );
