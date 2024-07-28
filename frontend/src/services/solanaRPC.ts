import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { CustomChainConfig, IProvider } from "@web3auth/base";
import { SolanaWallet } from "@web3auth/solana-provider";
import idl from "../lib/gemquest.json";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  AccountLayout,
} from "@solana/spl-token";
import bs58 from "bs58";
import {
  AnchorProvider,
  BN,
  Program,
  setProvider,
  web3,
} from "@coral-xyz/anchor";
import {
  mplTokenMetadata,
  fetchDigitalAssetByMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  gemAddresses,
  gemMetadataAccounts,
  nftMetadata,
  ipfsGateway,
} from "../utils";

export default class SolanaRpc {
  private provider: IProvider;
  umi: any;

  constructor(provider: IProvider) {
    this.provider = provider;
    this.umi = createUmi("https://api.devnet.solana.com").use(
      mplTokenMetadata()
    );
  }

  getAccounts = async (): Promise<string[]> => {
    try {
      const solanaWallet = new SolanaWallet(this.provider);
      const acc = await solanaWallet.requestAccounts();
      return acc;
    } catch (error) {
      return error as string[];
    }
  };

  getBalance = async (): Promise<string> => {
    try {
      const solanaWallet = new SolanaWallet(this.provider);
      const connectionConfig = await solanaWallet.request<
        string[],
        CustomChainConfig
      >({
        method: "solana_provider_config",
        params: [],
      });
      const conn = new Connection(connectionConfig.rpcTarget);

      const accounts = await solanaWallet.requestAccounts();
      const balance = await conn.getBalance(new PublicKey(accounts[0]));
      return balance.toString();
    } catch (error) {
      return error as string;
    }
  };

  signMessage = async (message: string): Promise<string> => {
    try {
      const solanaWallet = new SolanaWallet(this.provider);
      const msg = Buffer.from(message, "utf8");
      const res = await solanaWallet.signMessage(msg as any);
      return res.toString();
    } catch (error) {
      console.error("Sign message error:", error);
      return "";
    }
  };

  mintGems = async (amount: number, mintAddress: string): Promise<string> => {
    if (amount <= 0) {
      return "";
    }
    try {
      const users = await this.getAccounts();
      const userWallet = users[0];
      const connectionConfig = {
        rpcTarget: "https://api.devnet.solana.com",
      };
      const conn = new Connection(connectionConfig.rpcTarget);
      // Récupérez la clé privée de l'API
      const response = await fetch("/api/getKey", { method: "POST" });
      const data = await response.json();
      // Décodez la clé privée de adminWallet
      const adminWalletSecretKey = bs58.decode(data.privateKey);
      const adminWallet = Keypair.fromSecretKey(adminWalletSecretKey);
      const provider = new AnchorProvider(conn, adminWallet as any, {
        preflightCommitment: "finalized",
      });
      setProvider(provider);
      const program = new Program(idl as any, provider);

      const mint = new PublicKey(mintAddress);

      const associatedTokenAccount = getAssociatedTokenAddressSync(
        mint,
        new PublicKey(userWallet as string)
      );

      console.table({
        programId: program.programId.toBase58(),
        userWallet: userWallet,
        signer: adminWallet.publicKey.toBase58(),
        mint: mint.toBase58(),
        associatedTokenAccount: associatedTokenAccount.toBase58(),
      });

      const instruction = program.instruction.mintTokensToUser(new BN(amount), {
        accounts: {
          mintAuthority: provider.wallet.publicKey,
          recipient: userWallet,
          mintAccount: mint,
          associatedTokenAccount: associatedTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        },
      });

      const { blockhash } = await conn.getRecentBlockhash("finalized");

      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: adminWallet.publicKey,
      }).add(instruction);

      const signature = await sendAndConfirmTransaction(conn, transaction, [
        adminWallet,
      ]);
      console.log("Transaction confirmed:", signature);
      return signature;
    } catch (error) {
      console.error("Error in mintGems:", error);
      throw error;
    }
  };

  fetchGems = async (): Promise<{ [key: string]: number }> => {
    try {
      const users = await this.getAccounts();
      const connectionConfig = {
        rpcTarget: "https://api.devnet.solana.com",
      };
      const conn = new Connection(connectionConfig.rpcTarget);
      const userWallet = new PublicKey(users[0]);

      const getTokenBalance = async (mintAddress: PublicKey) => {
        const associatedTokenAccount = await PublicKey.findProgramAddress(
          [
            userWallet.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            mintAddress.toBuffer(),
          ],
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const tokenAccountInfo = await conn.getAccountInfo(
          associatedTokenAccount[0]
        );
        if (!tokenAccountInfo) return 0;

        const amount = tokenAccountInfo.data.readUIntLE(64, 8);
        return amount / LAMPORTS_PER_SOL;
      };

      const gem1Balance = await getTokenBalance(new PublicKey(gemAddresses[1]));
      const gem5Balance = await getTokenBalance(new PublicKey(gemAddresses[5]));
      const gem10Balance = await getTokenBalance(
        new PublicKey(gemAddresses[10])
      );
      const gem20Balance = await getTokenBalance(
        new PublicKey(gemAddresses[20])
      );

      return {
        gem1: gem1Balance,
        gem5: gem5Balance,
        gem10: gem10Balance,
        gem20: gem20Balance,
      };
    } catch (error) {
      console.error("Failed to fetch user gems:", error);
      throw error;
    }
  };

  fetchGemsMetadata = async (): Promise<{ [key: string]: any }> => {
    try {
      const getMetadata = async (metadataAccount: string) => {
        const metadataPDA: any = [new PublicKey(metadataAccount), 0];
        const asset = await fetchDigitalAssetByMetadata(this.umi, metadataPDA);
        return asset;
      };
      const fetchJsonFromIpfs = async (url: string) => {
        const response = await fetch(url.replace("ipfs://", ipfsGateway));
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
      };

      const gem1Metadata = await getMetadata(gemMetadataAccounts[1]);
      const gem5Metadata = await getMetadata(gemMetadataAccounts[5]);
      const gem10Metadata = await getMetadata(gemMetadataAccounts[10]);
      const gem20Metadata = await getMetadata(gemMetadataAccounts[20]);

      const gemsMetadataUrls = {
        gem1: gem1Metadata.metadata.uri,
        gem5: gem5Metadata.metadata.uri,
        gem10: gem10Metadata.metadata.uri,
        gem20: gem20Metadata.metadata.uri,
      };

      const gem1Data = await fetchJsonFromIpfs(gemsMetadataUrls.gem1);
      const gem5Data = await fetchJsonFromIpfs(gemsMetadataUrls.gem5);
      const gem10Data = await fetchJsonFromIpfs(gemsMetadataUrls.gem10);
      const gem20Data = await fetchJsonFromIpfs(gemsMetadataUrls.gem20);

      return {
        gem1: gem1Data,
        gem5: gem5Data,
        gem10: gem10Data,
        gem20: gem20Data,
      };
    } catch (error) {
      console.error("Failed to fetch gems metadata:", error);
      throw error;
    }
  };

  fetchNFT = async (): Promise<{ [key: string]: any }> => {
    try {
      const getMetadata = async (metadataAccount: string) => {
        const metadataPDA: any = [new PublicKey(metadataAccount), 0];
        const asset = await fetchDigitalAssetByMetadata(this.umi, metadataPDA);
        return asset;
      };

      const fetchJsonFromIpfs = async (url: string) => {
        const response = await fetch(url.replace("ipfs://", ipfsGateway));
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
      };

      const metadata = await Promise.all(
        nftMetadata.map(async (nft) => {
          const metadataInfo = await getMetadata(nft.metadataAccount);
          const metadataUri = metadataInfo.metadata.uri;
          const metadataJson = await fetchJsonFromIpfs(metadataUri);
          return { ...nft, metadata: metadataJson };
        })
      );

      const metadataMap: { [key: string]: any } = {};
      metadata.forEach((nft) => {
        metadataMap[nft.symbol] = {
          metadata: nft.metadata,
          address: nft.address,
        };
      });

      return metadataMap;
    } catch (error) {
      console.error("Failed to fetch NFT metadata:", error);
      throw error;
    }
  };

  approveTokenBurn = async (
    gemAmount: number,
    mintAddress: PublicKey
  ): Promise<string> => {
    if (gemAmount <= 0) {
      return "";
    }
    try {
      console.log("Starting approveTokenBurn: mint adress", mintAddress);
      const solanaWallet = new SolanaWallet(this.provider);
      const users = await this.getAccounts();
      const userWallet = users[0];
      const connectionConfig = {
        rpcTarget: "https://api.devnet.solana.com",
      };
      const conn = new Connection(connectionConfig.rpcTarget);

      console.log("Fetching admin wallet key");
      // Récupérez la clé privée de l'API
      const response = await fetch("/api/getKey", { method: "POST" });
      const data = await response.json();
      // Décodez la clé privée de adminWallet
      const adminWalletSecretKey = bs58.decode(data.privateKey);
      const adminWallet = Keypair.fromSecretKey(adminWalletSecretKey);

      const provider = new AnchorProvider(conn, adminWallet as any, {
        preflightCommitment: "finalized",
      });
      const program = new Program(idl as any, provider);
      setProvider(provider);

      const GEM_AMOUNT = gemAmount * web3.LAMPORTS_PER_SOL;
      console.log("GEM_AMOUNT", GEM_AMOUNT);

      console.log("Creating/getting user token account");
      const userTokenATA = await getOrCreateAssociatedTokenAccount(
        program.provider.connection,
        adminWallet, // Payer
        mintAddress,
        new PublicKey(userWallet)
      );
      console.log("Creating approve token instruction");
      // Give allowance to admin to burn user token
      const instructionApproveToken = await program.instruction.approveToken(
        new BN(GEM_AMOUNT),
        {
          accounts: {
            associatedTokenAccount: userTokenATA.address,
            delegate: adminWallet.publicKey,
            authority: userWallet,
            // system
            tokenProgram: TOKEN_PROGRAM_ID,
          },
        }
      );

      console.log("Fetching latest blockhash");
      const latestBlockhashInfo = await conn.getLatestBlockhash("finalized");

      console.log("Creating transaction");
      const transactionApprove = new Transaction({
        blockhash: latestBlockhashInfo.blockhash,
        feePayer: new PublicKey(userWallet),
        lastValidBlockHeight: latestBlockhashInfo.lastValidBlockHeight,
      }).add(instructionApproveToken);

      console.log("Signing and sending transaction");
      // Using web3auth wallet to sign the transaction
      const signedTx = await solanaWallet.signAndSendTransaction(
        transactionApprove
      );

      console.log("Approve Token Transaction confirmed:", signedTx);

      // Fetch the updated token account info
      const accountInfo = await conn.getAccountInfo(userTokenATA.address);
      if (accountInfo) {
        const tokenAccountInfo = AccountLayout.decode(
          Uint8Array.from(accountInfo.data)
        );
        const delegatedAmount = tokenAccountInfo.delegatedAmount;
        const delegatedGemAmount =
          Number(delegatedAmount) / web3.LAMPORTS_PER_SOL;
        console.log(
          "Updated number of gems delegated:",
          delegatedGemAmount.toString(),
          "gems"
        );
      } else {
        console.log("Failed to fetch updated token account info.");
      }

      return signedTx?.signature;
    } catch (error) {
      console.error("Error in approveTokenBurn:", error);
      throw error;
    }
  };

  checkApproveToken = async (userWallet: PublicKey, mintAddress: PublicKey) => {
    try {
      const connectionConfig = {
        rpcTarget: "https://api.devnet.solana.com",
      };
      const conn = new Connection(connectionConfig.rpcTarget);
      // Récupérez la clé privée de l'API
      const response = await fetch("/api/getKey", { method: "POST" });
      const data = await response.json();
      // Décodez la clé privée de adminWallet
      const adminWalletSecretKey = bs58.decode(data.privateKey);
      const adminWallet = Keypair.fromSecretKey(
        new Uint8Array(adminWalletSecretKey)
      );

      const provider = new AnchorProvider(conn, adminWallet as any, {
        preflightCommitment: "finalized",
      });
      const program = new Program(idl as any, provider);
      setProvider(provider);

      const userTokenATA = await getOrCreateAssociatedTokenAccount(
        program.provider.connection,
        adminWallet, // Payer
        mintAddress,
        userWallet
      );

      const accountInfo = await program.provider.connection.getAccountInfo(
        userTokenATA.address
      );

      if (accountInfo) {
        const tokenAccount = AccountLayout.decode(
          new Uint8Array(accountInfo.data)
        );
        const delegatedAmount = tokenAccount.delegatedAmount;
        console.log("Token delegated of user wallet:", delegatedAmount);
        return delegatedAmount;
      } else {
        console.log("Token account does not exist or has no delegated tokens.");
        return 0;
      }
    } catch (error) {
      console.error("Error in checkApproveToken:", error);
      throw error;
    }
  };

  burnTokenTransferNFT = async (
    nftTokenAddr: string,
    nft_price: number,
    gemAmounts: { [key: string]: number }
  ): Promise<string> => {
    try {
      const users = await this.getAccounts();
      const userWallet = users[0];
      const connectionConfig = {
        rpcTarget: "https://api.devnet.solana.com",
      };
      const conn = new Connection(connectionConfig.rpcTarget);
      // Récupérez la clé privée de l'API
      const response = await fetch("/api/getKey", { method: "POST" });
      const data = await response.json();
      const adminWalletSecretKey = bs58.decode(data.privateKey);
      const adminWallet = Keypair.fromSecretKey(
        new Uint8Array(adminWalletSecretKey)
      );
      const provider = new AnchorProvider(conn, adminWallet as any, {
        preflightCommitment: "finalized",
      });
      const program = new Program(idl as any, provider);
      setProvider(provider);

      // check if total gems fit the nft price
      let totalGems = 0;
      for (const [gemValue, gemAmount] of Object.entries(gemAmounts)) {
        if (gemValue !== "refund") {
          totalGems += gemAmount * parseInt(gemValue);
        }
      }
      console.log("Total gems amount:", totalGems, "NFT price:", nft_price);
      if (totalGems < nft_price) {
        throw new Error("Total gems amount is less than NFT price");
      } else if (totalGems > nft_price) {
        const refund = totalGems - nft_price;
        if (gemAmounts["refund"] !== refund) {
          throw new Error("Refund amount does not match the difference");
        }
      }
      console.log("NFT Token Address:", nftTokenAddr);
      const MINT_NFT_ACCOUNT = new PublicKey(nftTokenAddr);

      const userNftATA = await getOrCreateAssociatedTokenAccount(
        program.provider.connection,
        adminWallet, // Payer
        MINT_NFT_ACCOUNT,
        new PublicKey(userWallet)
      );
      console.log("User NFT ATA:", userNftATA.address.toBase58());

      const adminNftATA = getAssociatedTokenAddressSync(
        MINT_NFT_ACCOUNT,
        adminWallet.publicKey
      );

      const instructions = [];
      const specialKey = new PublicKey(new Array(32).fill(1));
      const gemEntries = Object.entries(gemAmounts).filter(
        ([gemValue, gemAmount]) => gemValue !== "refund" && gemAmount > 0
      );

      for (let i = 0; i < gemEntries.length; i++) {
        const [gemValue, gemAmount] = gemEntries[i];
        const gemPublicKey = new PublicKey(
          gemAddresses[gemValue as "1" | "5" | "10" | "20"]
        );

        const userTokenATA = await getOrCreateAssociatedTokenAccount(
          program.provider.connection,
          adminWallet, // Payer
          gemPublicKey,
          new PublicKey(userWallet)
        );

        const burnInstruction = program.instruction.burnTokenTransferNft(
          new BN(gemAmount).mul(new BN(web3.LAMPORTS_PER_SOL)),

          {
            accounts: {
              payer: adminWallet.publicKey,
              mintTokenAccount: gemPublicKey,
              associatedTokenAccount: userTokenATA.address,
              from: adminNftATA,
              to: i === gemEntries.length - 1 ? userNftATA.address : specialKey,
              fromAuthority: adminWallet.publicKey,
              tokenProgram: TOKEN_PROGRAM_ID,
            },
          }
        );
        instructions.push(burnInstruction);
      }

      const blockhashInfo = await conn.getLatestBlockhash("finalized");
      const transaction = new Transaction({
        blockhash: blockhashInfo.blockhash,
        lastValidBlockHeight: blockhashInfo.lastValidBlockHeight,
        feePayer: adminWallet.publicKey,
      }).add(...instructions);

      const signature = await sendAndConfirmTransaction(conn, transaction, [
        adminWallet,
      ]);
      console.log("Mint NFT Transaction confirmed:", signature);
      // Log the refund amount
      await this.mintGems(gemAmounts.refund, gemAddresses[1]);
      console.log("Refunded amount:", gemAmounts.refund);
      return signature;
    } catch (error) {
      console.error("Error in burnTokenTransferNFT:", error);
      throw error;
    }
  };

  fetchNFTByUser = async (): Promise<{ [key: string]: number }> => {
    try {
      const users = await this.getAccounts();
      const userWallet = new PublicKey(users[0]);
      const connectionConfig = {
        rpcTarget: "https://api.devnet.solana.com",
      };
      const conn = new Connection(connectionConfig.rpcTarget);

      const getNFTBalance = async (mintAddress: PublicKey) => {
        const associatedTokenAccount = await PublicKey.findProgramAddress(
          [
            userWallet.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            mintAddress.toBuffer(),
          ],
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const tokenAccountInfo = await conn.getAccountInfo(
          associatedTokenAccount[0]
        );
        if (!tokenAccountInfo) return 0;

        const amount = tokenAccountInfo.data.readUIntLE(64, 8);
        return amount;
      };

      const nftBalances: { [key: string]: number } = {};

      for (const nft of nftMetadata) {
        const mintAddress = new PublicKey(nft.address);
        const balance = await getNFTBalance(mintAddress);
        nftBalances[nft.symbol] = balance;
      }

      return nftBalances;
    } catch (error) {
      console.error("Failed to fetch user NFTs:", error);
      throw error;
    }
  };
}
