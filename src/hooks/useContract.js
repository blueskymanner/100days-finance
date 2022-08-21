import { useMemo } from "react";
import useActiveWeb3React from "./useActiveWeb3React";
import ASTRO_ABI from "../_common/astro-abi.json";
import erc20Abi from "../_common/erc20.json";
import { astroTokenAddress } from "../_common/address";
import { ROUTER_ADDRESS } from "@traderjoe-xyz/sdk";
// import useAddress from './useAddress';
import {
  getContract,
  getUniswapV2RouterContract,
} from "../utils/contractHelpers";

export const useTokenContract = (address) => {
  const { library } = useActiveWeb3React();
  return useMemo(() => getContract(erc20Abi, address, library.getSigner()), [
    library,
    address,
  ]);
};

export const useAstroTokenContract = (address) => {
  const { library, account } = useActiveWeb3React();
  return useMemo(() => getContract(ASTRO_ABI, address, library.getSigner()), [
    library,
    address,
    account,
  ]);
};

export const useUniswapV2RouterContract = () => {
  const { library, chainId } = useActiveWeb3React();
  return useMemo(
    () =>
      getUniswapV2RouterContract(ROUTER_ADDRESS[chainId], library.getSigner()),
    [library, chainId]
  );
};
