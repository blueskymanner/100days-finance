import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import Moralis from 'moralis';
import { BigNumber } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import useDataService from 'hooks/useDataService';
import {
  CurrencyAmount,
  JSBI,
  Token,
  WAVAX,
  CAVAX,
  Fetcher,
  Trade,
  Router,
  Percent,
  TokenAmount,
  ROUTER_ADDRESS,
} from '@traderjoe-xyz/sdk';

import {
  Grid,
  Typography,
  ButtonBase,
  Button,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';

import Menu from '@mui/material/Menu';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import useTokenApprove from 'hooks/useTokenApprove';
import useGetAllowanceOfToken from 'hooks/useGetAllowanceOfToken';
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';

import { IconArrowsUpDown, IconSettings } from '@tabler/icons';
import { useUniswapV2RouterContract } from '../../hooks/useContract';
import useAstroRef from 'hooks/useAstroRef';
import useTokenBalance from 'hooks/useTokenBalance';
import metamaskIcon from 'assets/images/astro/metamask.png';
import avaxIcon from 'assets/images/astro/avax.png';
import usdcIcon from 'assets/images/astro/usdc.png';
import astroIcon from 'assets/images/astro/astro-icon.png';
import Tokenmodal from 'ui-component/cards/Tokenmodal';
import SlipModal from './SlipModal';
import {
  astroTokenAddress,
  avaxTokenAddress,
  usdcTokenAddress,
  wavaxTokenAddress,
} from '_common/address';

const tryParseAmount = (value, currency) => {
  if (!value || !currency) {
    return undefined;
  }
  try {
    // const typedValueParsed = parseUnits(value, currency.decimals).toString();
    const typedValueParsed = Moralis.Units.Token(
      value,
      currency.decimals,
    ).toString();
    if (typedValueParsed !== '0') {
      return currency instanceof Token
        ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
        : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed));
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.info(`Failed to parse input amount: "${value}"`, error);
  }
  // necessary for all paths to return a value
  return undefined;
};
const wrappedCurrency = (currency, chainId) => {
  return chainId && currency === CAVAX
    ? WAVAX[chainId]
    : currency instanceof Token
    ? currency
    : undefined;
};
const useTradeExactIn = (currencyAmountIn, currencyOut) => {
  const [pair, setPair] = useState(null);
  const { chainId, library } = useWeb3React();
  useEffect(() => {
    if (currencyAmountIn && currencyOut) {
      (async () => {
        setPair(
          await Fetcher.fetchPairData(
            wrappedCurrency(currencyAmountIn?.currency, chainId),
            wrappedCurrency(currencyOut, chainId),
            library,
          ),
        );
      })();
    }
  }, [currencyAmountIn, currencyOut, chainId, library]);
  return useMemo(() => {
    if (currencyAmountIn && currencyOut && pair) {
      return (
        Trade.bestTradeExactIn([pair], currencyAmountIn, currencyOut, {
          maxHops: 3,
          maxNumResults: 1,
        })[0] ?? null
      );
    }
    return null;
  }, [pair, currencyAmountIn, currencyOut]);
};
const useTradeExactOut = (currencyIn, currencyAmountOut) => {
  const [pair, setPair] = useState(null);
  const { chainId, library } = useWeb3React();
  useEffect(() => {
    if (currencyIn && currencyAmountOut) {
      (async () => {
        console.log(library);
        setPair(
          await Fetcher.fetchPairData(
            wrappedCurrency(currencyAmountOut?.currency, chainId),
            wrappedCurrency(currencyIn, chainId),
            library,
          ),
        );
      })();
    }
  }, [currencyIn, currencyAmountOut, chainId, library]);
  return useMemo(() => {
    if (currencyIn && currencyAmountOut && pair) {
      return (
        Trade.bestTradeExactOut([pair], currencyIn, currencyAmountOut, {
          maxHops: 3,
          maxNumResults: 1,
        })[0] ?? null
      );
    }
    return null;
  }, [pair, currencyIn, currencyAmountOut]);
};
const useSwapCallArguments = (
  trade,
  allowedSlippage,
  deadline,
  recipientAddressOrName,
) => {
  const { account, chainId, library } = useWeb3React();
  const contract = useUniswapV2RouterContract();
  const recipient = account;
  return useMemo(() => {
    if (!trade || !recipient || !library || !account || !chainId) return [];
    const swapMethods = [];
    swapMethods.push(
      Router.swapCallParameters(trade, {
        feeOnTransfer: false,
        allowedSlippage,
        recipient,
        ttl: deadline,
      }),
    );

    if (trade.TradeType === 0) {
      swapMethods.push(
        Router.swapCallParameters(trade, {
          feeOnTransfer: true,
          allowedSlippage,
          recipient,
          ttl: deadline,
        }),
      );
    }

    return swapMethods.map((parameters) => ({ parameters, contract }));
  }, [account, allowedSlippage, chainId, deadline, library, recipient, trade]);
};
const useSwapCallback = (
  trade,
  allowedSlippage,
  deadline,
  recipientAddressOrName,
) => {
  const { account, chainId, library } = useWeb3React();
  const swapCalls = useSwapCallArguments(
    trade,
    allowedSlippage,
    deadline,
    recipientAddressOrName,
  );
  const { onApprove } = useTokenApprove(ROUTER_ADDRESS[chainId]);
  const { cvrAllowance, handleAllowance } = useGetAllowanceOfToken(
    ROUTER_ADDRESS[chainId],
  );
  const recipient = account;
  // useEffect(() => {
  //     handleAllowance();
  // }, [])
  return useMemo(() => {
    if (!trade || !library || !account || !chainId) {
      return {
        state: 'Invalid',
        callback: null,
        error: 'Missing dependencies',
      };
    }
    if (!recipient) {
      return { state: 'Loading', callback: null, error: null };
    }

    return {
      state: 'Valid',
      callback: async function onSwap() {
        console.log('----');
        if (!cvrAllowance) {
          console.log('++++');

          await onApprove();
          await handleAllowance();
        }
        const estimatedCalls = await Promise.all(
          swapCalls.map((call) => {
            const {
              parameters: { methodName, args, value },
              contract,
            } = call;
            const options = !value || /^0x0*$/.test(value) ? {} : { value };
            console.log(call);
            return contract.estimateGas[methodName](...args, options)
              .then((gasEstimate) => {
                return {
                  call,
                  gasEstimate,
                };
              })
              .catch((gasError) => {
                console.info(
                  'Gas estimate failed, trying eth_call to extract error',
                  call,
                );

                return contract.callStatic[methodName](...args, options)
                  .then((result) => {
                    console.info(
                      'Unexpected successful call after failed estimate gas',
                      call,
                      gasError,
                      result,
                    );
                    return {
                      call,
                      error: new Error(
                        'Unexpected issue with estimating the gas. Please try again.',
                      ),
                    };
                  })
                  .catch((callError) => {
                    console.info('Call threw error', call, callError);
                    let errorMessage;
                    switch (callError.reason) {
                      case 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT':
                      case 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT':
                        errorMessage =
                          'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.';
                        break;
                      default:
                        errorMessage = `The transaction cannot succeed due to error: ${callError.reason}. This is probably an issue with one of the tokens you are swapping.`;
                    }
                    return { call, error: new Error(errorMessage) };
                  });
              });
          }),
        );

        const successfulEstimation = estimatedCalls.find(
          (el, ix, list) =>
            'gasEstimate' in el &&
            (ix === list.length - 1 || 'gasEstimate' in list[ix + 1]),
        );

        if (!successfulEstimation) {
          const errorCalls = estimatedCalls.filter((call) => 'error' in call);
          if (errorCalls.length > 0)
            throw errorCalls[errorCalls.length - 1].error;
          throw new Error(
            'Unexpected error. Please contact support: none of the calls threw an error',
          );
        }

        const {
          call: {
            contract,
            parameters: { methodName, args, value },
          },
          gasEstimate,
        } = successfulEstimation;

        return contract[methodName](...args, {
          gasLimit: gasEstimate
            .mul(BigNumber.from(10000).add(BigNumber.from(1000)))
            .div(BigNumber.from(10000)),
          ...(value && !/^0x0*$/.test(value)
            ? { value, from: account }
            : { from: account }),
        })
          .then((response) => {
            return response.hash;
          })
          .catch((error) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.');
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`, error, methodName, args, value);
              throw new Error(`Swap failed: ${error.message}`);
            }
          });
      },
      error: null,
    };
  }, [
    trade,
    library,
    account,
    chainId,
    recipient,
    recipientAddressOrName,
    swapCalls,
  ]);
};

const SwapForAstro = () => {
  const { account, chainId, library } = useWeb3React();
  const [flagExchange, setFlagExchange] = useState(true);
  const [flagSwapButton, setFlagSwapButton] = useState(true);
  const [selectedToken, setSelectedToken] = useState(0);
  const [isShow1, setShow1] = useState(false);
  const [isShow2, setShow2] = useState(false);
  const [fromToken, setFromToken] = useState({
    img: avaxIcon,
    name: 'AVAX',
    isClose: false,
  });
  const [toToken, setToToken] = useState({
    img: astroIcon,
    name: 'ASTRO',
    isClose: false,
  });
  const [sendAmount, setAmount] = useState('');
  const [receiveAmount, setReceivedAmount] = useState('');
  const [fromTokenBal, setFromTokenBal] = useState(0);
  const [toTokenBal, setToTokenBal] = useState(0);
  const [astroBalance, setAstroBalance] = useState(0);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [wavaxBalance, setWavaxBalance] = useState(0);
  const [avaxBalance, setAvaxBalance] = useState(0);
  const [slippage, setSlippage] = useState('49');
  const [isOpen, setModal] = useState(false);
  const [countSellTax, setSellTax] = useState(30);
  const [{ loading, astroPrice, holdersCount, totalSupply }] = useDataService();
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
  ] = useAstroRef();

  const astroBal = useTokenBalance(astroTokenAddress);
  useEffect(() => {
    (async () => {
      if (account) {
        const avaxBal = await library.getBalance(account);
        setAvaxBalance(
          Number(ethers.utils.formatEther(avaxBal.toString())).toFixed(2),
        );
      }
    })();
  }, [account]);
  const usdcBal = useTokenBalance(usdcTokenAddress);
  const wavaxBal = useTokenBalance(wavaxTokenAddress);

  useEffect(() => {
    if (astroBal) {
      setAstroBalance(Number(userBal).toFixed(2));
    }
    if (usdcBal) {
      setUsdcBalance(
        Number(ethers.utils.formatEther(usdcBal.balance.toString())).toFixed(2),
      );
    }
    if (wavaxBal) {
      setWavaxBalance(
        Number(ethers.utils.formatEther(wavaxBal.balance.toString())).toFixed(
          2,
        ),
      );
    }
  }, [astroBal, usdcBal, wavaxBal]);

  useEffect(() => {
    if (fromToken.name === 'AVAX') {
      setFromTokenBal(avaxBalance);
    }
    if (fromToken.name === 'WAVAX') {
      setFromTokenBal(wavaxBalance);
    }
    if (fromToken.name === 'USDC') {
      setFromTokenBal(usdcBalance);
    }
    if (fromToken.name === 'ASTRO') {
      setFromTokenBal(astroBalance);
    }
    if (toToken.name === 'AVAX') {
      setToTokenBal(avaxBalance);
    }
    if (toToken.name === 'WAVAX') {
      setToTokenBal(wavaxBalance);
    }
    if (toToken.name === 'USDC') {
      setToTokenBal(usdcBalance);
    }
    if (toToken.name === 'ASTRO') {
      setToTokenBal(astroBalance);
    }
  }, [
    fromToken,
    toToken,
    avaxBalance,
    usdcBalance,
    astroBalance,
    wavaxBalance,
  ]);

  useEffect(() => {
    if (flagExchange) {
      setFromToken({ ...fromToken, img: avaxIcon, name: 'AVAX' });
      setToToken({ ...toToken, img: astroIcon, name: 'ASTRO' });
    } else {
      setFromToken({ ...fromToken, img: astroIcon, name: 'ASTRO' });
      setToToken({ ...toToken, img: avaxIcon, name: 'AVAX' });
    }
  }, [flagExchange]);

  const handleSelectToken = (event) => {
    setSelectedToken(event.target.value);
  };

  const changeFromTo = () => {
    setFlagExchange(!flagExchange);
  };

  useEffect(() => {
    if (fromToken.isClose) {
      setShow1(false);
      setFromToken({ ...fromToken, isClose: false });
    }
    if (toToken.isClose) {
      setShow2(false);
      setToToken({ ...toToken, isClose: false });
    }
  }, [fromToken, toToken]);

  const [currencies, setCurrencies] = useState({});
  useEffect(() => {
    if (fromToken.name === 'AVAX') {
      setCurrencies({
        INPUT: CAVAX,
        OUTPUT: new Token(chainId, astroTokenAddress, 18, 'ASTRO', 'ASTROs'),
      });
    }
    if (fromToken.name === 'WAVAX') {
      setCurrencies({
        INPUT: WAVAX,
        OUTPUT: new Token(chainId, astroTokenAddress, 18, 'ASTRO', 'ASTROs'),
      });
    }
    if (fromToken.name === 'USDC') {
      setCurrencies({
        INPUT: new Token(chainId, usdcTokenAddress, 18, 'USDC', 'USDCs'),
        OUTPUT: new Token(chainId, astroTokenAddress, 18, 'ASTRO', 'ASTROs'),
      });
    }
    if (toToken.name === 'USDC') {
      setCurrencies({
        INPUT: new Token(chainId, astroTokenAddress, 18, 'ASTRO', 'ASTROs'),
        OUTPUT: new Token(chainId, usdcTokenAddress, 18, 'USDC', 'USDCs'),
      });
    }
    if (toToken.name === 'AVAX') {
      setCurrencies({
        INPUT: new Token(chainId, astroTokenAddress, 18, 'ASTRO', 'ASTROs'),
        OUTPUT: CAVAX,
      });
    }
    if (toToken.name === 'WAVAX') {
      setCurrencies({
        INPUT: new Token(chainId, astroTokenAddress, 18, 'ASTRO', 'ASTROs'),
        OUTPUT: WAVAX,
      });
    }
  }, [chainId, fromToken, toToken]);
  const [independentField, setIndependentField] = useState('INPUT');
  const [typedValue, setTypedValue] = useState('');
  const dependentField = useMemo(() => {
    return independentField === 'INPUT' ? 'OUTPUT' : 'INPUT';
  }, [independentField]);
  const isExactIn = useMemo(() => {
    return independentField === 'INPUT';
  }, [independentField]);
  const parsedAmount = useMemo(() => {
    return tryParseAmount(
      typedValue,
      (isExactIn ? currencies.INPUT : currencies.OUTPUT) ?? undefined,
    );
  }, [typedValue, isExactIn]);
  const bestTradeExactIn = useTradeExactIn(
    isExactIn ? parsedAmount : undefined,
    currencies.OUTPUT ?? undefined,
  );
  const bestTradeExactOut = useTradeExactOut(
    currencies.INPUT ?? undefined,
    !isExactIn ? parsedAmount : undefined,
  );
  const trade = isExactIn ? bestTradeExactIn : bestTradeExactOut;
  const parsedAmounts = {
    INPUT: independentField === 'INPUT' ? parsedAmount : trade?.inputAmount,
    OUTPUT: independentField === 'OUTPUT' ? parsedAmount : trade?.outputAmount,
  };
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  };
  const slippageTolerance = new Percent(`${slippage * 100}`, '10000');
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    slippageTolerance,
    deadline,
    null,
  );
  const onTypeInput = (value) => {
    setTypedValue(value);

    const st =
      astroPrice * value <= 10000
        ? sellTax
        : astroPrice * value >= 10001 && 100 * value <= 25000
        ? whaleTax
        : invadorTax;

    setSellTax(st);
    setIndependentField('INPUT');
  };
  const onTypeOutput = (value) => {
    setTypedValue(value);
    setIndependentField('OUTPUT');
  };

  const handleSwap = () => {
    if (!formattedAmounts.INPUT || !formattedAmounts.OUTPUT) {
      console.log('Please input token amount correctly');
      return;
    }
    if (swapCallback) {
      swapCallback()
        .then((hash) => {
          console.log(hash);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const maxValue = () => {
    onTypeInput(fromTokenBal);
  };

  const onSellClick = () => {
    setTypedValue(toTokenBal);
    setIndependentField('OUTPUT');
  };

  const sellValue20 = () => {
    onTypeInput(fromTokenBal * 0.2);
  };

  const sellValue50 = () => {
    onTypeInput(fromTokenBal * 0.5);
  };

  const SlippageModal = () => {
    setModal(true);
  };

  return (
    <MainCard title="" style={{ height: 'calc(100% - 50px)' }}>
      <Grid container sx={{ rowGap: '12px' }}>
        <Grid
          item
          container
          xs={12}
          md={12}
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            rowGap: '12px',
          }}
        >
          <Grid container item xs={12} sm={12} sx={{ padding: '0px 12px' }}>
            <SubCard>
              <Grid
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Grid>
                  <Typography
                    sx={{
                      fontFamily: 'Century Gothic, sans-serif',
                      fontSize: '24px',
                      lineHeight: '35px',
                      fontWeight: '700',
                      letterSpacing: '1px',
                      color: 'white',
                    }}
                  >
                    SWAP FOR ASTRO
                  </Typography>
                  {flagExchange ? (
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: '400',
                        color: 'white',
                      }}
                    >
                      Buy ASTRO below using <b>AVAX</b> or <b>USDC</b>
                    </Typography>
                  ) : (
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: '400',
                      }}
                    >
                      Sell <b>ASTRO</b> below
                    </Typography>
                  )}
                </Grid>
                <ButtonBase
                  variant="contained"
                  sx={{ cursor: 'pointer' }}
                  onClick={SlippageModal}
                >
                  <IconSettings size="30px" color="rgb(255, 184, 77)" />
                </ButtonBase>
              </Grid>
              <Grid
                sx={{
                  display: 'flex',
                  backgroundColor: 'rgba(21, 27, 52, 0.3)',
                  border: '1px solid rgb(89, 71, 255)',
                  borderRadius: '20px',
                  flexDirection: 'column',
                  textAlign: 'left',
                  padding: '20px 16px 10px',
                  marginTop: '1rem',
                  gap: '10px',
                }}
              >
                <Grid sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography
                    sx={{
                      fontFamily: 'Poppins',
                      fontSize: '18px',
                      fontWeight: '400',
                    }}
                  >
                    From
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: 'Poppins',
                      fontSize: '18px',
                      fontWeight: '400',
                      cursor: 'pointer',
                    }}
                  >
                    <span onClick={maxValue}>Balance: {fromTokenBal}</span>
                  </Typography>
                </Grid>
                <Grid sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Grid>
                    <input
                      style={{
                        width: '100%',
                        background: 'transparent',
                        outline: 'none',
                        fontFamily: 'Century Gothic, sans-serif',
                        fontSize: '22px',
                        color: 'rgb(255, 184, 77)',
                        textOverflow: 'ellipsis',
                        border: 'none',
                        fontWeight: 'bold',
                        margin: '5px 0',
                      }}
                      placeholder="0.0"
                      value={formattedAmounts.INPUT}
                      onChange={(e) => onTypeInput(e.target.value)}
                    />
                  </Grid>
                  {flagExchange ? (
                    <Grid>
                      <button
                        style={{
                          color: 'rgb(255, 184, 77)',
                          background: 'transparent',
                          border: 'none',
                          fontSize: '14px',
                          padding: '0px 10px',
                          margin: '12px 10px 10px 0px',
                          cursor: 'pointer',
                        }}
                        onClick={maxValue}
                      >
                        MAX
                      </button>
                    </Grid>
                  ) : (
                    <Grid style={{ display: 'flex' }}>
                      <button
                        style={{
                          color: 'rgb(255, 184, 77)',
                          background: 'transparent',
                          border: 'none',
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'inline',
                          marginRight: '-8px',
                        }}
                        onClick={sellValue20}
                      >
                        20%
                      </button>
                      <button
                        style={{
                          color: 'rgb(255, 184, 77)',
                          background: 'transparent',
                          border: 'none',
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'inline',
                        }}
                        onClick={sellValue50}
                      >
                        50%
                      </button>
                    </Grid>
                  )}

                  <Grid style={{ width: '120px' }}>
                    <Button
                      style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '16px',
                        fontWeight: 'bold',
                      }}
                      variant="contained"
                      onClick={() => setShow1(true)}
                    >
                      <img
                        src={fromToken.img}
                        style={{
                          width: '30px',
                          height: '30px',
                          marginRight: '10px',
                        }}
                      />
                      {fromToken.name}
                    </Button>
                    {flagExchange ? (
                      <>
                        {isShow1 && (
                          <Grid
                            sx={{
                              background: '#151b34',
                              borderRadius: '10px',
                              padding: '10px 0',
                              position: 'absolute',
                            }}
                          >
                            <MenuItem
                              value={0}
                              sx={{}}
                              onClick={() =>
                                setFromToken({
                                  ...fromToken,
                                  img: avaxIcon,
                                  name: 'AVAX',
                                  isClose: true,
                                })
                              }
                            >
                              <Grid sx={{ display: 'flex' }}>
                                <img
                                  src={avaxIcon}
                                  style={{ width: '30px', height: '30px' }}
                                />
                                <Typography
                                  sx={{
                                    fontFamily: 'Poppins',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    marginLeft: '8px',
                                    color: 'white',
                                  }}
                                >
                                  AVAX
                                </Typography>
                              </Grid>
                            </MenuItem>
                            <MenuItem
                              value={1}
                              sx={{}}
                              onClick={() =>
                                setFromToken({
                                  ...fromToken,
                                  img: avaxIcon,
                                  name: 'WAVAX',
                                  isClose: true,
                                })
                              }
                            >
                              <Grid sx={{ display: 'flex' }}>
                                <img
                                  src={avaxIcon}
                                  style={{ width: '30px', height: '30px' }}
                                />
                                <Typography
                                  sx={{
                                    fontFamily: 'Poppins',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    marginLeft: '8px',
                                    color: 'white',
                                  }}
                                >
                                  WAVAX
                                </Typography>
                              </Grid>
                            </MenuItem>
                            <MenuItem
                              value={2}
                              sx={{}}
                              onClick={() =>
                                setFromToken({
                                  ...fromToken,
                                  img: usdcIcon,
                                  name: 'USDC',
                                  isClose: true,
                                })
                              }
                            >
                              <Grid sx={{ display: 'flex' }}>
                                <img
                                  src={usdcIcon}
                                  style={{ width: '30px', height: '30px' }}
                                />
                                <Typography
                                  sx={{
                                    fontFamily: 'Poppins',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    marginLeft: '8px',
                                    color: 'white',
                                  }}
                                >
                                  USDC
                                </Typography>
                              </Grid>
                            </MenuItem>
                          </Grid>
                        )}
                      </>
                    ) : (
                      <>
                        {isShow1 && (
                          <Grid
                            sx={{
                              background: '#151b34',
                              borderRadius: '10px',
                              padding: '10px 0',
                              position: 'absolute',
                            }}
                          >
                            <MenuItem
                              value={0}
                              sx={{}}
                              onClick={() =>
                                setFromToken({
                                  ...fromToken,
                                  img: astroIcon,
                                  name: 'ASTRO',
                                  isClose: true,
                                })
                              }
                            >
                              <Grid sx={{ display: 'flex' }}>
                                <img
                                  src={astroIcon}
                                  style={{ width: '30px', height: '30px' }}
                                />
                                <Typography
                                  sx={{
                                    fontFamily: 'Poppins',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    marginLeft: '8px',
                                    color: 'white',
                                  }}
                                >
                                  ASTRO
                                </Typography>
                              </Grid>
                            </MenuItem>
                          </Grid>
                        )}
                      </>
                    )}
                  </Grid>
                </Grid>
              </Grid>
              <Grid
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  margin: 'auto',
                  marginTop: '1rem',
                  borderRadius: '20px',
                  background: 'rgb(255, 184, 77)',
                }}
              >
                <IconArrowsUpDown
                  size="24px"
                  color="rgba(0, 0, 0, 0.54)"
                  style={{ cursor: 'pointer' }}
                  onClick={() => changeFromTo()}
                />
              </Grid>
              <Grid
                sx={{
                  display: 'flex',
                  backgroundColor: 'rgba(21, 27, 52, 0.3)',
                  border: '1px solid rgb(89, 71, 255)',
                  borderRadius: '20px',
                  flexDirection: 'column',
                  textAlign: 'left',
                  padding: '20px 16px 10px',
                  marginTop: '1rem',
                  gap: '10px',
                }}
              >
                <Grid sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography
                    sx={{
                      fontFamily: 'Poppins',
                      fontSize: '18px',
                      fontWeight: '400',
                    }}
                  >
                    To
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: 'Poppins',
                      fontSize: '18px',
                      fontWeight: '400',
                      cursor: 'pointer',
                    }}
                  >
                    <span onClick={onSellClick}> Balance: {toTokenBal} </span>
                  </Typography>
                </Grid>
                <Grid sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Grid>
                    <input
                      style={{
                        width: '100%',
                        background: 'transparent',
                        outline: 'none',
                        fontFamily: 'Century Gothic, sans-serif',
                        fontSize: '22px',
                        color: 'rgb(255, 184, 77)',
                        textOverflow: 'ellipsis',
                        border: 'none',
                        fontWeight: 'bold',
                        margin: '5px 0',
                      }}
                      placeholder="0.0"
                      value={formattedAmounts.OUTPUT}
                      onChange={(e) => onTypeOutput(e.target.value)}
                    />
                  </Grid>
                  <Grid>
                    <Button
                      style={{
                        width: '120px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '16px',
                        fontWeight: 'bold',
                      }}
                      variant="contained"
                      onClick={() => setShow2(true)}
                    >
                      <img
                        src={toToken.img}
                        style={{
                          width: '30px',
                          height: '30px',
                          marginRight: '10px',
                        }}
                      />
                      {toToken.name}
                    </Button>
                    {flagExchange ? (
                      <>
                        {isShow2 && (
                          <Grid
                            sx={{
                              background: '#151b34',
                              borderRadius: '10px',
                              padding: '10px 0',
                              position: 'absolute',
                            }}
                          >
                            <MenuItem
                              value={0}
                              sx={{}}
                              onClick={() =>
                                setToToken({
                                  ...toToken,
                                  img: astroIcon,
                                  name: 'ASTRO',
                                  isClose: true,
                                })
                              }
                            >
                              <Grid sx={{ display: 'flex' }}>
                                <img
                                  src={astroIcon}
                                  style={{ width: '30px', height: '30px' }}
                                />
                                <Typography
                                  sx={{
                                    fontFamily: 'Poppins',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    marginLeft: '8px',
                                    color: 'white',
                                  }}
                                >
                                  ASTRO
                                </Typography>
                              </Grid>
                            </MenuItem>
                          </Grid>
                        )}
                      </>
                    ) : (
                      <>
                        {isShow2 && (
                          <Grid
                            sx={{
                              background: '#151b34',
                              borderRadius: '10px',
                              padding: '10px 0',
                              position: 'absolute',
                              zIndex: '1',
                            }}
                          >
                            <MenuItem
                              value={0}
                              sx={{}}
                              onClick={() =>
                                setToToken({
                                  ...toToken,
                                  img: avaxIcon,
                                  name: 'AVAX',
                                  isClose: true,
                                })
                              }
                            >
                              <Grid sx={{ display: 'flex' }}>
                                <img
                                  src={avaxIcon}
                                  style={{ width: '30px', height: '30px' }}
                                />
                                <Typography
                                  sx={{
                                    fontFamily: 'Poppins',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    marginLeft: '8px',
                                    color: 'white',
                                  }}
                                >
                                  AVAX
                                </Typography>
                              </Grid>
                            </MenuItem>
                            <MenuItem
                              value={1}
                              sx={{}}
                              onClick={() =>
                                setToToken({
                                  ...toToken,
                                  img: avaxIcon,
                                  name: 'WAVAX',
                                  isClose: true,
                                })
                              }
                            >
                              <Grid sx={{ display: 'flex' }}>
                                <img
                                  src={avaxIcon}
                                  style={{ width: '30px', height: '30px' }}
                                />
                                <Typography
                                  sx={{
                                    fontFamily: 'Poppins',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    marginLeft: '8px',
                                    color: 'white',
                                  }}
                                >
                                  WAVAX
                                </Typography>
                              </Grid>
                            </MenuItem>
                            <MenuItem
                              value={2}
                              sx={{}}
                              onClick={() =>
                                setToToken({
                                  ...toToken,
                                  img: usdcIcon,
                                  name: 'USDC',
                                  isClose: true,
                                })
                              }
                            >
                              <Grid sx={{ display: 'flex' }}>
                                <img
                                  src={usdcIcon}
                                  style={{ width: '30px', height: '30px' }}
                                />
                                <Typography
                                  sx={{
                                    fontFamily: 'Poppins',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    marginLeft: '8px',
                                    color: 'white',
                                  }}
                                >
                                  USDC
                                </Typography>
                              </Grid>
                            </MenuItem>
                          </Grid>
                        )}
                      </>
                    )}
                  </Grid>
                </Grid>
              </Grid>
              <Grid sx={{ marginTop: '1rem' }}>
                <Grid
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '14px',
                      marginBottom: '5px',
                      color: '#bcc3cf',
                    }}
                  >
                    Price
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '16px',
                      fontFamily: 'Poppins',
                    }}
                  >
                    0 AVAX per ASTRO
                  </Typography>
                </Grid>
                <Grid
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '14px',
                      marginBottom: '5px',
                      color: '#bcc3cf',
                    }}
                  >
                    Slippage Tolerance
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '16px',
                      fontFamily: 'Poppins',
                      color: '#bcc3cf',
                    }}
                  >
                    {slippage}%
                  </Typography>
                </Grid>
                <Grid
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '14px',
                      marginBottom: '5px',
                    }}
                  >
                    {flagExchange
                      ? `Buy Tax (${buyTax}%)`
                      : `Sell Tax (${countSellTax})`}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '16px',
                      fontFamily: 'Poppins',
                    }}
                  >
                    0
                  </Typography>
                </Grid>
              </Grid>
              <Grid sx={{ marginTop: '1rem' }}>
                {!formattedAmounts.INPUT || !formattedAmounts.OUTPUT ? (
                  <>
                    <Button
                      variant="contained"
                      sx={{
                        cursor: 'pointer',
                        flexDirection: 'column',
                        padding: '10px 20px',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: 'rgba(98, 98, 98, 0.7)',
                        fontFamily: 'Poppins',
                        fontSize: '18px',
                        borderRadius: '6px',
                      }}
                    >
                      Enter an amount
                    </Button>
                  </>
                ) : (
                  <>
                    {Number(formattedAmounts.INPUT) > fromTokenBal ? (
                      <Button
                        variant="contained"
                        sx={{
                          cursor: 'pointer',
                          flexDirection: 'column',
                          padding: '10px 20px',
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          background: 'rgba(98, 98, 98, 0.7)',
                          fontFamily: 'Poppins',
                          fontSize: '18px',
                          borderRadius: '6px',
                        }}
                      >
                        Insufficient token balance
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        sx={{
                          cursor: 'pointer',
                          flexDirection: 'column',
                          padding: '10px 20px',
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          background:
                            'linear-gradient(90deg,#7a1bff -3.88%,#5947ff)',
                          fontFamily: 'Poppins',
                          fontSize: '18px',
                          borderRadius: '6px',
                        }}
                        onClick={handleSwap}
                      >
                        Swap
                      </Button>
                    )}
                  </>
                )}
              </Grid>
              {/* <Grid
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "1rem",
                }}
              >
                <img
                  src={astroIcon}
                  style={{ width: "30px", height: "30px" }}
                />
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontFamily: "Poppins",
                    marginLeft: "1rem",
                  }}
                >
                  {" "}
                  Add ASTRO token to MetaMask
                </Typography>
              </Grid> */}
            </SubCard>
          </Grid>
          <Grid container item xs={12} sm={12} sx={{ padding: '0px 12px' }}>
            {flagExchange ? (
              <SubCard>
                <Grid
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '14px',
                      marginBottom: '5px',
                      color: '#bcc3cf',
                    }}
                  >
                    Minimum received
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontFamily: 'Poppins',
                      color: '#bcc3cf',
                    }}
                  >
                    0 ASTRO
                  </Typography>
                </Grid>
                <Grid
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '14px',
                      marginBottom: '5px',
                      color: '#bcc3cf',
                    }}
                  >
                    Price Impact
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      color: '#4ed047',
                      fontFamily: 'Poppins',
                    }}
                  >
                    {'< 0.01%'}
                  </Typography>
                </Grid>
                <Grid
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '14px',
                      marginBottom: '5px',
                    }}
                  >
                    Liquidity Provider Fee
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontFamily: 'Poppins',
                    }}
                  >
                    0 AVAX
                  </Typography>
                </Grid>
              </SubCard>
            ) : (
              <SubCard>
                <Grid
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '14px',
                      marginBottom: '5px',
                      color: '#bcc3cf',
                    }}
                  >
                    Maximum sold
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontFamily: 'Poppins',
                      color: '#bcc3cf',
                    }}
                  >
                    0 ASTRO
                  </Typography>
                </Grid>
                <Grid
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '14px',
                      marginBottom: '5px',
                      color: '#bcc3cf',
                    }}
                  >
                    Price Impact
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      color: '#4ed047',
                      fontFamily: 'Poppins',
                    }}
                  >
                    {'< 0.01%'}
                  </Typography>
                </Grid>
                <Grid
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '14px',
                      marginBottom: '5px',
                    }}
                  >
                    Liquidity Provider Fee
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontFamily: 'Poppins',
                    }}
                  >
                    0 ASTRO
                  </Typography>
                </Grid>
              </SubCard>
            )}
          </Grid>
        </Grid>
      </Grid>
      <SlipModal
        isOpen={isOpen}
        setModal={setModal}
        setSlippage={setSlippage}
        slippage={slippage}
      />
    </MainCard>
  );
};

export default SwapForAstro;
