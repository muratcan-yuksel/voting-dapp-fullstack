const { ethers } = require("hardhat");

async function main() {
  // We get the contract to deploy
  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();

  await voting.deployed();

  console.log("Voting deployed to:", voting.address);
}

// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
