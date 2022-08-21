
import { ethers } from 'ethers';
import ethSimpleProvider from './providers';
import { simpleRpcProvider } from './providers';
import IUniswapV2Router02Abi from '../_common/router.json';
import erc20Abi from '../_common/erc20.json';

export const getContract = (abi, address, signer) => {
    const signerOrProvider = signer ?? simpleRpcProvider;
    return address ? new ethers.Contract(address, abi, signerOrProvider) : null;
};

export const getUniswapV2RouterContract = (address, signer) => {
    return getContract(IUniswapV2Router02Abi, address, signer);
};

export const getErc20Contract = (address, signer) => {
    return getContract(erc20Abi, address, signer);
  };