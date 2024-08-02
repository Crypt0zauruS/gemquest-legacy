import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  ParsedAccountData,
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
  getMint,
  getAssociatedTokenAddress,
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
  MPL_TOKEN_METADATA_PROGRAM_ID,
  fetchDigitalAsset,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  gemAddresses,
  gemMetadataAccounts,
  nftMetadata,
  ipfsGateway,
  ticketMetadata,
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
    if (!message) {
      return "";
    }
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

  getAdminWallet = async (): Promise<Keypair> => {
    try {
      const response = await fetch("/api/getKey", { method: "POST" });
      const data = await response.json();
      // Décodez la clé privée de adminWallet
      const adminWalletSecretKey = bs58.decode(data.privateKey);
      const adminWallet = Keypair.fromSecretKey(
        new Uint8Array(adminWalletSecretKey)
      );
      return adminWallet;
    } catch (error) {
      console.error("Error in getAdminKey:", error);
      throw error;
    }
  };

  getNFTDecimals = async (
    connection: Connection,
    mintAddress: web3.PublicKeyInitData
  ): Promise<number> => {
    try {
      const mintPublicKey = new PublicKey(mintAddress);
      const mintInfo = await getMint(connection, mintPublicKey);
      console.log(`Decimals for NFT: ${mintInfo.decimals}`);
      return Number(mintInfo.decimals);
    } catch (error) {
      console.error("Error fetching NFT decimals:", error);
      throw error;
    }
  };

  getPrice = async (): Promise<number> => {
    try {
      const connection = new Connection("https://api.devnet.solana.com");
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("initial_price")],
        new PublicKey(idl.address)
      );

      const accountInfo = await connection.getAccountInfo(pda);

      if (!accountInfo || !accountInfo.data) {
        throw new Error("Compte non trouvé ou données non disponibles");
      }

      // Décodez les données du compte
      const price = accountInfo.data.readBigUInt64LE(8); // 8 bytes offset pour le discriminator

      return Number(price);
    } catch (error) {
      console.error("Error in getInitialPrice:", error);
      throw error;
    }
  };

  updateInitialPrice = async (newPrice: number): Promise<string> => {
    try {
      const adminWallet = await this.getAdminWallet();
      const connection = new Connection("https://api.devnet.solana.com");
      const provider = new AnchorProvider(connection, adminWallet as any, {
        preflightCommitment: "confirmed",
      });
      const program: Program = new Program(idl as any, provider);

      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("initial_price")],
        new PublicKey(idl.address)
      );

      const tx = await program.methods
        .updateInitialPrice(new BN(newPrice))
        .accounts({
          initialPriceAccount: pda,
          admin: adminWallet.publicKey,
        })
        .rpc();

      console.log("Prix initial mis à jour. Transaction:", tx);
      return tx;
    } catch (error) {
      console.error("Error in updateInitialPrice:", error);
      throw error;
    }
  };

  activateTicket = async (mintAddress: string): Promise<string> => {
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
      const adminWallet = await this.getAdminWallet();
      const provider = new AnchorProvider(conn, adminWallet as any, {
        preflightCommitment: "finalized",
      });
      const program = new Program(idl as any, provider);
      setProvider(provider);

      const mintPublicKey = new PublicKey(mintAddress);

      const [ticketStatusPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("ticket_status"), mintPublicKey.toBuffer()],
        program.programId
      );

      const tx = await (program.methods.activateTicket() as any)
        .accounts({
          ticketStatusAccount: ticketStatusPDA,
          admin: adminWallet.publicKey,
        })
        .rpc();

      console.log("Ticket activated. Transaction signature:", tx);

      return tx;
    } catch (error) {
      console.error("Error activating ticket:", error);
      throw error;
    }
  };

  getTicketStatus = async (mintAddress: string): Promise<{}> => {
    try {
      const connection = new Connection("https://api.devnet.solana.com");
      const mintPublicKey = new PublicKey(mintAddress);
      const [ticketStatusPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("ticket_status"), mintPublicKey.toBuffer()],
        new PublicKey(idl.address)
      );
      const accountInfo = await connection.getAccountInfo(ticketStatusPDA);
      if (!accountInfo || !accountInfo.data) {
        throw new Error("Account not found or data not available");
      }
      const status = accountInfo.data.readUInt32LE(8);
      const expiration = accountInfo.data.readBigInt64LE(12);
      console.log("Ticket status:", status);
      console.log("Ticket expiration:", expiration);
      const currentTime = BigInt(Math.floor(Date.now() / 1000));
      let statusString;

      if (status === 0) {
        statusString = "Not activated";
      } else if (status === 1 && expiration > currentTime) {
        statusString = "Activated";
      } else {
        statusString = "Expired";
      }
      return {
        status: statusString,
        expiration: Number(expiration),
      };
    } catch (error) {
      console.error("Error in getTicketStatus:", error);
      throw error;
    }
  };

  mintGems = async (amount: number, mintAddress: string): Promise<string> => {
    if (amount <= 0 || !mintAddress) {
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
      const adminWallet = await this.getAdminWallet();
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
    amount: number,
    mintAddress: PublicKey
  ): Promise<string> => {
    if (amount <= 0 || !mintAddress) {
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
      const adminWallet = await this.getAdminWallet();
      const provider = new AnchorProvider(conn, adminWallet as any, {
        preflightCommitment: "finalized",
      });
      const program = new Program(idl as any, provider);
      setProvider(provider);
      const decimals = await this.getNFTDecimals(conn, mintAddress);
      const AMOUNT = new BN(amount).mul(new BN(10).pow(new BN(decimals)));

      console.log("AMOUNT", AMOUNT);

      console.log("Creating/getting user token account");
      const userTokenATA = await getOrCreateAssociatedTokenAccount(
        program.provider.connection,
        adminWallet, // Payer
        mintAddress,
        new PublicKey(userWallet)
      );
      console.log("Creating approve token instruction");
      // Give allowance to admin to burn user token
      const instructionApproveToken = program.instruction.approveToken(AMOUNT, {
        accounts: {
          associatedTokenAccount: userTokenATA.address,
          delegate: adminWallet.publicKey,
          authority: userWallet,
          // system
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      });

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
        console.log(
          `Updated number of ${decimals === 0 ? "NFT" : "Gems"} delegated:`,
          delegatedAmount.toString()
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
    if (!userWallet || !mintAddress) {
      return 0;
    }
    try {
      const connectionConfig = {
        rpcTarget: "https://api.devnet.solana.com",
      };
      const conn = new Connection(connectionConfig.rpcTarget);
      const adminWallet = await this.getAdminWallet();

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

  burnTokens = async (
    program: Program,
    adminWallet: Keypair,
    burnTrackerPDA: PublicKey,
    gemEntries: [string, number][],
    gemAddresses: { [key: string]: string },
    userWallet: string
  ) => {
    const instructions = [];
    const specialKey = new PublicKey(new Array(32).fill(1));

    for (const [gemValue, gemAmount] of gemEntries) {
      const gemPublicKey = new PublicKey(
        gemAddresses[gemValue as "1" | "5" | "10" | "20"]
      );

      const userTokenATA = await getOrCreateAssociatedTokenAccount(
        program.provider.connection,
        adminWallet,
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
            from: userTokenATA.address,
            to: specialKey,
            fromAuthority: adminWallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            burnTracker: burnTrackerPDA,
          },
        }
      );
      instructions.push(burnInstruction);
    }

    const blockhashInfo = await program.provider.connection.getLatestBlockhash(
      "finalized"
    );
    const transaction = new Transaction({
      blockhash: blockhashInfo.blockhash,
      lastValidBlockHeight: blockhashInfo.lastValidBlockHeight,
      feePayer: adminWallet.publicKey,
    }).add(...instructions);

    const signature = await sendAndConfirmTransaction(
      program.provider.connection,
      transaction,
      [adminWallet]
    );
    console.log("Burn Transaction confirmed:", signature);
    return signature;
  };

  transferNFT = async (
    program: Program,
    adminWallet: Keypair,
    burnTrackerPDA: PublicKey,
    nftTokenAddr: string,
    userWallet: string
  ) => {
    const MINT_NFT_ACCOUNT = new PublicKey(nftTokenAddr);

    const userNftATA = await getOrCreateAssociatedTokenAccount(
      program.provider.connection,
      adminWallet,
      MINT_NFT_ACCOUNT,
      new PublicKey(userWallet)
    );

    const adminNftATA = getAssociatedTokenAddressSync(
      MINT_NFT_ACCOUNT,
      adminWallet.publicKey
    );

    const transferInstruction = program.instruction.burnTokenTransferNft(
      new BN(1),
      {
        accounts: {
          payer: adminWallet.publicKey,
          mintTokenAccount: MINT_NFT_ACCOUNT,
          associatedTokenAccount: adminNftATA,
          from: adminNftATA,
          to: userNftATA.address,
          fromAuthority: adminWallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          burnTracker: burnTrackerPDA,
        },
      }
    );

    const blockhashInfo = await program.provider.connection.getLatestBlockhash(
      "finalized"
    );
    const transaction = new Transaction({
      blockhash: blockhashInfo.blockhash,
      lastValidBlockHeight: blockhashInfo.lastValidBlockHeight,
      feePayer: adminWallet.publicKey,
    }).add(transferInstruction);

    const signature = await sendAndConfirmTransaction(
      program.provider.connection,
      transaction,
      [adminWallet]
    );
    console.log("NFT Transfer Transaction confirmed:", signature);
    return signature;
  };

  burnTokenTransferNFT = async (
    nftTokenAddr: string,
    nft_price: number,
    gemAmounts: { [key: string]: number }
  ): Promise<string> => {
    if (
      nft_price <= 0 ||
      Object.keys(gemAmounts).length === 0 ||
      !nftTokenAddr
    ) {
      throw new Error("Invalid input parameters");
    }

    try {
      const userWallet = (await this.getAccounts())[0];
      const connection = new Connection("https://api.devnet.solana.com");
      const adminWallet = await this.getAdminWallet();
      const provider = new AnchorProvider(connection, adminWallet as any, {
        preflightCommitment: "confirmed",
      });
      const program = new Program(idl as any, provider);

      // Validate total gem amount
      let totalGems = Object.entries(gemAmounts).reduce(
        (sum, [gemValue, amount]) =>
          gemValue !== "refund" ? sum + parseInt(gemValue) * amount : sum,
        0
      );
      if (totalGems < nft_price) {
        throw new Error("Total gems amount is less than NFT price");
      }

      // Calculate refund
      const refund = totalGems - nft_price;
      if (gemAmounts["refund"] !== refund) {
        throw new Error("Refund amount does not match the difference");
      }

      // Find PDA for BurnTracker
      const [burnTrackerPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("burn_tracker"), adminWallet.publicKey.toBuffer()],
        program.programId
      );

      // 1. Initialize BurnTracker
      const initInstruction = program.instruction.initializeBurnTracker(
        new BN(nft_price),
        {
          accounts: {
            burnTracker: burnTrackerPDA,
            payer: adminWallet.publicKey,
            systemProgram: SystemProgram.programId,
          },
        }
      );

      const initTx = await sendAndConfirmTransaction(
        connection,
        new Transaction().add(initInstruction),
        [adminWallet]
      );
      console.log("Burn Tracker Initialized:", initTx);

      // 2. Burn Tokens
      const gemEntries = Object.entries(gemAmounts).filter(
        ([gemValue, amount]) => gemValue !== "refund" && amount > 0
      );

      for (const [gemValue, amount] of gemEntries) {
        const gemMint = new PublicKey(
          gemAddresses[gemValue as unknown as keyof typeof gemAddresses]
        );
        const userGemATA = await getAssociatedTokenAddress(
          gemMint,
          new PublicKey(userWallet)
        );

        const burnInstruction = program.instruction.burnTokenTransferNft(
          new BN(amount),
          {
            accounts: {
              associatedTokenAccount: userGemATA,
              mintTokenAccount: gemMint,
              from: userGemATA,
              to: new PublicKey(new Array(32).fill(1)), // Special burn address
              fromAuthority: adminWallet.publicKey,
              tokenProgram: TOKEN_PROGRAM_ID,
              burnTracker: burnTrackerPDA,
            },
          }
        );

        const burnTx = await sendAndConfirmTransaction(
          connection,
          new Transaction().add(burnInstruction),
          [adminWallet]
        );
        console.log(`Burned ${amount} of ${gemValue} gem:`, burnTx);
      }

      // 3. Transfer NFT
      const nftMint = new PublicKey(nftTokenAddr);
      const userNftATA = await getAssociatedTokenAddress(
        nftMint,
        new PublicKey(userWallet)
      );
      const adminNftATA = await getAssociatedTokenAddress(
        nftMint,
        adminWallet.publicKey
      );

      const transferInstruction = program.instruction.burnTokenTransferNft(
        new BN(1),
        {
          accounts: {
            associatedTokenAccount: adminNftATA,
            mintTokenAccount: nftMint,
            from: adminNftATA,
            to: userNftATA,
            fromAuthority: adminWallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            burnTracker: burnTrackerPDA,
          },
        }
      );

      const transferTx = await sendAndConfirmTransaction(
        connection,
        new Transaction().add(transferInstruction),
        [adminWallet]
      );
      console.log("NFT Transferred:", transferTx);

      // 4. Handle Refund
      if (refund > 0) {
        await this.handleRefund(refund);
      }

      return transferTx;
    } catch (error) {
      console.error("Error in burnTokenTransferNFT:", error);
      throw error;
    }
  };

  // Helper function to handle refund
  async handleRefund(refundAmount: number) {
    const gemValues = [20, 10, 5, 1];
    for (const value of gemValues) {
      const count = Math.floor(refundAmount / value);
      if (count > 0) {
        await this.mintGems(
          count,
          gemAddresses[value.toString() as unknown as keyof typeof gemAddresses]
        );
        refundAmount -= count * value;
      }
      if (refundAmount === 0) break;
    }
    console.log("Refund processed");
  }

  CreateTicketNFT = async () => {
    const SEED_METADATA = "metadata";
    const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
      MPL_TOKEN_METADATA_PROGRAM_ID
    );
    const httpMetadataUri = ticketMetadata.uri.replace("ipfs://", ipfsGateway);
    const jsonData = await fetch(httpMetadataUri);
    const fetched = (await jsonData.json()) as {
      symbol: any;
      name: string;
    };
    const dataNFT = {
      name: fetched.name,
      symbol: fetched.symbol,
      uri: ticketMetadata.uri,
    };
    const solanaWallet = new SolanaWallet(this.provider);
    const users = await this.getAccounts();
    const userWallet = users[0];
    const connectionConfig = await solanaWallet.request<
      string[],
      CustomChainConfig
    >({
      method: "solana_provider_config",
      params: [],
    });
    const conn = new Connection(connectionConfig.rpcTarget);
    const adminWallet = await this.getAdminWallet();
    const provider = new AnchorProvider(conn, adminWallet as any, {
      preflightCommitment: "finalized",
    });
    const program = new Program(idl as any, provider);
    setProvider(provider);
    const buyer = new PublicKey(userWallet);
    // Generate a new keypair for the mint
    const mintNftTokenAccount = new Keypair();
    // Derive the associated token address account for the mint and payer.
    const associatedNftTokenAccountAddress = getAssociatedTokenAddressSync(
      mintNftTokenAccount.publicKey,
      buyer
    );

    const [metadataAccount] = await PublicKey.findProgramAddress(
      [
        Buffer.from(SEED_METADATA),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintNftTokenAccount.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    const [initialPricePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("initial_price")],
      program.programId
    );

    const [ticketStatusPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("ticket_status"), mintNftTokenAccount.publicKey.toBuffer()],
      program.programId
    );

    const buyerInstruction = program.instruction.createTicketNft(
      dataNFT.name,
      dataNFT.symbol,
      dataNFT.uri,
      {
        accounts: {
          payer: buyer,
          admin: adminWallet.publicKey,
          initialPriceAccount: initialPricePDA,
          metadataAccount,
          mintNftAccount: mintNftTokenAccount.publicKey,
          associatedNftTokenAccount: associatedNftTokenAccountAddress,
          ticketStatusAccount: ticketStatusPDA,
          tokenProgram: TOKEN_PROGRAM_ID,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
        },
      }
    );
    try {
      const latestBlockhashInfo = await conn.getLatestBlockhash("finalized");
      const transaction = new Transaction({
        blockhash: latestBlockhashInfo.blockhash,
        feePayer: adminWallet.publicKey,
        lastValidBlockHeight: latestBlockhashInfo.lastValidBlockHeight,
      }).add(buyerInstruction);

      transaction.partialSign(adminWallet);
      transaction.partialSign(mintNftTokenAccount);
      const userSignedTransaction = await solanaWallet.signTransaction(
        transaction
      );
      const signature = await conn.sendRawTransaction(
        userSignedTransaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        }
      );
      console.log("signature", signature);
      await conn.confirmTransaction(signature, "confirmed");
      return signature;
    } catch (error) {
      if (error instanceof web3.SendTransactionError) {
        console.error("Transaction failed. Error details:", error);
        console.error("Error logs:", error.logs);
      } else {
        console.error("Error creating ticket NFT:", error);
      }
      throw error;
    }
  };

  getUserTickets = async () => {
    const users = await this.getAccounts();
    const userWallet = new PublicKey(users[0]);
    const connectionConfig = {
      rpcTarget: "https://api.devnet.solana.com",
    };
    const conn = new Connection(connectionConfig.rpcTarget);
    const adminWallet = await this.getAdminWallet();
    // Récupérer tous les comptes de jetons de l'utilisateur
    const tokenAccounts = await conn.getTokenAccountsByOwner(
      new PublicKey(userWallet),
      {
        programId: TOKEN_PROGRAM_ID,
      }
    );

    const tickets: any[] = [];

    for (const tokenAccount of tokenAccounts.value) {
      const accountInfo = await conn.getParsedAccountInfo(tokenAccount.pubkey);
      const tokenInfo = (accountInfo.value?.data as ParsedAccountData).parsed
        .info;
      // Vérifier si c'est un NFT (amount = 1 et decimals = 0)
      if (
        tokenInfo.tokenAmount.decimals === 0 &&
        tokenInfo.tokenAmount.amount === "1"
      ) {
        const mintPublicKey = new PublicKey(tokenInfo.mint);
        const signatures = await conn.getSignaturesForAddress(mintPublicKey);
        if (signatures.length > 0) {
          // Récupérer les détails de la transaction
          const txDetails = await conn.getTransaction(signatures[0]?.signature);
          // Récupérer le Program ID
          // let programId = "Unknown";
          // if (
          //   txDetails &&
          //   txDetails?.transaction?.message?.accountKeys?.length > 0
          // ) {
          //   programId =
          //     txDetails.transaction.message.accountKeys[0]?.toString();
          // }
          //if (programId === idl.address) {
          // console.log(txDetails, idl.address);
          const asset = await fetchDigitalAsset(this.umi, tokenInfo.mint);
          if (
            asset.metadata.symbol === "GQTCK" &&
            asset.metadata.updateAuthority === adminWallet.publicKey.toBase58()
          ) {
            const uri = asset.metadata.uri.replace("ipfs://", ipfsGateway);
            const jsonData = await fetch(uri);
            const image = (await jsonData.json()).image;

            let mintTimestamp;
            if (txDetails?.blockTime) {
              mintTimestamp = txDetails.blockTime;
            } else {
              mintTimestamp = null;
            }
            tickets.push({
              mint: mintPublicKey.toBase58(),
              name: asset.metadata.name,
              image: image.replace("ipfs://", ipfsGateway),
              mintTimestamp,
            });
          }
          // }
        }
      }
    }
    return tickets;
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
