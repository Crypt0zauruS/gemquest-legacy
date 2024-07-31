import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import RPC from "../../services/solanaRPC";
import Loader from "../Loader";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { format } from "date-fns";

type TicketManagerProps = {
  provider: any;
  onClose: () => void;
};

const TicketManager = ({ provider, onClose }: TicketManagerProps) => {
  type Ticket = {
    status: string | undefined;
    mintTimestamp: string;
    image: string | undefined;
    name: string;
    mint: string;
    expiration: number | undefined;
  };

  const [userTickets, setUserTickets] = useState<Ticket[]>([]);
  const [ticketPrice, setTicketPrice] = useState(0);
  const [loader, setLoader] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);

  useEffect(() => {
    fetchTicketData(true);
  }, []);

  const fetchTicketData = async (init = false) => {
    setLoader(true);
    try {
      const rpc = new RPC(provider);
      const [tickets, price] = await Promise.all([
        rpc.getUserTickets(),
        rpc.getPrice(),
      ]);
      setUserTickets(tickets);
      setTicketPrice(price);
    } catch (err) {
      console.error("Failed to fetch ticket data:", err);
      toast.error("Failed to load ticket information", {
        theme: "dark",
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      init && setLoader(false);
    }
  };

  const buyTicket = async () => {
    setLoader(true);
    try {
      const rpc = new RPC(provider);
      const balance = await rpc.getBalance();
      console.log("Balance:", balance, "Ticket Price:", ticketPrice);
      if (Number(balance) < ticketPrice) {
        toast.error("Insufficient funds", {
          theme: "dark",
          position: "top-right",
          autoClose: 5000,
        });
        throw new Error("Insufficient funds");
      }
      await rpc.CreateTicketNFT();
      setTimeout(async () => {
        await fetchTicketData(false);
        toast.success(`Ticket minted successfully!`, {
          theme: "dark",
          position: "top-right",
          autoClose: 5000,
        });
      }, 3000);
    } catch (error) {
      console.error("Error during Ticket minting:", error);
      toast.error("Error during Ticket minting", {
        theme: "dark",
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoader(false);
    }
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(parseInt(timestamp) * 1000);
    const mintTimestamp = format(date, "MMMM 'the' do, yyyy, h:mm a");
    return mintTimestamp;
  };

  const handleTicketClick = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
    try {
      const rpc = new RPC(provider);
      const { status, expiration }: any = await rpc.getTicketStatus(
        ticket.mint
      );
      setSelectedTicket((prevTicket) => ({
        ...prevTicket!,
        status,
        expiration,
      }));
    } catch (error) {
      console.error("Error fetching ticket status:", error);
      toast.error("Failed to fetch ticket status", {
        theme: "dark",
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const toggleTicketsDisplay = () => {
    setShowAllTickets(!showAllTickets);
  };

  const displayedTickets = showAllTickets
    ? userTickets
    : userTickets.slice(0, 4);

  const TicketModal = ({
    ticket,
    onClose,
  }: {
    ticket: Ticket | null;
    onClose: () => void;
  }) => {
    if (!ticket) return null;

    return (
      <div className="modalnft">
        <div className="modalContentNft">
          <img
            src={ticket?.image}
            alt={ticket?.name}
            style={{
              width: "100%",
              maxHeight: "70vh",
              objectFit: "contain",
              borderRadius: "10px",
              boxShadow: "0 0 5px 5px grey",
            }}
          />
          <h2>{ticket?.name}</h2>
          <p>Bought: {formatDate(ticket?.mintTimestamp)}</p>
          <p style={{ margin: "10px" }}>
            Status: {ticket?.status || "Loading..."}
          </p>
          {ticket?.status === "Activated" && (
            <p>
              Expires:{" "}
              {ticket?.expiration
                ? new Date(ticket?.expiration * 1000).toLocaleString()
                : "Loading..."}
            </p>
          )}
          <button className="btnResult" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="modalnft">
      <div className="modalContentNft">
        <h1
          className="modalContentNft"
          style={{
            fontFamily: "Final Frontier",
            fontSize: "1.5rem",
            margin: "0 auto",
          }}
        >
          Tickets Manager
        </h1>
        {loader ? (
          <Loader
            loadingMsg="Incoming subspace transmission..."
            styling={undefined}
          />
        ) : (
          <>
            <h2 style={{ margin: "20px", color: "orangered" }}>
              Price: {ticketPrice / LAMPORTS_PER_SOL} SOL
            </h2>
            <button
              className="btnResult success"
              onClick={buyTicket}
              style={{ marginBottom: "20px" }}
            >
              Buy Ticket
            </button>
            <hr />
            <h3>Your Tickets:</h3>
            <div className="rewardsContainer">
              {displayedTickets
                // sort by date
                .sort(
                  (a, b) =>
                    parseInt(b.mintTimestamp) - parseInt(a.mintTimestamp)
                )
                .map((ticket, index) => (
                  <div
                    key={index}
                    className="rewardItem"
                    onClick={() => handleTicketClick(ticket)}
                  >
                    <img
                      src={ticket?.image}
                      alt={ticket?.name}
                      className="rewardImage"
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "10px",
                        marginBottom: "10px",
                        cursor: "pointer",
                      }}
                    />
                    <h3>Bought {formatDate(ticket?.mintTimestamp)}</h3>
                  </div>
                ))}
            </div>
            {userTickets.length > 4 && (
              <button className="btnSubmit" onClick={toggleTicketsDisplay}>
                {showAllTickets ? "Show Less" : "Show More"}
              </button>
            )}
            {userTickets.length === 0 && <p>You don't have any tickets yet.</p>}
          </>
        )}
        <button
          className="btnResult"
          onClick={onClose}
          style={{ marginTop: "20px" }}
        >
          Close
        </button>
      </div>
      {isModalOpen && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTicket(null);
          }}
        />
      )}
    </div>
  );
};

export default TicketManager;
