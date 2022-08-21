import { useCallback } from "react";
import { useAstroTokenContract } from "./useContract";
import { astroTokenAddress } from "_common/address";
import { useWeb3React } from "@web3-react/core";

export const useIsClaimable = () => {
    const { account } = useWeb3React();
    const tokenContract = useAstroTokenContract(astroTokenAddress);
    const checkNeedsInitialDelayKickoff = useNeedsInitialDelayKickoff();

    const callback = useCallback(async () => {
        try {
            const needsKickoff = await checkNeedsInitialDelayKickoff();
            if (needsKickoff) return false;

            const allottedSellInterval = (await tokenContract.callStatic.allottedSellInterval()).toNumber();
            const lastClaimed = (await tokenContract.callStatic._allottedSellHistory(account)).toNumber();
            const now = new Date().getTime() / 1000;
            return now >= lastClaimed + allottedSellInterval;
        } catch (err) {
            console.log("err in useIsClaimable", err);
            return false;
        }
    });

    return callback;
}

export const useNeedsInitialDelayKickoff = () => {
    const { account } = useWeb3React();
    const tokenContract = useAstroTokenContract(astroTokenAddress);

    const callback = useCallback(async () => {
        try {
            const lastClaimed = (await tokenContract.callStatic._allottedSellHistory(account)).toNumber();
            console.log({ lastClaimed })
            return lastClaimed === 0;
        } catch (err) {
            console.log("err occurred in useNeedsInitialDelayKickoff", err);
            return false;
        }
    });

    return callback;
}

export const useUpdateAllottedSellTimer = () => {
    const tokenContract = useAstroTokenContract(astroTokenAddress);
    const checkNeedsInitialDelayKickoff = useNeedsInitialDelayKickoff();

    const callback = useCallback(async () => {
        try {
            const needsKickoff = await checkNeedsInitialDelayKickoff();
            if (!needsKickoff) {
                console.log("delay already kicked off");
                return false;
            }

            const tx = await tokenContract.updateAllottedSellTimer();
            const receipt = await tx.wait();
            return receipt.status;

        } catch (err) {
            console.log("err occurred in useUpdateAllottedSellTimer", err);
            return false;
        }
    });

    return callback;
}

export const useClaim = () => {
    const tokenContract = useAstroTokenContract(astroTokenAddress);
    const getIsClaimable = useIsClaimable();

    const claimCallback = useCallback(async () => {
        try {
            const isClaimable = await getIsClaimable();
            if (!isClaimable) {
                console.log("not claimable yet.");
                return false;
            }

            const tx = await tokenContract.claimAllottedSell();
            const receipt = await tx.wait();
            return receipt.status;
        } catch (err) {
            console.log(err);
            return false;
        }
    }, [tokenContract]);

    return claimCallback;
};

