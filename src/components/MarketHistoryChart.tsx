import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { MarketCommodityData, MarketHistoryPoint } from '../types/game';
import { TrendingUp, TrendingDown, Minus, Clock, Eye, AlertCircle, Compass } from 'lucide-react';
import { Language } from '../i18n/translations';

interface MarketHistoryChartProps {
  commodityKey: string;
  commodityName: string;
  data: MarketCommodityData;
  language: Language;
}

export const MarketHistoryChart: React.FC<MarketHistoryChartProps> = ({
  commodityKey,
  commodityName,
  data,
  language,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(480);
  const [hoveredPoint, setHoveredPoint] = useState<MarketHistoryPoint | null>(null);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(Math.floor(entry.contentRect.width));
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const history = data.history && data.history.length > 0 ? data.history : [
    { day: 1, hour: 0, price: data.current * 0.92, saturation: data.saturation + 0.1 },
    { day: 1, hour: 6, price: data.current * 0.95, saturation: data.saturation + 0.05 },
    { day: 1, hour: 12, price: data.current * 0.98, saturation: data.saturation },
    { day: 1, hour: 18, price: data.current * 1.01, saturation: data.saturation - 0.02 },
    { day: 1, hour: 24, price: data.current, saturation: data.saturation },
  ];

  const prices = history.map((h) => h.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 10) / 10;
  const isUpTrend = data.trend === 'up';

  // D3 rendering
  useEffect(() => {
    if (!svgRef.current || history.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = containerWidth;
    const height = 180;
    const margin = { top: 15, right: 35, bottom: 25, left: 45 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const defs = svg.append('defs');

    // Gradient fill under the price line
    const priceGrad = defs
      .append('linearGradient')
      .attr('id', `chart-grad-${commodityKey}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    const themeColor = isUpTrend ? '#10b981' : data.trend === 'down' ? '#f43f5e' : '#38bdf8';

    priceGrad.append('stop').attr('offset', '0%').attr('stop-color', themeColor).attr('stop-opacity', 0.25);
    priceGrad.append('stop').attr('offset', '100%').attr('stop-color', themeColor).attr('stop-opacity', 0.0);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, history.length - 1])
      .range([0, innerWidth]);

    const yMin = Math.max(0, minPrice * 0.95);
    const yMax = maxPrice * 1.05;
    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([innerHeight, 0]);

    // Grid lines
    const yTicks = yScale.ticks(4);
    g.selectAll('.grid-line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', 'rgba(255, 255, 255, 0.06)')
      .attr('stroke-dasharray', '2 2');

    // Axes
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(4)
      .tickFormat((d) => (Number(d) >= 1000 ? `$${(Number(d) / 1000).toFixed(1)}k` : `$${d}`));

    g.append('g')
      .call(yAxis)
      .call((group) => {
        group.select('.domain').attr('stroke', 'rgba(255, 255, 255, 0.12)');
        group.selectAll('.tick line').attr('stroke', 'rgba(255, 255, 255, 0.08)');
        group.selectAll('.tick text').attr('fill', '#94a3b8').attr('font-size', '9px').attr('font-family', 'monospace');
      });

    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.min(6, history.length))
      .tickFormat((d, i) => {
        const pt = history[Number(d)];
        return pt ? `${pt.hour}h` : '';
      });

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .call((group) => {
        group.select('.domain').attr('stroke', 'rgba(255, 255, 255, 0.12)');
        group.selectAll('.tick line').attr('stroke', 'rgba(255, 255, 255, 0.08)');
        group.selectAll('.tick text').attr('fill', '#94a3b8').attr('font-size', '9px').attr('font-family', 'monospace');
      });

    // Area & Line
    const areaGen = d3
      .area<MarketHistoryPoint>()
      .x((d, i) => xScale(i))
      .y0(innerHeight)
      .y1((d) => yScale(d.price))
      .curve(d3.curveMonotoneX);

    const lineGen = d3
      .line<MarketHistoryPoint>()
      .x((d, i) => xScale(i))
      .y((d) => yScale(d.price))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(history)
      .attr('fill', `url(#chart-grad-${commodityKey})`)
      .attr('d', areaGen);

    g.append('path')
      .datum(history)
      .attr('fill', 'none')
      .attr('stroke', themeColor)
      .attr('stroke-width', 2.2)
      .attr('d', lineGen);

    // Crosshair & Interaction
    const crosshair = g.append('g').style('display', 'none');
    crosshair
      .append('line')
      .attr('class', 'crosshair-line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', 'rgba(255, 255, 255, 0.4)')
      .attr('stroke-dasharray', '3 3');

    const focusCircle = crosshair
      .append('circle')
      .attr('r', 4.5)
      .attr('fill', themeColor)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5);

    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseenter', () => crosshair.style('display', 'block'))
      .on('mouseleave', () => {
        crosshair.style('display', 'none');
        setHoveredPoint(null);
      })
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event);
        const idxFraction = xScale.invert(mx);
        const idx = Math.max(0, Math.min(history.length - 1, Math.round(idxFraction)));
        const pt = history[idx];
        if (pt) {
          setHoveredPoint(pt);
          const cx = xScale(idx);
          const cy = yScale(pt.price);
          crosshair.select('.crosshair-line').attr('x1', cx).attr('x2', cx);
          focusCircle.attr('cx', cx).attr('cy', cy);
        }
      });
  }, [history, containerWidth, isUpTrend, data.trend, commodityKey, minPrice, maxPrice]);

  return (
    <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-4 space-y-3.5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white tracking-wide">
              {commodityName} {language === 'ru' ? '— Динамика котировок' : '— Price History'}
            </h4>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                isUpTrend
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : data.trend === 'down'
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              }`}
            >
              {isUpTrend ? (
                <>
                  <TrendingUp className="w-3 h-3" /> ВВЕРХ
                </>
              ) : data.trend === 'down' ? (
                <>
                  <TrendingDown className="w-3 h-3" /> СПАД
                </>
              ) : (
                <>
                  <Minus className="w-3 h-3" /> СТАБИЛЬНО
                </>
              )}
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono mt-0.5">
            {language === 'ru' ? 'Текущий спот:' : 'Current Spot:'}{' '}
            <strong className="text-white font-bold">${data.current.toLocaleString()}</strong>
            <span className="mx-2">·</span>
            {language === 'ru' ? 'Насыщение рынка:' : 'Saturation:'}{' '}
            <strong className="text-slate-200">{Math.round(data.saturation * 100)}%</strong>
          </div>
        </div>

        {/* Forecast Box */}
        <div className="bg-[#121926] border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2.5">
          <Compass className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="text-[11px] font-mono">
            <span className="text-slate-400">{language === 'ru' ? 'Прогноз 24ч:' : '24h Forecast:'} </span>
            <strong
              className={`font-bold ${
                (data.forecastExpectedChange ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {(data.forecastExpectedChange ?? 0) >= 0 ? '+' : ''}
              {data.forecastExpectedChange ?? 5}%
            </strong>
            <span className="text-[10px] text-slate-500 ml-1">
              ({data.forecastConfidence ?? 85}% {language === 'ru' ? 'точность' : 'conf'})
            </span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div ref={containerRef} className="relative w-full bg-[#070b10] border border-white/[0.06] rounded-xl pt-2">
        <svg ref={svgRef} className="w-full block" />

        {hoveredPoint && (
          <div className="absolute top-2 right-3 bg-[#0d141f]/95 border border-white/15 backdrop-blur-md rounded-xl px-2.5 py-1.5 shadow-xl text-[10px] font-mono pointer-events-none">
            <div className="text-slate-300 font-bold border-b border-white/10 pb-0.5">
              Час {hoveredPoint.hour} (День {hoveredPoint.day})
            </div>
            <div className="flex gap-3 text-slate-200 pt-0.5">
              <span>
                Цена: <strong className="text-emerald-400">${hoveredPoint.price.toLocaleString()}</strong>
              </span>
              <span>
                Насыщение: <strong className="text-amber-400">{Math.round(hoveredPoint.saturation * 100)}%</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
        <div className="bg-[#121720] border border-white/[0.05] rounded-lg py-1.5 px-2">
          <span className="text-[10px] text-slate-400 block">{language === 'ru' ? 'Мин. цена' : 'Low Price'}</span>
          <span className="text-slate-200 font-bold">${minPrice.toLocaleString()}</span>
        </div>
        <div className="bg-[#121720] border border-white/[0.05] rounded-lg py-1.5 px-2">
          <span className="text-[10px] text-slate-400 block">{language === 'ru' ? 'Средняя' : 'Avg Price'}</span>
          <span className="text-slate-200 font-bold">${avgPrice.toLocaleString()}</span>
        </div>
        <div className="bg-[#121720] border border-white/[0.05] rounded-lg py-1.5 px-2">
          <span className="text-[10px] text-slate-400 block">{language === 'ru' ? 'Макс. цена' : 'Peak Price'}</span>
          <span className="text-emerald-400 font-bold">${maxPrice.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
