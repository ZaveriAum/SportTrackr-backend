# SportTrackr Backend 🏃‍♂️⚽

## Overview

Welcome to the **SportTrackr Backend**, the robust server-side foundation for the SportTrackr ecosystem. This repository houses the API and database logic that drives real-time sports tracking, user management, and data analytics for athletes and enthusiasts alike. Built with scalability and performance in mind, it seamlessly integrates with the SportTrackr frontend and mobile applications.

## Features

- **RESTful API**: Fast and secure endpoints for managing users, workouts, and stats.
- **Real-Time Data**: Syncs live sports activity data with connected clients.
- **Database Management**: Efficient storage and retrieval of user profiles, sessions, and metrics.
- **Authentication**: Secure JWT-based user authentication and authorization.
- **Scalable Architecture**: Designed to handle growing user bases and data loads.

---

## Tech Stack

- **Language**: [Node.js](https://nodejs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (or MongoDB, depending on your setup)

## Getting Started

### Prerequisites

- Node.js v16+ installed
- PostgreSQL (or your chosen DB) running locally or remotely
- Git for cloning the repo

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ZaveriAum/SportTrackr-backend.git
   cd SportTrackr-backend
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create .env file in root

   ```bash
   example.env
   DB_HOST=??
   DB_USER=??
   DB_PASSWORD=??
   DB_DATABASE=??
   LOG_DB_DATABASE=??
   DB_PORT=??
   ACCESS_TOKEN_SECRET=??
   REFRESH_TOKEN_SECRET=??
   EMAIL_TOKEN_SECRET=??
   RESET_PASSWORD_TOKEN_SECRET=??
   EMAIL_USER=??
   EMAIL_PASS=??
   FRONTEND_URL=??
   AWS_ACCESS_KEY=??
   AWS_SECRET_KEY=??
   AWS_REGION=??
   AWS_BUCKET_NAME=??
   STRIPE_SECRET_KEY=??
   WEBHOOK_SECRET=??
   TERMS_CONDITIONS_VERSION=??
   ```

4. Start Server
   ```bash
   npm start
   ```
