# Franchise Investment Decision Support System (FDSS)

A decision-support and marketplace platform connecting investors with verified franchisers across multiple industries.

## Technology Stack

- **Frontend**: HTML5, CSS3, Bootstrap 5, JavaScript, React 19, TypeScript, Vite
- **Backend**: Python 3, Django 5, Django REST Framework, SQLite

## Architecture Overview

```
franchise-investment-decision-support-system/
├── backend/                  # Python Django REST API
│   ├── fdss_backend/         # Django project configuration (settings, urls, wsgi)
│   ├── franchises/           # Main Django app (models, views, serializers, urls)
│   │   └── management/       # Seeding commands
│   ├── manage.py             # Django CLI runner
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React + Bootstrap Frontend
│   ├── src/                  # Components, services, pages, types
│   ├── index.html            # Entry HTML with Bootstrap 5 integration
│   ├── vite.config.ts        # Vite build & proxy settings
│   └── package.json          # Frontend npm package manifest
└── README.md
```

## Quick Start Guide

### 1. Backend Setup (Django)

Make sure Python 3.10+ is installed on your system.

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Seed database with sample franchises & demo accounts
python manage.py seed_data

# Start Django development server (runs on http://127.0.0.1:8000)
python manage.py runserver 8000
```

### 2. Frontend Setup (React + Vite)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

The frontend automatically proxies `/api` calls to the Django backend running at `http://127.0.0.1:8000`.

## Key Features

- **Feasibility Evaluation Engine**: Algorithmic scoring of financial payback, capital adequacy, location demand, and risk index.
- **Franchise Marketplace**: Filter franchises by category, budget, location, and payback period.
- **Multi-Role Portal**: Dedicated interfaces for Investors, Franchisers, and Platform Administrators.
- **Application & Contract Workflow**: E-signature contract flow, payment record tracking, and territory reservations.
- **Interactive Messaging & Meeting Scheduling**: Direct investor-to-franchiser communications.
