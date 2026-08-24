# healthcare-appointment-manager
# 🏥 Healthcare Appointment Manager

A full-stack healthcare appointment management system designed to simplify the process of managing patients, doctors, appointments, and schedules through a centralized web application.

The system provides a modern React-based frontend and a FastAPI backend with database integration, authentication, email communication, and Google Calendar support.

## ✨ Features

* 🔐 **User Authentication**

  * Secure user registration and login
  * JWT-based authentication
  * Password hashing and protected routes

* 👨‍⚕️ **Doctor & Patient Management**

  * Manage patient and doctor information
  * Role-based access to application features
  * Centralized healthcare information management

* 📅 **Appointment Management**

  * Create and manage appointments
  * View appointment details and schedules
  * Manage appointment status and availability

* 📆 **Google Calendar Integration**

  * Integrates appointments with Google Calendar
  * Helps users keep track of scheduled appointments

* 📧 **Email Notifications**

  * Email-based communication for appointment-related activities
  * FastAPI-Mail integration

* 🗄️ **Database Management**

  * PostgreSQL database
  * SQLAlchemy ORM for database operations

* 🤖 **LLM Integration**

  * Backend utilities for integrating language-model-based functionality

* 🌐 **REST API**

  * FastAPI-based backend
  * Modular API routers for authentication, appointments, and administration

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* JavaScript
* React Router
* Axios
* Styled Components

### Backend

* Python
* FastAPI
* Uvicorn
* SQLAlchemy
* Pydantic
* PostgreSQL
* JWT Authentication
* Passlib / bcrypt

### Integrations

* Google Calendar API
* Google Authentication
* Email services
* LLM utilities

## 🏗️ Project Architecture

```text
healthcare-appointment-manager/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── admin.py
│   │   │   ├── appointments.py
│   │   │   └── auth_routers.py
│   │   │
│   │   ├── auth.py
│   │   ├── database.py
│   │   ├── email_utils.py
│   │   ├── google_calendar_utils.py
│   │   ├── llm_utils.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   │
│   ├── get_google_token.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## 🔄 Application Workflow

```text
                ┌─────────────────────┐
                │       User          │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │   React Frontend    │
                │   Vite + Axios      │
                └──────────┬──────────┘
                           │ REST API
                           ▼
                ┌─────────────────────┐
                │    FastAPI Backend  │
                │ Authentication/API  │
                └──────┬───────┬──────┘
                       │       │
             ┌─────────┘       └──────────┐
             ▼                            ▼
    ┌─────────────────┐          ┌──────────────────┐
    │   PostgreSQL    │          │ External Services│
    │   + SQLAlchemy  │          │ Google Calendar  │
    └─────────────────┘          │ Email / LLM      │
                                 └──────────────────┘
```

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed:

* Python 3.9+
* Node.js and npm
* PostgreSQL
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/dhivyaapv/healthcare-appointment-manager.git
cd healthcare-appointment-manager
```

## ⚙️ Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file inside the `backend` directory and configure the required database, authentication, email, Google API, and other application credentials.

Example:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/healthcare_db

SECRET_KEY=your_secret_key

# Email configuration
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_email_password
MAIL_FROM=your_email
MAIL_SERVER=your_mail_server
MAIL_PORT=587

# Google Calendar configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

> **Important:** Never commit `.env` files, API keys, passwords, OAuth credentials, or other secrets to GitHub.

### Run the Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

The FastAPI server will start on:

```text
http://127.0.0.1:8000
```

FastAPI also provides interactive API documentation at:

```text
http://127.0.0.1:8000/docs
```

## 💻 Frontend Setup

Open a new terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at the URL displayed by Vite, typically:

```text
http://localhost:5173
```

## 📡 Backend API Modules

The backend follows a modular FastAPI router structure:

| Module                     | Purpose                               |
| -------------------------- | ------------------------------------- |
| `auth_routers.py`          | User authentication and authorization |
| `appointments.py`          | Appointment creation and management   |
| `admin.py`                 | Administrative functionality          |
| `auth.py`                  | Authentication and security utilities |
| `database.py`              | Database connection and configuration |
| `models.py`                | SQLAlchemy database models            |
| `schemas.py`               | Pydantic request/response schemas     |
| `email_utils.py`           | Email functionality                   |
| `google_calendar_utils.py` | Google Calendar integration           |
| `llm_utils.py`             | LLM-related functionality             |

## 🔒 Security

The application incorporates several security mechanisms:

* JWT-based authentication
* Password hashing
* Protected API endpoints
* Environment-based configuration
* Separation of frontend and backend services
* Database access through SQLAlchemy

Sensitive credentials should always be stored in environment variables rather than source code.

## 📁 Development Structure

The project follows a separated frontend-backend architecture:

**Frontend →** React application responsible for the user interface, routing, API requests, and client-side interaction.

**Backend →** FastAPI application responsible for authentication, business logic, database operations, appointments, integrations, and API endpoints.

This separation makes the application easier to maintain, test, and extend.

## 🔮 Future Enhancements

Potential improvements include:

* 🔔 Real-time appointment notifications
* 📱 Responsive mobile application
* 💳 Online consultation/payment integration
* 📊 Appointment analytics dashboard
* 🩺 Electronic medical record management
* 💬 Doctor-patient communication
* ☁️ Cloud deployment
* 🧪 Automated unit and integration testing
* 🔄 CI/CD pipeline

## 👩‍💻 Author

**Dhivyaa PV**

GitHub: [@dhivyaapv](https://github.com/dhivyaapv)

## 📄 License

This project is intended for educational and development purposes.
