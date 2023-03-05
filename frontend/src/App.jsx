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
  const [reversedProposals, setReversedProposals] = useState([]);
  const [renderHandler, setRenderHandler] = useState(0);

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
      setRenderHandler(renderHandler + 1);
      // update the proposals array with the new proposal
      // setProposals([
      //   ...proposals,
      //   { title: proposal.title, description: proposal.description },
      // ]);
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
      setReversedProposals([...proposals].reverse());
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

  const handleConnectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };
  const connectWallet = async () => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      handleConnectWallet();
    }
  };

  useEffect(() => {
    getProposals();
  }, [walletConnected, renderHandler]);

  return (
    <div className="flex  flex-col justify-start items-center p-4 text-white bg-black min-h-screen h-full">
      {!walletConnected && (
        <button
          className="border bg-blue-600 text-white font-bold p-2 m-3"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      )}

      {walletConnected && (
        <>
          <div className="flex flex-row ">
            <input
              type="text"
              placeholder="Title"
              value={proposal.title}
              onChange={(e) =>
                setProposal({ ...proposal, title: e.target.value })
              }
              className="border p-2 mr-4 text-black"
            />
            <input
              type="text"
              placeholder="Description"
              value={proposal.description}
              onChange={(e) =>
                setProposal({ ...proposal, description: e.target.value })
              }
              className="border p-2 text-black"
            />
          </div>

          <button
            className="border bg-blue-600 text-white font-bold p-2 m-3"
            onClick={addProposal}
          >
            Add Proposal
          </button>

          {reversedProposals.map((proposal, index) => (
            <div key={index} className="border p-4 min-w-[350px] w-auto">
              <h3 className="pb-2">Title: {proposal.title}</h3>
              <p className="pb-2">Description: {proposal.description}</p>
              <div className="flex justify-between">
                <button
                  className="border p-2 bg-red-600 text-white font-semibold"
                  onClick={() => vote(proposal.id, false)}
                >
                  No
                </button>
                <button
                  className="border p-2 bg-green-600 text-white font-semibold"
                  onClick={() => vote(proposal.id, true)}
                >
                  Yes
                </button>
              </div>
              <div className="flex justify-between">
                {/* //get vote counts */}
                <p className="text-red-600">
                  No: {proposal.noVotes.toNumber()}
                </p>
                <p className="text-green-600">
                  Yes: {proposal.yesVotes.toNumber()}
                </p>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default App;
