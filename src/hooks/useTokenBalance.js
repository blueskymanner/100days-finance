import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import useActiveWeb3React from './useActiveWeb3React';
import { BIG_ZERO } from '../utils/bigNumber';
import { getErc20Contract } from '../utils/contractHelpers';

export const FetchStatus = {
  NOT_FETCHED: 'not-fetched',
  SUCCESS: 'success',
  FAILED: 'failed',
};

const useTokenBalance = (tokenAddress) => {
  const { NOT_FETCHED, SUCCESS, FAILED } = FetchStatus;
  const [balanceState, setBalanceState] = useState({
    balance: BIG_ZERO,
    decimals: 18,
    fetchStatus: NOT_FETCHED,
  });
  const { account, library, chainId } = useActiveWeb3React();
  // const tokenAddress = getCvrAddressByChainId(chainId || 4);
  useEffect(() => {
    const fetchBalance = async () => {
      const contract = getErc20Contract(tokenAddress, library);
      try {
        const decimals = await contract.decimals();
        const res = await contract.balanceOf(account);

        // console.log(ethers.utils.formatEther(res, decimals))
        setBalanceState({
          balance: new BigNumber(res.toString()),
          decimals,
          fetchStatus: SUCCESS,
        });
      } catch (e) {
        console.error(e);
        setBalanceState((prev) => ({
          ...prev,
          fetchStatus: FAILED,
        }));
      }
    };

    if (account) {
      fetchBalance();
    }
  }, [account, tokenAddress, SUCCESS, FAILED, library]);

  return balanceState;
};

export default useTokenBalance;
