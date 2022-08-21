import { useEffect, useState, useRef } from "react";
import { useWeb3React } from "@web3-react/core";
import { simpleRpcProvider, defaultProvider } from "../utils/providers";
import getRpcUrl from "../utils/getRpcUrl";
/**
 * Provides a web3 provider with or without user's signer
 * Recreate web3 instance only if the provider change
 */

export const APP_CHAIN_ID = 43114;

const useActiveWeb3React = () => {
  const { library, chainId, ...web3React } = useWeb3React();
  const refEth = useRef(library);
  const [provider, setprovider] = useState(library || simpleRpcProvider);

  useEffect(() => {
    console.log("check", provider);
    if (library !== refEth.current) {
      setprovider(library || simpleRpcProvider);
      refEth.current = library;
    }
  }, [library, provider]);

  return {
    library: provider,
    chainId: chainId ?? parseInt(APP_CHAIN_ID, 10),
    ...web3React,
  };
};

export default useActiveWeb3React;
