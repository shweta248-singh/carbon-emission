# Carbon Supply Chain Tracker

A carbon-aware supply chain management system that analyzes shipping routes and logistics operations to calculate environmental impact. It recommends optimized eco-friendly alternatives while tracking inventory in real time.

## Tech Stack
- **Frontend**: React.js + Vite + Tailwind CSS + Recharts
- **Backend**: Node.js + Express + MongoDB
- **Optimizer Engine**: Python FastAPI + Pandas + NumPy
- **Orchestration**: Docker + Docker Compose

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (for local development)
- Python 3.9+ (for local development)

### Running with Docker
```bash
docker-compose up --build
```

### Local Development

#### Backend
1. `cd backend`
2. `npm install`
3. `npm start`

#### Optimizer Engine
1. `cd optimizer-engine`
2. `pip install -r requirements.txt`
3. `uvicorn main:app --reload`

#### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Postman Testing Guide

### 1. Register User
- **Method**: POST
- **URL**: `http://localhost:5000/api/auth/register`
- **Body**: `{ "name": "Test User", "email": "test@example.com", "password": "password123" }`

### 2. Login User
- **Method**: POST
- **URL**: `http://localhost:5000/api/auth/login`
- **Body**: `{ "email": "test@example.com", "password": "password123" }`
- **Action**: Copy the `token` from the response.

### 3. Add Inventory
- **Method**: POST
- **URL**: `http://localhost:5000/api/inventory`
- **Header**: `Authorization: Bearer <token>`
- **Body**: `{ "name": "Product A", "quantity": 100, "location": "Warehouse 1" }`

### 4. Create Shipment
- **Method**: POST
- **URL**: `http://localhost:5000/api/shipments`
- **Header**: `Authorization: Bearer <token>`
- **Body**: `{ "origin": "London", "destination": "Paris", "distanceKm": 450, "vehicleType": "truck" }`

### 5. Get Analytics
- **Method**: GET
- **URL**: `http://localhost:5000/api/analytics/dashboard`
- **Header**: `Authorization: Bearer <token>`

## Deployment
This project is configured for easy deployment on **Render**.
- Backend: Use `backend/Dockerfile`
- Frontend: Use `frontend/Dockerfile`
- Optimizer: Use `optimizer-engine/Dockerfile`
