import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "./constants";

const App = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();
  const [proposal, setProposal] = useState({
    title: "",
    description: "",
  });
  const [proposals, setProposals] = useState([]);

  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Goerli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const addProposal = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, signer);
      const tx = await contract.addProposal(
        proposal.title,
        proposal.description
      );
      await tx.wait();
      console.log("Proposal added successfully");
      // console.log(proposals);
    } catch (err) {
      console.error(err);
    }
  };

  const getProposals = async () => {
    try {
      const provider = await getProviderOrSigner();
      const contract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, provider);
      const proposals = await contract.getProposals();
      console.log(proposals);
      setProposals(proposals);
    } catch (err) {
      console.error(err);
    }
  };

  //get proposal id on click
  // const getProposalId = async (proposalId) => {
  //   try {
  //     const provider = await getProviderOrSigner();
  //     const contract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, provider);
  //     const proposal = await contract.getProposal(proposalId);
  //     console.log(proposal);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }

  const vote = async (proposalId, vote) => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, signer);
      //vote is boolean
      const tx = await contract.vote(proposalId, vote);
      await tx.wait();
      window.alert("Vote added successfully");
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);
  return (
    <div>
      <input
        type="text"
        placeholder="Title"
        value={proposal.title}
        onChange={(e) => setProposal({ ...proposal, title: e.target.value })}
      />
      <input
        type="text"
        placeholder="Description"
        value={proposal.description}
        onChange={(e) =>
          setProposal({ ...proposal, description: e.target.value })
        }
      />

      <button onClick={addProposal}>Add Proposal</button>

      <button onClick={getProposals}>Get Proposals</button>
    </div>
  );
};

export default App;
