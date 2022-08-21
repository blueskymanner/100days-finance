import { ethers } from "ethers";
import getRpcUrl from "./getRpcUrl";

const RPC_URL = getRpcUrl();

export const simpleRpcProvider = new ethers.providers.Web3Provider(
  window.ethereum,
  "any"
);

export default ethers.getDefaultProvider("rinkeby");
