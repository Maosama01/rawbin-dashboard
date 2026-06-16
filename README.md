# Rawbin Dashboard

The Rawbin Dashboard is a React + Vite frontend application designed to pair with the Rawbin IoT Composter backend. It provides an intuitive interface for users to monitor their smart bin telemetry, visualize data trends, manage pairing cycles, and authenticate securely.

## Features

- **Authentication:** Dual-login support (Email + Password AND Phone Number + SMS OTP).
- **Responsive Telemetry:** Real-time visualization of your composter's health (Temperature, Humidity, CO2, pH, Fill Level) using responsive charts.
- **Demo Mode:** An interactive empty-state experience allowing developers and testers to instantly pair a virtual "Demo Device". This automatically requests 24 hours of perfectly shaped mock telemetry data from the backend to showcase chart layouts.
- **Glassmorphic UI:** Modern UI design prioritizing clean aesthetics, subtle blurring, and high-contrast metric cards.

## Quick Start

### Prerequisites
- Node.js (v18+)
- Running instance of the `rawbin-backend` (FastAPI)

### Installation

```bash
# Install dependencies
npm install

# Create environment configuration
cp .env.example .env.local

# Run the local development server
npm run dev
```

## Important Development Notes

- **OTP Authentication:** When testing the SMS-OTP login locally, you do not need a Twilio account. The backend is configured so that when `APP_ENV=development`, the correct OTP for any phone number is strictly hardcoded to `123456`.
- **Phone Number Format:** When logging in via phone, ensure your number includes the standard `+` prefix and country code (e.g. `+918949231213`).

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** CSS3, Glassmorphism design patterns, Lucide Icons
- **Charting:** Recharts
- **Deployment:** Vercel
