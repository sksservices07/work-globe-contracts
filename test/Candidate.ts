import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { waffle, ethers } from "hardhat";
import { CandidateContract } from "../typechain-types";
import { createCandidateProfile } from "./utils";

const CandidateArtifacts = require("../artifacts/contracts/candidate.sol/CandidateContract.json");
const { deployContract } = waffle;

describe("Candidate Tests", () => {
    let accounts: SignerWithAddress[];
    let candidateContractInstance: CandidateContract;

    before(async () => {
        accounts = await ethers.getSigners();
        candidateContractInstance = (await deployContract(accounts[0], CandidateArtifacts)) as CandidateContract;
    });

    it("Register candidate", async () => {
        let totalCandidates = await candidateContractInstance.totalCandidates();
        expect(totalCandidates).to.equal(0);

        let ownerAddress: string = accounts[1].address;

        // test registerCandidate(Candidate memory _newCandidate)
        await candidateContractInstance.connect(accounts[1]).registerCandidate(createCandidateProfile(1, ownerAddress), {
            from: ownerAddress
        });

        // test getCandidateByAddress(address _candidateAddress)
        let candidate: CandidateContract.CandidateStruct = await candidateContractInstance.getCandidateByAddress(ownerAddress);
        expect(candidate.id).to.equal(1);
        expect(candidate.ownerAddress).to.equal(ownerAddress);

        // test CANDIDATE_ID
        let candidate_id: BigNumber = await candidateContractInstance.CANDIDATE_ID();
        expect(candidate_id).to.equal(1);

        // test getCandidateByAddress(address _candidateAddress)
        candidate = await candidateContractInstance.getCandidateById(candidate_id);
        expect(candidate.id).to.equal(1);
        expect(candidate.ownerAddress).to.equal(ownerAddress);

        // test totalCandidates()
        totalCandidates = await candidateContractInstance.totalCandidates();
        expect(totalCandidates).to.equal(1);
    });

    it("Register with same address - Revert", async () => {
        let ownerAddress: string = accounts[1].address;

        await expect(
            candidateContractInstance.registerCandidate(createCandidateProfile(1, ownerAddress))
        ).to.be.revertedWith("OwnerAddress not matching msg.sender.");

        await expect(
            candidateContractInstance.connect(accounts[1]).registerCandidate(createCandidateProfile(1, ownerAddress), {
                from: ownerAddress
            })
        ).to.be.revertedWith("Candidate is registered using this address.");
    });

    it("Register more candidate", async () => {
        let ownerAddress: string = accounts[2].address;
        await candidateContractInstance.connect(accounts[2]).registerCandidate(createCandidateProfile(2, ownerAddress), {
            from: ownerAddress
        });

        ownerAddress = accounts[3].address;
        await candidateContractInstance.connect(accounts[3]).registerCandidate(createCandidateProfile(3, ownerAddress), {
            from: ownerAddress
        });

        ownerAddress = accounts[4].address;
        await candidateContractInstance.connect(accounts[4]).registerCandidate(createCandidateProfile(4, ownerAddress), {
            from: ownerAddress
        });

        ownerAddress = accounts[5].address;
        await candidateContractInstance.connect(accounts[5]).registerCandidate(createCandidateProfile(5, ownerAddress), {
            from: ownerAddress
        });

        let totalCandidates = await candidateContractInstance.totalCandidates();
        expect(totalCandidates).to.equal(5);
    });

    it("Edit profile Candidate", async () => {
        let ownerAddress: string = accounts[4].address;
        let prevCandidateProfile: CandidateContract.CandidateStruct = await candidateContractInstance.getCandidateByAddress(ownerAddress);

        let profile: CandidateContract.CandidateStruct = createCandidateProfile(66, ownerAddress);
        profile.id = 4;
        await candidateContractInstance.connect(accounts[4]).editRegisteredCandidate(profile, {
            from: ownerAddress
        });

        let updatedCandidateProfile: CandidateContract.CandidateStruct = await candidateContractInstance.getCandidateByAddress(ownerAddress);

        expect(prevCandidateProfile.id).to.equal(updatedCandidateProfile.id);
        expect(prevCandidateProfile.ownerAddress).to.equal(updatedCandidateProfile.ownerAddress);
        expect(updatedCandidateProfile.fname).to.equal('FUser66');
    })
})