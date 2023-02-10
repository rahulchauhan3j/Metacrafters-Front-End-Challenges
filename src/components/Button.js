import { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "../abi/BankApp.json";
import "../App.css";

import contractAddress from "../contractAddress/contractAddress.json";
function Button() {
  const [errorMessage, setErrorMessage] = useState("No Error");
  const [account, setAccount] = useState("0x00000000000000");
  const [balance, setBalance] = useState(0);
  const [buttonLabel, setButtonLabel] = useState("Connect to Wallet");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [bankAppContract, setContract] = useState(null);
  const [bankBalance, setBankBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [recieverAddress, setRecieverAddress] = useState("0x00000000000000");
  const [recieverAmount, setRecieverAmount] = useState(0);

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

    const bankApp = new ethers.Contract(
      contractAddress.address,
      abi.abi,
      signer
    );
    console.log(bankApp.address);
    setContract(bankApp);
  };

  const chainChanged = () => {
    setAccount("0x000000000");
    setBalance(0);
    setErrorMessage("");
    setButtonLabel("Connect to Wallet");
    setProvider(null);
    setSigner(null);
    setContract(null);
  };

  const checkBankBalance = async () => {
    setErrorMessage("No Error");
    try {
      const bankBalance = await bankAppContract.accountBalance();
      setBankBalance(ethers.utils.formatEther(bankBalance));
    } catch (error) {
      setErrorMessage(error.data.message);
    }
  };

  const createAccount = async () => {
    setErrorMessage("No Error");
    try {
      const create = await bankAppContract.createAccount();
    } catch (error) {
      setErrorMessage(error.data.message);
    }
  };

  const depositFunds = async () => {
    setErrorMessage("No Error");
    try {
      const funds = {
        value: ethers.utils.parseEther(depositAmount),
      };
      const deposited = await bankAppContract.deposit(funds);
      await deposited.wait(1);
      await checkBankBalance();
      const newBalance = await signer.getBalance();
      setBalance(ethers.utils.formatEther(newBalance));
    } catch (error) {
      setErrorMessage(error.data.message);
    }
  };

  const withdrawFunds = async () => {
    setErrorMessage("No Error");
    try {
      const fundsToBeWithdrawn = ethers.utils.parseEther(withdrawAmount);

      const withdrawn = await bankAppContract.withdraw(fundsToBeWithdrawn);
      await withdrawn.wait(1);
      await checkBankBalance();
      const newBalance = await signer.getBalance();
      setBalance(ethers.utils.formatEther(newBalance));
    } catch (error) {
      setErrorMessage(error.data.message);
    }
  };
  const handleDepositAmountChange = async (event) => {
    setDepositAmount(event.target.value);
  };

  const handleWithdrawAmountChange = async (event) => {
    setWithdrawAmount(event.target.value);
  };

  const handleRecieverAddressChange = async (event) => {
    setRecieverAddress(event.target.value);
  };

  const handleRecieverAmountChange = async (event) => {
    setRecieverAmount(event.target.value);
  };

  const transferFunds = async () => {
    console.log("A");
    const transferToReciever = await bankAppContract.transfer(
      recieverAddress,
      ethers.utils.parseEther(recieverAmount)
    );
    await checkBankBalance();
    const newBalance = await signer.getBalance();
    setBalance(ethers.utils.formatEther(newBalance));
    await transferToReciever.wait(1);
  };

  return (
    <div className="button_css">
      <button type="button" onClick={connectHandler}>
        {buttonLabel}
      </button>
      <br></br>
      <label htmlFor="Address">Address</label>
      <input type="text" id="Address" readOnly value={account}></input>
      <label htmlFor="Balance">Balance</label>
      <input type="text" id="Balance" readOnly value={balance}></input>
      <span>{errorMessage}</span>
      <br></br>
      <button type="button" onClick={checkBankBalance}>
        Check Account Bank Balance
      </button>
      <span>Bank Balance is {bankBalance}</span>
      <br></br>
      <button type="button" onClick={createAccount}>
        Create Account
      </button>
      <br></br>
      <label htmlFor="Amount">Amount To Be Deposited</label>
      <input
        type="text"
        id="Amount"
        min="0"
        step="1"
        onChange={handleDepositAmountChange}
      ></input>
      <button type="button" onClick={depositFunds}>
        Deposit Funds in Account
      </button>
      <br></br>
      <label htmlFor="withdrawAmount">Amount To Be Withdrawn</label>
      <input
        type="text"
        id="withdrawAmount"
        min="0"
        step="1"
        onChange={handleWithdrawAmountChange}
      ></input>
      <button type="button" onClick={withdrawFunds}>
        Withdraw Funds from Account
      </button>
      <br></br>
      <br></br>
      <label htmlFor="recieverAddress">Reciever Address</label>
      <input
        type="text"
        id="recieverAddress"
        onChange={handleRecieverAddressChange}
      ></input>
      <label htmlFor="recieverAmount">Reciever Amount</label>
      <input
        type="text"
        id="recieverAmount"
        min="0"
        step="1"
        onChange={handleRecieverAmountChange}
      ></input>
      <button type="button" onClick={transferFunds}>
        Transfer Funds
      </button>
    </div>
  );
}

export default Button;
