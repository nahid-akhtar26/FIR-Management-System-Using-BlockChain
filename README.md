# FIR Management System using Blockchain

A full-stack FIR registration and tracking system with a **simple tamper-evident blockchain layer**.

## ✅ What this version includes
- FIR registration with validation (name, incident details, date/time, location, officer workflow).
- Role-based access (`user`, `officer`, `admin`) with JWT auth.
- Each FIR is anchored to a mined blockchain block (SHA-256, previous hash linking, timestamp, nonce).
- FIR integrity verification endpoint.
- Chain validation endpoint for officers/admin.
- Refactored backend with controllers, validators, config, middleware, and utilities.
- Better logging and centralized error handling.

---

## Tech Stack
- **Frontend:** React 18, React Router, Axios
- **Backend:** Node.js, Express
- **Database:** MongoDB + Mongoose
- **Security/Auth:** JWT, bcryptjs, express-validator
- **Blockchain:** Custom SHA-256 linked-block chain persisted in `blockchain/chain.json`

---

## Updated Structure

```text
PRO/
├── blockchain/
│   └── SimpleBlockchain.js
├── client/
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── firController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── requestLogger.js
│   ├── models/
│   │   ├── FIR.js
│   │   └── User.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── blockchain.js
│   │   ├── fir.js
│   │   └── user.js
│   ├── services/
│   │   └── blockchainService.js
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   └── logger.js
│   ├── validators/
│   │   └── firValidators.js
│   └── index.js
├── .env.example
└── README.md
```

---

## Environment Variables
Create `.env` from `.env.example`.

```bash
cp .env.example .env
```

Set values as needed:
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV`

---

## Installation

```bash
npm install
cd client && npm install && cd ..
```

## Run (Dev)

```bash
npm run dev
```

This starts:
- API: `http://localhost:5000`
- Web: `http://localhost:3000`

---

## Main API Endpoints

### FIR
- `POST /api/fir/submit` - Register FIR
- `GET /api/fir/my-firs` - List own FIRs
- `GET /api/fir/:id` - View single FIR
- `PUT /api/fir/:id/status` - Officer/Admin status update
- `GET /api/fir/:id/verify` - Verify FIR integrity

### Blockchain
- `GET /api/blockchain/fir/:id/verify` - Verify FIR against blockchain
- `GET /api/blockchain/chain/validate` - Validate full chain (officer/admin)

---

## Notes for Beginners
- FIR core fields are immutable at database level after submission.
- Integrity verification compares DB FIR snapshot to on-chain data hash.
- If any FIR core field is tampered, verification fails.
