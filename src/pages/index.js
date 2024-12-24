import React, { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SafleID } from "@getsafle/safle-gaming-sdk";
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";

const config = {
  env: "testnet",
  rpcUrl: "https://rpc.cardona.zkevm-rpc.com",
  mainContractAddress: "0xf84BF12149Da39Fa83f97cF7def894251d1aB6cc",
  storageContractAddress: "0xC7B024F87FfD7118BDCE4018F4E6B6802520C122",
  chainId: "2442",
  relayerUrl: "https://dev-relayer-queue-gaming.safle.com/set-safleid",
  relayerApiKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Imh1c2llbiIsImlhdCI6MTUxNjIzOTAyMn0.I6C9sJ9JD1j21td45PwLKMyJTqbhaefFSfcYcTN2GWQ",
};

const safleIdInstance = new SafleID(config);

const Home = () => {
  const [safleId, setSafleId] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [existingSafleId, setExistingSafleId] = useState(null);
  const [error, setError] = useState(null);
  const { address } = useAccount();

  useEffect(() => {
    if (address) {
      handleWalletConnect(address);
    }
  }, [address]);

  // Function to check if a SafleID exists for the connected wallet address
  const checkSafleId = async (address) => {
    try {
      const result = await safleIdInstance.getSafleId(address);
      console.log(result, "result");
      if (result === "This address has no associated SafleID.") {
        setExistingSafleId(null);
      } else {
        setExistingSafleId(result);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching SafleID:", err);
      setError("Unable to fetch SafleID. Please try again.");
    }
  };

  // Handle wallet connection
  const handleWalletConnect = async (address) => {
    setUserAddress(address);
    checkSafleId(address);
  };

  // Handle wallet disconnection
  const handleWalletDisconnect = () => {
    setUserAddress(""); // Clear user address
    setExistingSafleId(null); // Clear SafleID
    console.log("Wallet disconnected and SafleID reset.");
    console.log("Wallet disconnected and SafleID reset.");
  };

  // Handle SafleID registration
  const handleConnectSafleId = async () => {
    try {
      const isValidFormat = await safleIdInstance.isSafleIdValid(safleId);
      if (!isValidFormat) {
        alert("Invalid SafleID format. Please enter a valid SafleID.");
        return;
      }

      const resolutionResult = await safleIdInstance.getAddress(safleId);
      if (resolutionResult !== "This SafleID is not registered.") {
        alert("SafleID already exists. Please choose a different SafleID.");
        return;
      }

      const registrationResult = await safleIdInstance.setSafleId({
        userAddress,
        safleId,
      });
      console.log("Registration Result:", registrationResult);
      alert("SafleID registered successfully!");
      setExistingSafleId(safleId);
    } catch (error) {
      console.error("Error in SafleID operations:", error);
      alert("An error occurred while performing SafleID operations.");
    }
  };

  useEffect(() => {
    if (existingSafleId === null || existingSafleId === "Invalid address.") {
      // Clear any related UI or reset inputs
    }
  }, [existingSafleId]);

  return (
    <div
      style={{
        backgroundColor: "#1a202c",
        color: "white",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: "2.25rem",
            fontWeight: "700",
          }}
        >
          Access your universal ID powered by Safle.
        </h1>
        {/* <p style={{ color: "#E5E7EB" }}>Connect your wallet.</p> */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ConnectButton
            onConnect={(walletData) => handleWalletConnect(walletData.address)}
            onDisconnect={() => {
              console.log("onDisconnect triggered");
              handleWalletDisconnect();
            }}
          />
        </div>

        <div style={{ marginTop: "1rem" }}>
          {
            existingSafleId !== null ? (
              existingSafleId && existingSafleId !== "Invalid address." ? (
                // Show SafleID if it exists
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    marginTop: "1rem",
                    backgroundImage:
                      "linear-gradient(90deg, pink, blue, red, yellow)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Your SafleID: {existingSafleId}
                </h2>
              ) : (
                // Show input field and button if SafleID doesn't exist or is invalid
                <div>
                  <p>Claim your free ID now.</p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      marginTop: "1rem",
                      justifyContent: "center",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Enter your SafleID"
                      value={safleId}
                      onChange={(e) => setSafleId(e.target.value)}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#2D3748",
                        border: "1px solid #4A5568",
                        color: "white",
                        borderRadius: "0.375rem",
                        outline: "none",
                        boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.5)",
                      }}
                    />
                    <button
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#3182CE",
                        color: "white",
                        borderRadius: "0.375rem",
                        fontWeight: "600",
                        transition: "background-color 0.3s ease",
                      }}
                      onClick={handleConnectSafleId}
                    >
                      Register SafleID
                    </button>
                  </div>
                </div>
              )
            ) : null // Do not show anything initially
          }
        </div>
      </div>
    </div>
  );
};

export default Home;
