import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { BotanyPlant, PlantTelemetryPoint } from '../types/game';
import { Language, translations } from '../i18n/translations';
import { Activity, AlertTriangle, CheckCircle2, TrendingUp, Zap, Droplets, Leaf } from 'lucide-react';

interface BotanyTelemetryChartProps {
  plant: BotanyPlant;
  language: Language;
}

type MetricMode = 'all' | 'npk' | 'health_biomass';

export const BotanyTelemetryChart: React.FC<BotanyTelemetryChartProps> = ({ plant, language }) => {
  const t = translations[language];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [metricMode, setMetricMode] = useState<MetricMode>('all');
  const [hoveredPoint, setHoveredPoint] = useState<PlantTelemetryPoint | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(650);

  // Measure container dimensions
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

  // Compute physiological absorption curve and telemetry points
  const telemetryData: PlantTelemetryPoint[] = useMemo(() => {
    const currentProgress = Math.max(5, plant.progress);
    const totalHours = Math.max(24, Math.round((currentProgress / 100) * 168)); // up to 168 simulation hours (1 week)
    const pointsCount = Math.max(16, Math.min(36, Math.round(totalHours / 4)));

    const ph = plant.nutrients.ph;
    // pH absorption efficiency curve: optimal between 5.8 and 6.5
    let phEfficiency = 1.0;
    if (ph < 5.8) {
      phEfficiency = Math.max(0.35, 1.0 - Math.pow((5.8 - ph) / 0.8, 1.6));
    } else if (ph > 6.5) {
      phEfficiency = Math.max(0.35, 1.0 - Math.pow((ph - 6.5) / 0.8, 1.6));
    }

    const mediumMultiplier = plant.medium === 'hydroponics' ? 1.18 : 1.0;
    const lightMultiplier = plant.lightWattage === 1000 ? 1.12 : 1.0;

    const currentN_Abs = Math.min(100, Math.round(plant.nutrients.n * phEfficiency * mediumMultiplier * 0.95));
    const currentP_Abs = Math.min(100, Math.round(plant.nutrients.p * phEfficiency * mediumMultiplier * 0.95));
    const currentK_Abs = Math.min(100, Math.round(plant.nutrients.k * phEfficiency * mediumMultiplier * 0.95));
    const currentEfficiency = Math.round(((currentN_Abs + currentP_Abs + currentK_Abs) / 3) * (plant.health / 100));

    const generated: PlantTelemetryPoint[] = [];

    for (let i = 0; i <= pointsCount; i++) {
      const stepFraction = i / pointsCount;
      const simHour = Math.round(stepFraction * totalHours);
      const simDay = Math.floor(simHour / 24) + 1;
      const stepProg = stepFraction * currentProgress;

      // Realistic biological nutrient uptake curves:
      // Early vegetative (0-40% progress): N is peak, P & K moderate
      // Mid-flowering (40-80% progress): P & K peak, N gradually lowers
      // Late curing / flush (80-100% progress): P & K peak resin density
      const vegFactor = Math.max(0, 1 - stepProg / 90);
      const bloomFactor = Math.min(1.2, (stepProg / 65) * 1.1);

      const nVal = Math.min(100, Math.max(15, Math.round(
        (currentN_Abs * (0.65 + vegFactor * 0.45) + Math.sin(i * 0.8) * 4) * lightMultiplier
      )));

      const pVal = Math.min(100, Math.max(15, Math.round(
        (currentP_Abs * (0.45 + bloomFactor * 0.65) + Math.cos(i * 0.7) * 3) * lightMultiplier
      )));

      const kVal = Math.min(100, Math.max(15, Math.round(
        (currentK_Abs * (0.50 + bloomFactor * 0.60) + Math.sin(i * 0.6) * 3.5) * lightMultiplier
      )));

      // Biomass follows a biological sigmoid growth curve
      const biomass = Math.min(100, Math.max(2, Math.round(100 / (1 + Math.exp(-0.075 * (stepProg - 45))))));

      // Health curve reacts smoothly with slight baseline variance
      const healthPoint = Math.min(100, Math.max(20, Math.round(
        plant.health - (1 - phEfficiency) * 20 * (1 - stepFraction * 0.5) + Math.sin(i * 1.1) * 2
      )));

      const efficiency = Math.round(((nVal + pVal + kVal) / 3) * (healthPoint / 100));

      generated.push({
        hour: simHour,
        day: simDay,
        health: healthPoint,
        biomass,
        nAbsorption: nVal,
        pAbsorption: pVal,
        kAbsorption: kVal,
        uptakeEfficiency: efficiency,
        ph: Number((plant.nutrients.ph + (Math.sin(i * 0.4) * 0.08)).toFixed(2)),
      });
    }

    // Force last point to match current live telemetry precisely
    if (generated.length > 0) {
      const last = generated[generated.length - 1];
      last.health = plant.health;
      last.nAbsorption = currentN_Abs;
      last.pAbsorption = currentP_Abs;
      last.kAbsorption = currentK_Abs;
      last.uptakeEfficiency = currentEfficiency;
      last.ph = plant.nutrients.ph;
    }

    return generated;
  }, [plant]);

  // Is plant suffering nutrient lockout?
  const isNutrientLockout = plant.nutrients.ph < 5.8 || plant.nutrients.ph > 6.5;

  // D3 Chart Render
  useEffect(() => {
    if (!svgRef.current || telemetryData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = containerWidth;
    const height = 280;
    const margin = { top: 25, right: 30, bottom: 35, left: 45 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Scales
    const maxHour = d3.max(telemetryData, (d) => d.hour) || 24;
    const xScale = d3.scaleLinear().domain([0, maxHour]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

    // Root Group
    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Gradients Definition
    const defs = svg.append('defs');

    // 1. Shaded Optimal Zone (70-95%)
    g.append('rect')
      .attr('x', 0)
      .attr('y', yScale(95))
      .attr('width', innerWidth)
      .attr('height', yScale(70) - yScale(95))
      .attr('fill', 'rgba(16, 185, 129, 0.04)')
      .attr('stroke', 'rgba(16, 185, 129, 0.15)')
      .attr('stroke-dasharray', '4 4');

    g.append('text')
      .attr('x', innerWidth - 8)
      .attr('y', yScale(95) + 12)
      .attr('text-anchor', 'end')
      .attr('fill', 'rgba(16, 185, 129, 0.55)')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .text(`★ ${t.phOptimal} (70-95%)`);

    // Gridlines (Y-axis)
    const yTicks = [25, 50, 75, 100];
    g.selectAll('.grid-line-y')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-line-y')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', 'rgba(255, 255, 255, 0.06)')
      .attr('stroke-dasharray', '2 2');

    // X Axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.min(8, Math.floor(width / 70)))
      .tickFormat((d) => `${d}h`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .call((group) => {
        group.select('.domain').attr('stroke', 'rgba(255, 255, 255, 0.15)');
        group.selectAll('.tick line').attr('stroke', 'rgba(255, 255, 255, 0.1)');
        group
          .selectAll('.tick text')
          .attr('fill', '#94a3b8')
          .attr('font-size', '10px')
          .attr('font-family', 'monospace');
      });

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => `${d}%`);

    g.append('g')
      .call(yAxis)
      .call((group) => {
        group.select('.domain').attr('stroke', 'rgba(255, 255, 255, 0.15)');
        group.selectAll('.tick line').attr('stroke', 'rgba(255, 255, 255, 0.1)');
        group
          .selectAll('.tick text')
          .attr('fill', '#94a3b8')
          .attr('font-size', '10px')
          .attr('font-family', 'monospace');
      });

    // Helper Line & Area Generators
    const createLine = (accessor: (d: PlantTelemetryPoint) => number) =>
      d3
        .line<PlantTelemetryPoint>()
        .x((d) => xScale(d.hour))
        .y((d) => yScale(accessor(d)))
        .curve(d3.curveMonotoneX);

    const createArea = (accessor: (d: PlantTelemetryPoint) => number) =>
      d3
        .area<PlantTelemetryPoint>()
        .x((d) => xScale(d.hour))
        .y0(innerHeight)
        .y1((d) => yScale(accessor(d)))
        .curve(d3.curveMonotoneX);

    // Render Metrics based on Active Metric Mode
    if (metricMode === 'all' || metricMode === 'npk') {
      // Nitrogen Area & Line
      const nGrad = defs.append('linearGradient').attr('id', 'n-gradient').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
      nGrad.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.22);
      nGrad.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', 0.0);

      g.append('path').datum(telemetryData).attr('fill', 'url(#n-gradient)').attr('d', createArea((d) => d.nAbsorption));
      g.append('path').datum(telemetryData).attr('fill', 'none').attr('stroke', '#10b981').attr('stroke-width', 2.2).attr('d', createLine((d) => d.nAbsorption));

      // Phosphorus Area & Line
      const pGrad = defs.append('linearGradient').attr('id', 'p-gradient').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
      pGrad.append('stop').attr('offset', '0%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.2);
      pGrad.append('stop').attr('offset', '100%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.0);

      g.append('path').datum(telemetryData).attr('fill', 'url(#p-gradient)').attr('d', createArea((d) => d.pAbsorption));
      g.append('path').datum(telemetryData).attr('fill', 'none').attr('stroke', '#f59e0b').attr('stroke-width', 2.2).attr('d', createLine((d) => d.pAbsorption));

      // Potassium Area & Line
      const kGrad = defs.append('linearGradient').attr('id', 'k-gradient').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
      kGrad.append('stop').attr('offset', '0%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.2);
      kGrad.append('stop').attr('offset', '100%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.0);

      g.append('path').datum(telemetryData).attr('fill', 'url(#k-gradient)').attr('d', createArea((d) => d.kAbsorption));
      g.append('path').datum(telemetryData).attr('fill', 'none').attr('stroke', '#06b6d4').attr('stroke-width', 2.2).attr('d', createLine((d) => d.kAbsorption));
    }

    if (metricMode === 'all' || metricMode === 'health_biomass') {
      // Plant Health Line (Vibrant Lime)
      g.append('path')
        .datum(telemetryData)
        .attr('fill', 'none')
        .attr('stroke', '#84cc16')
        .attr('stroke-width', 2.5)
        .attr('d', createLine((d) => d.health));

      // Biomass Growth Sigmoid Curve (Purple Violet)
      g.append('path')
        .datum(telemetryData)
        .attr('fill', 'none')
        .attr('stroke', '#c084fc')
        .attr('stroke-width', 2.0)
        .attr('stroke-dasharray', '5 3')
        .attr('d', createLine((d) => d.biomass));
    }

    // Interactive Hover Overlay & Crosshair
    const crosshair = g.append('g').style('display', 'none');

    crosshair
      .append('line')
      .attr('class', 'crosshair-line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', 'rgba(255, 255, 255, 0.45)')
      .attr('stroke-width', 1.2)
      .attr('stroke-dasharray', '3 3');

    // Hover dots
    const dotN = crosshair.append('circle').attr('r', 4.5).attr('fill', '#10b981').attr('stroke', '#fff').attr('stroke-width', 1.5);
    const dotP = crosshair.append('circle').attr('r', 4.5).attr('fill', '#f59e0b').attr('stroke', '#fff').attr('stroke-width', 1.5);
    const dotK = crosshair.append('circle').attr('r', 4.5).attr('fill', '#06b6d4').attr('stroke', '#fff').attr('stroke-width', 1.5);
    const dotHealth = crosshair.append('circle').attr('r', 4.5).attr('fill', '#84cc16').attr('stroke', '#fff').attr('stroke-width', 1.5);

    const bisect = d3.bisector<PlantTelemetryPoint, number>((d) => d.hour).center;

    // Overlay Rect for Mouse Tracking
    g.append('rect')
      .attr('class', 'overlay')
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
        const hourVal = xScale.invert(mx);
        const idx = bisect(telemetryData, hourVal);
        const pt = telemetryData[Math.max(0, Math.min(telemetryData.length - 1, idx))];

        if (pt) {
          setHoveredPoint(pt);
          const cx = xScale(pt.hour);
          crosshair.select('.crosshair-line').attr('x1', cx).attr('x2', cx);

          dotN.attr('cx', cx).attr('cy', yScale(pt.nAbsorption));
          dotP.attr('cx', cx).attr('cy', yScale(pt.pAbsorption));
          dotK.attr('cx', cx).attr('cy', yScale(pt.kAbsorption));
          dotHealth.attr('cx', cx).attr('cy', yScale(pt.health));

          dotN.style('display', metricMode === 'health_biomass' ? 'none' : 'block');
          dotP.style('display', metricMode === 'health_biomass' ? 'none' : 'block');
          dotK.style('display', metricMode === 'health_biomass' ? 'none' : 'block');
          dotHealth.style('display', metricMode === 'npk' ? 'none' : 'block');
        }
      });
  }, [telemetryData, metricMode, containerWidth, t.phOptimal]);

  const latestPoint = telemetryData[telemetryData.length - 1] || null;

  return (
    <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-sm">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white tracking-wide">
              {t.telemetryTitle}
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              D3.js Live Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t.telemetrySubtitle}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#141b26] p-1 rounded-xl border border-white/[0.06] text-xs">
          <button
            onClick={() => setMetricMode('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              metricMode === 'all'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.chartAllMetrics}
          </button>
          <button
            onClick={() => setMetricMode('npk')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              metricMode === 'npk'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.chartNpkAbsorption}
          </button>
          <button
            onClick={() => setMetricMode('health_biomass')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              metricMode === 'health_biomass'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.chartHealthBiomass}
          </button>
        </div>
      </div>

      {/* Nutrient Lockout Alert Banner */}
      {isNutrientLockout && (
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-200 text-xs animate-pulse">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-medium">
            {t.phLockoutWarning} (Текущий pH: <strong className="font-mono text-rose-300">{plant.nutrients.ph.toFixed(1)}</strong>)
          </span>
        </div>
      )}

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
        <div className="bg-[#121824] border border-white/[0.06] rounded-xl p-2.5 flex flex-col justify-between">
          <span className="text-[11px] text-emerald-400 font-mono font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            {t.metricNitrogen}
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base font-bold text-white font-mono">
              {latestPoint?.nAbsorption ?? 0}%
            </span>
            <span className="text-[10px] text-slate-400">листва</span>
          </div>
        </div>

        <div className="bg-[#121824] border border-white/[0.06] rounded-xl p-2.5 flex flex-col justify-between">
          <span className="text-[11px] text-amber-400 font-mono font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            {t.metricPhosphorus}
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base font-bold text-white font-mono">
              {latestPoint?.pAbsorption ?? 0}%
            </span>
            <span className="text-[10px] text-slate-400">бутоны</span>
          </div>
        </div>

        <div className="bg-[#121824] border border-white/[0.06] rounded-xl p-2.5 flex flex-col justify-between">
          <span className="text-[11px] text-cyan-400 font-mono font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
            {t.metricPotassium}
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base font-bold text-white font-mono">
              {latestPoint?.kAbsorption ?? 0}%
            </span>
            <span className="text-[10px] text-slate-400">смола</span>
          </div>
        </div>

        <div className="bg-[#121824] border border-white/[0.06] rounded-xl p-2.5 flex flex-col justify-between">
          <span className="text-[11px] text-lime-400 font-mono font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-lime-500 inline-block" />
            {t.metricHealth}
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base font-bold text-white font-mono">
              {plant.health}%
            </span>
            <span className="text-[10px] text-slate-400">живучесть</span>
          </div>
        </div>

        <div className="bg-[#121824] border border-white/[0.06] rounded-xl p-2.5 flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-[11px] text-purple-400 font-mono font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
            {t.metricBiomass}
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base font-bold text-white font-mono">
              {latestPoint?.biomass ?? 0}%
            </span>
            <span className="text-[10px] text-slate-400">масса</span>
          </div>
        </div>
      </div>

      {/* D3 SVG Chart Container */}
      <div ref={containerRef} className="relative w-full overflow-hidden bg-[#070b10] border border-white/[0.06] rounded-xl pt-2">
        <svg ref={svgRef} className="w-full block" />

        {/* Hover Inspection Callout */}
        {hoveredPoint && (
          <div className="absolute top-3 right-4 bg-[#0e141e]/95 backdrop-blur-md border border-white/15 rounded-xl px-3 py-2 shadow-xl text-[11px] font-mono pointer-events-none space-y-1">
            <div className="text-slate-300 font-bold flex items-center justify-between gap-4 border-b border-white/10 pb-1">
              <span>{t.hoursGrowth}: {hoveredPoint.hour}h (День {hoveredPoint.day})</span>
              <span className="text-emerald-400">pH: {hoveredPoint.ph}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 pt-0.5">
              <span className="text-emerald-400">N (Азот): <strong>{hoveredPoint.nAbsorption}%</strong></span>
              <span className="text-amber-400">P (Фосфор): <strong>{hoveredPoint.pAbsorption}%</strong></span>
              <span className="text-cyan-400">K (Калий): <strong>{hoveredPoint.kAbsorption}%</strong></span>
              <span className="text-lime-400">Здоровье: <strong>{hoveredPoint.health}%</strong></span>
              <span className="text-purple-400 col-span-2">Биомасса: <strong>{hoveredPoint.biomass}%</strong> (КПД: {hoveredPoint.uptakeEfficiency}%)</span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Legend Footer */}
      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-emerald-500 inline-block" />
            <span>N (Азот - вегетация)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-amber-500 inline-block" />
            <span>P (Фосфор - цветение)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-cyan-500 inline-block" />
            <span>K (Калий - смола/терпены)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-lime-500 inline-block" />
            <span>Здоровье растения</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-purple-400 inline-block border-b border-dashed" />
            <span>Кривая биомассы</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-slate-500">
          <span>Среда: {plant.medium === 'hydroponics' ? 'DWC Hydro' : 'Soil'}</span>
          <span>·</span>
          <span>Свет: {plant.lightWattage}W</span>
        </div>
      </div>
    </div>
  );
};
