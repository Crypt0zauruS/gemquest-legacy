import * as anchor from "@coral-xyz/anchor";
import { Program, web3, BN } from "@coral-xyz/anchor";
import { clusterApiUrl, PublicKey, Connection, Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import "dotenv/config";
import fs from "fs";
import path from "path";

const INITIAL_PRICE_SEED = "initial_price";

let wallet: anchor.Wallet;
let program: any;

async function main() {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const walletKPSecretKey = bs58.decode(process.env.PRIVATE_KEY);
  const walletKP = Keypair.fromSecretKey(walletKPSecretKey);

  wallet = new anchor.Wallet(walletKP as any);
  console.log("Wallet:", wallet.publicKey.toBase58());

  const provider = new anchor.AnchorProvider(connection as any, wallet, {
    preflightCommitment: "processed",
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  const idl = JSON.parse(
    require("fs").readFileSync("./target/idl/gemquest.json", "utf8")
  );
  program = new Program(idl, provider);
  console.log("Program ID:", program.programId.toBase58());

  await initializeInitialPrice();
}

async function initializeInitialPrice() {
  const [initialPricePDA] = await PublicKey.findProgramAddress(
    [Buffer.from(INITIAL_PRICE_SEED)],
    program.programId
  );

  try {
    await program.methods
      .initializeInitialPrice()
      .accounts({
        initialPriceAccount: initialPricePDA,
        admin: wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Initial price initialized successfully.");
    console.log("Initial Price PDA:", initialPricePDA.toBase58());

    // Fetch the initial price account for verification
    const account = await program.account.initialPriceAccount.fetch(
      initialPricePDA
    );
    console.log("Initial Price:", account.price.toString());

    // Create a file to store the initial price PDA
    const initialPriceContent = `
export const initialPricePDA = "${initialPricePDA.toBase58()}";
export const initialPrice = "${account.price.toString()}";

    `;
    fs.writeFileSync(
      path.join(__dirname, "initialPricePDA.js"),
      initialPriceContent
    );
    console.log("initialPricePDA.js file created successfully.");
  } catch (error) {
    console.error("Error initializing initial price:", error);
  }
}

main().then(
  () => process.exit(),
  (err) => {
    console.error(err);
    process.exit(-1);
  }
);
