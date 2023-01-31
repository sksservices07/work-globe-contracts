import { HardhatUserConfig } from "hardhat/config";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-toolbox"
import "@nomiclabs/hardhat-waffle";
import "@nomicfoundation/hardhat-chai-matchers";

const config: HardhatUserConfig = {
  solidity: "0.8.11",
};

export default config;