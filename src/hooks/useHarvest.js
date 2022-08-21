import { useCallback } from "react";
import { astroTokenAddress } from "_common/address";
import { useWeb3React } from "@web3-react/core";
import { useAstroTokenContract } from "./useContract";

const useHarvest = async () => {
  const contract = useAstroTokenContract(astroTokenAddress);
  let txHash;
  try {
    txHash = await contract.claimAllottedSell();
    console.log("check in here", txHash);
  } catch (err) {
    // console.log("err=>", err);
  }
  return txHash;
};

export default useHarvest;
