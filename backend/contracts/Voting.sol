//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 voteCount;
        uint256 yesVotes;
        uint256 noVotes;
    }
    mapping(uint256 => mapping(address => bool)) private hasVotedForProposal; //Mapping of proposal IDs to whether an address has voted for that proposal

    // The Proposal[] public proposals line creates an array called proposals that will store all of the Proposal objects.
    Proposal[] public proposals;

    // constructor() {}
    modifier nonEmptyString(string memory str) {
        require(bytes(str).length > 0, "String cannot be empty");
        _;
    }

    function addProposal(string memory _title, string memory _description)
        public
        nonEmptyString(_title)
        nonEmptyString(_description)
    {
        Proposal memory newProposal = Proposal({
            id: uint256(proposals.length),
            title: _title,
            description: _description,
            voteCount: 0,
            yesVotes: 0,
            noVotes: 0
        });
        proposals.push(newProposal);
        // emit ProposalAdded(newProposal.id, newProposal.title);
    }

    function vote(uint256 _proposalId, bool _yesVote) public {
        require(_proposalId < proposals.length, "Invalid proposal ID");
        require(
            !hasVotedForProposal[_proposalId][msg.sender],
            "You have already voted for this proposal"
        );
        if (_yesVote) {
            proposals[_proposalId].yesVotes++;
        } else {
            proposals[_proposalId].noVotes++;
        }
        proposals[_proposalId].voteCount++;
        hasVotedForProposal[_proposalId][msg.sender] = true;
    }

    function getProposalVotes(uint256 _proposalId)
        public
        view
        returns (uint256 yesVotes, uint256 noVotes)
    {
        require(_proposalId < proposals.length, "Invalid proposal ID");
        return (
            proposals[_proposalId].yesVotes,
            proposals[_proposalId].noVotes
        );
    }
}
