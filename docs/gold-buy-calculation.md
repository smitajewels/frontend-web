# Gold Buy Calculation Formula

Reference document for Smita Jewellers digital gold purchases.  
Use this to confirm pricing logic with the team before / after implementation.

---

## 1. Formula

### Display rate (what the customer is charged against)

```
Display rate (per 10g) = round(Admin rate ÷ 1.03) + ₹300
```

- `Admin rate` = rate set by admin (per 10g), for the selected karat.
- `round(...)` = nearest **rupee** (whole number).
- `₹300` = fixed markup per 10g (your profit layer).

### Buy by amount (customer enters rupees; GST included in payment)

```
Base (ex-GST) = payment ÷ 1.03
GST           = payment − base
Grams         = floor_3(base × 10 ÷ display rate)
```

- Money rounded to **2 decimals**.
- Grams floored to **3 decimals** (round down).

### Buy by grams (customer enters weight)

```
Base (ex-GST) = grams × display rate ÷ 10
Total (pay)   = base × 1.03
GST           = total − base
```

### Your profit (markup only)

```
Profit ≈ ₹300 × grams ÷ 10
```

---

## 2. Confirmed example

**Admin rate:** ₹1,70,000 / 10g  
**Customer pays:** ₹50,000 (by amount)

| Item | Value |
|------|------:|
| Admin ÷ 1.03 | ₹1,65,048.54… → round **₹1,65,049** |
| Display rate | ₹1,65,049 + 300 = **₹1,65,349 / 10g** |
| Base (ex-GST) | **₹48,543.69** |
| GST (3%) | **₹1,456.31** |
| Gold credited | **2.935 g** |
| Profit (₹300 markup) | **₹88.05** |

---

## 3. Buy by amount — same admin ₹1,70,000  
*(Display rate = ₹1,65,349 / 10g)*

| Pay (₹) | Base (ex-GST) | GST | Grams | Profit |
|--------:|--------------:|----:|------:|-------:|
| 1,000 | 970.87 | 29.13 | 0.058 | 1.74 |
| 5,000 | 4,854.37 | 145.63 | 0.293 | 8.79 |
| 10,000 | 9,708.74 | 291.26 | 0.587 | 17.61 |
| 25,000 | 24,271.84 | 728.16 | 1.467 | 44.01 |
| **50,000** | **48,543.69** | **1,456.31** | **2.935** | **88.05** |
| 1,00,000 | 97,087.38 | 2,912.62 | 5.871 | 176.13 |

---

## 4. Buy by amount — ₹50,000 pay, different admin rates

| Admin / 10g | Display / 10g | Grams | Profit |
|------------:|--------------:|------:|-------:|
| 1,65,000 | 1,60,494 | 3.024 | 90.72 |
| **1,70,000** | **1,65,349** | **2.935** | **88.05** |
| 1,75,000 | 1,70,203 | 2.852 | 85.56 |
| 1,80,000 | 1,75,057 | 2.773 | 83.19 |

---

## 5. Buy by grams — admin ₹1,70,000  
*(Display rate = ₹1,65,349 / 10g)*

| Grams | Base (ex-GST) | GST | Customer pays | Profit |
|------:|--------------:|----:|--------------:|-------:|
| 0.100 | 1,653.49 | 49.60 | 1,703.09 | 3.00 |
| 0.500 | 8,267.45 | 248.02 | 8,515.47 | 15.00 |
| 1.000 | 16,534.90 | 496.05 | 17,030.95 | 30.00 |
| 2.000 | 33,069.80 | 992.09 | 34,061.89 | 60.00 |
| 2.935 | 48,529.93 | 1,455.90 | 49,985.83 | 88.05 |
| 5.000 | 82,674.50 | 2,480.24 | 85,154.74 | 150.00 |
| 10.000 | 1,65,349.00 | 4,960.47 | 1,70,309.47 | 300.00 |

---

## 6. Important notes for team

1. **By amount and by grams are not exact mirrors** because grams are floored to 3 decimals.  
   - Pay ₹50,000 → get **2.935 g**  
   - Buy **2.935 g** → pay **₹49,985.83**  
   - Leftover on the ₹50,000 case ≈ **₹13.76** (not credited as gold).

2. Confirm before coding:
   - [ ] Display rate: round `admin ÷ 1.03` to **nearest rupee** (not 2 decimals)?
   - [ ] Grams: floor to **3** decimals (not 4)?
   - [ ] ₹300 markup applies to **all karats** (18K / 22K / 24K)?
   - [ ] Live rate shown on Home = this **display rate**?

3. Reproduce examples anytime:

```bash
python scripts/calc_examples.py
```

---

## 8. Implementation status

**Implemented in backend** (`goldCalculator.service.ts`, buy + collect + live rates + `/api/auth/me` portfolio valuation):

- Display rate = `round(admin ÷ 1.03) + liveRateMarkupPer10g` (default markup **₹300**)
- Buy by amount / by grams as above
- Grams floored to **3** decimals
- Collect (sell/handover) valued at **display rate**
- Portfolio current value on `/me`, profile, admin customer detail uses **display rates**

Set markup via `GoldPricingConfig.liveRateMarkupPer10g` (seeded to 300).

```bash
# Apply seed markup + run unit checks
cd backend
npx prisma db seed
npm test -- --testPathPattern="goldCalculator|helpers|config.service"
```
