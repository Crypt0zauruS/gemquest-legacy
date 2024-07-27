import {
    Program,
    AnchorProvider,
    web3,
    setProvider,
    Wallet,
} from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { clusterApiUrl, PublicKey, Connection, Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import "dotenv/config";

const METADATA_SEED = Buffer.from("metadata");
const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

let wallet: any;
let program: Program;

async function main() {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    const walletKP = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY));
    wallet = new Wallet(walletKP as any);
    console.log("Wallet:", wallet.publicKey.toBase58());

    const provider = new AnchorProvider(connection as any, wallet, {
        preflightCommitment: "processed",
        commitment: "confirmed",
    });
    setProvider(provider);

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
        };
        return {
            name: fetched.name,
            symbol: fetched.symbol,
            uri: ipfsUrl,
        };
    }

    const metadata_gem_1 = await convertIpfsToHttp(
        "ipfs://QmTNdfcWPYmYHrmDnWvXMyjDMYxApxGSGMA41LEYrz3uG9/gem_1.json"
    );

    const metadata_gem_5 = await convertIpfsToHttp(
        "ipfs://QmTNdfcWPYmYHrmDnWvXMyjDMYxApxGSGMA41LEYrz3uG9/gem_5.json"
    );
    const metadata_gem_10 = await convertIpfsToHttp(
        "ipfs://QmTNdfcWPYmYHrmDnWvXMyjDMYxApxGSGMA41LEYrz3uG9/gem_10.json"
    );

    const metadata_gem_20 = await convertIpfsToHttp(
        "ipfs://QmTNdfcWPYmYHrmDnWvXMyjDMYxApxGSGMA41LEYrz3uG9/gem_20.json"
    );


    await CreateToken(metadata_gem_1);
    await CreateToken(metadata_gem_5);
    await CreateToken(metadata_gem_10);
    await CreateToken(metadata_gem_20);
}


/*
* Create new SPL Token with metadata
*/
async function CreateToken(metadata: {
    name: string;
    symbol: any;
    uri: string;
}) {
    const mintAccount = Keypair.generate();

    const [metadataAccount] = await PublicKey.findProgramAddress(
        [
            METADATA_SEED,
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mintAccount.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
    );

    await program.methods
        .createToken(metadata.name, metadata.symbol, metadata.uri)
        .accounts({
            payer: wallet.publicKey,
            mintAccount: mintAccount.publicKey,
            metadataAccount: metadataAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            systemProgram: web3.SystemProgram.programId,
        })
        .signers([mintAccount])
        .rpc();

    console.log("Token créé avec les métadonnées:", metadata);
    console.log("Token créé à l'adresse:", mintAccount.publicKey.toBase58());
    console.log("Compte de métadonnées:", metadataAccount.toBase58());
}

main().then(
    () => process.exit(),
    (err) => {
        console.error(err);
        process.exit(-1);
    }
);
