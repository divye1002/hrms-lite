# HRMS Lite

A lightweight Human Resource Management System with employee management and attendance tracking.

## Tech Stack

| Layer    | Technology                        | Deployment |
|----------|-----------------------------------|------------|
| Frontend | React 19 + Vite                   | Vercel     |
| Backend  | Django 4.2 + Django REST Framework| Render     |
| Database | PostgreSQL                        | Render     |

## Features

### Core
- **Employee Management** — Add, view, and delete employees
- **Attendance Tracking** — Mark daily attendance (Present / Absent) and view records

### Bonus
- **Dashboard** — Summary cards (total employees, present/absent/unmarked today)
- **Attendance Filters** — Filter records by employee and/or date
- **Attendance Rate** — Per-employee present-day counts with progress bars

## Project Structure

```
hrms-lite/
├── backend/                # Django + DRF
│   ├── hrms/               # Django project settings
│   ├── employees/           # App: models, serializers, views, urls
│   ├── requirements.txt
│   ├── Procfile             # Render web process
│   └── build.sh             # Render build script
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── components/      # Navbar, Spinner, EmptyState, ErrorAlert
│   │   ├── pages/           # Dashboard, EmployeeList, AttendancePage
│   │   └── services/        # API client (axios)
│   └── .env                 # VITE_API_URL
└── README.md
```

## Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 20+
- PostgreSQL running locally

### 1. Database Setup

```bash
# Create the PostgreSQL database
psql -U postgres -c "CREATE DATABASE hrms_lite;"
```

### 2. Backend

```bash
cd backend

# (Optional) Create a virtual environment
python -m venv venv && venv\Scripts\activate   # Windows
# source venv/bin/activate                     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Copy env file and edit if needed
copy .env.example .env   # or: cp .env.example .env

# Run migrations
python manage.py migrate

# Start the dev server (port 8000)
python manage.py runserver
```

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server (port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## API Reference

| Method | Endpoint                         | Description                          |
|--------|----------------------------------|--------------------------------------|
| GET    | `/api/employees/`                | List all employees                   |
| POST   | `/api/employees/`                | Create an employee                   |
| DELETE | `/api/employees/<employee_id>/`  | Delete an employee                   |
| GET    | `/api/attendance/`               | List attendance (optional filters)   |
| POST   | `/api/attendance/`               | Mark attendance                      |
| GET    | `/api/dashboard/`                | Dashboard summary statistics         |

**Query Parameters for `/api/attendance/`:**
- `employee_id` — Filter by employee
- `date` — Filter by date (YYYY-MM-DD)

## Deployment

### Backend (Render)
1. Create a new **Web Service** on Render connected to the `backend/` directory
2. Set build command: `chmod +x build.sh && ./build.sh`
3. Set start command: `gunicorn hrms.wsgi:application`
4. Add environment variables: `DATABASE_URL`, `DJANGO_SECRET_KEY`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `DEBUG=False`

### Frontend (Vercel)
1. Import the `frontend/` directory on Vercel
2. Set environment variable: `VITE_API_URL=https://your-render-backend.onrender.com/api`

## Assumptions
- Single admin user — no authentication required
- Leave management, payroll, and advanced HR features are out of scope
- Attendance status is binary: Present or Absent
