# The Nook Cafe Loyalty App

A QR-based digital loyalty system for small cafés, built to replace traditional punch cards with a role-protected web app.

**Live Demo:** [The Nook Cafe Loyalty App](https://tsyruk.github.io/Nook/)

![App demo](https://github.com/user-attachments/assets/3e60ecc7-63dd-4072-9f81-7ea6e28ad892)

---

## Overview

The Nook Cafe Loyalty App is a digital rewards platform designed for small cafés. It allows customers to collect stamps, staff to manage rewards at checkout, and admins to monitor loyalty activity through a protected dashboard.

This project was built to simulate a real-world small business workflow using a frontend web app with a more realistic backend security model.

---

## Key Features

### Customer Experience
- Create an account
- Sign in and access a personal QR loyalty card
- Track stamp progress
- View free coffee rewards
- See reward expiration dates
- View visit history
- Update account details

### Staff Tools
- Search customers by name or phone
- Scan QR codes at checkout
- Add stamps after purchases
- Redeem rewards
- Grant birthday rewards
- Perform protected actions through backend role checks

### Admin Dashboard
- View loyalty analytics
- Track members, visits, redemptions, and active rewards
- View customer profiles
- Add or remove stamps
- Grant free rewards
- Review customer visit history
- Monitor reward activity

---

## Rewards System

- **10 stamps = 1 free coffee**
- **Birthday month = 1 free coffee**
- **Rewards expire after 90 days**

---

## Authentication and Security

This project started with a simpler frontend-only access model and was upgraded to use a stronger authentication and authorization approach.

### Current Security Model
- Supabase Auth with email/password
- Role-based protection using a `profiles` table
- Row Level Security (RLS) for controlled access
- Protected Supabase Edge Functions for staff/admin actions
- Backend role checks for sensitive operations

### Why This Matters
This project moves beyond a simple UI demo and demonstrates:
- authenticated sessions
- backend authorization
- role-based access control
- safer admin and staff operations

---

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend / Services
- Supabase Auth
- Supabase Database
- Supabase Edge Functions

---

## How It Works

1. A customer creates an account
2. The app generates a QR-based loyalty card
3. Staff search by phone/name or scan the QR code
4. A stamp is added after each purchase
5. After 10 stamps, a free coffee reward is created
6. Staff redeem the reward when it is used

---

## What I Learned

This project helped me practice building a role-based web app with authentication, backend authorization, and protected actions.

It also helped me understand how to improve a project from a simple frontend-only concept into a more realistic application architecture using Supabase Auth, RLS, and Edge Functions.

---

## Setup

1. Clone the repository
2. Open the project locally
3. Connect the app to your Supabase project
4. Configure any required environment values
5. Run the project in your browser

---

## Future Improvements

- Add a more polished admin analytics dashboard
- Improve role management
- Expand reward options beyond coffee
- Add stronger production-ready validation
- Improve mobile responsiveness
- Add automated tests

---

## About This Project

I built Nook as a portfolio project to demonstrate how a small business loyalty system could work in practice. The project focuses on QR-based workflows, role-based access, customer rewards, and backend-protected actions.

---

## License

This project was created for educational and portfolio purposes.
