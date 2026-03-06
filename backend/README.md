## YAKSHA Express + MySQL API

This folder contains an Express backend that replaces the old PHP auth endpoints with a JSON API backed by MySQL.

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

Create a `.env` file in this folder with at least:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=yaksha
DB_PORT=3306

FRONTEND_ORIGIN=http://localhost:5173

JWT_SECRET=change_this_to_a_long_random_string
```

### 3. Create the database / table

In MySQL:

```sql
CREATE DATABASE IF NOT EXISTS yaksha;
USE yaksha;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Run the API

```bash
npm start
```

The API will be available at `http://localhost:4000`, with routes:

- `POST /api/signup` – create user and set auth cookie
- `POST /api/login` – validate user and set auth cookie
- `POST /api/logout` – clear auth cookie
- `GET /api/check-session` – returns `{ logged_in: boolean, username? }`
- `GET /api/health` – basic health check

You can now point your frontend `fetch` calls to these endpoints instead of the old PHP files.

