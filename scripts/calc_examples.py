from decimal import Decimal, ROUND_HALF_UP, ROUND_DOWN

def round_money(x: float) -> float:
    return float(Decimal(str(x)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))

def floor_grams_3(x: float) -> float:
    return float(Decimal(str(x)).quantize(Decimal("0.001"), rounding=ROUND_DOWN))

def display_rate(admin: float) -> int:
    # (admin / 1.03) rounded to nearest rupee + 300
    stripped = admin / 1.03
    return int(round(stripped)) + 300

def by_amount(admin: float, payment: float):
    disp = display_rate(admin)
    base = round_money(payment / 1.03)
    gst = round_money(payment - base)
    grams = floor_grams_3(base * 10 / disp)
    profit = round_money(300 * grams / 10)
    cost_at_admin = round_money(grams * admin / 10)  # theoretical if buying at admin rate? 
    # Profit per formula: ₹300 markup * grams / 10
    return {
        "admin": admin,
        "display": disp,
        "payment": payment,
        "base": base,
        "gst": gst,
        "grams": grams,
        "profit_markup": profit,
        # reverse check: base should approx equal grams * display / 10 (with floor loss)
        "value_at_display": round_money(grams * disp / 10),
        "floor_loss": round_money(base - (grams * disp / 10)),
    }

def by_grams(admin: float, grams: float):
    disp = display_rate(admin)
    base = round_money(grams * disp / 10)
    total = round_money(base * 1.03)
    gst = round_money(total - base)
    profit = round_money(300 * grams / 10)
    return {
        "admin": admin,
        "display": disp,
        "grams": grams,
        "base": base,
        "gst": gst,
        "total": total,
        "profit_markup": profit,
    }

# Verify user's example
ex = by_amount(170000, 50000)
print("USER EXAMPLE BY AMOUNT")
for k, v in ex.items():
    print(f"  {k}: {v}")

print("\n=== MORE BY AMOUNT EXAMPLES ===")
examples_amt = [
    (170000, 1000),
    (170000, 5000),
    (170000, 10000),
    (170000, 25000),
    (170000, 50000),
    (170000, 100000),
    (165000, 50000),
    (175000, 50000),
    (180000, 50000),
    (100000, 10000),
]
for admin, pay in examples_amt:
    r = by_amount(admin, pay)
    print(f"Admin {admin:>8,} | Pay {pay:>8,} => Rate {r['display']:>8,} | Base {r['base']:>10,.2f} | GST {r['gst']:>8,.2f} | Grams {r['grams']:.3f} | Profit {r['profit_markup']:>7,.2f} | FloorLoss {r['floor_loss']:>6,.2f}")

print("\n=== BY GRAMS EXAMPLES (admin 170000) ===")
for g in [0.1, 0.5, 1.0, 2.0, 2.935, 5.0, 10.0]:
    r = by_grams(170000, g)
    print(f"Grams {g:>6.3f} => Rate {r['display']:,} | Base {r['base']:>10,.2f} | GST {r['gst']:>8,.2f} | Total {r['total']:>10,.2f} | Profit {r['profit_markup']:>7,.2f}")

print("\n=== Cross-check: BY_GRAMS 2.935g should be close to 50k payment ===")
r = by_grams(170000, 2.935)
print(r)
