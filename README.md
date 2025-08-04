# Azthorize

> Secure, scalable authentication API with hashed email indexing, AES-encrypted data, cookie-based token auth, rate limiting, and full user CRUD in NestJS + PostgreSQL.

## Guide

1. [Introduction](#introduction)
2. [Resources](#resources)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Usage](#usage)
7. [Endpoints](#endpoints)
8. [Error Handling](#error-handling)
9. [Contribution](#contribution)

## Introduction

This is a robust, production-ready authentication API built with NestJS and PostgreSQL, architected with a strong focus on security, scalability, and best practices. The system uses hashed email indexing for secure and efficient user lookup, combined with bcrypt hashing for password storage. To further enhance client data protection, AES encryption is applied to user email addresses at rest, ensuring data confidentiality even in the event of a database compromise.

Authentication is handled via a secure token-based system using HTTP-only cookies to store access and refresh tokens, minimizing exposure to XSS attacks. The refresh token flow allows for seamless session renewal while maintaining strong access control. The implementation also includes rate limiting on sensitive endpoints such as login and registration, protecting against brute-force attacks and ensuring system resilience under potential abuse.

A full-featured User CRUD is provided, with rigorous input validation and data sanitization, ensuring consistency and integrity across the API. The codebase adheres to clean architecture principles, making it modular, testable, and easy to extend.

This API is designed for high-security environments where user data protection is a top priority, balancing performance with modern cryptographic and authentication standards.

## Resources

The main features of this API include:

- User CRUD operations;
- Route's body validation;
- 2FA Service (like activate, deactivate, verify and generate);
- Mail service for notification activity (Strange activities like new devices, Account verification, Recover password, 2FA verification);
- Rate-limiting using Cache preventing Brute Force, DoS aND DDoS attacks.
- Helmet and CORS to ensure security on Front-end avoiding cross-site scripting (XSS) and information leakage.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (LTS or Latest Version);
- PostgresSQL Database;
- Redis Database;

## Installation

To install the API locally, follow these steps:

```bash
# Clone the repository
git clone https://github.com/matheusPavaneli/Azthorize-Auth.git

# Navigate into the project directory
cd Azthorize-Auth

# Install the required dependencies
npm install

# Create migration after changing entities
npm run migration:generate -- src/migrations/CreateUsersTable

# Apply migrations to DB
npm run migration:run

# Start application
npm start

# If you have been using Windows and don't have cross-env (Optional)
npm install --save-dev cross-env
```

## Configuration

Set up environment variables by creating a `.env.development` and `.env.production` file in the project root with the following structure:

```bash
PORT=
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

FRONTEND_VALIDATE_EMAIL_URL=
FRONTEND_RECOVER_PASSWORD_URL=

REDIS_HOST=
REDIS_PORT=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

AES_SECRET_KEY=
JWT_REFRESH_SECRET=
JWT_ACCESS_SECRET=
JWT_VERIFY_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
```

## Usage

Run the API using the following commands:

For development environment:

```bash
npm run start:dev
```

For production environment:

```bash
npm start
```

## Endpoints

### **POST** `/user`

- **Description**: Create a new user.
- **Request Body**:
  - `email` (required);
  - `password` (required);
  - `name` (optional);
  - `username` (optional).
- **Response Example**:

```json
{
    "success": true,
    "statusCode": 201,
    "path": "/user",
    "message": "Request sucessful",
    "data": {
        "id": "5c825b8f-5117-4b0c-8146-86d34af39ca0",
        "name": null,
        "username": null,
        "email": "161efd2cfdeee54d67dc36b2c36d5a5150641e9b61d4bd62d2",
        "emailHash": "25b1b0284bcf792a4c2f989ae1502a5e52814f07ff7625c4ca54d5dca3e9c946",
        "iv": "9a60993d6b135d6042e776f681def651",
        "password": "$2b$10$zgYSQHH9ZFTWS2iekt9.MuFJXNiBIxAMU82Uy4Ntu5vXTBuZvZ1JS",
        "isVerified": false,
        "twoFactorSecret": null,
        "twoFactorEnabled": false,
        "provider": "default",
        "createdAt": "2025-08-04T15:49:28.256Z",
        "updatedAt": "2025-08-04T15:49:28.256Z"
    }
}
```

### **PATCH** `/user/change-password`

- **Description**: Change your older password to a new one
- **Request Body**:
  - `oldPassword` (required);
  - `newPassword` (required);
  - `confirmPassword` (required);
- **Response Example**:

```json
{
    "success": true,
    "statusCode": 200,
    "path": "/user/change-password",
    "message": "Request sucessful",
    "data": {
        "message": "Password changed"
    }
}
```

### **POST** `/auth/login`

- **Description**: Authentication in The Application using user to starting a new session.
- **Request Body**:
  - `email` (required);
  - `password` (required);
- **Response Example**:

```json
{
    "success": true,
    "statusCode": 200,
    "path": "/auth/login",
    "message": "Request sucessful",
    "data": {
        "message": "Login successful"
    }
}
```

### **POST** `/auth/logout`

- **Description**: Exit the Application.
- **Request Body**:
- **Response Example**:

```json
{
    "success": true,
    "statusCode": 200,
    "path": "/auth/logout",
    "message": "Request sucessful",
    "data": {
        "message": "Logout successful"
    }
}
```

### **PATCH** `/auth/refresh-access-token`

- **Description**: Refresh your access token to use the route application.
- **Request Body**:
- **Response Example**:

```json
{
    "success": true,
    "statusCode": 200,
    "path": "/auth/refresh-access-token",
    "message": "Request sucessful",
    "data": {
        "message": "Access token refreshed"
    }
}
```

### **POST** `/auth/send-verification-account-email`

- **Description**: Verify your account using email.
- **Request Body**:
- **Response Example**:

```json
{
    "success": true,
    "statusCode": 200,
    "path": "/auth/send-verification-account-email",
    "message": "Request sucessful",
    "data": {
        "message": "Verification email sent"
    }
}
```

### **POST** `/auth/recover-password`

- **Description**: Sends a recovery password link to your email
- **Request Body**:
  - `email` (required);
- **Response Example**:

```json
{
    "success": true,
    "statusCode": 200,
    "path": "/auth/recover-password",
    "message": "Request sucessful",
    "data": {
        "message": "If the email exists, an email will be sent"
    }
}
```

### **PATCH** `/auth/reset-password?token=${TOKEN}`

- **Description**: Reset your password using the token found in the URL 
- **Request Param**:
  - `token` (required);
- **Request Body**:
  - `newPassword` (required);
  - `confirmPassword` (required);
- **Response Example**:

```json
{
    "success": true,
    "statusCode": 200,
    "path": "/auth/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hdGhldXMucGF2bmVsaUBnbWFpbC5jb20iLCJpYXQiOjE3NTQzMTg0NTQsImV4cCI6MTc1NDMxODc1NH0.TgErqWlvGktEUSD1TrxJ6zn1ZbMmvdrTdVL71ysmIgM",
    "message": "Request sucessful",
    "data": {
        "message": "Password reset"
    }
}
```

### **GET** `/auth/verify-account?token=${TOKEN}`

- **Description**: Use to verify your account 
- **Request Param**:
  - `token` (required);
- **Request Body**:
- **Response Example**:

```json
{
  "success": true,
  "statusCode": 200,
  "path": "/auth/verify-account?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hdGhldXMucGF2bmVsaUBnbWFpbC5jb20iLCJpYXQiOjE3NTQzMjE4NTUsImV4cCI6MTc1NDMyMjE1NX0.35h4ylnukA_A-pfj1bFRErlgzsSJECwmW3D5T7VWbiQ",
  "message": "Request sucessful",
  "data": {
    "message": "Token verified"
  }
}
```

### **GET** `/auth/google`

- **Description**: Starts the Google Authentication using Email
- **Request Param**:
- **Request Body**:
- **Response Example**:

```json
```

### **GET** `/auth/google/callback`

- **Description**: The callback of Google authentication
- **Request Param**:
- **Request Body**:
- **Response Example**:

```json
{
    "success": true,
    "statusCode": 200,
    "path": "/2fa/google/callback",
    "message": "Request sucessful",
    "data": {
        "message": "Login successful"
    }
}
```


### **PATCH** `/2fa/generate`

- **Description**: Starts the initial protocol to activate your 2FA.
- **Request Body**:
- **Response Example**:

```json
{
    "success": true,
    "statusCode": 200,
    "path": "/2fa/generate",
    "message": "Request sucessful",
    "data": {
        "qrCode": "data_image is so big :P",
        "message": "QR code generated"
    }
}
```

### **PUT** `/2fa/activate`

- **Description**: Activate your 2FA using a mobile code..
- **Request Body**:
  - `token` (required);
- **Response Example**:

```json
{
    "success": true,
    "statusCode": 200,
    "path": "/2fa/activate",
    "message": "Request sucessful",
    "data": {
        "message": "2FA enabled"
    }
}
```

### **PATCH** `/2fa/verify`

- **Description**: Verify the code to use in the application routes
- **Request Body**:
  - `token` (required);
- **Response Example**:

```json
{
    "success": true,
    "statusCode": 200,
    "path": "/2fa/verify",
    "message": "Request sucessful",
    "data": {
        "message": "2FA verified"
    }
}
```

### **PUT** `/2fa/disable`

- **Description**: Verify the code to disable 2FA.
- **Request Body**:
  - `token` (required);
- **Response Example**:

```json
{
    "success": true,
    "statusCode": 200,
    "path": "/2fa/disable",
    "message": "Request sucessful",
    "data": {
        "message": "2FA disabled"
    }
}
```

### **GET** `/2fa/send-email-token`

- **Description**: Send a verification code to your email.
- **Request Body**:
- **Response Example**:

```json
{
    "success": true,
    "statusCode": 200,
    "path": "/2fa/send-email-token",
    "message": "Request sucessful",
    "data": {
        "message": "Token sent"
    }
}
```

### **PATCH** `/2fa/verify-email-token`

- **Description**: Verify the code to use in the application routes
- **Request Body**:
  - `token` (required);
- **Response Example**:

```json
{
    "success": true,
    "statusCode": 200,
    "path": "2fa/verify-email-token",
    "message": "Request sucessful",
    "data": {
        "message": "2FA verified"
    }
}
```

## Error Handling

The API follows standard HTTP error codes to indicate the result of a request. Here are the common errors:

- **BadRequestError (400)**: Invalid input or request parameters.
- **UnauthorizedError (401)**: Authentication required or invalid credentials.
- **ForbiddenError (403)**: Access to the requested resource is denied.
- **NotFoundError (404)**: The requested resource could not be found.
- **ConflictError (409)**: Conflict in the request, such as duplicate data.
- **UnprocessableEntityError (422)**: The server understands the request but cannot process it due to invalid data.
- **InternalServerError (500)**: An unexpected condition was encountered on the server.
- **Not Modified (304)**: Occurs when the request does not change any information.

## Contribution

Contributions are welcome! To contribute, follow these steps:

1. Fork the repository.
2. Create a new branch for your feature: `git checkout -b my-new-feature`.
3. Commit your changes: `git commit -m 'Add new feature'`.
4. Push to the branch: `git push origin my-new-feature`.
5. Open a Pull Request.
