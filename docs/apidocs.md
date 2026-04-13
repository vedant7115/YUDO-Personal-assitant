# YUDO API Documentation

## Authentication

| Method | Endpoint     | Description   |
| ------ | ------------ | ------------- |
| POST   | /auth/signup | Register user |
| POST   | /auth/login  | Login user    |
| POST   | /auth/logout | Logout        |
| GET    | /auth/me     | Current user  |

---

## User

| Method | Endpoint      |
| ------ | ------------- |
| GET    | /user/profile |
| PUT    | /user/profile |

---

## Documents

| Method | Endpoint          |
| ------ | ----------------- |
| POST   | /documents/upload |
| GET    | /documents        |
| DELETE | /documents/:id    |

---

## Notes

| Method | Endpoint   |
| ------ | ---------- |
| POST   | /notes     |
| GET    | /notes     |
| PUT    | /notes/:id |
| DELETE | /notes/:id |

---

## Timeline

| Method | Endpoint  |
| ------ | --------- |
| POST   | /timeline |
| GET    | /timeline |

---

## Goals

| Method | Endpoint   |
| ------ | ---------- |
| POST   | /goals     |
| GET    | /goals     |
| PUT    | /goals/:id |

---

## Journal

| Method | Endpoint |
| ------ | -------- |
| POST   | /journal |
| GET    | /journal |

---

## Chat AI

| Method | Endpoint      |
| ------ | ------------- |
| POST   | /chat         |
| GET    | /chat/history |

---

## Dashboard

| Method | Endpoint         |
| ------ | ---------------- |
| GET    | /dashboard/stats |
