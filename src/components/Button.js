import { useState, useEffect } from "react";
import { ethers } from "ethers";
function Button() {
  const [errorMessage, setErrorMessage] = useState("No Error");
  const [account, setAccount] = useState("0x00000000000000");
  const [balance, setBalance] = useState(0);
  const [buttonLabel, setButtonLabel] = useState("Connect to Wallet");

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", accountChanged);
      window.ethereum.on("chainChanged", chainChanged);
    }
  });

  const connectHandler = async () => {
    if (window.ethereum === undefined) {
      setErrorMessage("Metamask not Installed");
      return;
    }

    window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then((res) => accountChanged(res[0]))
      .catch((err) => {
        if (err.code === 4001) {
          console.log("Please connect to Metamask.");
        } else {
          console.error(err);
        }
      });
  };

  const accountChanged = async (account) => {
    setAccount(account);
    try {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [account.toString(), "latest"],
      });

      setBalance(ethers.utils.formatEther(balance));
      setButtonLabel("Connected");
    } catch (error) {
      console.log(error);
    }
  };

  const chainChanged = () => {
    setAccount("0x000000000");
    setBalance(0);
    setErrorMessage("");
    setButtonLabel("Connect to Wallet");
  };

  return (
    <div>
      <button type="button" onClick={connectHandler}>
        {buttonLabel}
      </button>
      <label htmlFor="Address">Address</label>
      <input type="text" id="Address" readOnly value={account}></input>
      <label htmlFor="Balance">Balance</label>
      <input type="text" id="Balance" readOnly value={balance}></input>
      <span>{errorMessage}</span>
    </div>
  );
}

export default Button;
