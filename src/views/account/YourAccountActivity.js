import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { Grid, Typography, Button, Skeleton } from '@mui/material';
import { formatFloatFixed, numberWithCommas } from 'utils/helpers';
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import ChartView from 'ui-component/cards/ChartView';
import useAstroMoralis from 'hooks/useAstroMoralis';
import useAstroRef from 'hooks/useAstroRef';
import useDataService from 'hooks/useDataService';

export default function YourAccountActivity() {
  const [{ astroAPY, astroROI, userBalance }] = useAstroMoralis();
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
    },
  ] = useAstroRef();

  const [{ loading, astroPrice, holdersCount, totalSupply }] = useDataService();

  return (
    <MainCard
      title="YOUR ACCOUNT ACTIVITY"
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
        <Grid item xs={12} sm={6} sx={{ padding: '0px 12px' }}>
          <SubCard>
            <Typography
              sx={{
                fontSize: '14px',
                lineHeight: '35px',
              }}
            >
              Your Earnings / Daily
            </Typography>
            <Typography
              sx={{
                fontFamily: 'Century Gothic, sans-serif',
                fontWeight: 'bold',
                color: '#4ed047',
                fontSize: '40px',
                lineHeight: '35px',
                overflow: 'hidden',
                textAlign: 'left',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              ${((dprVal * userBal * astroPrice) / 100).toFixed(2)}
            </Typography>
            <Typography
              sx={{
                fontFamily: 'Poppins',
                fontSize: '16px',
                margin: 0,
                textAlign: 'left',
                lineHeight: '35px',
              }}
            >
              {((dprVal * userBal) / 100).toFixed(2)} ASTRO
            </Typography>
          </SubCard>
        </Grid>
        <Grid item xs={12} sm={6} sx={{ padding: '0px 12px' }}>
          <SubCard>
            <Typography
              sx={{
                fontSize: '14px',
                lineHeight: '35px',
              }}
            >
              APY
            </Typography>
            {apyVal ? (
              <Typography
                sx={{
                  fontFamily: 'Century Gothic, sans-serif',
                  fontSize: '32px',
                  lineHeight: '35px',
                  overflow: 'hidden',
                  textAlign: 'left',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: 'white',
                  marginBottom: '5px',
                }}
              >
                {formatFloatFixed(apyVal, 2)}%
              </Typography>
            ) : (
              <Skeleton variant="rectangular" width={'100%'} height={35} />
            )}
            <Typography
              sx={{
                color: 'hsla(0,0%,100%,.8)',
                fontFamily: 'Poppins',
                fontSize: '16px',
                margin: 0,
                textAlign: 'left',
              }}
            >
              Daily % Rate (DPR): ~
              {dprVal ? (
                formatFloatFixed(dprVal, 2) + '%'
              ) : (
                <Skeleton variant="rectangular" width={'100%'} height={24} />
              )}
            </Typography>
          </SubCard>
        </Grid>
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
                  fontSize: '14px',
                  lineHeight: '35px',
                }}
              >
                Total Earned
              </Typography>
              <Typography
                sx={{
                  alignSelf: 'center',
                  backgroundColor: 'rgba(0,0,0,.1)',
                  border: '1px solid #595959',
                  borderRadius: '15px',
                  padding: '1px 10px',
                  color: '#4da349',
                  fontSize: '15px',
                  textAlign: 'center',
                }}
              >
                +0%
              </Typography>
            </Grid>
            <Typography
              sx={{
                color: '#4ed047',
                fontFamily: 'Century Gothic, sans-serif',
                fontSize: '32px',
                lineHeight: '35px',
                overflow: 'hidden',
                textAlign: 'left',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              $0
            </Typography>
            <Typography
              sx={{
                fontFamily: 'Poppins',
                fontSize: '16px',
                margin: 0,
                textAlign: 'left',
                lineHeight: '35px',
              }}
            >
              0 ASTRO
            </Typography>
          </SubCard>
        </Grid>
        <Grid item xs={12} sm={6} sx={{ padding: '0px 12px' }}>
          <SubCard>
            <Typography
              sx={{
                fontSize: '14px',
                lineHeight: '35px',
              }}
            >
              Your Balance
            </Typography>
            <Typography
              sx={{
                color: '#4ed047',
                fontFamily: 'Century Gothic, sans-serif',
                fontSize: '32px',
                lineHeight: '35px',
                overflow: 'hidden',
                textAlign: 'left',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              ${(userBal * astroPrice).toFixed(3)}
            </Typography>
            <Typography
              sx={{
                fontFamily: 'Poppins',
                fontSize: '16px',
                margin: 0,
                textAlign: 'left',
                lineHeight: '35px',
              }}
            >
              {userBal ? Number(userBal).toFixed(0) : '0'} ASTRO
            </Typography>
          </SubCard>
        </Grid>
      </Grid>

      {/* <Grid item container xs={12} md={12}>
                <Grid sx={{
                    padding: '15px 12px',
                    height: '380px',
                    width: '100%',
                    justifyContent: 'center'
                }}>
                    <ChartView astroPrice={astroPrice}/>
                </Grid>
            </Grid> */}
      <Grid
        item
        container
        xs={12}
        md={12}
        sx={{ justifyContent: 'center', margin: '20px 0' }}
      >
        {/* <Button
          variant="contained"
          sx={{
            cursor: "pointer",
            flexDirection: "column",
            padding: "14px 70px",
            display: "flex",
            justifyContent: "center",
            alignItems: "right",
            textAlign: "right",
            background: "transparent",
            border: "1.5px solid #7a1bff",
            fontFamily: "Poppins",
            fontSize: "16px",
            borderRadius: "6px",
            margin: "0 10px",
            "&:hover": {
              background: "transparent",
              boxShadow: "1px 1px 10px 0 #fa34b2",
              transition: "all .3s ease",
            },
          }}
        >
          DEX Charts
        </Button> */}
        <Button
          variant="contained"
          sx={{
            margin: '0 10px',
            cursor: 'pointer',
            flexDirection: 'column',
            padding: '14px 70px',
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
          onClick={() => navigate('/swap')}
        >
          Buy ASTRO
        </Button>
      </Grid>
    </MainCard>
  );
}
