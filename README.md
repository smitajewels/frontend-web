# Smita Jewellers — Digital Gold (Web)

Mobile-first React + TypeScript + Tailwind CSS frontend for the Smita Jewellers digital gold platform.

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4
- React Router
- Sonner toasts
- Razorpay Checkout

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

App runs at `http://localhost:5173`. API defaults to `http://localhost:4000` via `VITE_API_URL`.

## Features

**User**
- Login / Register (multipart with PAN photo) / Forgot & Reset password
- Home: portfolio, live rates, banners, quick actions
- Buy gold (grams/amount) via Razorpay
- History (gold + payments)
- Collection eligibility
- Profile + change password

**Admin**
- Dashboard metrics
- Update gold rates
- Collect gold from customers
- Customers search + detail
- Today purchases & payment history
- Current scheme

## Design

Visual system matches the mobile app: cream `#FFFBF5`, gold primary `#B8860B`, gold gradient cards, bottom tabs (Home / History / Collect / Profile).
