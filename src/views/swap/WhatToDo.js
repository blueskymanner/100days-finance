import React, { useState, useCallback } from "react";

import { Grid, Typography, Button, TextField, Slider } from "@mui/material";
import useAstroMoralis from "hooks/useAstroMoralis";
import MainCard from "ui-component/cards/MainCard";
import SubCard from "ui-component/cards/SubCard";
import useAstroRef from "hooks/useAstroRef";
import useDataService from "hooks/useDataService";
import useTokenBalance from "hooks/useTokenBalance";
import { useAutoApy } from "hooks/useAutoApy";
import {
  astroTokenAddress,
  avaxTokenAddress,
  usdcTokenAddress,
} from "_common/address";
import { AssistantRounded } from "@mui/icons-material";

export default function WhatToDo() {
  const [dayCounter, setDayCounter] = useState(30);
  const [astroAmount, setAstroAmount] = useState("");
  const [apy, setApy] = useState("");
  const [currentPrice, setCrrentPrice] = useState("");
  const [futurePrice, setFuturePrice] = useState("");
  const [{ astroAPY, astroROI, userBalance }] = useAstroMoralis();
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
    },
  ] = useAstroRef();

  const astroBal = useTokenBalance(astroTokenAddress);
  const autoapy = useAutoApy(dayCounter);

  const handleAmount = useCallback(
    (e) => {
      const RE = /^\d*\.?\d{0,18}$/;
      if (RE.test(e.currentTarget.value)) {
        setAstroAmount(
          e.currentTarget.value > 150000 ? 150000.0 : e.currentTarget.value
        );
      }
    },
    [setAstroAmount]
  );

  const handleApy = useCallback(
    (e) => {
      const RE = /^\d*\.?\d{0,18}$/;
      if (RE.test(e.currentTarget.value)) {
        setApy(
          e.currentTarget.value >= apyVal ? apyVal : e.currentTarget.value
        );
      }
    },
    [setApy]
  );

  const handlePrice = useCallback(
    (e) => {
      const RE = /^\d*\.?\d{0,18}$/;
      if (RE.test(e.currentTarget.value)) {
        setCrrentPrice(
          e.currentTarget.value >= 1000000 ? 1000000 : e.currentTarget.value
        );
      }
    },
    [setCrrentPrice]
  );

  const handleFuturePrice = useCallback(
    (e) => {
      const RE = /^\d*\.?\d{0,18}$/;
      if (RE.test(e.currentTarget.value)) {
        setFuturePrice(
          e.currentTarget.value >= 1000000 ? 1000000 : e.currentTarget.value
        );
      }
    },
    [setFuturePrice]
  );

  const maxValue = () => {
    setAstroAmount(Number(userBal).toFixed(2));
  };

  const currentApyValue = () => {
    setApy(apyVal);
  };

  const currentPriceValue = () => {
    setCrrentPrice(parseFloat(astroPrice).toFixed(4));
  };

  const futurePriceValue = () => {
    setFuturePrice(parseFloat(astroPrice).toFixed(4));
  };

  return (
    <MainCard title="WHAT TO DO" style={{ height: "calc(100% - 50px)" }}>
      <Grid container sx={{ rowGap: "15px" }}>
        <Grid
          item
          container
          xs={12}
          md={12}
          sx={{
            display: "flex",
            flexWrap: "wrap",
            rowGap: "15px",
          }}
        >
          <Grid item xs={12} sm={12} sx={{ padding: "0px 12px" }}>
            <SubCard>
              <Typography
                sx={{
                  fontSize: "14px",
                  lineHeight: "35px",
                  fontWeight: "600",
                }}
              >
                Steps to Financial Freedom with ASTRO
              </Typography>
              <Grid sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  sx={{
                    fontFamily: "Century Gothic, sans-serif",
                    fontWeight: "bold",
                    fontSize: "16px",
                    lineHeight: "35px",
                    marginRight: "6px",
                    whiteSpace: "nowrap",
                    fontWeight: "700",
                    color: "white",
                  }}
                >
                  Step 1:
                </Typography>
                <Typography
                  sx={{
                    fontSize: "14px",
                  }}
                >
                  Buy ASTRO
                </Typography>
              </Grid>
              <Grid sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  sx={{
                    fontFamily: "Century Gothic, sans-serif",
                    fontWeight: "bold",
                    fontSize: "16px",
                    lineHeight: "35px",
                    marginRight: "6px",
                    whiteSpace: "nowrap",
                    fontWeight: "700",
                    color: "white",
                  }}
                >
                  Step 2:
                </Typography>
                <Typography
                  sx={{
                    fontSize: "14px",
                  }}
                >
                  Simply hold your ASTRO for 100 Days and watch it auto-compound
                </Typography>
              </Grid>
              <Grid sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  sx={{
                    fontFamily: "Century Gothic, sans-serif",
                    fontWeight: "bold",
                    fontSize: "16px",
                    lineHeight: "35px",
                    marginRight: "6px",
                    whiteSpace: "nowrap",
                    fontWeight: "700",
                    color: "white",
                  }}
                >
                  Step 3:
                </Typography>
                <Typography
                  sx={{
                    fontSize: "14px",
                  }}
                >
                  After 100 days, begin claiming 1% of your ASTRO each day
                </Typography>
              </Grid>
            </SubCard>
          </Grid>
          <Grid item xs={12} sm={12} sx={{ padding: "0px 12px" }}>
            <Typography
              sx={{
                fontSize: "18px",
                fontFamily: "Century Gothic, sans-serif",
                fontWeight: "700",
                marginTop: "0.5rem",
                marginBottom: "0.25rem",
              }}
            >
              CALCULATOR
            </Typography>
            <Typography
              sx={{
                fontSize: "14px",
                color: "#bcc3cf",
              }}
            >
              Estimate your returns based on today's performance
            </Typography>
          </Grid>
          <Grid
            item
            container
            xs={12}
            sm={12}
            sx={{
              display: "flex",
              flexWrap: "wrap",
              rowGap: "15px",
            }}
          >
            <Grid item xs={12} sm={6} sx={{ padding: "0px 12px" }}>
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: "400",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                Astro Amount
              </Typography>
              <TextField
                value={astroAmount}
                placeholder="0"
                onChange={handleAmount}
                style={{ width: "100%" }}
                InputProps={{
                  endAdornment: (
                    <Button
                      sx={{
                        cursor: "pointer",
                        color: "#fff",
                        fontSize: "16px",
                        "&:hover": {
                          backgroundColor: "#151b34",
                          color: "gray",
                        },
                      }}
                      onClick={maxValue}
                    >
                      MAX
                    </Button>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ padding: "0px 12px" }}>
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: "400",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                APY (%)
              </Typography>
              <TextField
                value={apy}
                placeholder="0"
                style={{ width: "100%" }}
                onChange={handleApy}
                InputProps={{
                  endAdornment: (
                    <Button
                      sx={{
                        cursor: "pointer",
                        color: "#fff",
                        fontSize: "16px",
                        "&:hover": {
                          backgroundColor: "transparent",
                          color: "gray",
                        },
                      }}
                      onClick={currentApyValue}
                    >
                      Current
                    </Button>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ padding: "0px 12px" }}>
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: "400",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                ASTRO Price at purchase ($)
              </Typography>
              <TextField
                value={currentPrice}
                placeholder="0"
                style={{ width: "100%" }}
                onChange={handlePrice}
                InputProps={{
                  endAdornment: (
                    <Button
                      sx={{
                        cursor: "pointer",
                        color: "#fff",
                        fontSize: "16px",
                        "&:hover": {
                          backgroundColor: "transparent",
                          color: "gray",
                        },
                      }}
                      onClick={currentPriceValue}
                    >
                      Current
                    </Button>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ padding: "0px 12px" }}>
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: "400",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                Future ASTRO Price ($)
              </Typography>
              <TextField
                value={futurePrice}
                placeholder="0"
                style={{ width: "100%" }}
                onChange={handleFuturePrice}
                InputProps={{
                  endAdornment: (
                    <Button
                      sx={{
                        cursor: "pointer",
                        color: "#fff",
                        fontSize: "16px",
                        "&:hover": {
                          backgroundColor: "transparent",
                          color: "gray",
                        },
                      }}
                      onClick={futurePriceValue}
                    >
                      Current
                    </Button>
                  ),
                }}
              />
            </Grid>
          </Grid>
          <div style={{ margin: "20px 10px", width: "100%" }}>
            <Grid item xs={12} sm={12} sx={{ padding: "10px 12px" }}>
              <Typography
                sx={{
                  fontSize: "14px",
                }}
              >
                {dayCounter} days
              </Typography>
              <Slider
                aria-label="Temperature"
                min={1}
                max={365}
                step={1}
                value={dayCounter}
                onChange={(e, val) => {
                  setDayCounter(val);
                }}
                sx={{
                  "& .MuiSlider-thumb": {
                    background: "#1976d1",
                    border: "3px solid #7a1bff",
                    height: "28px",
                    width: "28px",
                  },
                  height: "12px",
                  "& .MuiSlider-track": {
                    border: "1px solid #1976d1",
                    background: "linear-gradient(180deg,#7929ff,#5c44ff)",
                  },
                  "& .MuiSlider-rail": {
                    border: "2px solid #5c44ff",
                    background: "#113c70",
                  },
                }}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={12}
              sx={{
                padding: "0px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <Grid
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: "400",
                  }}
                >
                  Your initial investment
                </Typography>
                <Typography
                  sx={{
                    fontSize: "16px",
                  }}
                >
                  $
                  {parseFloat(
                    (astroAmount * currentPrice).toPrecision()
                  ).toFixed(4)}
                </Typography>
              </Grid>
              <Grid
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: "400",
                  }}
                >
                  Current wealth
                </Typography>
                <Typography
                  sx={{
                    fontSize: "16px",
                  }}
                >
                  ${parseFloat(astroAmount * astroPrice).toFixed(4)}
                </Typography>
              </Grid>
              <Grid
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: "400",
                  }}
                >
                  ASTRO rewards estimation
                </Typography>
                <Typography
                  sx={{
                    fontSize: "16px",
                  }}
                >
                  {parseFloat(astroAmount * autoapy).toFixed(4)} ASTRO
                </Typography>
              </Grid>
              <Grid
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: "400",
                  }}
                >
                  Potential return
                </Typography>
                <Typography
                  sx={{
                    fontSize: "16px",
                  }}
                >
                  ${parseFloat(astroAmount * futurePrice * autoapy).toFixed(4)}
                </Typography>
              </Grid>
              {/* <Grid
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: "400",
                  }}
                >
                  Potential number of ASTRO Journeys
                </Typography>
                <Typography
                  sx={{
                    fontSize: "16px",
                  }}
                >
                  0
                </Typography>
              </Grid> */}
            </Grid>
          </div>
        </Grid>
      </Grid>
    </MainCard>
  );
}
