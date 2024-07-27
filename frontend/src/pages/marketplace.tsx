import { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { useRouter } from "next/router";
import RPC from "../services/solanaRPC";
import { ipfsGateway, gemAddresses, gemTypes } from "../utils";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import Logout from "../components/Logout";

interface LoginProps {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loggedIn: boolean;
  provider: any;
}

interface Nft {
  metadata: any;
  address: string;
  name: string;
  image: string;
  symbol?: string;
  description?: string;
  properties?: {
    gem_cost?: number;
  };
}

type ApprovedGems = {
  [key: number]: bigint;
};

const Marketplace: React.FC<LoginProps> = ({ logout, loggedIn, provider }) => {
  const router = useRouter();

  const [totalGems, setTotalGems] = useState(0);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [selectedNft, setSelectedNft] = useState<Nft | null>(null);
  const [loader, setLoader] = useState(false);
  const [userGems, setUserGems] = useState<{
    [key: string]: number;
  }>({
    gem1: 0,
    gem5: 0,
    gem10: 0,
    gem20: 0,
  });
  const [gemsMetadata, setGemsMetadata] = useState<{
    gem1?: any;
    gem5?: any;
    gem10?: any;
    gem20?: any;
    [key: string]: any; // Add this line to allow indexing with a number
  }>({});
  const [nftByUser, setNftByUser] = useState<{
    [key: string]: number;
  }>({});

  const [nftMetadata, setNftMetadata] = useState<{
    [key: string]: any;
  }>({});

  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);

  const openRewardsModal = () => {
    setIsRewardsModalOpen(true);
  };

  const closeRewardsModal = () => {
    setIsRewardsModalOpen(false);
  };

  const openCollectionModal = () => {
    setIsCollectionModalOpen(true);
  };
  const closeCollectionModal = () => {
    setIsCollectionModalOpen(false);
  };

  useEffect(() => {
    if (loggedIn && provider) {
      fetchData();
    } else {
      resetData();
      logout();
      router.push("/");
    }
  }, [loggedIn, provider]);

  const fetchData = useCallback(async () => {
    setLoader(true);
    try {
      const rpc = new RPC(provider);
      const [gems, nftMetadata, gemsMetadata, nftByUser] = await Promise.all([
        rpc.fetchGems(),
        rpc.fetchNFT(),
        rpc.fetchGemsMetadata(),
        rpc.fetchNFTByUser(),
      ]);

      setUserGems(gems);
      setTotalGems(
        gems.gem1 * 1 + gems.gem5 * 5 + gems.gem10 * 10 + gems.gem20 * 20
      );
      console.log(nftMetadata);
      setNftMetadata(nftMetadata);
      setGemsMetadata(gemsMetadata);
      setNftByUser(nftByUser);
      console.table({ gems, nftMetadata, gemsMetadata, nftByUser });
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err);
    } finally {
      setLoader(false);
    }
  }, [provider]);

  const resetData = () => {
    setUserGems({
      gem1: 0,
      gem5: 0,
      gem10: 0,
      gem20: 0,
    });
    setNftMetadata({});
    setGemsMetadata({
      gem1: {},
      gem5: {},
      gem10: {},
      gem20: {},
    });
    setTotalGems(0);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openDetailModal = (nft: any) => {
    console.log(nft);
    setSelectedNft(nft);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedNft(null);
    setIsDetailModalOpen(false);
  };

  const checkAllowance = async (
    rpc: RPC,
    userWallet: string,
    gemTypes: { type: string; value: number }[]
  ): Promise<ApprovedGems> => {
    let fetch: ApprovedGems = {};
    const fetching = gemTypes.map(async (gemType) => {
      const mintAddress = new PublicKey(
        gemAddresses[gemType.value as 1 | 5 | 10 | 20]
      );
      try {
        const res = await rpc.checkApproveToken(
          new PublicKey(userWallet),
          mintAddress
        );
        console.log(
          "Allowance for",
          gemAddresses[gemType.value as 1 | 5 | 10 | 20],
          res
        );
        fetch = { ...fetch, [gemType.value]: res } as ApprovedGems;
      } catch (error) {
        console.error(
          `Error checking approval for ${
            gemAddresses[gemType.value as 1 | 5 | 10 | 20]
          }:`,
          error
        );
        fetch = { ...fetch, [gemType.value]: 0n }; // Default to 0 if there is an error
      }
    });
    await Promise.all(fetching);
    console.log(fetch);
    return fetch;
  };

  // const checkTokenAllowance = async (
  //   rpc: RPC,
  //   userWallet: string,
  //   gemTypes: { type: string; value: number }[]
  // ) => {
  //   let attempts = 0;
  //   const maxAttempts = 20; // Maximum number of attempts
  //   const interval = 2000; // Interval between attempts in milliseconds

  //   while (attempts < maxAttempts) {
  //     let allApproved = true;
  //     for (const gemType of gemTypes) {
  //       const mintAddress = gemAddresses[gemType.value as 1 | 5 | 10 | 20];
  //       const accountInfo = await rpc.checkApproveToken(
  //         new PublicKey(userWallet),
  //         new PublicKey(mintAddress)
  //       );
  //       if (accountInfo < gemType.value) {
  //         allApproved = false;
  //         break;
  //       }
  //     }
  //     if (allApproved) {
  //       return true;
  //     }
  //     attempts++;
  //     await new Promise((resolve) => setTimeout(resolve, interval));
  //   }
  //   return false;
  // };

  const approveRequiredGems = async (
    rpc: RPC,
    userWallet: string,
    gemCost: number
  ) => {
    // Get already approved gems
    let approvedGems = await checkAllowance(rpc, userWallet, gemTypes);
    // Sort gemTypes by value in descending order
    gemTypes.sort((a, b) => b.value - a.value);
    let remainingCost = gemCost;
    for (const gemType of gemTypes) {
      const gemAmount = userGems[gemType.type];
      if (gemAmount > 0) {
        const alreadyApproved = Number(approvedGems[gemType.value] || 0n);
        const gemsNeeded = Math.max(
          Math.floor((remainingCost - alreadyApproved) / gemType.value),
          0
        );

        const gemsToApprove = Math.min(gemsNeeded, gemAmount);
        if (gemsToApprove > 0) {
          const gemPublicKey = new PublicKey(
            gemAddresses[gemType.value as 1 | 5 | 10 | 20]
          );
          console.log("Approving", gemsToApprove, gemPublicKey);
          await rpc.approveTokenBurn(gemsToApprove, gemPublicKey);
          remainingCost -= gemsToApprove * gemType.value;
        }
      }
      if (remainingCost <= 0) break;
    }
    // Re-check the allowances after attempting to approve more gems
    approvedGems = await checkAllowance(rpc, userWallet, gemTypes);
    // Calculate the new remaining cost based on the latest approvals
    remainingCost =
      gemCost -
      gemTypes.reduce((acc, gemType) => {
        const approvedAmount = Number(approvedGems[gemType.value] || 0n);
        return (
          acc + Math.min(approvedAmount, userGems[gemType.type] * gemType.value)
        );
      }, 0);

    if (
      remainingCost > 0 &&
      gemTypes.every(
        (gemType) =>
          Number(approvedGems[gemType.value] || 0n) >=
          userGems[gemType.type] * gemType.value
      )
    ) {
      throw new Error("Not enough gems to cover the cost");
    }
  };

  const handleBuyNFT = async (address: string) => {
    try {
      setLoader(true);
      const rpc = new RPC(provider);
      console.log(selectedNft);
      toast.loading(`Approve burning GEMS Tokens ...`, {
        theme: "dark",
        position: "top-right",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
      });
      const accounts = await rpc.getAccounts();
      const userWallet = accounts[0];
      const gemCost = selectedNft?.metadata?.properties?.gem_cost;
      //await rpc.approveTokenBurn(gemCost);
      await approveRequiredGems(rpc, userWallet, gemCost);
      toast.dismiss();

      // TODO: Investigate, the TX is finalized but the token allowance is not updated
      // We need to wait a little
      // await new Promise(resolve => setTimeout(resolve, 5000));
      // await rpc.checkApproveToken();
      // await new Promise(resolve => setTimeout(resolve, 5000));
      // await rpc.checkApproveToken();
      // Vérifier l'allocation des jetons

      // const accounts = await rpc.getAccounts();
      // const userWallet = accounts[0];
      // const mintAddress = new PublicKey(gemAddresses[1]);
      // const allowanceUpdated = await checkTokenAllowance(
      //   rpc,
      //   userWallet,
      //   mintAddress,
      //   gemCost
      // );

      // if (!allowanceUpdated) {
      //   throw new Error("Token allowance not updated in time");
      // }

      toast.success(`Burn GEMS tokens approved ! \n`, {
        theme: "dark",
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
      });

      toast.loading(`Minting ${selectedNft?.metadata?.name} NFT ...`, {
        theme: "dark",
        position: "top-right",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
      });
      await rpc.burnTokenTransferNFT(address, gemCost);
      toast.dismiss();
      toast.success(`NFT ! ${selectedNft?.metadata?.name} minted \n`, {
        theme: "dark",
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
      });
      // Refresh data
      await fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Error during NFT minting", {
        theme: "dark",
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
      });
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      console.log("Back button pressed");
      setTotalGems(0);
      setGemsMetadata({
        gem1: {},
        gem5: {},
        gem10: {},
        gem20: {},
      });
      setUserGems({
        gem1: 0,
        gem5: 0,
        gem10: 0,
        gem20: 0,
      });

      logout();
      router.push("/");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [logout, router]);

  return (
    <div>
      <div style={{ marginTop: "15px" }}>
        <Logout logout={logout} />
      </div>
      <ToastContainer />
      <Header />

      <main>
        <div className="marketplaceContainer">
          <div className="marketplaceContent">
            {error && (
              <span className="animate__animated animate__zoomInLeft">
                {error}
              </span>
            )}

            {loader && <Loader loadingMsg={undefined} styling={undefined} />}
            {loggedIn && !loader && (
              <div>
                <h3
                  className="modalContentNft"
                  style={{
                    fontFamily: "Final Frontier",
                    width: "350px",
                    fontSize: "1.5rem",
                    margin: "0 auto",
                    marginTop: "10px",
                  }}
                >
                  Welcome to the Marketplace !
                </h3>
                <hr style={{ paddingTop: "10px" }} />
                <div className="gemsContainer">
                  {userGems?.gem1 > 0 && (
                    <div className="gemItem">
                      <img
                        src={gemsMetadata?.gem1?.image?.replace(
                          "ipfs://",
                          ipfsGateway
                        )}
                        alt="Gem 1"
                        className="gemImage"
                      />
                      <div className="gemCount">{userGems?.gem1}</div>
                    </div>
                  )}
                  {userGems?.gem5 > 0 && (
                    <div className="gemItem">
                      <img
                        src={gemsMetadata?.gem5?.image?.replace(
                          "ipfs://",
                          ipfsGateway
                        )}
                        alt="Gem 5"
                        className="gemImage"
                      />
                      <div className="gemCount">{userGems?.gem5}</div>
                    </div>
                  )}
                  {userGems?.gem10 > 0 && (
                    <div className="gemItem">
                      <img
                        src={gemsMetadata?.gem10?.image?.replace(
                          "ipfs://",
                          ipfsGateway
                        )}
                        alt="Gem 10"
                        className="gemImage"
                      />
                      <div className="gemCount">{userGems?.gem10}</div>
                    </div>
                  )}
                  {userGems?.gem20 > 0 && (
                    <div className="gemItem">
                      <img
                        src={gemsMetadata?.gem20?.image?.replace(
                          "ipfs://",
                          ipfsGateway
                        )}
                        alt="Gem 20"
                        className="gemImage"
                      />
                      <div className="gemCount">{userGems?.gem20}</div>
                    </div>
                  )}
                </div>

                <div className="totalGems">
                  <span>💎 {totalGems} GEMS 💎 </span>
                </div>
                <hr />
                <div style={{ paddingTop: "10px" }} />
                <p
                  className="modalContentNft"
                  style={{
                    fontFamily: "Final Frontier",
                    color: "orangered",
                    width: "350px",
                    fontSize: "1.4rem",
                    margin: "0 auto",
                    cursor: "pointer",
                    marginBottom: "10px",
                  }}
                  onClick={openRewardsModal}
                >
                  Redeem 💎 for rewards
                </p>
                <div style={{ paddingTop: "20px" }} />
                <p
                  className="modalContentNft"
                  style={{
                    fontFamily: "Final Frontier",
                    color: "orangered",
                    width: "350px",
                    fontSize: "1.4rem",
                    margin: "0 auto",
                    cursor: "pointer",
                    marginBottom: "10px",
                  }}
                  onClick={openCollectionModal}
                >
                  Your collection
                </p>
              </div>
            )}
          </div>

          {isModalOpen && loggedIn && (
            <>
              <div className="overlay"></div>
              <div className="engage" style={{ maxHeight: "300px" }}>
                <div className="rules" style={{ marginTop: "30px" }}>
                  <p>
                    <span
                      style={{
                        display: "block",
                        fontFamily: "Final Frontier",
                        fontSize: "1.5rem",
                        color: "skyblue",
                        marginBottom: "15px",
                      }}
                    >
                      Welcome to the Marketplace !
                    </span>
                    <br />
                    Here you can exchange your Gems 💎 for NFTs. <br />
                    Each NFT can be exchanged for free stuffs in the park
                  </p>
                </div>
                <button
                  className="btnSubmit"
                  type="button"
                  style={{ marginTop: "30px" }}
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </>
          )}
          {isRewardsModalOpen && (
            <div className="modalnft">
              <div className="modalContentNft">
                <div>
                  <h4 style={{ textAlign: "center", margin: "5px" }}>
                    Exchange those in green ! <br />
                    You have {totalGems} gems
                  </h4>
                </div>
                <hr />
                <div className="rewardsContainer">
                  {Object.keys(nftMetadata).map((key) => (
                    <div
                      key={key}
                      className="rewardItem"
                      style={{ cursor: "pointer" }}
                      onClick={() => openDetailModal(nftMetadata[key])}
                    >
                      <img
                        src={nftMetadata[key]?.metadata?.image?.replace(
                          "ipfs://",
                          ipfsGateway
                        )}
                        alt={nftMetadata[key]?.metadata?.name}
                        className={`rewardImage ${
                          nftMetadata[key]?.metadata?.properties?.gem_cost &&
                          Number(
                            nftMetadata[key]?.metadata?.properties?.gem_cost
                          ) <= totalGems
                            ? "green"
                            : "red"
                        }`}
                      />
                      <h3>{nftMetadata[key]?.metadata?.name}</h3>
                      <h3>
                        {nftMetadata[key]?.metadata?.properties?.gem_cost} 💎
                      </h3>
                    </div>
                  ))}
                </div>
                <button
                  className="btnResult success"
                  onClick={closeRewardsModal}
                >
                  Close
                </button>
              </div>
            </div>
          )}
          {isDetailModalOpen && selectedNft && (
            <div className="modalnft">
              <div className="modalContentNft">
                <img
                  src={selectedNft?.metadata?.image?.replace(
                    "ipfs://",
                    ipfsGateway
                  )}
                  alt={selectedNft?.metadata?.name}
                  style={{
                    width: "85%",
                    height: "auto",
                    borderRadius: "10px",
                    boxShadow: "0 0 5px 8px #000",
                  }}
                />
                <h2>{selectedNft?.metadata?.name}</h2>
                <p>Symbol: {selectedNft?.metadata?.symbol}</p>
                <p>{selectedNft?.metadata?.description}</p>
                <p>Cost: {selectedNft?.metadata?.properties?.gem_cost} 💎</p>
                <p>
                  <button
                    className="btnResult success"
                    style={{
                      fontFamily: "Final Frontier",
                      marginTop: "10px",
                    }}
                    disabled={
                      loader ||
                      totalGems <
                        Number(selectedNft?.metadata?.properties?.gem_cost)
                    }
                    onClick={() => handleBuyNFT(selectedNft?.address)}
                  >
                    💎 Buy NFT ! 💎
                  </button>
                </p>
                <button
                  className="btnResult"
                  style={{
                    fontFamily: "Final Frontier",
                    fontSize: "0.8rem",
                    marginTop: "10px",
                  }}
                  onClick={closeDetailModal}
                >
                  Close
                </button>
              </div>
            </div>
          )}
          {isCollectionModalOpen && (
            <div className="modalnft">
              <div className="modalContentNft">
                <div>
                  <h4 style={{ textAlign: "center", margin: "5px" }}>
                    Check your rewards collection !
                  </h4>
                </div>
                <hr />
                <div className="rewardsContainer">
                  {Object.keys(nftMetadata).map(
                    (key) =>
                      nftByUser[nftMetadata[key]?.metadata?.symbol] > 0 && (
                        <div key={key} className="rewardItem">
                          <img
                            src={nftMetadata[key]?.metadata?.image?.replace(
                              "ipfs://",
                              ipfsGateway
                            )}
                            alt={nftMetadata[key]?.metadata?.name}
                            className={`rewardImage blue`}
                          />
                          <h3>
                            {nftMetadata[key]?.metadata?.name}{" "}
                            {nftByUser[nftMetadata[key]?.metadata?.symbol] > 1
                              ? `(x${
                                  nftByUser[nftMetadata[key]?.metadata?.symbol]
                                })`
                              : ""}
                          </h3>
                        </div>
                      )
                  )}
                </div>
                <button
                  className="btnResult success"
                  onClick={closeCollectionModal}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Marketplace;
