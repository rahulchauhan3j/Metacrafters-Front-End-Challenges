import { useState, useEffect } from "react";
import { ethers } from "ethers";
function Button() {
  const [errorMessage, setErrorMessage] = useState("No Error");
  const [account, setAccount] = useState("0x00000000000000");
  const [balance, setBalance] = useState(0);
  const [buttonLabel, setButtonLabel] = useState("Connect to Wallet");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

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

    await accountChanged();
  };

  const accountChanged = async (account) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const balance = await signer.getBalance();
    setProvider(provider);
    setSigner(signer);
    setAccount(address);
    setBalance(ethers.utils.formatEther(balance));
    setButtonLabel("Connected");
  };

  const chainChanged = () => {
    setAccount("0x000000000");
    setBalance(0);
    setErrorMessage("");
    setButtonLabel("Connect to Wallet");
    setProvider(null);
    setSigner(null);
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
