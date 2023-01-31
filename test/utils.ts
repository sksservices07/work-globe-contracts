import { CandidateContract } from "../typechain-types";

export function createCandidateProfile(index: Number, ownerAddress: string): CandidateContract.CandidateStruct {
    let fname: string = "FUser" + index;
    let lname: string = "LUser" + + index;
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
        experiences: [`I have ${index} experiences.`, "I had first worked here.", "Then there."],
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