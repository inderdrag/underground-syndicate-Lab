import React, { useState } from 'react';
import { Copy, Check, Download, Code2, Monitor, Smartphone, Database, Layers, Sparkles } from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language, translations } from '../i18n/translations';

interface NativeEngineStudioProps {
  language: Language;
}

export const NativeEngineStudio: React.FC<NativeEngineStudioProps> = ({ language }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'unity_cs' | 'godot_gd' | 'unity_shader' | 'godot_shader' | 'sqlite' | 'scene_tree'>('unity_cs');
  const [copied, setCopied] = useState<boolean>(false);

  const fileContents = {
    unity_cs: `// ============================================================================
// File: EconomyEngine.cs
// Target Engine: Unity 2022.3+ LTS / Unity 6 (C#)
// Platforms: Windows Standalone (.EXE) & Android (.APK)
// Description: Dynamic local market economy, price volatility, risk factors,
//              three-tier distribution channels, and daily upkeep deductions.
// Dependencies: System.Data.SQLite / Mono.Data.Sqlite (Encrypted local DB)
// ============================================================================

using System;
using System.Collections.Generic;
using UnityEngine;

namespace UndergroundSyndicate.Economy
{
    [Serializable]
    public enum DistributionChannel
    {
        StreetDealers,   // High bust risk, instant cash, low volume
        DarknetMarket,   // Medium risk, crypto (BTC/XMR), delayed dead-drops
        WholesaleCartel  // Low personal risk, strict high volume quotas & >=90% purity
    }

    [Serializable]
    public class MarketProduct
    {
        public string id;
        public string name;
        public float basePrice;
        public float currentPrice;
        public float marketSaturation; // 0.0 to 1.0 (scarcity indicator)
    }

    public class EconomyEngine : MonoBehaviour
    {
        public static EconomyEngine Instance { get; private set; }

        [Header("Player Financial State (Local Encrypted)")]
        [SerializeField] private double _cashBalance = 3800.0;
        [SerializeField] private double _moneroBalance = 2.85;
        [SerializeField] private double _bitcoinBalance = 0.045;

        [Header("Law Enforcement Risk")]
        [Range(0f, 100f)]
        [SerializeField] private float _policeHeat = 12f;
        [SerializeField] private bool _hasLawyerRetainer = false;

        [Header("Infrastructure & Power Grid")]
        [SerializeField] private int _installedSolarWattage = 400; // 400W per panel
        [SerializeField] private int _carbonScrubbers = 2;

        public event Action<double> OnCashChanged;
        public event Action<float> OnHeatChanged;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
            DontDestroyOnLoad(gameObject);
        }

        /// <summary>
        /// Dynamic Market Pricing Algorithm:
        /// Volatility is driven by local market saturation, police heat risk premium,
        /// and batch purity/potency multiplier.
        /// </summary>
        public float CalculateDynamicPrice(MarketProduct product, float batchPurity)
        {
            float scarcityBonus = (1.0f - Mathf.Clamp01(product.marketSaturation)) * 0.45f;
            float policeRiskPremium = (_policeHeat / 100.0f) * 0.35f;
            float qualityMultiplier = 0.70f + (Mathf.Clamp01(batchPurity) * 0.40f);

            float dynamicPrice = product.basePrice * (1.0f + scarcityBonus + policeRiskPremium) * qualityMultiplier;
            return Mathf.Round(dynamicPrice * 100f) / 100f;
        }

        /// <summary>
        /// Street Dealer transaction execution
        /// Instant cash payout, but adds direct police heat based on batch volume.
        /// </summary>
        public bool ExecuteStreetSale(MarketProduct product, float volumeGrams, float purity, out double cashEarned)
        {
            cashEarned = 0;
            if (volumeGrams <= 0) return false;

            float unitPrice = CalculateDynamicPrice(product, purity);
            cashEarned = (double)unitPrice * volumeGrams;
            _cashBalance += cashEarned;

            // Street arrest risk calculation
            float addedHeat = 3.0f + (volumeGrams * 0.15f);
            if (_hasLawyerRetainer) addedHeat *= 0.5f;
            _policeHeat = Mathf.Clamp(_policeHeat + addedHeat, 0f, 100f);

            OnCashChanged?.Invoke(_cashBalance);
            OnHeatChanged?.Invoke(_policeHeat);
            return true;
        }

        /// <summary>
        /// Darknet Market order delivery
        /// Settled in privacy cryptocurrency (Monero / Bitcoin) with delayed dead-drop.
        /// </summary>
        public void FulfillDarknetOrder(float xmrPayout, float btcPayout)
        {
            _moneroBalance += xmrPayout;
            _bitcoinBalance += btcPayout;
            // Medium risk profile
            _policeHeat = Mathf.Clamp(_policeHeat + 1.5f, 0f, 100f);
            OnHeatChanged?.Invoke(_policeHeat);
        }

        /// <summary>
        /// Daily facility deductions (Midnight Simulation Tick)
        /// Lease rent, municipal electricity, staff salaries, lawyer retainer.
        /// </summary>
        public void ProcessDailyMidnightUpkeep(int totalApparatusWatts, int trimmers, int chemists, int couriers)
        {
            const double baseRent = 350.0;
            
            // Power grid spike check
            int gridWatts = Mathf.Max(0, totalApparatusWatts - _installedSolarWattage);
            double dailyKwh = (gridWatts * 24.0) / 1000.0;
            double electricityCost = dailyKwh * 0.18; // $0.18/kWh

            // If grid draw exceeds 1800W threshold, municipal utility telemetry flags police
            if (gridWatts > 1800)
            {
                float spikeHeat = (gridWatts - 1800) * 0.005f;
                _policeHeat = Mathf.Clamp(_policeHeat + spikeHeat, 0f, 100f);
            }

            double payroll = (trimmers * 85.0) + (chemists * 190.0) + (couriers * 115.0);
            double lawyerCost = _hasLawyerRetainer ? 200.0 : 0.0;

            double totalUpkeep = baseRent + electricityCost + payroll + lawyerCost;
            _cashBalance -= totalUpkeep;

            OnCashChanged?.Invoke(_cashBalance);
            OnHeatChanged?.Invoke(_policeHeat);
        }
    }
}`,

    godot_gd: `# ============================================================================
# File: economy_engine.gd
# Target Engine: Godot 4.2+ (GDScript)
# Platforms: Windows Desktop (.exe) & Android (.apk via Android Build Template)
# Architecture: Native SQLite local database persistence (No Web / Electron)
# ============================================================================

class_name EconomyEngine
extends Node

signal cash_updated(new_balance: float)
signal heat_updated(new_heat: float)

@export var cash_balance: float = 3800.0
@export var monero_balance: float = 2.85
@export var bitcoin_balance: float = 0.045
@export_range(0.0, 100.0) var police_heat: float = 12.0
@export var has_lawyer_retainer: bool = false
@export var solar_capacity_watts: int = 400

# Dynamic pricing formula matching native specifications
func calculate_price(base_price: float, saturation: float, purity: float) -> float:
	var scarcity_bonus: float = (1.0 - clampf(saturation, 0.0, 1.0)) * 0.45
	var risk_premium: float = (police_heat / 100.0) * 0.35
	var quality_multiplier: float = 0.70 + (clampf(purity, 0.0, 1.0) * 0.40)
	
	var final_price: float = base_price * (1.0 + scarcity_bonus + risk_premium) * quality_multiplier
	return snappedf(final_price, 0.01)

# Street dealer distribution
func execute_street_sale(base_price: float, saturation: float, volume_grams: float, purity: float) -> Dictionary:
	var unit_price: float = calculate_price(base_price, saturation, purity)
	var payout: float = unit_price * volume_grams
	cash_balance += payout
	
	var heat_delta: float = 3.0 + (volume_grams * 0.15)
	if has_lawyer_retainer:
		heat_delta *= 0.5
	police_heat = clampf(police_heat + heat_delta, 0.0, 100.0)
	
	cash_updated.emit(cash_balance)
	heat_updated.emit(police_heat)
	return {"payout": payout, "heat_added": heat_delta}

# Daily midnight deduction routine
func process_daily_upkeep(apparatus_watts: int, trimmers: int, chemists: int, couriers: int) -> float:
	var base_rent: float = 350.0
	var grid_watts: int = maxi(0, apparatus_watts - solar_capacity_watts)
	var daily_kwh: float = (grid_watts * 24.0) / 1000.0
	var power_cost: float = daily_kwh * 0.18
	
	# Power grid anomaly police alert
	if grid_watts > 1800:
		police_heat = clampf(police_heat + ((grid_watts - 1800) * 0.005), 0.0, 100.0)
		heat_updated.emit(police_heat)
		
	var payroll: float = (trimmers * 85.0) + (chemists * 190.0) + (couriers * 115.0)
	var lawyer: float = 200.0 if has_lawyer_retainer else 0.0
	var total_deduction: float = base_rent + power_cost + payroll + lawyer
	
	cash_balance -= total_deduction
	cash_updated.emit(cash_balance)
	return total_deduction
`,

    unity_shader: `// ============================================================================
// File: DrugEffectShaders.shader
// Target Engine: Unity URP (Universal Render Pipeline) / Full Screen Blit
// Language: HLSL
// Description: Multi-mode ingestion shader covering White Widow, Amnesia Haze,
//              Gorilla Glue #4, Purple Haze, Psilocybin, and LSD-25.
// ============================================================================

Shader "UndergroundSyndicate/DrugEffectShaders"
{
    Properties
    {
        _MainTex ("Source Texture", 2D) = "white" {}
        _EffectMode ("Effect Mode (0:WhiteWidow, 1:Amnesia, 2:Gorilla, 3:Purple, 4:Psilocybin, 5:LSD)", Int) = 0
        _Intensity ("Effect Intensity", Range(0, 1)) = 1.0
        _VignetteSoftness ("Fog Vignette Softness", Range(0.1, 1.0)) = 0.5
        _InversionCycle ("LSD Color Inversion State", Float) = 0.0
    }

    SubShader
    {
        Tags { "RenderType"="Opaque" "RenderPipeline"="UniversalPipeline" }
        ZTest Always ZWrite Off Cull Off

        Pass
        {
            HLSLPROGRAM
            #pragma vertex Vert
            #pragma fragment Frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            struct Attributes {
                float4 positionOS : POSITION;
                float2 uv : TEXCOORD0;
            };

            struct Varyings {
                float4 positionCS : SV_POSITION;
                float2 uv : TEXCOORD0;
            };

            TEXTURE2D(_MainTex);
            SAMPLER(sampler_MainTex);

            int _EffectMode;
            float _Intensity;
            float _VignetteSoftness;
            float _InversionCycle;

            Varyings Vert(Attributes input) {
                Varyings output;
                output.positionCS = TransformObjectToHClip(input.positionOS.xyz);
                output.uv = input.uv;
                return output;
            }

            // 6-fold radial kaleidoscope mapping for LSD-25
            float2 Kaleidoscope(float2 uv, float segments) {
                float2 centered = uv - 0.5;
                float angle = atan2(centered.y, centered.x);
                float radius = length(centered);
                float seg = 6.2831853 / segments;
                angle = abs(fmod(angle, seg) - seg * 0.5);
                return float2(cos(angle), sin(angle)) * radius + 0.5;
            }

            float4 Frag(Varyings input) : SV_Target
            {
                float2 uv = input.uv;
                float time = _Time.y;

                // Mode 0: White Widow (Fog vignette & time dilation soft haze)
                if (_EffectMode == 0) {
                    float dist = distance(uv, float2(0.5, 0.5));
                    float vignette = smoothstep(0.3, 0.75, dist) * _Intensity;
                    float4 col = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, uv);
                    return lerp(col, float4(0.92, 0.96, 1.0, 1.0), vignette * 0.45);
                }

                // Mode 1: Amnesia Haze (High brightness exposure flare)
                if (_EffectMode == 1) {
                    float4 col = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, uv);
                    col.rgb *= 1.0 + (0.35 * _Intensity);
                    col.rgb += float3(0.08, 0.06, 0.0) * _Intensity; // Citrus sativa warmth
                    return col;
                }

                // Mode 2: Gorilla Glue #4 (Couch-Lock edge blur & peripheral sedation)
                if (_EffectMode == 2) {
                    float dist = distance(uv, float2(0.5, 0.5));
                    float blurEdge = smoothstep(0.25, 0.7, dist) * _Intensity;
                    float2 sway = float2(sin(time * 0.8), cos(time * 0.6)) * 0.004 * blurEdge;
                    float4 col = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, uv + sway);
                    return lerp(col, col * 0.65, blurEdge * 0.6);
                }

                // Mode 3: Purple Haze (Ultraviolet magenta grade & spectral shift)
                if (_EffectMode == 3) {
                    float4 col = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, uv);
                    float3 purpleTint = float3(col.r * 1.35, col.g * 0.75, col.b * 1.5);
                    return float4(lerp(col.rgb, purpleTint, _Intensity), col.a);
                }

                // Mode 4: Psilocybin Mushrooms (Sine-wave vertex melting & RGB chromatic split)
                if (_EffectMode == 4) {
                    float waveOffset = sin(uv.y * 12.0 + time * 3.0) * 0.015 * _Intensity;
                    float2 distortedUV = uv + float2(waveOffset, 0.0);

                    // Chromatic aberration RGB split
                    float r = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, distortedUV + float2(0.008 * _Intensity, 0)).r;
                    float g = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, distortedUV).g;
                    float b = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, distortedUV - float2(0.008 * _Intensity, 0)).b;
                    return float4(r, g, b, 1.0);
                }

                // Mode 5: LSD-25 (Kaleidoscope + 5-second color inversion)
                if (_EffectMode == 5) {
                    float2 kUV = Kaleidoscope(uv, 6.0);
                    float4 col = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, kUV);
                    if (_InversionCycle > 0.5) {
                        col.rgb = 1.0 - col.rgb;
                    }
                    col.rgb = lerp(col.rgb, float3(col.b, col.r, col.g), 0.35 * _Intensity);
                    return col;
                }

                return SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, uv);
            }
            ENDHLSL
        }
    }
}`,

    godot_shader: `// ============================================================================
// File: drug_effects.gdshader
// Target Engine: Godot 4.2+ (CanvasItem Shader for Viewport / CanvasLayer)
// ============================================================================

shader_type canvas_item;

uniform sampler2D screen_texture : hint_screen_texture, filter_linear_mipmap;
uniform int effect_mode : hint_range(0, 5) = 0;
uniform float intensity : hint_range(0.0, 1.0) = 1.0;
uniform bool lsd_invert = false;

vec2 kaleidoscope(vec2 uv, float segments) {
	vec2 c = uv - 0.5;
	float a = atan(c.y, c.x);
	float r = length(c);
	float seg = 6.2831853 / segments;
	a = abs(mod(a, seg) - seg * 0.5);
	return vec2(cos(a), sin(a)) * r + 0.5;
}

void fragment() {
	vec2 uv = SCREEN_UV;
	
	if (effect_mode == 0) {
		// White Widow: Frost fog vignette
		float d = distance(uv, vec2(0.5));
		float vig = smoothstep(0.3, 0.75, d) * intensity;
		vec4 col = texture(screen_texture, uv);
		COLOR = mix(col, vec4(0.92, 0.96, 1.0, 1.0), vig * 0.45);
	}
	else if (effect_mode == 1) {
		// Amnesia Haze: High brightness
		vec4 col = texture(screen_texture, uv);
		col.rgb *= 1.0 + (0.35 * intensity);
		COLOR = col;
	}
	else if (effect_mode == 4) {
		// Psilocybin: Sine wave melting + Chromatic RGB split
		float wave = sin(uv.y * 14.0 + TIME * 3.5) * 0.015 * intensity;
		vec2 warp_uv = uv + vec2(wave, 0.0);
		float r = texture(screen_texture, warp_uv + vec2(0.008 * intensity, 0.0)).r;
		float g = texture(screen_texture, warp_uv).g;
		float b = texture(screen_texture, warp_uv - vec2(0.008 * intensity, 0.0)).b;
		COLOR = vec4(r, g, b, 1.0);
	}
	else if (effect_mode == 5) {
		// LSD-25: 6-fold kaleidoscope + inversion cycle
		vec2 k_uv = kaleidoscope(uv, 6.0);
		vec4 col = texture(screen_texture, k_uv);
		if (lsd_invert) {
			col.rgb = 1.0 - col.rgb;
		}
		COLOR = col;
	}
	else {
		COLOR = texture(screen_texture, uv);
	}
}`,

    sqlite: `-- ============================================================================
-- File: schema.sql
-- Local Encrypted SQLite Database Schema (No Cloud / Server Dependencies)
-- Target: SQLite 3.40+ (SQLCipher AES-256 local encrypted file)
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_finances (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    cash_balance REAL NOT NULL DEFAULT 3800.0,
    monero_balance REAL NOT NULL DEFAULT 2.85,
    bitcoin_balance REAL NOT NULL DEFAULT 0.045,
    police_heat REAL NOT NULL DEFAULT 12.0,
    lawyer_active INTEGER NOT NULL DEFAULT 0,
    current_day INTEGER NOT NULL DEFAULT 1,
    current_hour INTEGER NOT NULL DEFAULT 8
);

CREATE TABLE IF NOT EXISTS plant_cultivations (
    id TEXT PRIMARY KEY,
    strain_id TEXT NOT NULL,
    growth_stage TEXT NOT NULL,
    progress_percent REAL NOT NULL DEFAULT 0.0,
    health_percent REAL NOT NULL DEFAULT 100.0,
    purity_rating REAL NOT NULL DEFAULT 90.0,
    medium_type TEXT NOT NULL DEFAULT 'soil',
    light_wattage INTEGER NOT NULL DEFAULT 600,
    smell_units INTEGER NOT NULL DEFAULT 10
);

CREATE TABLE IF NOT EXISTS mycology_batches (
    id TEXT PRIMARY KEY,
    strain_name TEXT NOT NULL DEFAULT 'Golden Teacher',
    current_stage TEXT NOT NULL, -- sterilization, inoculation, incubation, fruiting
    progress_percent REAL NOT NULL DEFAULT 0.0,
    autoclave_psi REAL NOT NULL DEFAULT 15.0,
    contamination_risk REAL NOT NULL DEFAULT 5.0,
    is_contaminated INTEGER NOT NULL DEFAULT 0,
    target_yield_grams REAL NOT NULL DEFAULT 280.0
);

CREATE TABLE IF NOT EXISTS synthesis_batches (
    id TEXT PRIMARY KEY,
    product_name TEXT NOT NULL DEFAULT 'LSD-25',
    reaction_stage TEXT NOT NULL, -- precursor, reaction, purification, dosing
    progress_percent REAL NOT NULL DEFAULT 0.0,
    safelight_enabled INTEGER NOT NULL DEFAULT 1,
    purity_rating REAL NOT NULL DEFAULT 98.0,
    dosed_sheets_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS distribution_orders (
    id TEXT PRIMARY KEY,
    channel_type TEXT NOT NULL, -- street, darknet, cartel
    buyer_alias TEXT NOT NULL,
    item_key TEXT NOT NULL,
    volume_units REAL NOT NULL,
    payout_cash REAL,
    payout_crypto REAL,
    is_fulfilled INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`,

    scene_tree: `# ============================================================================
# Native UI Scene Tree Architecture
# Target: Windows Desktop (1920x1080) & Android (Touch Inputs, Scaled Virtual Canvas)
# ============================================================================

## 1. Unity UI Toolkit Hierarchy (Windows .EXE & Android .APK)
RootVisualElement (UIDocument)
├── OverlayShaderBlitContainer (Full-Screen Render Texture Blit)
│   └── IngestionPostProcessVolume (Custom URP Post Process Component)
├── MainHUDCanvas (Dynamic DPI Scaler 1080p Desktop / 720p Android Touch)
│   ├── TopStatusBar (Safe Area Padding, Tabular Currency & Heat Meter)
│   │   ├── BrandWordmark ("Underground Syndicate")
│   │   ├── NavSegmentedControl (Botany, Mycology, Synthesis, Market, Upkeep)
│   │   ├── StrategicStrip (Cash, XMR, BTC, Police Heat Bar, Grid Wattage)
│   │   └── IngestionTripAbortButton
│   ├── ContentViewport (Touch Scrollable on Android / Virtual Wheel Desktop)
│   │   ├── BotanyGrowTentView (Plant Grid + NPK Sliders + Carbon Filters)
│   │   ├── MycologyCleanRoomView (Autoclave + SAB Chamber + Fruiting Monotub)
│   │   ├── SynthesisLabView (Reflux Condenser + Safelight Column + Blotter Art)
│   │   ├── MarketHubView (Street Hand-off, Tor Darknet Escrow, Cartel Contracts)
│   │   └── OperationsView (Lease Rent, Solar Array, Payroll, Bribes)
│   └── AndroidVirtualTouchBar (Visible only when Application.isMobilePlatform)
│       └── ThumbQuickShortcuts (Lab Quick-Inspect, Heat Emergency Call)

## 2. Godot 4 Control Node Tree (.exe / .apk)
Control (name: "GameRoot", layout: Full Rect)
├── SubViewportContainer (Stretch: true)
│   └── SubViewport
│       └── Camera2D (with Screen-Shake & Drug Shaders attached)
├── CanvasLayer (name: "UILayer")
│   └── MarginContainer (Theme Overrides: Safe Area Margin)
│       └── VBoxContainer
│           ├── PanelContainer (name: "TopNavHeader")
│           ├── HBoxContainer (name: "MetricBar")
│           └── TabContainer (name: "PhaseViewports")
│               ├── ScrollContainer (name: "BotanyTab")
│               ├── ScrollContainer (name: "MycologyTab")
│               ├── ScrollContainer (name: "SynthesisTab")
│               ├── ScrollContainer (name: "MarketTab")
│               └── ScrollContainer (name: "UpkeepTab")
└── CanvasLayer (name: "PostProcessLayer", follow_viewport: false)
    └── ColorRect (Material: drug_effects.gdshader, Mouse Filter: Ignore)
`
  };

  const handleCopy = () => {
    sounds.playClick();
    navigator.clipboard.writeText(fileContents[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    sounds.playClick();
    const content = fileContents[activeTab];
    const filename =
      activeTab === 'unity_cs'
        ? 'EconomyEngine.cs'
        : activeTab === 'godot_gd'
        ? 'economy_engine.gd'
        : activeTab === 'unity_shader'
        ? 'DrugEffectShaders.shader'
        : activeTab === 'godot_shader'
        ? 'drug_effects.gdshader'
        : activeTab === 'sqlite'
        ? 'schema.sql'
        : 'native_scene_tree.md';

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>{t.studioBadge1}</span>
            <span aria-hidden="true">·</span>
            <span>{t.studioBadge2}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
            {t.studioTitle}
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed font-medium">
            {t.studioDesc}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? t.copiedSuccess : t.copyCode}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>{t.downloadFile}</span>
          </button>
        </div>
      </div>

      {/* Architecture Highlights Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-neutral-300 font-mono font-semibold">
            <Monitor className="w-4 h-4 text-emerald-400" />
            <span>{t.desktopTarget}</span>
          </div>
          <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
            {t.desktopTargetDesc}
          </p>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-neutral-300 font-mono font-semibold">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>{t.androidTarget}</span>
          </div>
          <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
            {t.androidTargetDesc}
          </p>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-neutral-300 font-mono font-semibold">
            <Database className="w-4 h-4 text-amber-400" />
            <span>{t.sqliteTarget}</span>
          </div>
          <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
            {t.sqliteTargetDesc}
          </p>
        </div>
      </div>

      {/* Code Viewer Panel */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {/* File Tabs */}
        <div className="flex items-center overflow-x-auto border-b border-neutral-800 bg-neutral-950 px-2 py-1 gap-1 text-xs font-mono">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('unity_cs');
            }}
            className={`px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'unity_cs'
                ? 'bg-neutral-800 text-emerald-400 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            EconomyEngine.cs (Unity C#)
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('godot_gd');
            }}
            className={`px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'godot_gd'
                ? 'bg-neutral-800 text-cyan-400 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            economy_engine.gd (Godot)
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('unity_shader');
            }}
            className={`px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'unity_shader'
                ? 'bg-neutral-800 text-amber-400 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            DrugEffectShaders.shader (HLSL)
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('godot_shader');
            }}
            className={`px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'godot_shader'
                ? 'bg-neutral-800 text-purple-400 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            drug_effects.gdshader (Godot)
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('sqlite');
            }}
            className={`px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'sqlite'
                ? 'bg-neutral-800 text-emerald-300 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            schema.sql (SQLite Cipher)
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('scene_tree');
            }}
            className={`px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'scene_tree'
                ? 'bg-neutral-800 text-neutral-100 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Scene_Trees.md
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-neutral-950 font-mono text-xs text-neutral-300 overflow-x-auto max-h-[580px] leading-relaxed">
          <pre>{fileContents[activeTab]}</pre>
        </div>
      </div>
    </div>
  );
};
