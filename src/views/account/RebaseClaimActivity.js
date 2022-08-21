import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Grid,
  Typography,
  Button,
  useMediaQuery,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import { IconPlus, IconMinus } from '@tabler/icons';
import useAstroMoralis from 'hooks/useAstroMoralis';
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import useAstroRef from 'hooks/useAstroRef';
import { useAstroTokenContract } from 'hooks/useContract';
import { astroTokenAddress } from '../../_common/address';
import useHarvest from 'hooks/useHarvest';
import astroIcon from 'assets/images/astro/astro-icon.png';
import useDataService from 'hooks/useDataService';
import { formatFloatFixed, numberWithCommas } from 'utils/helpers';
import { useIsClaimable, useNeedsInitialDelayKickoff, useUpdateAllottedSellTimer, useClaim } from 'hooks/claims';

export default function RebaseClaimActivity() {
  const [mins, setMins] = React.useState(0);
  const [claimpro, setClaimpro] = React.useState(1);
  const [rewardYield, setRewardYield] = useState(0);
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  let navigate = useNavigate();
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
  const claimAstro = parseFloat(userBal * claimpro) / 100;

  const [needsKickoff, setNeedsKickoff] = useState(false);
  const [isClaimable, setIsClaimable] = useState(false);

  const checkNeedsKickoff = useNeedsInitialDelayKickoff();
  const checkIsClaimable = useIsClaimable();
  const onUpdateAllottedSellTimer = useUpdateAllottedSellTimer();
  const onClaim = useClaim();

  const onButtonClick = useCallback(async () => {
    if (needsKickoff) {
      await onUpdateAllottedSellTimer();
      return
    }
    if (isClaimable) {
      await onClaim();
    }
  });

  const gotoSwap = () => {
    navigate('/swap');
  };
  const [expanded, setExpanded] = React.useState('accordian');

  const [{ loading, astroPrice, holdersCount, totalSupply }] = useDataService();

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const currentTime = new Date().getTime() / 1000;
  useEffect(() => {
    const timer = setTimeout(() => {
      if (rebase) {
        const minutes = rebase - currentTime;
        setMins(minutes);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [currentTime]);

  useEffect(() => {
    setRewardYield(
      rewardYieldDenominatorVal
        ? parseFloat(rewardYieldVal / rewardYieldDenominatorVal)
        : 0,
    );
  }, []);

  useEffect(() => {
    checkNeedsKickoff().then(x => {
      console.log("checkNeedsKickoff", x);
      setNeedsKickoff(x)
    });
    checkIsClaimable().then(x => setIsClaimable(x))
  }, [checkNeedsKickoff, checkIsClaimable])

  useEffect(() => {
    console.log({ isClaimable, needsKickoff })
  }, [isClaimable, needsKickoff])

  return (
    <MainCard
      title="REBASE & CLAIM ACTIVITY"
      style={{ height: 'calc(100% - 50px)' }}
    >
      <Grid
        item
        container
        xs={12}
        md={12}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          rowGap: '15px',
        }}
      >
        {/* <Grid item xs={12} sm={5} sx={{ padding: "0px 12px" }}>
          <Grid
            sx={{
              height: "100%",
              justifyContent: "center",
            }}
          >
            <SubCard>
              <Grid
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-around",
                }}
              >
                <Grid
                  sx={{
                    padding: "0px 12px",
                    display: "flex",
                    flexDirection: "column",
                    textAlign: "center",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Grid sx={{ width: "100%", textAlign: "center" }}>
                    <CircularProgress
                      variant="determinate"
                      sx={{
                        color: "#feb74c",
                        width: "100% !important",
                        height: "100% !important",
                        maxWidth: "200px",
                      }}
                      value={100}
                      thickness={4.5}
                    />
                  </Grid>
                  <Grid
                    sx={{
                      position: "absolute",
                      zIndex: "1",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "16px",
                        marginBottom: "5px",
                        textAlign: "center",
                        fontFamily: "Century Gothic, sans-serif",
                      }}
                    >
                      TIME UNTIL<br></br>NEXT REBASE
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Century Gothic, sans-serif",
                        fontSize: "24px",
                        marginBottom: "5px",
                        fontWeight: "bold",
                        color: "white",
                      }}
                    >
                      {mins ? Number(mins / 60).toFixed(2) : "00.00"}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid
                  sx={{
                    padding: "10px 12px",
                    display: "flex",
                    flexDirection: "column",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "14px",
                    }}
                  >
                    NEXT REBASE AMOUNT
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    ${(rewardYield * 100 * claimAstro * astroPrice).toFixed(1)}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "12px",
                    }}
                  >
                    {(rewardYield * 100 * claimAstro).toFixed(1)} ASTRO
                  </Typography>
                </Grid>
                <Grid
                  sx={{
                    padding: "0px 12px",
                    display: "flex",
                    flexDirection: "column",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "14px",
                      marginBottom: "5px",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    ASTRO is auto-compounding
                  </Typography>
                </Grid>
              </Grid>
            </SubCard>
          </Grid>
        </Grid> */}
        <Grid item xs={12} sm={12} sx={{ padding: '0px 12px' }}>
          <Typography
            sx={{
              fontSize: '18px',
              fontWeight: '700',
              marginTop: '0.5rem',
              marginBottom: '0.25rem',
            }}
          >
            Your Daily Claim Quote:
          </Typography>
          <Typography
            sx={{
              fontSize: '14px',
            }}
          >
            If you choose to take your weekly claim, click below for 1% to
            maximize your growth. If you'd like to take more earnings,{' '}
            <span
              onClick={gotoSwap}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              swap here.
            </span>
          </Typography>
          <Grid
            sx={{
              margin: '1rem 0px',
              width: '100%',
              borderRadius: '10px',
              boxSizing: 'border-box',
              display: 'flex',
              justifyContent: 'space-between',
              backgroundColor: '#151b34',
              border: '1px solid #5947ff',
              padding: '10px 15px',
            }}
          >
            <Grid
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <img src={astroIcon} style={{ width: '30px', height: '30px' }} />
              <Typography
                sx={{
                  margin: '1px',
                  fontSize: '16px',
                  fontWeight: '400',
                }}
              >
                CLAIM ASTRO
              </Typography>
            </Grid>
            <Typography
              sx={{
                margin: '1px',
                fontSize: '28px',
                fontWeight: 'bold',
                color: 'rgb(255, 184, 77)',
              }}
            >
              {claimAstro ? claimAstro.toFixed(2) : '0.00'}
            </Typography>
          </Grid>
          <Grid
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography
              sx={{
                fontSize: '15px',
                fontFamily: 'Poppins',
                fontWeight: '400',
                color: 'bcc3cf',
              }}
            >
              Your Earnings/Daily:{' '}
              <span style={{ color: 'white' }}>
                {dprVal ? (
                  formatFloatFixed(dprVal, 2) + '%'
                ) : (
                  <Skeleton variant="rectangular" width={'100%'} height={24} />
                )}
              </span>
            </Typography>
            <Typography
              sx={{
                fontSize: '15px',
                fontFamily: 'Poppins',
                color: '#fff',
              }}
            >
              {((dprVal * userBal) / 100).toFixed(2)} ($
              {(dprVal * userBal * astroPrice).toFixed(2)})
            </Typography>
          </Grid>
          <Grid
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography
              sx={{
                fontSize: '15px',
                fontFamily: 'Poppins',
                fontWeight: '400',
                color: 'bcc3cf',
              }}
            >
              Recommended Claim:{' '}
              <span style={{ color: 'white' }}>{claimpro}%</span>
            </Typography>
            <Typography
              sx={{
                fontSize: '15px',
                fontFamily: 'Poppins',
                color: '#fff',
              }}
            >
              {claimAstro.toFixed(2)} (${(claimAstro * astroPrice).toFixed(2)})
            </Typography>
          </Grid>
          <Grid
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography
              sx={{
                fontSize: '15px',
                fontFamily: 'Poppins',
                fontWeight: '400',
                color: 'bcc3cf',
              }}
            >
              Claim Tax: <span style={{ color: 'white' }}>0%</span>
            </Typography>
            <Typography
              sx={{
                fontSize: '15px',
                fontFamily: 'Poppins',
                color: '#fff',
              }}
            >
              0 ($0)
            </Typography>
          </Grid>
          <hr
            style={{
              height: '1px',
              background: '#ddd',
              margin: '0.5rem 0px',
            }}
          />
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
                  fontSize: '15px',
                  fontFamily: 'Poppins',
                  fontWeight: '400',
                }}
              >
                Estimated Amount
              </Typography>
              <Typography
                sx={{
                  fontSize: '15px',
                  fontFamily: 'Poppins',
                  fontWeight: '400',
                }}
              >
                You'll Receive in $USDC
              </Typography>
            </Grid>
            <Typography
              sx={{
                fontSize: '26px',
                fontFamily: 'Poppins',
                fontWeight: '400',
                color: '#4ed047',
              }}
            >
              ${parseFloat(claimAstro * astroPrice).toFixed(2)}
            </Typography>
          </Grid>
          <Button
            variant="contained"
            sx={{
              cursor: 'pointer',
              flexDirection: 'column',
              padding: '14px 20px',
              width: '100%',
              marginTop: '10px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'linear-gradient(90deg,#7a1bff -3.88%,#5947ff)',
              fontFamily: 'Poppins',
              fontSize: '16px',
              borderRadius: '6px',
              '&:hover': {
                boxShadow: '1px 1px 10px 0 #fa34b2',
                transition: 'all .3s ease',
              },
            }}
            onClick={onButtonClick}
            {...(!needsKickoff && !isClaimable ? { disabled: true } : {})}
          >
            {
              needsKickoff ? "Kickoff Initial Delay" : isClaimable ? "Weekly Claim (1% = $0.00)" : "Cannot claim yet, wait a week"
            }
          </Button>
        </Grid>
        <div style={{ width: '100%', margin: '10px' }}>
          <Grid
            item
            xs={12}
            sm={12}
            sx={{
              margin: '0px 1rem',
              background: 'rgb(21, 27, 52)',
              border: '1px solid rgb(89, 71, 255)',
              borderRadius: '0.25rem',
              overflow: 'hidden',
            }}
          >
            <MuiAccordion
              disableGutters
              elevation={0}
              square
              expanded={expanded === 'accordian'}
              onChange={handleChange('accordian')}
            >
              <MuiAccordionSummary
                expandIcon={
                  expanded === 'accordian' ? (
                    <IconMinus size="24px" color="#FFF" />
                  ) : (
                    <IconPlus size="24px" color="#FFF" />
                  )
                }
                aria-controls="accordiand-content"
                id="accordiand-header"
              >
                <Typography
                  sx={{
                    // fontFamily: 'Poppins',
                    fontSize: '16px',
                    fontWeight: '500',
                  }}
                >
                  Buy / Transfer Tax
                </Typography>
              </MuiAccordionSummary>
              <MuiAccordionDetails
                sx={{ borderTop: '1px solid rgb(89, 71, 255)' }}
              >
                <Grid container sx={{ width: '100%' }}>
                  <Grid item container xs={12} sm={12}>
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      sx={{ paddingRight: !matchDownSM ? '16px' : '0px' }}
                    >
                      <Typography
                        sx={{
                          fontFamily: 'Poppins',
                          fontSize: '14px',
                          fontWeight: '700',
                          margin: '1px',
                          color: 'white',
                        }}
                      >
                        Regular Tax:
                      </Typography>
                      <Grid
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: 'Poppins',
                            fontSize: '12px',
                            color: 'white',
                          }}
                        >
                          Buy / Transfer Tax
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: 'Poppins',
                            fontSize: '12px',
                            color: '#fff',
                          }}
                        >
                          {buyTax ? buyTax : '0'}%
                        </Typography>
                      </Grid>
                      <Grid
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: 'Poppins',
                            fontSize: '12px',
                            color: 'rgb(188, 195, 207)',
                          }}
                        >
                          Sell Tax
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: 'Poppins',
                            fontSize: '12px',
                            color: '#fff',
                          }}
                        >
                          {sellTax ? sellTax : '0'}%
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      sx={{
                        borderLeft: !matchDownSM
                          ? '2px solid rgb(70, 77, 98)'
                          : '0px solid transparent',
                        paddingLeft: !matchDownSM ? '16px' : '0px',
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: 'Poppins',
                          fontSize: '14px',
                          fontWeight: '700',
                          margin: '1px',
                          color: 'white',
                        }}
                      >
                        Whale Tax (volumn sell tax):
                      </Typography>
                      <Grid
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: 'Poppins',
                            fontSize: '12px',
                            color: 'rgb(188, 195, 207)',
                          }}
                        >
                          {'USD > $25,001'}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: 'Poppins',
                            fontSize: '12px',
                            color: '#fff',
                          }}
                        >
                          {invadorTax ? invadorTax : '0'}%
                        </Typography>
                      </Grid>
                      <Grid
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: 'Poppins',
                            fontSize: '12px',
                            color: 'rgb(188, 195, 207)',
                          }}
                        >
                          USD $10,001 - $25,000
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: 'Poppins',
                            fontSize: '12px',
                            color: '#fff',
                          }}
                        >
                          {whaleTax ? whaleTax : '0'}%
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </MuiAccordionDetails>
            </MuiAccordion>
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            sx={{
              padding: '20px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <Grid
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography
                sx={{
                  fontSize: '16px',
                  fontFamily: 'Poppins',
                  fontWeight: '400',
                }}
              >
                Current ASTRO Price
              </Typography>
              <Typography
                sx={{
                  fontSize: '16px',
                  fontFamily: 'Poppins',
                }}
              >
                $ {astroPrice ? Number(astroPrice).toFixed(2) : '0'}
              </Typography>
            </Grid>
            <Grid
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography
                sx={{
                  fontSize: '16px',
                  fontFamily: 'Poppins',
                  fontWeight: '400',
                }}
              >
                Next Reward Amount
              </Typography>
              <Typography
                sx={{
                  fontSize: '16px',
                  fontFamily: 'Poppins',
                  color: '#ffb84d',
                }}
              >
                {parseFloat(rewardYield * 100 * claimAstro).toFixed(1)} ASTRO
              </Typography>
            </Grid>
            <Grid
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography
                sx={{
                  fontSize: '16px',
                  fontFamily: 'Poppins',
                  fontWeight: '400',
                }}
              >
                Next Reward Amount USDC
              </Typography>
              <Typography
                sx={{
                  fontSize: '16px',
                  fontFamily: 'Poppins',
                }}
              >
                ${' '}
                {parseFloat(
                  rewardYield * 100 * claimAstro * astroPrice,
                ).toFixed(0)}{' '}
                USD
              </Typography>
            </Grid>
            <Grid
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography
                sx={{
                  fontSize: '16px',
                  fontFamily: 'Poppins',
                  fontWeight: '400',
                }}
              >
                Next Reward Yield
              </Typography>
              <Typography
                sx={{
                  fontSize: '16px',
                  fontFamily: 'Poppins',
                }}
              >
                {parseFloat(rewardYield * 100).toFixed(5)} %
              </Typography>
            </Grid>
            <Grid
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography
                sx={{
                  fontSize: '16px',
                  fontFamily: 'Poppins',
                  fontWeight: '400',
                }}
              >
                ROI (30-Day Rate)
              </Typography>
              <Typography
                sx={{
                  fontSize: '16px',
                  fontFamily: 'Poppins',
                }}
              >
                {apyMonVal ? (
                  formatFloatFixed(apyMonVal, 2) + ' %'
                ) : (
                  <Skeleton variant="rectangular" width={'100%'} height={24} />
                )}
              </Typography>
            </Grid>
            <Grid
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography
                sx={{
                  fontSize: '16px',
                  fontFamily: 'Poppins',
                  fontWeight: '400',
                }}
              >
                ROI (30-Day Rate) USD
              </Typography>
              <Typography
                sx={{
                  fontSize: '16px',
                  fontFamily: 'Poppins',
                }}
              >
                $ {((apyMonVal / 100) * claimAstro * astroPrice).toFixed(0)} USD
              </Typography>
            </Grid>
          </Grid>
        </div>
      </Grid>
    </MainCard>
  );
}
