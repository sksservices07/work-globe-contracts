// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.11;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

import "./candidate.sol";

contract JobContract is Initializable, ContextUpgradeable, OwnableUpgradeable {
    struct Job {
        uint256 jobId; // job index starts from 0
        string companyName;
        string position;
        string description;
        string employmentType;
        string location;
        string companyWebsiteUrl;
        address employer;
    }

    uint256 public JOB_ID = 0;
    Job[] private jobs;
    mapping(address => address[]) public candidates;

    CandidateContract public candidateContract;

    constructor(address _candidateContractAddress) initializer {
        candidateContract = CandidateContract(_candidateContractAddress);
        __Ownable_init();
    }

    // add job
    function addJob(
        string memory _companyName,
        string memory _position,
        string memory _description,
        string memory _employmentType,
        string memory _location,
        string memory _companyWebsiteUrl
    ) public payable {
        require(msg.value == 5 * 10**15);
        Job memory job = Job({
            jobId: JOB_ID,
            companyName: _companyName,
            position: _position,
            description: _description,
            employmentType: _employmentType,
            location: _location,
            companyWebsiteUrl: _companyWebsiteUrl,
            employer: _msgSender()
        });
        jobs.push(job);
        JOB_ID++;
    }

    // list all jobs
    function allJobs() public view returns (Job[] memory) {
        return jobs;
    }

    function getJobById(uint256 _jobid) public view returns (Job memory) {
        return jobs[_jobid];
    }

    // delete Job
    // this is highly gas consuming task
    function deleteJob(uint256 _jobId) public {
        require(
            _msgSender() == jobs[_jobId].employer || _msgSender() == owner(),
            "You are neither employer of this job nor owner."
        );

        if (_jobId >= jobs.length) return;
        for (uint256 i = _jobId; i < jobs.length - 1; i++) {
            jobs[i] = jobs[i + 1];
            jobs[i].jobId = i;
        }

        jobs.pop();
        JOB_ID--;
    }

    // candidate will apply for job
    function applyForJob(uint256 _jobid) public {
        candidateContract.getCandidateByAddress(_msgSender()); // will automatically throw error if candidate with _msgSender doesn't exists

        address[] memory appliedCandidates = candidates[
            jobs[_jobid].employer
        ];
        for (uint256 i = 0; i < appliedCandidates.length; i++) {
            require(
                appliedCandidates[i] != _msgSender(),
                "You have already registered for this job using this address."
            );
        }

        candidates[jobs[_jobid].employer].push(_msgSender());
    }

    // returns total number of jobs
    function totalJobs() public view returns (uint256) {
        return jobs.length;
    }

    function getAppliedCandidatesByJobId(uint256 _jobid)
        public
        view
        returns (address[] memory)
    {
        require(
            jobs[_jobid].employer == _msgSender(),
            "You are not employer of this job."
        );
        return candidates[jobs[_jobid].employer];
    }
}
