# Rawbin Smart Composter Dashboard

The central dashboard for monitoring and managing the Rawbin Smart Ecosystem. This premium UI is built with a focus on "Smart Sustainability" – combining clean, organic aesthetics with real-time IoT data visualization.

## Architecture

- **Framework:** React + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v3)
- **Design System:** Custom "Smart Sustainability" Light Theme
- **Data Visualization:** Recharts (Area charts for TimescaleDB aggregation)
- **Icons:** Lucide React

## Features

- **Global Ecosystem Overview:** High-level metrics tracking total compost weight and active critical alerts across all paired hardware.
- **Real-Time Telemetry Grid:** 8 dedicated monitoring gauges for tracking core metrics (Temperature, Humidity, CO2, pH, Bin Fill Level, Weight, and Fan Speed).
- **Historical Analytics:** Recharts area charts that dynamically map to TimescaleDB's raw, hourly, and daily continuous aggregates.
- **Alert Threshold Configuration:** Form interfaces to set minimum and maximum safe operating bounds for background workers (Celery/Redis pipeline).
- **Secure Hardware Pairing:** A 3-step simulated HMAC-SHA256 Challenge-Response workflow for pairing new Bluetooth IoT devices securely.

## Local Development

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

## Theme Details

The application is built on a strict Light Mode organic theme:
- **Backgrounds:** Soft off-white and pale stone.
- **Accents:** Sage greens and leafy emeralds for healthy states.
- **Alerts:** Warm terracotta for warnings/critical errors.
- **Shapes:** Smooth organic curves with `rounded-2xl` and `rounded-3xl` radii, supported by diffuse low-opacity drop shadows (`shadow-organic`).
