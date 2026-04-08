# F.A.C.T.S Investment System

## 🎯 Overview
A 5-step value investing framework by Brandon Wong. Use when analyzing individual stocks, building portfolios, or making investment decisions.

## System Flow
```
Find → Assess → Calculate → Track → Savings
```

---

## Step 1: F - Find (寻找股票)

### 5 Discovery Methods
1. **街邊 Main Street** - Observe popular brands in daily life (stores, restaurants, products)
2. **新聞 News** - Track news for business trends, earnings reports, market moves
3. **朋友 Friends** - Get stock tips from trusted friends
4. **大師 Track Guru** - Follow legendary investors (Buffett, Munger, Lynch, etc.)
5. **篩選 Screener** - Use online stock screeners with filters

### Recommended Screeners
- **US Stocks:** [Finviz Screener](https://finviz.com/screener.ashx?v=111&f=fa_debteq_u0.5,fa_pe_low,fa_roe_o10&ft=2)
- **Malaysia:** [Bursa Marketplace](http://www.bursamarketplace.com/mkt/tools/screener)
- **Singapore:** [SGX Screener](https://www2.sgx.com/securities/stock-screener)
- **Global:** [Jitta](https://www.jitta.com/home)
- **Dividends:** [DividendYields.org](https://www.dividendyields.org/)

---

## Step 2: A - Assess (评估)

### 10-Point Check List (E.F.R.I.E.N.D.S.K.)
Each item scores 1 point. Total = /10

| Letter | Metric | Condition | Score |
|--------|--------|-----------|-------|
| **E** | EPS Consistency | Stable/growing for 10 years | 0.5-1 |
| **F** | Free Cash Flow | Positive for 10 years | 0.5-1 |
| **R** | Return on Equity | ROE > 15% consistently for 10 years | 0.5-1 |
| **I** | Interest Coverage | EBIT/Interest: >10 = strong, >4 = OK | 0.5-1 |
| **E** | Economic Moat | See Moat Types below | 0.5-4 |
| **N** | Net Margin | >10% recent years and increasing | 0.5-1 |
| **D** | Dividends | Pays dividends to investors | 0.5-1 |
| **A** | Authority Risk | Government policy risk? Low = good | -1 to +1 |
| **S** | Science/Tech Risk | Tech disruption risk? Low = good | -1 to +1 |
| **K** | Key People Risk | Depends on key individuals? Low = good | -1 to +1 |

### Economic Moat Types
- **Intangible Assets** (品牌、专利)
- **Low Cost Advantage** (规模效应)
- **High Switching Cost** (用户难以迁移)
- **Network Effect** (网络效应)

### Moat Strength Rating
| Rating | Moats | Score |
|--------|-------|-------|
| 3+ Moats | Wide Moat | 4 |
| 2 Moats | Strong Moat | 3 |
| 1 Moat | Narrow Moat | 2 |
| Weak Moat | Minimal | 1 |
| No Moat | None | 0 |

---

## Step 3: C - Calculate (计算)

### Three Stock Types

#### 1. 📈 Growth Stock (成长股)
**Conditions:**
- Payout Ratio < 30%
- ROE > 15%

**Valuation Formula:**
```
PEG = PE / EPS Growth Rate
```

**Entry Price Calculation:**
```
Target Price = EPS × Growth Rate
Entry Price = Target Price × 0.8 (20% discount)
Review Price = Target Price × 1.2 (20% premium)
```

**Decision:**
- Buy when: PEG < 1
- Sell when: PEG > 1.2

#### 2. 💰 Dividend Stock (股息股)
**Conditions:**
- Consistent Dividends
- Payout Ratio < 90%

**Valuation Formula:**
```
Expected Price = Dividend / Dividend Yield
```

**Decision:**
- Buy when: Dividend Yield > 5%
  (or 2%+ higher than your bank rate)
- Sell when: Price increases by 50%

#### 3. 🏦 Asset Stock (资产股)
**Types:** Banks, Gold, Properties, Oil Rigs

**Valuation Formula:**
```
Target Price = BVPS × Target PB Ratio
```

**Decision:**
- Buy when: P/B < 1
- Sell when: Price hits Book Value Per Share (BVPS)

---

## Step 4: T - Track (跟踪)

### Price Levels
| Level | Formula | Purpose |
|-------|---------|---------|
| **Entry** | Target × 0.8 | Buy zone (20% below fair value) |
| **Review** | Target × 1.2 | Review zone (20% above fair value) |
| **Fair Value** | Calculated | Neutral zone |

### Scoring System (e/f/r/i/e/N/D/A/S/K)

For each metric, assign:
- **+1** (positive) - Passes criteria
- **-1** (negative) - Fails criteria  
- **0.5** (partial) - Partially passes
- **0** (N/A) - Not applicable

**Formula Letters:**
- `e` = EPS score
- `f` = FCF score
- `r` = ROE score
- `i>10` = Interest coverage > 10
- `i>4` = Interest coverage > 4
- `e4` = 4+ Moats
- `e3` = 3 Moats
- `e2` = 2 Moats
- `e1` = 1 Moat
- `N20` = Net margin > 20%
- `N10` = Net margin > 10%
- `D` = Dividends
- `A` = Authority risk
- `S` = Science risk
- `K` = Key people risk

---

## Step 5: S - Savings (现金管理)

### S&P PE Ratio → Cash Allocation

| S&P PE | Cash % |
|--------|--------|
| 10 | 25% |
| 20 | 50% |
| 30 | 75% |
| 40 | 100% |

**Logic:** When market is expensive (high PE), hold more cash. When cheap (low PE), invest more.

---

## 🚀 Usage Instructions

### When User Asks to Analyze a Stock:

1. **Fetch real-time data** from financial APIs
2. **Run 10-Point Assessment** - Fill out E.F.R.I.E.N.D.S.K.
3. **Classify the stock** - Growth / Dividend / Asset
4. **Calculate target price** using appropriate formula
5. **Determine Entry & Review prices**
6. **Score the stock** (/10)
7. **Give recommendation** - Buy / Hold / Sell with reasoning

### Analysis Template:

```
## [TICKER] F.A.C.T.S Analysis

### 📊 Basic Info
- Current Price: $XXX
- Market Cap: $XXX
- PE: XX
- EPS: $XXX
- Dividend Yield: X.X%

### ✅ 10-Point Assessment
| Metric | Status | Score |
|--------|--------|-------|
| E - EPS 10yr | ✅ Yes | +1 |
| F - FCF 10yr | ✅ Yes | +1 |
| R - ROE >15% | ✅ Yes | +1 |
| I - Interest Cov | >10 | +1 |
| E - Economic Moat | 2 Moats | +3 |
| N - Net Margin | >20% | +1 |
| D - Dividends | Yes | +1 |
| A - Authority Risk | Low | +1 |
| S - Science Risk | High | -1 |
| K - Key People Risk | Low | +1 |
| **TOTAL** | | **X/10** |

### 💰 Valuation
- Stock Type: [Growth/Dividend/Asset]
- Target Price: $XXX
- Entry Price: $XXX (20% discount)
- Review Price: $XXX (20% premium)

### 🎯 Recommendation
**[BUY / HOLD / SELL]** at [Entry/Current] price
Reasoning: ...
```

---

## ⚠️ Important Notes

- This is a **value investing** framework based on fundamentals
- Always verify data from multiple sources
- Consider macro factors (interest rates, economy)
- Past performance ≠ future results
- This is educational, not financial advice

---

## 🔗 Reference
- Original Framework: BOS Spreadsheet by Brandon Wong
- Inspirations: Warren Buffett, Benjamin Graham, Peter Lynch
- Last Updated: 2026-04-08
