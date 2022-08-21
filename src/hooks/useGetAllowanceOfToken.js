import { useCallback, useState } from 'react';
import { useTokenContract } from './useContract';
import useActiveWeb3React from './useActiveWeb3React';
import {astroTokenAddress} from '../_common/address';

const useGetAllowanceOfToken = (address, tokenSymbol = 'cvr') => {
  const { account } = useActiveWeb3React();
  const [cvrAllowance, setAllowance] = useState(false);
  // const cvrAddress = getCvrAddress();
  // const cvrContract = useTokenContract(cvrAddress);
  const tokenAddress = astroTokenAddress;
  const tokenContract = useTokenContract(tokenAddress);
  const handleAllowance = useCallback(() => {
    const get = async () => {
      const res = await tokenContract.allowance(account, address);
      setAllowance(res.gt(0));
    };

    if (address && tokenContract) {
      get();
    }
  }, [tokenContract, address, tokenSymbol, account]);

  return { cvrAllowance, handleAllowance };
};

export default useGetAllowanceOfToken;
