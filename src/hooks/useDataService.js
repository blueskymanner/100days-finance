import { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Moralis from 'moralis';
import axios from 'axios';
import { useAstroTokenContract } from './useContract';
import { astroTokenAddress } from '_common/address';

const ASTRO_PRICE_URL = `https://api.traderjoexyz.com/priceusd/${astroTokenAddress}`;
const TOTAL_HOLDERS_URL = `https://api.covalenthq.com/v1/43114/tokens/${astroTokenAddress}/token_holders/?quote-currency=USD&format=JSON&page-size=1000000000&key=ckey_4692876c71644fb1b93abfae7f9`;

const DataServiceContext = createContext(null);

export default function useDataService() {
  const [{ loading, astroPrice, holdersCount, totalSupply }] = useContext(
    DataServiceContext,
  );
  return [{ loading, astroPrice, holdersCount, totalSupply }];
}

export const DataServiceProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [astroPrice, setAstroPrice] = useState(0);
  const [holdersCount, setHoldersCount] = useState(0);
  const [totalSupply, setTotalSupply] = useState(null);

  const contract = useAstroTokenContract(astroTokenAddress);

  const getAstroPrice = async () => {
    setLoading(true);
    try {
      const { data: response } = await axios.get(ASTRO_PRICE_URL);
      setAstroPrice(Moralis.Units.FromWei(response, 18));
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const getTotalHolders = async () => {
    setLoading(true);
    try {
      const { data: response } = await axios.get(TOTAL_HOLDERS_URL);
      setHoldersCount(response.data.pagination.total_count);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const getTotalSupply = async () => {
    let supply;
    try {
      supply = await contract.totalSupply();
    } catch (err) {
      console.log('err => ', err);
    }
    return supply;
  };

  useEffect(() => {
    getAstroPrice();
    getTotalHolders();
  }, []);

  useEffect(() => {
    let isUpdated = true;
    if (isUpdated) {
      (async () => {
        const total = await getTotalSupply();
        setTotalSupply(ethers.utils.formatUnits(total, 18));
      })();
    }
    return () => {
      isUpdated = false;
    };
  }, []);

  return (
    <DataServiceContext.Provider
      value={[{ loading, astroPrice, holdersCount, totalSupply }]}
    >
      {children}
    </DataServiceContext.Provider>
  );
};
