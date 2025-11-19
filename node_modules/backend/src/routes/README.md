# Authentication API Documentation

## Overview

The authentication system provides user registration, login, and JWT-based authentication for the GitQuest application.

## Endpoints

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Description:** Creates a new user account with initial "Apprentice Coder" rank and 0 XP.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "chrono_coder",
  "password": "SecurePass123"
}
```

**Validation Rules:**
- Email must be valid format
- Password must be at least 8 characters
- Password must contain at least one letter and one number
- Email must be unique
- Username must be unique

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "username": "chrono_coder",
    "email": "user@example.com",
    "level": 1,
    "xp": 0
  }
}
```

**Error Responses:**
- `400` - Validation error (invalid email/password format)
- `409` - Duplicate user (email or username already exists)
- `500` - Internal server error

---

### 2. Login User

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "username": "chrono_coder",
    "email": "user@example.com",
    "level": 1,
    "xp": 0
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `401` - Invalid credentials
- `500` - Internal server error

---

### 3. Verify Token

**Endpoint:** `GET /api/auth/verify`

**Description:** Verifies a JWT token and returns user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "valid": true,
  "user": {
    "userId": "uuid-here",
    "username": "chrono_coder"
  }
}
```

**Error Responses:**
- `401` - Missing or invalid token
- `500` - Internal server error

---

## Authentication Middleware

### Usage

To protect routes, use the `authMiddleware`:

```typescript
import { authMiddleware } from '../middleware/authMiddleware';

router.get('/protected-route', authMiddleware, (req, res) => {
  // Access user info from req.user
  const { userId, username } = req.user!;
  res.json({ message: `Hello ${username}` });
});
```

### Optional Authentication

For routes that should work with or without authentication:

```typescript
import { optionalAuthMiddleware } from '../middleware/authMiddleware';

router.get('/optional-route', optionalAuthMiddleware, (req, res) => {
  if (req.user) {
    res.json({ message: `Hello ${req.user.username}` });
  } else {
    res.json({ message: 'Hello guest' });
  }
});
```

---

## Security Features

1. **Password Hashing:** Passwords are hashed using bcrypt with 12 salt rounds
2. **JWT Tokens:** Tokens expire after 1 hour (configurable via JWT_EXPIRES_IN)
3. **Input Validation:** Email format and password strength validation
4. **Error Handling:** Generic error messages to prevent information leakage

---

## Environment Variables

Required environment variables in `.env`:

```
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1h
```

---

## Testing with cURL

### Register:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test1234"}'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'
```

### Verify Token:
```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
