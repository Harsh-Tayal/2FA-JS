# 2FA Authentication with Express.js

This project implements a basic 2-Factor Authentication (2FA) system using Express.js. It utilizes `otplib` for generating and verifying authentication codes, and `node-json-db` for user data storage.

## Features

- User login with optional 2FA
- QR Code generation for 2FA setup
- Enable and verify 2FA for user accounts
- Session management with cookies

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Harsh-Tayal/2FA-JS
   ```

2. Navigate to the project directory:

   ```bash
   cd your-repo-name
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

## Usage

1. Start the server:

   ```bash
   npm start
   ```

2. The application will be running on `http://localhost:3000`.

## API Endpoints

### Login User

- **URL:** `/login`
- **Method:** `GET`
- **Query Parameters:**
  - `id` - User ID
  - `password` - User Password
  - `code` - (Optional) 2FA Code
- **Response:**
  - Success: `{ success: true }`
  - Code Requested: `{ codeRequested: true }`
  - Error: `{ error: "Invalid credentials" }`

### Generate QR Code for 2FA

- **URL:** `/qrImage`
- **Method:** `GET`
- **Cookies:**
  - `id` - User ID
- **Response:**
  - Success: `{ success: true, image: <QR Code Image Data URL> }`
  - Error: `{ success: false }`

### Enable 2FA

- **URL:** `/set2FA`
- **Method:** `GET`
- **Cookies:**
  - `id` - User ID
- **Query Parameters:**
  - `code` - 2FA Code
- **Response:**
  - Success: `{ success: true }`
  - Error: `{ success: false }`

### Check Current Session

- **URL:** `/check`
- **Method:** `GET`
- **Cookies:**
  - `id` - User ID
- **Response:**
  - Success: `{ success: true, id: <User ID> }`
  - Error: `{ success: false }`

### Logout User

- **URL:** `/logout`
- **Method:** `GET`
- **Response:**
  - Success: `{ success: true }`

## Dependencies

- express
- cookie-parser
- node-json-db
- qrcode
- otplib
