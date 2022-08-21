import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Grid,
  Typography,
  Button,
  Skeleton,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';

import { formatFloatFixed, numberWithCommas } from 'utils/helpers';
import useAstroMoralis from 'hooks/useAstroMoralis';
import useAstroRef from 'hooks/useAstroRef';
import useDataService from 'hooks/useDataService';

import { useAstroTokenContract } from '../../hooks/useContract';
// import moment from 'moment';

export default function CommunityPerformance() {
  const [{ astroAPY, astroROI, userBalance }] = useAstroMoralis();
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
  const [mins, setMins] = React.useState('00:00');
  const [mins_min_sec, setMinutesSecond] = React.useState(0);
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const [rewardYield, setRewardYield] = useState(0);
  const [claimpro, setClaimpro] = React.useState(1);
  const claimAstro = (userBal * claimpro) / 100;

  const [{ loading, astroPrice, holdersCount, totalSupply }] = useDataService();

  let navigate = useNavigate();

  const handleWeeklyClaim = () => {
    navigate('account');
  };

  const currentTime = new Date().getTime() / 1000;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (rebase) {
        if (currentTime > rebase) {
          setMins('00:00');
        } else {
          const distance = Math.floor((rebase - currentTime) / 60);
          const minutes = Math.floor(
            (distance % (1000 * 60 * 60)) / (1000 * 60),
          );
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          const formattedMinutes =
            minutes < 10 ? `0${minutes}` : String(minutes);
          const formattedSeconds =
            seconds < 10 ? `0${seconds}` : String(seconds);

          setMins(`${formattedMinutes}:${formattedSeconds}`);
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentTime, rebase]);

  return (
    <MainCard title="COMMUNITY PERFORMANCE">
      <Grid container sx={{ rowGap: '15px', padding: '0px !important' }}>
        <Grid
          item
          container
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            rowGap: '15px',
          }}
        >
          <Grid item xs={12} sm={6} sx={{ padding: '0px 12px' }}>
            <SubCard>
              <Grid
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '16px',
                    lineHeight: '35px',
                    fontFamily: 'Poppins',
                  }}
                >
                  ASTRO Price
                </Typography>
                <Typography
                  sx={{
                    alignSelf: 'center',
                    backgroundColor: 'rgba(0,0,0,.1)',
                    border: '1px solid #595959',
                    borderRadius: '15px',
                    padding: '1px 10px',
                    color: '#a54d52',
                    fontSize: '12px',
                    textAlign: 'center',
                  }}
                >
                  -100.00%
                </Typography>
              </Grid>
              {loading ? (
                <Skeleton variant="rectangular" width={'100%'} height={32} />
              ) : (
                <Typography
                  sx={{
                    fontFamily: 'Century Gothic, sans-serif',
                    fontSize: '32px',
                    lineHeight: '35px',
                    overflow: 'hidden',
                    textAlign: 'left',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    margin: '1rem 0px',
                    color: '#4ed047',
                  }}
                >
                  ${astroPrice ? formatFloatFixed(Number(astroPrice)) : '0'}
                </Typography>
              )}
            </SubCard>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ padding: '0px 12px' }}>
            <SubCard>
              <Typography
                sx={{
                  fontSize: '16px',
                  lineHeight: '35px',
                }}
              >
                Market Cap
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'Century Gothic, sans-serif',
                  fontSize: '32px',
                  lineHeight: '35px',
                  overflow: 'hidden',
                  textAlign: 'left',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  margin: '1rem 0px',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                $
                {astroPrice && totalSupply
                  ? `${formatFloatFixed(astroPrice * totalSupply, 3)}`
                  : '0'}
              </Typography>
            </SubCard>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ padding: '0px 12px' }}>
            <SubCard>
              <Typography
                sx={{
                  fontSize: '16px',
                  lineHeight: '35px',
                }}
              >
                APY
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'Century Gothic, sans-serif',
                  fontSize: '32px',
                  lineHeight: '35px',
                  overflow: 'hidden',
                  textAlign: 'left',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: '5px',
                  color: 'white',
                }}
              >
                {apyVal ? `${formatFloatFixed(apyVal)}%` : 0}
              </Typography>

              <Typography
                sx={{
                  color: 'hsla(0,0%,100%,.8)',
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  margin: 0,
                  textAlign: 'left',
                }}
              >
                Daily % Rate (DPR):{' '}
                {dprVal ? (
                  '~' + formatFloatFixed(dprVal, 2) + '%'
                ) : (
                  <Skeleton variant="rectangular" width={'100%'} height={24} />
                )}
              </Typography>
            </SubCard>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ padding: '0px 12px' }}>
            <SubCard>
              <Typography
                sx={{
                  fontSize: '16px',
                  lineHeight: '35px',
                }}
              >
                Total Holders
              </Typography>
              {loading ? (
                <Skeleton variant="rectangular" width={'100%'} height={32} />
              ) : (
                <Typography
                  sx={{
                    fontFamily: 'Century Gothic, sans-serif',
                    fontSize: '32px',
                    lineHeight: '35px',
                    overflow: 'hidden',
                    textAlign: 'left',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    margin: '1rem 0px',
                    color: 'white',
                  }}
                >
                  {holdersCount ? numberWithCommas(holdersCount) : '0'}
                </Typography>
              )}
            </SubCard>
          </Grid>
        </Grid>

        <Grid item xs={12} md={6}>
          <Grid
            sx={{
              padding: '0px 12px',
              height: '100%',
              justifyContent: 'center',
            }}
          >
            <SubCard padding={{ padding: '10px 20px', paddingBottom: '10px' }}>
              <Grid
                item
                container
                xs={12}
                sm={12}
                sx={{
                  height: !matchDownSM ? '100%' : 'auto',
                  padding: !matchDownSM ? '10px 40px' : '10px',
                }}
              >
                <Grid
                  item
                  xs={12}
                  sm={4}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Grid sx={{ width: '100%', textAlign: 'center' }}>
                    <CircularProgress
                      variant="determinate"
                      sx={{
                        color: '#feb74c',
                        width: '100% !important',
                        height: '100% !important',
                        maxWidth: '200px',
                      }}
                      value={100 - ((100 * mins_min_sec) / 3600) * 3600}
                      thickness={4.5}
                    />
                  </Grid>
                  <Grid
                    sx={{
                      position: 'absolute',
                      zIndex: '1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: 'Century Gothic, sans-serif',
                        fontSize: '12px',
                        marginBottom: '5px',
                        textAlign: 'center',
                      }}
                    >
                      TIME UNTIL<br></br>NEXT REBASE
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '24px',
                        fontFamily: 'Century Gothic, sans-serif',
                        fontWeight: 'bold',
                        color: 'white',
                      }}
                    >
                      {mins ? mins : '00:00'}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid
                  item
                  container
                  xs={12}
                  sm={8}
                  sx={{
                    height: '100%',
                    padding: '0px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: 'Century Gothic, sans-serif',
                      textAlign: 'center',
                      fontSize: '16px',
                    }}
                  >
                    NEXT REBASE AMOUNT
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: 'Century Gothic, sans-serif',
                      fontSize: '26px',
                      fontWeight: 'bold',
                      color: 'white',
                    }}
                  >
                    ${(rewardYield * 100 * claimAstro * astroPrice).toFixed(1)}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '12px',
                      color: '#bcc3cf',
                    }}
                  >
                    {(rewardYield * 100 * claimAstro).toFixed(1)} ASTRO
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      cursor: 'pointer',
                      flexDirection: 'column',
                      padding: '14px 20px',
                      width: 'calc(100% - 50px)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      background:
                        'linear-gradient(90deg,#7a1bff -3.88%,#5947ff)',
                      fontFamily: 'Poppins',
                      fontSize: '16px',
                      borderRadius: '6px',
                      '&:hover': {
                        boxShadow: '1px 1px 10px 0 #fa34b2',
                        transition: 'all .3s ease',
                      },
                    }}
                    onClick={handleWeeklyClaim}
                  >
                    Weekly Claim (1%)
                  </Button>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      marginBottom: '5px',
                      textAlign: 'center',
                    }}
                  >
                    If you choose to take your weekly claim, click above for 1%
                    to maximize your growth.
                  </Typography>
                </Grid>
              </Grid>
            </SubCard>
          </Grid>
        </Grid>
      </Grid>
    </MainCard>
  );
}
