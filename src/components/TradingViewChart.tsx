/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  ISeriesApi,
  IChartApi,
  UTCTimestamp,
} from 'lightweight-charts';
import { useBroker } from '../context/BrokerContext';
import { Candle, DataProviderStatus } from '../types/broker';
import { ChartQuickTradeBar } from './ChartQuickTradeBar';
import {
  Radio,
  Wifi,
  BarChart2,
  TrendingUp,
  RotateCcw,
  RefreshCw,
  Server,
  Layers,
  ChevronDown,
  Activity,
  Flame,
  Zap,
} from 'lucide-react';

export const TradingViewChart: React.FC = () => {
  const {
    activeMarket,
    currentPrice,
    candles,
    timeframe,
    setTimeframe,
    dataProviderStatus,
    refreshHistoricalData,
    tickDirection,
    chartSuspenseLevel,
    setChartSuspenseLevel,
    setMarketsModalOpen,
  } = useBroker();

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const ma7SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ma25SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const [showMa, setShowMa] = useState<boolean>(true);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1D'];

  // Format candles for lightweight-charts (time in seconds, ascending order, deduplicated)
  const formattedData = useMemo(() => {
    if (!candles || candles.length === 0) return [];
    const map = new Map<number, Candle>();

    candles.forEach((c) => {
      // Ensure seconds timestamp
      const sec = Math.floor(c.time / 1000);
      map.set(sec, c);
    });

    const sortedSecs = Array.from(map.keys()).sort((a, b) => a - b);
    return sortedSecs.map((sec) => {
      const c = map.get(sec)!;
      return {
        candle: {
          time: sec as UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        },
        volume: {
          time: sec as UTCTimestamp,
          value: c.volume,
          color: c.close >= c.open ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)',
        },
      };
    });
  }, [candles]);

  // Compute Moving Averages
  const ma7Data = useMemo(() => {
    if (!showMa || formattedData.length < 7) return [];
    const res: { time: UTCTimestamp; value: number }[] = [];
    for (let i = 6; i < formattedData.length; i++) {
      let sum = 0;
      for (let j = 0; j < 7; j++) {
        sum += formattedData[i - j].candle.close;
      }
      res.push({
        time: formattedData[i].candle.time,
        value: Number((sum / 7).toFixed(activeMarket.precision)),
      });
    }
    return res;
  }, [formattedData, showMa, activeMarket.precision]);

  const ma25Data = useMemo(() => {
    if (!showMa || formattedData.length < 25) return [];
    const res: { time: UTCTimestamp; value: number }[] = [];
    for (let i = 24; i < formattedData.length; i++) {
      let sum = 0;
      for (let j = 0; j < 25; j++) {
        sum += formattedData[i - j].candle.close;
      }
      res.push({
        time: formattedData[i].candle.time,
        value: Number((sum / 25).toFixed(activeMarket.precision)),
      });
    }
    return res;
  }, [formattedData, showMa, activeMarket.precision]);

  // Initialize Lightweight Charts
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;

    // Create chart instance
    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: '#0b0e14' },
        textColor: '#94a3b8',
        fontSize: 11,
        fontFamily: "'JetBrains Mono', 'Vazirmatn', monospace",
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.4)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.4)' },
      },
      crosshair: {
        vertLine: {
          color: '#f59e0b',
          width: 1,
          style: 3,
          labelBackgroundColor: '#1e293b',
        },
        horzLine: {
          color: '#f59e0b',
          width: 1,
          style: 3,
          labelBackgroundColor: '#f59e0b',
        },
      },
      rightPriceScale: {
        borderColor: '#1e293b',
        autoScale: true,
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // 1. Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });
    candleSeriesRef.current = candleSeries;

    // 2. Volume Histogram Series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // overlay
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.82,
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;

    // 3. MA 7 Line Series
    const ma7Series = chart.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 1,
      title: 'MA(7)',
      priceLineVisible: false,
      lastValueVisible: false,
    });
    ma7SeriesRef.current = ma7Series;

    // 4. MA 25 Line Series
    const ma25Series = chart.addSeries(LineSeries, {
      color: '#0284c7',
      lineWidth: 1,
      title: 'MA(25)',
      priceLineVisible: false,
      lastValueVisible: false,
    });
    ma25SeriesRef.current = ma25Series;

    // Crosshair move handler
    chart.subscribeCrosshairMove((param) => {
      if (param.time) {
        const timeSec = param.time as number;
        const found = candles.find((c) => Math.floor(c.time / 1000) === timeSec);
        if (found) {
          setHoveredCandle(found);
        }
      } else {
        setHoveredCandle(null);
      }
    });

    // Resize observer
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      ma7SeriesRef.current = null;
      ma25SeriesRef.current = null;
    };
  }, []);

  // Update Data on Chart whenever formattedData or indicators change
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return;

    if (formattedData.length > 0) {
      candleSeriesRef.current.setData(formattedData.map((d) => d.candle));
      volumeSeriesRef.current.setData(
        showVolume ? formattedData.map((d) => d.volume) : []
      );

      if (ma7SeriesRef.current) {
        ma7SeriesRef.current.setData(ma7Data);
      }
      if (ma25SeriesRef.current) {
        ma25SeriesRef.current.setData(ma25Data);
      }

      // Fit content on initial load
      chartRef.current?.timeScale().fitContent();
    }
  }, [formattedData, showVolume, ma7Data, ma25Data]);

  // Real-time tick update: update the last candle without reloading the whole series!
  useEffect(() => {
    if (!candleSeriesRef.current || !candles || candles.length === 0) return;
    const last = candles[candles.length - 1];
    const sec = Math.floor(last.time / 1000) as UTCTimestamp;

    candleSeriesRef.current.update({
      time: sec,
      open: last.open,
      high: last.high,
      low: last.low,
      close: currentPrice,
    });

    if (volumeSeriesRef.current && showVolume) {
      volumeSeriesRef.current.update({
        time: sec,
        value: last.volume,
        color: currentPrice >= last.open ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)',
      });
    }
  }, [currentPrice, candles, showVolume]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshHistoricalData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const activeCandle = hoveredCandle || (candles.length > 0 ? candles[candles.length - 1] : null);
  const isPositiveChange = activeCandle ? activeCandle.close >= activeCandle.open : true;
  const candleChange = activeCandle ? activeCandle.close - activeCandle.open : 0;
  const candleChangePct = activeCandle && activeCandle.open > 0 ? (candleChange / activeCandle.open) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col bg-[#0b0e14] border-b border-slate-800/80 min-h-[520px] lg:min-h-[580px] relative select-none">
      {/* Top Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 border-b border-slate-800/60 bg-[#0d1117] text-xs">
        {/* Left: Active Market Selector Button (On-chart Symbol Picker) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setMarketsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#172030] to-[#111724] border border-amber-500/40 hover:border-amber-400 hover:bg-[#1e2a40] transition-all group shadow-md text-xs cursor-pointer"
            title="تغییر نماد معاملاتی"
          >
            <div
              className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${activeMarket.iconBg} flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}
            >
              {activeMarket.baseAsset.substring(0, 3)}
            </div>
            <div className="flex items-center gap-1.5 font-bold text-slate-100">
              <span className="font-mono-numbers text-sm text-amber-300">{activeMarket.symbol}</span>
              <span className="text-[11px] font-normal text-slate-400 hidden sm:inline">({activeMarket.nameFa})</span>
            </div>
            {/* Live Price Badge inside symbol selector */}
            <div className="flex items-baseline gap-1 bg-slate-950/90 px-2 py-0.5 rounded-lg border border-slate-800/80">
              <span
                className={`font-mono-numbers font-bold text-xs ${
                  tickDirection === 'up'
                    ? 'text-emerald-400'
                    : tickDirection === 'down'
                    ? 'text-rose-400'
                    : activeMarket.change24h >= 0
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {currentPrice.toLocaleString(activeMarket.quoteAsset === 'IRT' ? 'fa-IR' : 'en-US', {
                  minimumFractionDigits: activeMarket.precision > 0 ? 2 : 0,
                  maximumFractionDigits: activeMarket.precision,
                })}
              </span>
              <span className="text-[9px] text-slate-400">
                {activeMarket.quoteAsset === 'IRT' ? 'تومان' : activeMarket.quoteAsset}
              </span>
            </div>
            {/* 24h Change Pill */}
            <span
              className={`hidden md:inline-block font-mono-numbers text-[10px] font-bold px-1.5 py-0.5 rounded ${
                activeMarket.change24h >= 0
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-rose-500/15 text-rose-400'
              }`}
            >
              {activeMarket.change24h >= 0 ? '+' : ''}
              {activeMarket.change24h.toFixed(2)}%
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

          {/* Timeframe Buttons */}
          <div className="flex items-center gap-1">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono-numbers transition-all ${
                  timeframe === tf
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-slate-800 mx-1 hidden md:block" />

          {/* Indicators Buttons */}
          <button
            onClick={() => setShowMa(!showMa)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
              showMa
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            MA (7/25)
          </button>
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
              showVolume
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            حجم
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1 hidden lg:block" />

          {/* Real-time Suspense Volatility Speed Controls */}
          <div className="hidden lg:flex items-center gap-1 bg-[#090d14] border border-slate-800 p-0.5 rounded-xl text-[10px]">
            <span className="px-2 text-slate-400 font-medium flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-400" />
              <span>نبض چارت:</span>
            </span>
            <button
              onClick={() => setChartSuspenseLevel('hyper')}
              title="نوسان شدید و سریع (بیشترین هیجان)"
              className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                chartSuspenseLevel === 'hyper'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              طوفانی (Hyper)
            </button>
            <button
              onClick={() => setChartSuspenseLevel('high')}
              title="نوسان پویا با کشمکش خریدار و فروشنده"
              className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                chartSuspenseLevel === 'high'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              پرتحرک (Live)
            </button>
            <button
              onClick={() => setChartSuspenseLevel('medium')}
              title="نوسان ملایم"
              className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                chartSuspenseLevel === 'medium'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              آرام
            </button>
          </div>
        </div>

        {/* Right: Live Pulse Pill & Live Provider Connection Badge */}
        <div className="flex items-center gap-2 text-[11px]">
          {/* Real-time Tick Suspense Pill */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold transition-all duration-200 ${
              tickDirection === 'up'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/20'
                : tickDirection === 'down'
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-sm shadow-rose-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                tickDirection === 'up'
                  ? 'bg-emerald-400 animate-ping'
                  : tickDirection === 'down'
                  ? 'bg-rose-400 animate-ping'
                  : 'bg-slate-500'
              }`}
            />
            <span>
              {tickDirection === 'up'
                ? 'فشار خریداران ▲'
                : tickDirection === 'down'
                ? 'فشار فروشندگان ▼'
                : 'تردید و تعادل بازار'}
            </span>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 font-mono-numbers shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">{dataProviderStatus.name}</span>
            <span className="text-emerald-400/70 font-normal">({dataProviderStatus.latencyMs}ms)</span>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="بازآوری داده‌های چارت از سرور جهانی"
            className="p-1.5 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={() => chartRef.current?.timeScale().fitContent()}
            title="تراز مجدد چارت"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TradingView OHLC Live Legend */}
      {activeCandle && (
        <div className="px-3 py-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 bg-[#0b0e14]/90 border-b border-slate-850 font-mono-numbers">
          <div className="flex items-center gap-1 text-slate-200 font-bold">
            <span>{activeMarket.symbol}</span>
            <span className="text-[10px] text-slate-400 font-normal">({timeframe})</span>
          </div>

          <span>
            O: <span className="text-slate-200">{activeCandle.open.toFixed(activeMarket.precision)}</span>
          </span>
          <span>
            H: <span className="text-emerald-400">{activeCandle.high.toFixed(activeMarket.precision)}</span>
          </span>
          <span>
            L: <span className="text-rose-400">{activeCandle.low.toFixed(activeMarket.precision)}</span>
          </span>
          <span>
            C: <span className="text-slate-200">{activeCandle.close.toFixed(activeMarket.precision)}</span>
          </span>
          <span>
            تغییر:{' '}
            <span className={isPositiveChange ? 'text-emerald-400' : 'text-rose-400'}>
              {isPositiveChange ? '+' : ''}
              {candleChange.toFixed(activeMarket.precision)} ({isPositiveChange ? '+' : ''}
              {candleChangePct.toFixed(2)}%)
            </span>
          </span>
          <span>
            حجم: <span className="text-slate-300">{activeCandle.volume.toLocaleString('en-US')}</span>
          </span>

          {showMa && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-amber-400 font-bold">MA7</span>
              <span className="text-sky-400 font-bold">MA25</span>
            </div>
          )}
        </div>
      )}

      {/* Lightweight Charts Canvas Host */}
      <div ref={chartContainerRef} className="flex-1 w-full h-full min-h-[350px] relative" />

      {/* Fast Buy & Sell Quick Trading Bar Directly Under Chart */}
      <ChartQuickTradeBar />
    </div>
  );
};
