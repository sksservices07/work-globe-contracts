import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers, waffle } from "hardhat";
import { CandidateContract, JobContract } from "../typechain-types";
import { createCandidateProfile } from "./utils";

const CandidateArtifacts = require("../artifacts/contracts/candidate.sol/CandidateContract.json");
const JobArtifacts = require("../artifacts/contracts/job.sol/JobContract.json");
const { deployContract, provider } = waffle;

describe("Job Tests", () => {
    let accounts: SignerWithAddress[];
    let candidateContractInstance: CandidateContract;
    let jobContractInstance: JobContract;

    before(async () => {
        accounts = await ethers.getSigners();
        // using accounts [6, 7, 8, 9, 10] for candidates
        // using accounts [0, 1, 2, 3, 4, 5] for jobs
        // using account  [0] for deployer / admin

        candidateContractInstance = (await deployContract(accounts[0], CandidateArtifacts)) as CandidateContract;
        jobContractInstance = (await deployContract(accounts[0], JobArtifacts, [candidateContractInstance.address])) as JobContract;

        // create 5 candidates
        let ownerAddress: string = accounts[6].address;
        await candidateContractInstance.connect(accounts[6]).registerCandidate(createCandidateProfile(6, ownerAddress), {
            from: ownerAddress
        });

        ownerAddress = accounts[7].address;
        await candidateContractInstance.connect(accounts[7]).registerCandidate(createCandidateProfile(7, ownerAddress), {
            from: ownerAddress
        });

        ownerAddress = accounts[8].address;
        await candidateContractInstance.connect(accounts[8]).registerCandidate(createCandidateProfile(8, ownerAddress), {
            from: ownerAddress
        });

        ownerAddress = accounts[9].address;
        await candidateContractInstance.connect(accounts[9]).registerCandidate(createCandidateProfile(9, ownerAddress), {
            from: ownerAddress
        });

        ownerAddress = accounts[10].address;
        await candidateContractInstance.connect(accounts[10]).registerCandidate(createCandidateProfile(10, ownerAddress), {
            from: ownerAddress
        })
    });

    it("Create Job", async () => {
        let totalJobs: BigNumber = await jobContractInstance.totalJobs();
        expect(totalJobs).to.equal(0);

        // test addJob(...)
        await expect(() =>
            jobContractInstance.addJob("Company0", "Backend Dev", "This position is open as of now - Desc", "Full-time", "Noida", "https://www.company-url1.com/", {
                value: 5 * 10 ** 15
            })
        ).to.changeEtherBalances([jobContractInstance, accounts[0]], [5 * 10 ** 15, -5 * 10 ** 15]);

        // test totalJobs()
        totalJobs = await jobContractInstance.totalJobs();
        expect(totalJobs).to.equal(1);

        // test JOB_ID()
        let job_id: BigNumber = await jobContractInstance.JOB_ID();
        expect(job_id).to.equal(1);

        // test getJobById(uint256 _jobid)
        let job: JobContract.JobStruct = await jobContractInstance.getJobById(0);
        expect(job.jobId).to.equal(0);
        expect(job.companyName).to.equal("Company0");
        expect(job.employer).to.equal(accounts[0].address);
    });

    it("Add more jobs +4", async () => {
        await jobContractInstance.addJob("Company1", "Devops", "This position is open as of now - Desc", "Full-time", "Noida", "https://www.company-url2.com/", {
            value: 5 * 10 ** 15
        });

        await jobContractInstance.addJob("Company2", "Devops", "This position is open as of now - Desc", "Full-time", "Noida", "https://www.company-url2.com/", {
            value: 5 * 10 ** 15
        });

        await jobContractInstance.addJob("Company3", "Frontend Dev", "Position is open as of now - Desc", "Part-time", "Ahmedabad", "https://www.company-url3.com/", {
            value: 5 * 10 ** 15
        });

        await jobContractInstance.addJob("Company4", "Security Engineer", "Salary range is only $40,000 per year", "Part-time", "Remote", "https://www.company-url4.com/", {
            value: 5 * 10 ** 15
        });

        let totalJobs: BigNumber = await jobContractInstance.totalJobs();
        expect(totalJobs).to.equal(5);
    });

    it("Checking all jobs", async () => {
        let allJobs: JobContract.JobStruct[] = await jobContractInstance.allJobs();
        expect(allJobs.length).to.equal(5);

        for (let i = 0; i < allJobs.length; i++) {
            expect(allJobs[i].companyName).to.equal("Company" + i);
        }
    });

    it("Delete job", async () => {
        await jobContractInstance.deleteJob(1);

        // total Jobs earlier were 5, now after deletion should be 4
        let totalJobs: BigNumber = await jobContractInstance.totalJobs();
        expect(totalJobs).to.equal(4);

        let allJobs: JobContract.JobStruct[] = await jobContractInstance.allJobs();
        expect(allJobs.length).to.equal(4);

        expect(allJobs[0].companyName).to.equal("Company0");
        expect(allJobs[1].companyName).to.equal("Company2");
        expect(allJobs[2].companyName).to.equal("Company3");
        expect(allJobs[3].companyName).to.equal("Company4");
    });

    it("Delete job with non-employer address - Revert", async () => {
        await expect(
            jobContractInstance.connect(accounts[1]).deleteJob(3, {  // not using accounts[0] because owner can also delete jobs
                from: accounts[1].address
            })
        ).to.be.revertedWith("You are neither employer of this job nor owner.");
    });

    it("Apply for job", async () => {
        await jobContractInstance.connect(accounts[6]).applyForJob(0, {
            from: accounts[6].address
        });
    });

    it("Apply for job - Revert", async () => {
        await expect(
            jobContractInstance.connect(accounts[1]).applyForJob(0, {
                from: accounts[1].address
            })
        ).to.be.revertedWith("Candidate not registered using this address.");
    });

    it("Apply for job - Revert", async () => {
        await expect(
            jobContractInstance.connect(accounts[6]).applyForJob(0, {
                from: accounts[6].address
            })
        ).to.be.revertedWith("You have already registered for this job using this address.");
    });

    it("Apply for job - multiple", async () => {
        await jobContractInstance.connect(accounts[7]).applyForJob(0, {
            from: accounts[7].address
        });

        await jobContractInstance.connect(accounts[8]).applyForJob(0, {
            from: accounts[8].address
        });

        await jobContractInstance.connect(accounts[9]).applyForJob(0, {
            from: accounts[9].address
        });
    });

    it("Employer sees candidates who have applied", async () => {
        let appliedCandidates = await jobContractInstance.getAppliedCandidatesByJobId(0);
        expect(appliedCandidates.length).to.equal(4);
    });

    it("Owner withdraw funds", async () => {
        let jobContractBalance: BigNumber = await provider.getBalance(jobContractInstance.address);

        await expect(() =>
            jobContractInstance.withdrawFunds(accounts[0].address)
        ).to.changeEtherBalances([jobContractInstance, accounts[0]], [jobContractBalance.mul(-1), jobContractBalance]);
    });

    it("Non-Owner withdraw funds - Revert", async () => {
        await expect(
            jobContractInstance.connect(accounts[1]).withdrawFunds(accounts[0].address, {
                from: accounts[1].address
            })
        ).to.be.revertedWith("Ownable: caller is not the owner");
    });
})