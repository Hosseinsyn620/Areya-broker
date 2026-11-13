/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useBroker } from '../context/BrokerContext';
import { Candle } from '../types/broker';
import { ZoomIn, ZoomOut, RotateCcw, BarChart2 } from 'lucide-react';

export const CandleChart: React.FC = () => {
  const { activeMarket, candles, currentPrice, timeframe, setTimeframe } = useBroker();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showMa, setShowMa] = useState<boolean>(true);
  const [showRsi, setShowRsi] = useState<boolean>(false);
  const [showVolume, setShowVolume] = useState<boolean>(true);

  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1D'];

  // Calculate Moving Average
  const calculateMA = useCallback((period: number, candleList: Candle[]) => {
    const ma: (number | null)[] = [];
    for (let i = 0; i < candleList.length; i++) {
      if (i < period - 1) {
        ma.push(null);
      } else {
        let sum = 0;
        for (let j = 0; j < period; j++) {
          sum += candleList[i - j].close;
        }
        ma.push(sum / period);
      }
    }
    return ma;
  }, []);

  // Calculate RSI (14)
  const calculateRsi = useCallback((candleList: Candle[]) => {
    const period = 14;
    const rsi: (number | null)[] = [];
    let gains = 0;
    let losses = 0;

    for (let i = 0; i < candleList.length; i++) {
      if (i === 0) {
        rsi.push(null);
        continue;
      }
      const change = candleList[i].close - candleList[i - 1].close;
      if (i <= period) {
        if (change >= 0) gains += change;
        else losses += Math.abs(change);

        if (i === period) {
          const avgGain = gains / period;
          const avgLoss = losses / period;
          const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
          rsi.push(100 - 100 / (1 + rs));
        } else {
          rsi.push(null);
        }
      } else {
        const gain = change >= 0 ? change : 0;
        const loss = change < 0 ? Math.abs(change) : 0;
        gains = (gains * (period - 1) + gain) / period;
        losses = (losses * (period - 1) + loss) / period;
        const rs = losses === 0 ? 100 : gains / losses;
        rsi.push(100 - 100 / (1 + rs));
      }
    }
    return rsi;
  }, []);

  const visibleCandles = useMemo(() => {
    const baseCount = Math.floor(60 / zoomLevel);
    return candles.slice(Math.max(0, candles.length - baseCount));
  }, [candles, zoomLevel]);

  const ma7 = useMemo(() => calculateMA(7, visibleCandles), [calculateMA, visibleCandles]);
  const ma25 = useMemo(() => calculateMA(25, visibleCandles), [calculateMA, visibleCandles]);
  const rsiValues = useMemo(() => calculateRsi(visibleCandles), [calculateRsi, visibleCandles]);

  // Main Canvas Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina display scaling
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = '#0b0e14';
    ctx.fillRect(0, 0, width, height);

    if (visibleCandles.length === 0) return;

    // Layout partitions
    const paddingRight = 75; // Y-axis price scale width
    const paddingBottom = 26; // X-axis time scale height
    const rsiHeight = showRsi ? 70 : 0;
    const volumeHeight = showVolume ? 60 : 0;
    const mainChartHeight = height - paddingBottom - rsiHeight - volumeHeight - 15;

    // Determine min/max price
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    visibleCandles.forEach((c) => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;
    });

    // Expand price range slightly for aesthetics
    const pricePadding = (maxPrice - minPrice) * 0.08 || 1;
    minPrice -= pricePadding;
    maxPrice += pricePadding;
    const priceRange = maxPrice - minPrice;

    const chartWidth = width - paddingRight;
    const candleWidth = Math.max(3, (chartWidth / visibleCandles.length) * 0.72);
    const candleSpacing = chartWidth / visibleCandles.length;

    // Helper functions
    const getY = (val: number) => {
      return mainChartHeight - ((val - minPrice) / priceRange) * mainChartHeight + 10;
    };

    // Draw grid lines
    ctx.strokeStyle = '#161d28';
    ctx.lineWidth = 1;

    // Horizontal price grid lines (5 lines)
    const gridSteps = 5;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';

    for (let i = 0; i <= gridSteps; i++) {
      const p = minPrice + (priceRange / gridSteps) * i;
      const y = getY(p);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Price labels on right margin
      const formattedPrice = p.toLocaleString(activeMarket.quoteAsset === 'IRT' ? 'fa-IR' : 'en-US', {
        maximumFractionDigits: activeMarket.precision,
      });
      ctx.fillText(formattedPrice, chartWidth + 8, y + 3);
    }

    // Vertical time grid lines (every 10 candles)
    ctx.textAlign = 'center';
    visibleCandles.forEach((c, idx) => {
      if (idx % 10 === 0) {
        const x = idx * candleSpacing + candleSpacing / 2;
        ctx.beginPath();
        ctx.moveTo(x, 10);
        ctx.lineTo(x, height - paddingBottom);
        ctx.stroke();

        const d = new Date(c.time);
        const timeLabel = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        ctx.fillText(timeLabel, x, height - 8);
      }
    });

    // Draw Volume Bars
    if (showVolume) {
      const volBaseY = mainChartHeight + 15 + volumeHeight;
      visibleCandles.forEach((c, idx) => {
        const x = idx * candleSpacing + (candleSpacing - candleWidth) / 2;
        const isUp = c.close >= c.open;
        const vHeight = (c.volume / (maxVolume || 1)) * (volumeHeight - 8);
        ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)';
        ctx.fillRect(x, volBaseY - vHeight, candleWidth, vHeight);
      });
    }

    // Draw Candlesticks
    visibleCandles.forEach((c, idx) => {
      const isUp = c.close >= c.open;
      const x = idx * candleSpacing + candleSpacing / 2;
      const candleLeft = x - candleWidth / 2;

      const openY = getY(c.open);
      const closeY = getY(c.close);
      const highY = getY(c.high);
      const lowY = getY(c.low);

      const color = isUp ? '#10b981' : '#f43f5e';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;

      // Wick
      ctx.beginPath();
      ctx.lineWidth = 1.2;
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Body
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));
      ctx.fillRect(candleLeft, bodyTop, candleWidth, bodyHeight);
    });

    // Draw Moving Averages
    if (showMa) {
      // MA 7 (Amber)
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      ma7.forEach((val, idx) => {
        if (val !== null) {
          const x = idx * candleSpacing + candleSpacing / 2;
          const y = getY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();

      // MA 25 (Sky Blue)
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      started = false;
      ma25.forEach((val, idx) => {
        if (val !== null) {
          const x = idx * candleSpacing + candleSpacing / 2;
          const y = getY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Draw Current Price Line & Badge
    const currentPriceY = getY(currentPrice);
    if (currentPriceY >= 10 && currentPriceY <= mainChartHeight + 10) {
      ctx.strokeStyle = '#f59e0b';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, currentPriceY);
      ctx.lineTo(chartWidth, currentPriceY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current Price Tag on right scale
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(chartWidth + 2, currentPriceY - 9, paddingRight - 4, 18);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        currentPrice.toLocaleString(activeMarket.quoteAsset === 'IRT' ? 'fa-IR' : 'en-US', {
          maximumFractionDigits: activeMarket.precision,
        }),
        chartWidth + 6,
        currentPriceY + 3.5
      );
    }

    // Draw RSI Panel if enabled
    if (showRsi) {
      const rsiTop = height - paddingBottom - rsiHeight;
      ctx.fillStyle = '#080a0f';
      ctx.fillRect(0, rsiTop, chartWidth, rsiHeight);

      ctx.strokeStyle = '#1e293b';
      ctx.strokeRect(0, rsiTop, chartWidth, rsiHeight);

      // Overbought / Oversold dashed lines (70 / 30)
      const y70 = rsiTop + rsiHeight * 0.3;
      const y30 = rsiTop + rsiHeight * 0.7;
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, y70);
      ctx.lineTo(chartWidth, y70);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.beginPath();
      ctx.moveTo(0, y30);
      ctx.lineTo(chartWidth, y30);
      ctx.stroke();
      ctx.setLineDash([]);

      // RSI curve
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let rsiStarted = false;
      rsiValues.forEach((val, idx) => {
        if (val !== null) {
          const x = idx * candleSpacing + candleSpacing / 2;
          const y = rsiTop + rsiHeight * (1 - val / 100);
          if (!rsiStarted) {
            ctx.moveTo(x, y);
            rsiStarted = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();

      // Label
      ctx.fillStyle = '#a78bfa';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('RSI (14)', 8, rsiTop + 14);
    }

    // Draw Crosshair if active
    if (crosshairPos) {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(crosshairPos.x, 0);
      ctx.lineTo(crosshairPos.x, height - paddingBottom);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, crosshairPos.y);
      ctx.lineTo(chartWidth, crosshairPos.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [
    visibleCandles,
    currentPrice,
    activeMarket,
    ma7,
    ma25,
    rsiValues,
    showMa,
    showRsi,
    showVolume,
    crosshairPos,
  ]);

  // Handle Mouse Move on Canvas for Crosshair
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const paddingRight = 75;
    const chartWidth = canvas.clientWidth - paddingRight;

    if (x >= 0 && x <= chartWidth && y >= 0 && y <= canvas.clientHeight - 26) {
      setCrosshairPos({ x, y });
      const candleSpacing = chartWidth / visibleCandles.length;
      const index = Math.min(
        visibleCandles.length - 1,
        Math.max(0, Math.floor(x / candleSpacing))
      );
      setHoveredCandle(visibleCandles[index]);
    } else {
      setCrosshairPos(null);
      setHoveredCandle(null);
    }
  };

  const handleMouseLeave = () => {
    setCrosshairPos(null);
    setHoveredCandle(null);
  };

  const activeCandle = hoveredCandle || visibleCandles[visibleCandles.length - 1];

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col bg-[#0b0e14] border-b border-slate-800/80 min-h-[380px] lg:min-h-[460px] relative select-none"
    >
      {/* Chart Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 border-b border-slate-800/60 bg-[#0d1117] text-xs">
        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-0.5 rounded text-xs font-mono-numbers transition-all ${
                timeframe === tf
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Indicators and Tools */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <button
            onClick={() => setShowMa(!showMa)}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              showMa ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            میانگین متحرک (MA)
          </button>
          <button
            onClick={() => setShowRsi(!showRsi)}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              showRsi ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            شاخص RSI
          </button>
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              showVolume ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            حجم
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* Zoom Controls */}
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
            title="بزرگ‌نمایی"
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.25))}
            title="کوچک‌نمایی"
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            title="بازنشانی زوم"
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Real-time Candle OHLC Info Bar */}
      {activeCandle && (
        <div className="px-3 py-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 bg-[#0b0e14]/90 border-b border-slate-850 font-mono-numbers">
          <span>
            باز: <span className="text-slate-200">{activeCandle.open.toFixed(activeMarket.precision)}</span>
          </span>
          <span>
            بالا: <span className="text-emerald-400">{activeCandle.high.toFixed(activeMarket.precision)}</span>
          </span>
          <span>
            پایین: <span className="text-rose-400">{activeCandle.low.toFixed(activeMarket.precision)}</span>
          </span>
          <span>
            بسته: <span className="text-slate-200">{activeCandle.close.toFixed(activeMarket.precision)}</span>
          </span>
          <span>
            حجم: <span className="text-slate-300">{activeCandle.volume.toLocaleString('en-US')}</span>
          </span>
          {showMa && (
            <>
              <span className="text-amber-400">MA(7)</span>
              <span className="text-sky-400">MA(25)</span>
            </>
          )}
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 relative w-full h-full min-h-[300px]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="absolute inset-0 w-full h-full cursor-crosshair"
        />
      </div>
    </div>
  );
};
