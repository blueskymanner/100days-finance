import { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import BigNumber from 'bignumber.js';
import { astroTokenAddress } from '_common/address';
import ASTRO_ABI from '_common/astro-abi.json';
import { useAstroTokenContract } from './useContract';
import { calcAPY, formatFloatFixed } from 'utils/helpers';

const AstroEtherContext = createContext(null);

export default function useAstroRef() {
  const [
    {
      userBal,
      rebase,
      rewardYieldVal,
      rewardYieldDenominatorVal,
      rebaseFrequencyVal,
      apyVal,
      dprVal,
      apyMonVal,
      buyTax,
      sellTax,
      whaleTax,
      invadorTax,
    },
  ] = useContext(AstroEtherContext);
  return [
    {
      userBal,
      rebase,
      rewardYieldVal,
      rewardYieldDenominatorVal,
      rebaseFrequencyVal,
      apyVal,
      dprVal,
      apyMonVal,
      buyTax,
      sellTax,
      whaleTax,
      invadorTax,
    },
  ];
}

export const AstroEtherProvider = ({ children }) => {
  const { account } = useWeb3React();
  const contract = useAstroTokenContract(astroTokenAddress);

  const [userBal, setUserBalance] = useState(0);
  const [rebase, setNextRebase] = useState(0);
  const [rewardYieldVal, setRewardYieldVal] = useState(0);
  const [rewardYieldDenominatorVal, setRewardYieldDenominatorVal] = useState(0);
  const [rebaseFrequencyVal, setRebaseFrequency] = useState(0);
  const [apyVal, setApyVal] = useState(0);
  const [apyMonVal, setMonApyVal] = useState(0);
  const [dprVal, setDprVal] = useState(0);
  const [buyTax, setBuyTax] = useState(0);
  const [sellTax, setSellTax] = useState(0);
  const [whaleTax, setWhaleTax] = useState(0);
  const [invadorTax, setInvadorTax] = useState(0);

  const getBalance = async () => {
    const userBal = await contract.balanceOf(account);
    return userBal;
  };

  const rewardYield = async () => {
    const rewardYield = await contract.rewardYield();
    return rewardYield;
  };

  const rewardYieldDenominator = async () => {
    const rewardYieldDenominator = await contract.rewardYieldDenominator();
    return rewardYieldDenominator;
  };

  const rebaseFrequency = async () => {
    const rebaseFrequency = await contract.rebaseFrequency();
    return rebaseFrequency;
  };

  const buyFee = async () => {
    const rebaseFrequency = await contract.totalFee(0);
    return rebaseFrequency;
  };
  const sellFee = async () => {
    const rebaseFrequency = await contract.totalFee(1);
    return rebaseFrequency;
  };
  const whaleFee = async () => {
    const rebaseFrequency = await contract.totalFee(2);
    return rebaseFrequency;
  };
  const invadorFee = async () => {
    const rebaseFrequency = await contract.totalFee(3);
    return rebaseFrequency;
  };

  const getNextRebase = async () => {
    let base;
    try {
      base = await contract.nextRebase();
    } catch (err) {
      console.log('err => ', err);
    }
    return base;
  };

  useEffect(() => {
    let isUpdated = true;
    if (isUpdated) {
      (async () => {
        if (account) {
          const bal = await getBalance();
          setUserBalance(ethers.utils.formatUnits(bal, 18));
        }
      })();
    }
    return () => {
      isUpdated = false;
    };
  }, [getBalance]);

  useEffect(() => {
    let isUpdated = true;
    if (isUpdated && contract) {
      (async () => {
        const base = await getNextRebase();
        console.log('base', base);
        setNextRebase(base.toNumber());
      })();
    }
    return () => {
      isUpdated = false;
    };
  }, [contract]);

  useEffect(() => {
    let isUpdated = true;
    if (isUpdated && contract) {
      (async () => {
        const value = await rewardYield();
        setRewardYieldVal(value.toNumber());
      })();
    }
    return () => {
      isUpdated = false;
    };
  }, [contract]);

  useEffect(() => {
    let isUpdated = true;
    if (isUpdated && contract) {
      (async () => {
        const value = await rewardYieldDenominator();
        setRewardYieldDenominatorVal(value.toNumber());
      })();
    }
    return () => {
      isUpdated = false;
    };
  }, [contract]);

  useEffect(() => {
    let isUpdated = true;
    if (isUpdated && contract) {
      (async () => {
        const value = await buyFee();
        setBuyTax(value.toNumber() / 100);
      })();
      (async () => {
        const value = await sellFee();
        setSellTax(value.toNumber() / 100);
      })();
      (async () => {
        const value = await whaleFee();
        setWhaleTax(value.toNumber() / 100);
      })();
      (async () => {
        const value = await invadorFee();
        setInvadorTax(value.toNumber() / 100);
      })();
    }
    return () => {
      isUpdated = false;
    };
  }, [contract]);

  useEffect(() => {
    let isUpdated = true;
    if (isUpdated && contract) {
      (async () => {
        const value = await rebaseFrequency();
        setRebaseFrequency(value.toNumber());
      })();
    }
    return () => {
      isUpdated = false;
    };
  }, [contract]);

  useEffect(() => {
    let isUpdated = true;
    if (isUpdated) {
      (async () => {
        if (rewardYieldVal && rewardYieldDenominatorVal && rebaseFrequencyVal) {
          setApyVal(
            Math.round(
              calcAPY(
                Number(rewardYieldVal),
                Number(rewardYieldDenominatorVal),
                (365 * 24 * 3600) / Number(rebaseFrequencyVal),
                2,
              ).toNumber() / 10,
            ) / 100,
          );
        }
      })();
      (async () => {
        if (rewardYieldVal && rewardYieldDenominatorVal && rebaseFrequencyVal) {
          setMonApyVal(
            Math.round(
              calcAPY(
                Number(rewardYieldVal),
                Number(rewardYieldDenominatorVal),
                (30 * 24 * 3600) / Number(rebaseFrequencyVal),
                2,
              ).toNumber() / 10,
            ) / 100,
          );
        }
      })();
      (async () => {
        if (rewardYieldVal && rewardYieldDenominatorVal && rebaseFrequencyVal) {
          setDprVal(
            Math.round(
              calcAPY(
                Number(rewardYieldVal),
                Number(rewardYieldDenominatorVal),
                (24 * 3600) / Number(rebaseFrequencyVal),
                2,
              ).toNumber() / 10,
            ) / 100,
          );
        }
      })();
    }
    return () => {
      isUpdated = false;
    };
  }, [rewardYieldVal, rewardYieldDenominatorVal, rebaseFrequencyVal]);

  return (
    <AstroEtherContext.Provider
      value={[
        {
          userBal,
          rebase,
          rewardYieldVal,
          rewardYieldDenominatorVal,
          rebaseFrequencyVal,
          apyVal,
          dprVal,
          apyMonVal,
          buyTax,
          sellTax,
          whaleTax,
          invadorTax,
        },
      ]}
    >
      {children}
    </AstroEtherContext.Provider>
  );
};
