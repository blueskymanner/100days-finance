import React, { useEffect, useState } from 'react';
import { de } from 'date-fns/locale';
import axios from 'axios';
import Moralis from 'moralis';
import { createChart, LineStyle, PriceScaleMode } from 'lightweight-charts';
import { astroTokenAddress } from '_common/address';

const ASTRO_PRICE_URL = `https://api.traderjoexyz.com/priceusd/${astroTokenAddress}`;

const Graph = () => {
  const chartRef = React.useRef(null);
  let astroPrice = 0;

  // useEffect(() => {
  //     let timer = setInterval(() => {
  //         getAstroPrice();
  //     }, 1000)

  //     //Clean up can be done like this
  //     return () => {
  //         clearInterval(timer);
  //     }
  // }, []);

  React.useEffect(() => {
    if (chartRef.current) {
      const chart = createChart(chartRef.current, {
        width: 720,
        height: 310,
        timeScale: {
          borderColor: '#fff',
        },
        layout: {
          backgroundColor: '#fff0',
        },
        grid: {
          vertLines: {
            color: '#fff0',
            style: LineStyle.Dotted,
          },
          horzLines: {
            color: '#fff0',
            style: LineStyle.Dotted,
          },
        },
      });

      prepareChart(chart, astroPrice);
    }
  }, []);

  function prepareChart(chart, astroPrice) {
    var candleSeries = chart.addAreaSeries({
      topColor: 'rgba(254, 183, 77, 0.7)',
      bottomColor: 'rgba(254, 183, 77, 0.13)',
      lineColor: '#feb74d',
    });

    var data = [];

    candleSeries.setData(data);

    let dayVar = 86400000;

    setInterval(async function() {
      const getAstroPrice = async () => {
        let price;
        try {
          const { data: response } = await axios.get(ASTRO_PRICE_URL);
          price = await Moralis.Units.FromWei(response, 18);
        } catch (error) {
          console.error(error);
        }
        return price;
      };
      const date = new Date(new Date('2019-05-28').getTime() + dayVar);
      const year = date.getFullYear(); // 2019
      const day = date.getDate();
      const month = date.getMonth();
      astroPrice = await getAstroPrice();
      candleSeries.update({
        time: `${year}-${month < 10 ? 0 : ''}${month + 1}-${day}`,
        value: astroPrice,
      });
      dayVar += 86400000;
    }, 2000);
  }
  return <div ref={chartRef} />;
};

export default Graph;
