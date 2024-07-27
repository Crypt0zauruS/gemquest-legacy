import * as anchor from "@coral-xyz/anchor";
import { Program, web3, BN } from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { clusterApiUrl, PublicKey, Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import bs58 from "bs58";
import "dotenv/config";
import { publicKey } from "@metaplex-foundation/umi/serializers";

const SEED_METADATA = "metadata";
const SEED_EDITION = "edition";
const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

let wallet: anchor.Wallet;
let program: Program;

async function main() {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    const walletKPSecretKey = bs58.decode(process.env.PRIVATE_KEY);
    const walletKP = Keypair.fromSecretKey(walletKPSecretKey);

    // create a new wallet
    wallet = new anchor.Wallet(walletKP as any);
    console.log("Wallet:", wallet.publicKey.toBase58());

    // Set provider
    const provider = new anchor.AnchorProvider(connection as any, wallet, {
        preflightCommitment: "processed",
        commitment: "confirmed",
    });
    anchor.setProvider(provider);

    // Load the program
    const idl = JSON.parse(
        require("fs").readFileSync("./target/idl/gemquest.json", "utf8")
    );
    program = new Program(idl, provider);
    console.log("Program ID:", program.programId.toBase58());

    async function convertIpfsToHttp(ipfsUrl: string) {
        const httpMetadataUri = ipfsUrl.replace(
            "ipfs://",
            "https://fuchsia-varying-camel-696.mypinata.cloud/ipfs/"
        );
        const response = await fetch(httpMetadataUri);
        const fetched = (await response.json()) as {
            symbol: any;
            name: string;
            properties: any;
        };
        return {
            name: fetched.name,
            symbol: fetched.symbol,
            uri: ipfsUrl,
        };
    }

    const metadataGQEEA = await convertIpfsToHttp(
        "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQEEA.json"
    );

    const metadataGQFD = await convertIpfsToHttp(
        "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQFD.json"
    );

    const metadataGQFS = await convertIpfsToHttp(
        "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQFS.json"
    );

    const metadataGQGC = await convertIpfsToHttp(
        "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQGC.json"
    );

    const metadataGQGP = await convertIpfsToHttp(
        "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQGP.json"
    );
    const metadataGQGS = await convertIpfsToHttp(
        "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQGS.json"
    );
    const metadataGQSKL = await convertIpfsToHttp(
        "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQSKL.json"
    );
    const metadataGQTS = await convertIpfsToHttp(
        "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQTS.json"
    );
    const metadataGQVIP = await convertIpfsToHttp(
        "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQVIP.json"
    );
    const amount = 99;
    await CreateNFT(metadataGQEEA, amount);
    await CreateNFT(metadataGQFD, amount);
    await CreateNFT(metadataGQFS, amount);
    await CreateNFT(metadataGQGC, amount);
    await CreateNFT(metadataGQGP, amount);
    await CreateNFT(metadataGQGS, amount);
    await CreateNFT(metadataGQSKL, amount);
    await CreateNFT(metadataGQTS, amount);
    await CreateNFT(metadataGQVIP, amount);
}


/**
 * Create a new NFT with metadata
 */
async function CreateNFT(metadata: any, amount: number) {

    // Generate a new keypair for the mint
    const mintNftTokenAccount = new Keypair();

    // Derive the associated token address account for the mint and payer.
    const associatedNftTokenAccountAddress = getAssociatedTokenAddressSync(
        mintNftTokenAccount.publicKey,
        wallet.publicKey
    );

    const [metadataAccount] = await PublicKey.findProgramAddress(
        [
            Buffer.from(SEED_METADATA),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mintNftTokenAccount.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
    );

    const [editionAccount] = await PublicKey.findProgramAddress(
        [
            Buffer.from(SEED_METADATA),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mintNftTokenAccount.publicKey.toBuffer(),
            Buffer.from(SEED_EDITION),
        ],
        TOKEN_METADATA_PROGRAM_ID
    );

    await program.methods
        .createNft(metadata.name, metadata.symbol, metadata.uri, new BN(amount))
        .accounts({
            payer: wallet.publicKey,

            metadataAccount: metadataAccount,
            editionAccount: editionAccount,

            mintNftAccount: mintNftTokenAccount.publicKey,
            associatedNftTokenAccount: associatedNftTokenAccountAddress,

            tokenProgram: TOKEN_PROGRAM_ID,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: web3.SystemProgram.programId,
            rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([mintNftTokenAccount])
        .rpc();

    console.log("NFTs created with metadata:", metadata);
    console.log("NFT created at:", mintNftTokenAccount.publicKey.toBase58());
    console.log(
        "Associated Token Account:",
        associatedNftTokenAccountAddress.toBase58()
    );
    console.log("Metadata Account:", metadataAccount.toBase58());
    console.log("Edition Account:", editionAccount.toBase58());
}

main().then(
    () => process.exit(),
    (err) => {
        console.error(err);
        process.exit(-1);
    }
);
