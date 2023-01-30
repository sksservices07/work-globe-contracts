// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.11;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

contract CandidateContract is Initializable, ContextUpgradeable {
    struct Links {
        string website;
        string linkedin;
        string github;
        string twitter;
    }

    struct Candidate {
        uint256 id;
        string fname;
        string lname;
        uint256 dob;
        string country;
        string primaryRole;
        string yoe;
        string bio;
        string profileImageIPFSURL;
        string[] experiences; // later, we can change it into separate struct
        string[] skills;
        string pronouns;
        string resumeIPFSURL;
        address ownerAddress;
        Links links;
    }

    uint256 public CANDIDATE_ID = 0;
    Candidate[] private candidates;
    mapping(address => uint256) public addressToId; // id starts from 1

    constructor() initializer {}

    // registers a candidate
    // requires _msgSender() not to be previously registered
    function registerCandidate(Candidate memory _newCandidate)
        public
        returns (uint256)
    {
        require(
            addressToId[_msgSender()] == 0,
            "Candidate is registered using this address."
        );

        CANDIDATE_ID++;

        _newCandidate.id = CANDIDATE_ID;

        candidates.push(_newCandidate);
        addressToId[_msgSender()] = CANDIDATE_ID;

        return CANDIDATE_ID;
    }

    // edit candidate profile
    // requires candidateID to update to be non-zero
    // requires _msgSender() has access to that candidateId (addressToId mapping)
    // requires ownerAddress is not being updated (remains same as previously registered to maintain consistency in addressToId mapping)
    function editRegisteredCandidate(Candidate memory _updatedCandidate)
        public
        returns (uint256)
    {
        uint256 candidateId = _updatedCandidate.id;

        require(
            candidateId != 0 &&
                addressToId[_msgSender()] == candidateId &&
                _msgSender() == _updatedCandidate.ownerAddress,
            "You are not owner of this candidate address."
        );

        candidates[candidateId - 1] = _updatedCandidate;

        return candidateId;
    }

    // returns candidate profile by id
    function getCandidateById(uint256 _id)
        public
        view
        returns (Candidate memory)
    {
        return candidates[_id - 1];
    }

    // returns candidate profile by address
    function getCandidateByAddress(address _candidateAddress)
        public
        view
        returns (Candidate memory)
    {
        uint256 candidateId = addressToId[_candidateAddress];
        return candidates[candidateId - 1];
    }

    // returns total number of candidates
    function totalCandidates() public view returns (uint256) {
        return candidates.length;
    }
}
