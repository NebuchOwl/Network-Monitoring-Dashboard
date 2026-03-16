# 🌐 Net-Monitor (Beta)

> **Modern, Fast, & Intelligent Network Monitoring Dashboard.**

Net-Monitor is a professional-grade network monitoring tool designed for real-time tracking, automatic device discovery, and multi-channel alerting. Built with a sleek, premium dark-mode UI and a robust Python backend.

![Image](https://img.shields.io/badge/Status-Beta-orange)
![Image](https://img.shields.io/badge/Backend-FastAPI-009688)
![Image](https://img.shields.io/badge/Frontend-React%20%2F%20TailwindV4-38B2AC)
![Image](https://img.shields.io/badge/Database-SQLite-07405E)

---

## ✨ Key Features

- **🚀 Auto-Discovery:** Automatically scans your subnet to find and add active devices.
- **🧠 Device Intelligence:** Intelligent port-based heuristics to identify device types (Router, Server, PC, Laptop, Printer) and assign appropriate icons.
- **📊 Real-time Dashboard:** Premium UI with live status tracking and 24h latency trend charts using `recharts`.
- **🔔 Multi-Channel Alerts:** Instant notifications via **Discord, Slack, Telegram, and Email** when a device goes down or recovers.
- **⚙️ Settings via UI:** Manage subnet ranges, scan intervals, error thresholds, and notification webhooks directly from the dashboard.
- **🧹 Auto-Cleanup:** Automatically clears logs older than 30 days to keep the database lightweight.

---

## 🛠 Tech Stack

- **Backend:** Python 3.10+, FastAPI, SQLAlchemy, icmplib (Async ICMP), APScheduler.
- **Frontend:** React (Vite), Tailwind CSS v4, Lucide Icons, TanStack Query.
- **Database:** SQLite (Async).

---

## 🚀 Quick Start

### 1. Prerequisite (Windows Users)
ICMP scanning requires privileges. Ensure you run your terminal as **Administrator**.
If you don't want to run as admin, the system uses `privileged=False` for wider compatibility on Windows home/pro editions.

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.main
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## ⚙️ Configuration

All major settings are managed through the **Dashboard > Settings** menu:
- **Subnet Range:** (e.g., `192.168.1.0/24`)
- **Scan Interval:** How often to ping devices (default: 60s).
- **Retry Count:** Number of failures before marking a device as "Down".
- **Webhooks:** Discord, Slack, and Telegram bot configuration.

---

## 📁 Project Structure

- `backend/`: FastAPI application, database models, and scanning engine.
- `frontend/`: React source code with Tailwind v4 styling.
- `docs/`: Development plans and documentation.

---

## 📄 License

This project is licensed under the MIT License.

---

Developed by **[Sina Kop](https://github.com/NebuchOwl)** • 2026
