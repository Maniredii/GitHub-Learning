# Authentication System Implementation

## Overview

The authentication system for GitQuest has been successfully implemented with JWT-based authentication, user registration, and login functionality.

## Implemented Components

### 1. Authentication Service (`src/services/authService.ts`)
- **Password Hashing:** Uses bcrypt with 12 salt rounds
- **Email Validation:** Validates email format using regex
- **Password Strength Validation:** Requires minimum 8 characters, at least one letter and one number
- **User Registration:** Creates user and initializes progress with "Apprentice Coder" rank and 0 XP
- **User Login:** Verifies credentials and returns JWT token
- **Token Generation:** Creates JWT tokens with configurable expiration
- **Token Verification:** Validates and decodes JWT tokens

### 2. Authentication Controller (`src/controllers/authController.ts`)
- **Register Endpoint:** Handles POST /api/auth/register
- **Login Endpoint:** Handles POST /api/auth/login
- **Verify Endpoint:** Handles GET /api/auth/verify
- **Error Handling:** Provides appropriate HTTP status codes and error messages

### 3. Authentication Routes (`src/routes/authRoutes.ts`)
- Defines routes for registration, login, and token verification
- Integrated into main Express application

### 4. Authentication Middleware (`src/middleware/authMiddleware.ts`)
- **authMiddleware:** Protects routes requiring authentication
- **optionalAuthMiddleware:** Allows optional authentication
- **Request Extension:** Adds user information to Express Request object
- **Token Extraction:** Extracts and verifies Bearer tokens from Authorization header

### 5. Main Application Integration (`src/index.ts`)
- Authentication routes mounted at `/api/auth`
- All endpoints accessible and ready for use

## API Endpoints

### POST /api/auth/register
Creates a new user account with initial progress.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "chrono_coder",
  "password": "SecurePass123"
}
```

**Response (201):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "username": "chrono_coder",
    "email": "user@example.com",
    "level": 1,
    "xp": 0
  }
}
```

### POST /api/auth/login
Authenticates user and returns JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "username": "chrono_coder",
    "email": "user@example.com",
    "level": 1,
    "xp": 0
  }
}
```

### GET /api/auth/verify
Verifies JWT token validity.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "valid": true,
  "user": {
    "userId": "uuid",
    "username": "chrono_coder"
  }
}
```

## Security Features

1. **Password Security:**
   - Bcrypt hashing with 12 salt rounds
   - Password strength validation
   - Passwords never stored in plain text

2. **Token Security:**
   - JWT tokens with configurable expiration (default: 1 hour)
   - Tokens signed with secret key from environment variables
   - Token verification on protected routes

3. **Input Validation:**
   - Email format validation
   - Password strength requirements
   - Duplicate email/username prevention

4. **Error Handling:**
   - Appropriate HTTP status codes
   - Generic error messages to prevent information leakage
   - Detailed logging for debugging

## Requirements Fulfilled

✅ **Requirement 1.2:** User registration with "Apprentice Coder" rank and 0 XP initialization
✅ **Requirement 1.3:** User login with JWT token generation and credential verification
✅ **Requirement 1.3:** JWT verification middleware for protected routes

## Dependencies

- `bcrypt`: Password hashing
- `jsonwebtoken`: JWT token generation and verification
- `uuid`: Unique identifier generation
- `express`: Web framework
- `knex`: Database query builder

## Environment Variables

Required in `.env`:
```
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1h
```

## Next Steps

The authentication system is now ready for use. Future tasks can:
1. Use `authMiddleware` to protect routes requiring authentication
2. Access user information via `req.user` in protected routes
3. Build upon this foundation for progress tracking and quest management

## Testing

To test the authentication system:

1. Ensure database is running and migrations are applied
2. Start the backend server: `npm run dev`
3. Use the cURL examples in `src/routes/README.md` or a tool like Postman
4. Verify registration creates user and user_progress records
5. Verify login returns valid JWT token
6. Verify protected routes require valid token

## Files Created

- `src/services/authService.ts` - Core authentication logic
- `src/controllers/authController.ts` - HTTP request handlers
- `src/routes/authRoutes.ts` - Route definitions
- `src/middleware/authMiddleware.ts` - JWT verification middleware
- `src/routes/README.md` - API documentation
- `AUTHENTICATION_IMPLEMENTATION.md` - This file

## Files Modified

- `src/index.ts` - Added authentication routes
- `package.json` - Added uuid dependency (via npm install)
