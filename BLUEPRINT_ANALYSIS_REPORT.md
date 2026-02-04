# MegaScenario v3 Blueprint Analysis Report

## Blueprint Information

- **Name:** MegaScenario v3 (copy)
- **Source:** Make.com
- **Total Lines:** 9,433
- **File Size:** 758.9KB
- **Purpose:** Automated B2B lead qualification and personalized outreach email generation

---

## Executive Summary

This Make.com blueprint implements an advanced AI-driven pipeline that:
1. Reads leads from Google Sheets
2. Analyzes LinkedIn data using Gemini AI
3. Qualifies leads through multi-stage filtering (B2B → HIT → Person FIT → Feasibility)
4. Researches web signals using Perplexity AI
5. Generates messaging angles
6. Crafts personalized outreach emails in two variations (Lucas + Ale paths)
7. Applies final harmonization patch

---

## Statistics

| Metric | Count |
|--------|-------|
| Total Modules | 18 |
| Google Sheets Modules | 1 |
| Gemini AI Modules | 12 |
| Perplexity AI Modules | 1 |
| Routers | 2 |
| Placeholders | 2 |
| Filtered Modules | 6 |
| Total Routes | 4 |
| Max Nesting Depth | 2 levels |

---

## Module Types Breakdown

### 1. Google Sheets (1 module)
- **Module ID:** 1
- **Function:** `filterRows` - Read leads from spreadsheet
- **Configuration:**
  - Spreadsheet: `T10_1_master_simSilviu`
  - Sheet: `LP/C_Input`
  - Range: `A1:CZ1` (columns A-CZ)
  - Limit: 4 records
  - Filter: Column A > 0
  - Sort: Ascending

### 2. Gemini AI (12 modules)
- **Model:** `gemini-3-pro-preview`
- **Temperature:** 0.2 (consistent across all)
- **Response Type:** JSON (for most modules)
- **Thinking Budget:** 256-512 tokens

**Module Functions:**
1. **[194] Internal Signals Extractor** - Extract facts and inferences from LinkedIn JSON
2. **[205] Business Intel** - Analyze B2B presence and company fit
3. **[184] Person Understanding** - Evaluate decision-maker fit
4. **[189] Feasibility** - Check outreach feasibility
5. **[199] Base Angle** - Generate base messaging angle
6. **[196] Angle Synthesizer** - Synthesize multiple angles
7. **[197] Angle Checker** - Validate angle quality
8. **[216] Crafter Architect (Lucas-1)** - Design Lucas email structure
9. **[203] Crafter Harmonizer (Lucas-2)** - Harmonize Lucas email
10. **[211] Crafter Architect (Ale-2)** - Design Ale email structure
11. **[212] Crafter Harmonizer (Ale-1)** - Harmonize Ale email
12. **[221] Crafter Patch** - Final patch combining both variations

### 3. Perplexity AI (1 module)
- **Module ID:** 195
- **Model:** `sonar`
- **Function:** Web research for internal/external signals
- **Web Search Context:** Medium
- **Triggered:** Only for Feasibility FIT leads

### 4. Routers (2 modules)

#### Router 208 - COMPANY B2B Filter
- **Entry Condition:** `{{205.result.b2b_presence.status}} == YES`
- **Routes:** 2
  - Route 1: B2B companies → Continue processing
  - Route 2: STORAGE → Placeholder

#### Router 225 - Research Router
- **Entry Condition:** None (processes all from Router 208)
- **Routes:** 2
  - Route 1: Main processing path
  - Route 2: Empty route

---

## Filter Conditions

| Module | Filter Name | Condition | Purpose |
|--------|-------------|-----------|---------|
| 208 | COMPANY B2B | `{{205.result.b2b_presence.status}} == YES` | Only process B2B companies |
| 184 | COMPANY HIT | `{{205.result.hit_filter.verdict}} == HIT` | Only process HIT companies (not STORAGE) |
| 189 | PERSON FIT | `{{184.result.Decision-Maker.decision_maker_fit}} == FIT` | Only process leads with FIT decision-makers |
| 195 | Feasibility FIT | `{{189.result.final_verdict.result}} == FIT` | Only research FIT feasibility leads |
| Placeholder 1 | Feasibility no-FIT | `{{189.result.final_verdict.result}} != FIT` | Fallback for non-FIT leads |
| Placeholder 2 | COMPANY STORAGE | `{{205.result.hit_filter.verdict}} == STORAGE` | Fallback for STORAGE companies |

---

## Connection IDs

| Connection ID | Service | Account/Usage |
|---------------|---------|---------------|
| 6927252 | Google Sheets | lucascaves11@gmail.com |
| 13301844 | Gemini AI | Used by all 12 Gemini modules |
| 13314140 | Perplexity AI | Used by module 195 |

---

## Workflow Stages

### Stage 1: DATA SOURCE
**Modules:** [1]

Fetch leads from Google Sheets with filtering (limit 4 records, column A > 0).

### Stage 2: INITIAL ANALYSIS
**Modules:** [194, 205]

- **[194]** Extract internal signals from LinkedIn JSON
- **[205]** Analyze business intelligence and B2B presence

### Stage 3: QUALIFICATION
**Modules:** [208, 184, 189]

- **[208]** Router filters by B2B presence
- **[184]** Evaluate decision-maker fit (HIT companies only)
- **[189]** Check outreach feasibility (FIT decision-makers only)

### Stage 4: RESEARCH
**Modules:** [225, 195]

- **[225]** Router directs to research path
- **[195]** Perplexity web search for internal/external signals (FIT leads only)

### Stage 5: ANGLE GENERATION
**Modules:** [199, 196, 197]

- **[199]** Generate base messaging angle
- **[196]** Synthesize angles using all context
- **[197]** Check and validate angle quality

### Stage 6: EMAIL CRAFTING
**Modules:** [216, 203, 211, 212, 221]

**Lucas Path:**
- **[216]** Crafter Architect (Lucas-1) - Design email structure
- **[203]** Crafter Harmonizer (Lucas-2) - Harmonize email

**Ale Path:**
- **[211]** Crafter Architect (Ale-2) - Design email structure
- **[212]** Crafter Harmonizer (Ale-1) - Harmonize email

**Final:**
- **[221]** Crafter Patch - Combine both variations

---

## Data Flow Chains

### Chain 1: Main Qualification Flow
```
[1] Sheets → [194] Signals → [205] Intel → [208] Router → [184] Person → [189] Feasibility
```

### Chain 2: Angle Development (FIT leads)
```
[189] Feasibility → [225] Router → [195] Research → [199] Base → [196] Synthesizer → [197] Checker
```

### Chain 3: Email Generation - Lucas Variation
```
[197] Checker → [216] Architect → [203] Harmonizer
```

### Chain 4: Email Generation - Ale Variation
```
[197] Checker → [211] Architect → [212] Harmonizer
```

### Chain 5: Final Patch
```
[203] Lucas + [212] Ale → [221] Patch
```

---

## Module Dependency Graph

| Module ID | Module Name | Depends On |
|-----------|-------------|------------|
| 1 | Google Sheets | (none - source) |
| 194 | Internal Signals Extractor | 1 |
| 205 | Business Intel | 1, 194 |
| 208 | Router (B2B) | 205 |
| 184 | Person Understanding | 1, 194, 205 |
| 189 | Feasibility | 1, 184, 194, 205 |
| 225 | Router (Research) | (all from 189) |
| 195 | Signals Research | 1, 184, 189, 205 |
| 199 | Base Angle | 184, 189, 194, 195, 205 |
| 196 | Angle Synthesizer | 1, 184, 189, 194, 195, 205 |
| 197 | Angle Checker | 184, 189, 196, 199 |
| 216 | Crafter Architect (Lucas) | 1, 184, 189, 196, 197, 199, 205 |
| 203 | Crafter Harmonizer (Lucas) | 1, 216 |
| 211 | Crafter Architect (Ale) | 1, 184, 189, 196, 197, 199 |
| 212 | Crafter Harmonizer (Ale) | 1, 211 |
| 221 | Crafter Patch | 184, 194, 203, 212 |

---

## Visual Flow Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ STAGE 1: DATA SOURCE                                                │
└─────────────────────────────────────────────────────────────────────┘
[1] Google Sheets: Filter Rows
    ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STAGE 2: INITIAL ANALYSIS                                           │
└─────────────────────────────────────────────────────────────────────┘
[194] Gemini: Internal Signals Extractor
    ↓
[205] Gemini: Business Intel
    ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STAGE 3: QUALIFICATION                                              │
└─────────────────────────────────────────────────────────────────────┘
[208] ROUTER (COMPANY B2B filter)
    ├─── Route 1: B2B = YES ───┐
    │                           ↓
    │                    [184] Gemini: Person Understanding
    │                           │ (filter: COMPANY HIT)
    │                           ↓
    │                    [189] Gemini: Feasibility
    │                           │ (filter: PERSON FIT)
    │                           ↓
    └─── Route 2: STORAGE ───→ [Placeholder]

┌─────────────────────────────────────────────────────────────────────┐
│ STAGE 4: RESEARCH                                                   │
└─────────────────────────────────────────────────────────────────────┘
[225] ROUTER (no entry filter)
    ├─── Route 1 ───────────────┐
    │                            ↓
    │                     [195] Perplexity: Signals Research
    │                            │ (filter: Feasibility FIT)
    │                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STAGE 5: ANGLE GENERATION                                           │
└─────────────────────────────────────────────────────────────────────┘
                             [199] Gemini: Base Angle
                                 ↓
                             [196] Gemini: Angle Synthesizer
                                 ↓
                             [197] Gemini: Angle Checker
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STAGE 6: EMAIL CRAFTING                                             │
└─────────────────────────────────────────────────────────────────────┘
                             ┌───────┴───────┐
                             ↓               ↓
                    LUCAS PATH           ALE PATH
                             ↓               ↓
            [216] Crafter Architect  [211] Crafter Architect
                             ↓               ↓
            [203] Crafter Harmonizer [212] Crafter Harmonizer
                             ↓               ↓
                             └───────┬───────┘
                                     ↓
                             [221] Crafter Patch
                                     ↓
                                  OUTPUT
```

---

## Canvas Layout (Make.com Designer Coordinates)

| Module | Position (x, y) |
|--------|-----------------|
| 1 - Google Sheets | (0, 0) |
| 194 - Signals Extractor | (308, 7) |
| 205 - Business Intel | (600, 4) |
| 208 - Router B2B | (926, 7) |
| 184 - Person Understanding | (1260, 10) |
| 189 - Feasibility | (1584, 5) |
| 225 - Router Research | (1886, 9) |
| 195 - Perplexity Signals | (2268, -1) |
| 199 - Base Angle | (2558, 7) |
| 196 - Angle Synthesizer | (2866, 5) |
| 197 - Angle Checker | (3166, 5) |
| 216 - Crafter Lucas-1 | (3526, -1) |
| 203 - Crafter Lucas-2 | (4069, -10) |
| 211 - Crafter Ale-2 | (4575, -12) |
| 212 - Crafter Ale-1 | (5065, -12) |
| 221 - Crafter Patch | (5540, -14) |
| Placeholder (no-FIT) | (1890, -362) |
| Placeholder (STORAGE) | (928, -339) |

**Observation:** The main flow moves from left to right (x: 0 → 5540), with branching occurring at routers. Placeholders are positioned below the main flow (negative y coordinates).

---

## Key Insights for AOS Studio Import

### 1. Sequential Processing
The workflow is primarily sequential with conditional branching at two key points:
- Router 208: Filters by B2B presence
- Router 225: No entry filter, but internal modules have filters

### 2. Multi-Stage Filtering
Leads go through a funnel:
1. B2B companies only
2. HIT verdict only (not STORAGE)
3. Decision-maker FIT only
4. Feasibility FIT only (for research)

### 3. Dual-Path Email Generation
Two parallel email variations (Lucas + Ale) are generated and then combined in a final patch module. This suggests:
- Testing different messaging approaches
- A/B testing capability
- Quality enhancement through multiple drafts

### 4. Heavy Gemini AI Usage
12 out of 18 modules use Gemini AI, indicating this is a heavily AI-driven workflow focused on:
- Signal extraction
- Analysis and qualification
- Content generation

### 5. Web Research Integration
Perplexity AI is used strategically only for leads that pass all filters, conserving API costs and focusing research on high-quality leads.

### 6. Structured JSON Responses
Most Gemini modules are configured to return JSON responses, enabling programmatic processing of AI outputs in downstream modules.

---

## Recommended AOS Studio Import Strategy

1. **Create Node Types:**
   - GoogleSheetsSource
   - GeminiProcessor
   - PerplexityResearch
   - Router
   - Placeholder

2. **Map Connections:**
   - Extract connection IDs and map to AOS credentials system
   - Create connection profiles for Google, Gemini, Perplexity

3. **Preserve Module References:**
   - All `{{module_id.field}}` references must be converted to AOS data flow syntax
   - Maintain dependency graph to ensure proper execution order

4. **Implement Filters:**
   - Convert Make.com filter conditions to AOS filter syntax
   - Preserve all filter logic (6 filtered modules)

5. **Router Logic:**
   - Implement conditional branching for 2 routers
   - Create route paths with proper filtering

6. **Canvas Layout:**
   - Use Make.com coordinates to preserve visual layout
   - Maintain horizontal left-to-right flow pattern

---

## Conclusion

This blueprint represents a sophisticated multi-stage AI pipeline for B2B outreach automation. The workflow demonstrates:

- **Intelligent filtering** to focus on high-quality leads
- **Multi-AI integration** leveraging Gemini and Perplexity strengths
- **Structured approach** to angle generation and email crafting
- **Quality assurance** through checkers and harmonizers
- **Dual-path strategy** for testing and optimization

The structure is well-suited for conversion to AOS Studio's node-based architecture, with clear dependencies, filters, and data flow patterns.
