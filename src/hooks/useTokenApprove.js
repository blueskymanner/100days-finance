import { useCallback } from "react";
import { ethers } from "ethers";
import { useTokenContract } from "./useContract";
import { useWeb3React } from "@web3-react/core";
// import useAddress from './useAddress';
import { astroTokenAddress } from "_common/address";

const useTokenApprove = (address, tokenSymbol = "cvr") => {
  const { account, library } = useWeb3React();
  //   const { getCvrAddress, getTokenAddress } = useAddress();
  // const cvrAddress = getCvrAddress();
  // const cvrContract = useTokenContract(cvrAddress);
  const tokenAddress = astroTokenAddress;
  const tokenContract = useTokenContract(tokenAddress);

  const handleApprove = useCallback(async () => {
    try {
      const tx = await tokenContract.approve(
        tokenContract.address,
        ethers.constants.MaxUint256
      );
      const receipt = await tx.wait();
      return receipt.status;
    } catch (e) {
      console.log(e);
      return false;
    }
  }, [address, tokenSymbol, library, account]);

  return { onApprove: handleApprove };
};

export default useTokenApprove;
