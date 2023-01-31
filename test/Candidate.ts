import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { waffle, ethers } from "hardhat";
import { CandidateContract } from "../typechain-types";

const CandidateArtifacts = require("../artifacts/contracts/candidate.sol/CandidateContract.json");
const { deployContract } = waffle;

function createCandidateProfile(index: Number, ownerAddress: string): CandidateContract.CandidateStruct {
    let fname: string = "FUser" + Number;
    let lname: string = "LUser" + + Number;

    let randomX = Date.now();

    return {
        id: 0,
        fname: fname,
        lname: lname,
        dob: randomX,
        country: "India",
        primaryRole: "Backend Engineer",
        yoe: (randomX % 10).toString(),
        bio: "Hi there.",
        profileImageIPFSURL: "ipfs://Q83k773kuh234f2382sdf4s8f5e" + randomX,
        experiences: ["I have 4 experiences.", "I had first worked here.", "Then there."],
        skills: ["Solidity", "NodeJS", "Rust"],
        pronouns: "He/Him",
        resumeIPFSURL: "ipfs://Qf98uik4mkmksdkwkufeu4eklfskdjfwehkri4",
        ownerAddress: ownerAddress,
        links: {
            website: `https://www.${fname + lname}.abc`,
            linkedin: "https://au.linkedin.com/" + fname,
            github: "https://github.com/" + fname,
            twitter: "https://twitter.com/" + fname
        }
    };
}

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

    });
})