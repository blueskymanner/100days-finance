import { useContext, useEffect, useState } from "react";
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js';
import { astroTokenAddress } from '_common/address';
import ASTRO_ABI from '_common/astro-abi.json';
import { useAstroTokenContract } from './useContract';
import { calcAPY, formatFloatFixed } from 'utils/helpers';


export const useAutoApy = (dayCounter) => {
    const { account } = useWeb3React();
    const contract = useAstroTokenContract(astroTokenAddress);

    const [rewardYieldVal, setRewardYieldVal] = useState(0);
    const [rewardYieldDenominatorVal, setRewardYieldDenominatorVal] = useState(0);
    const [rebaseFrequencyVal, setRebaseFrequency] = useState(0);
    const [apyVal, setApyVal] = useState(0);

    const rewardYield = async () => {
        const rewardYield = await contract.rewardYield();
        return rewardYield;
    }

    const rewardYieldDenominator = async () => {
        const rewardYieldDenominator = await contract.rewardYieldDenominator();
        return rewardYieldDenominator;
    }

    const rebaseFrequency = async () => {
        const rebaseFrequency = await contract.rebaseFrequency();
        return rebaseFrequency;
    }

    useEffect(() => {
        (async () => {
            const value = await rewardYield();
            setRewardYieldVal(value.toNumber());
        })();
    }, [contract]);

    useEffect(() => {
        let isUpdated = true;
        (async () => {
            const value = await rewardYieldDenominator();
            setRewardYieldDenominatorVal(value.toNumber());
        })();
    }, [contract]);

    useEffect(() => {
        (async () => {
            const value = await rebaseFrequency();
            setRebaseFrequency(value.toNumber());
        })();
    }, [contract]);

    useEffect(() => {
        (async () => {
            if (rewardYieldVal && rewardYieldDenominatorVal && rebaseFrequencyVal) {
                setApyVal(
                    Math.round(
                        calcAPY(
                            Number(rewardYieldVal),
                            Number(rewardYieldDenominatorVal),
                            dayCounter * 24 * 3600 / Number(rebaseFrequencyVal), 2
                        ).toNumber() / 10
                    ) / 100
                );
            }
        })();
    }, [
        rewardYieldVal, rewardYieldDenominatorVal, rebaseFrequencyVal, dayCounter
    ]);
    return apyVal;
};