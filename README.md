# The Nook Cafe Loyalty App

A QR-based digital loyalty system for small cafes, built to replace traditional punch cards with a role-protected web app.

**Live Demo:** [The Nook Cafe Loyalty App](https://tsyruk.github.io/Nook/)

---

## Project Overview

The Nook Cafe Loyalty App is a digital rewards platform designed for small cafés. It allows customers to collect stamps, staff to manage rewards at the register, and admins to monitor loyalty activity through a protected dashboard.

The application supports three user roles:

- **Customer** - tracks purchases, rewards, and visit history
- **Staff** - scans QR codes, adds stamps, redeems rewards, and grants birthday rewards
- **Admin** - manages customer rewards, removes stamps, grants rewards, and reviews activity

---

## What Makes This Project Stronger

This app originally used simple PIN-based staff/admin access, but it was upgraded to use a better authentication and authorization model:

- **Supabase Auth with email/password**
- **Role-based protection using a `profiles` table**
- **Row Level Security (RLS) for user profile access**
- **Protected Edge Functions for staff/admin actions**
- **Backend role checks for sensitive actions**

---

## Features

### Customer Experience

- Create an account
- Sign in with a phone number
- View a personal QR loyalty card
- Track stamp progress
- See pending free coffee rewards
- View reward expiration dates
- View visit history
- Update account details

### Rewards System

- **10 stamps = 1 free coffee**
- **Birthday month = 1 free coffee**
- Rewards expire after **90 days**

### Staff Tools

Built for fast use at the register.

- Search customers by name or phone
- Scan QR codes
- Add stamps
- Redeem rewards
- Grant birthday rewards
- Protected staff actions through backend role checks

### Admin Dashboard

Admins can monitor loyalty activity and manage rewards.

#### Dashboard analytics

- Total members
- Total visits
- Coffees redeemed
- Active rewards
- Average stamp progress

#### Customer management

- View customer profiles
- Add or remove stamps
- Grant free rewards
- View visit history

#### History

- View redeemed reward activity
- Track customer loyalty actions

---

## Authentication and Security

The admin side of the app now uses **Supabase Auth** instead of a frontend-only PIN flow.

### Current security model

- Admin signs in with **email + password**
- User identity is validated with **Supabase Auth**
- Role is loaded from the **profiles** table
- Staff/admin actions run through a protected **Supabase Edge Function**
- The Edge Function verifies the bearer token and checks the user’s role before allowing actions

---

## Tech Stack
- HTML
- CSS
- JavaScript
- Supabase Auth
- Supabase Database
- Supabase Edge Functions
- 
### Customer flow

```text
Customer creates account
        ↓
Customer receives a QR loyalty card
        ↓
Staff searches by phone/name or scans QR code
        ↓
Staff adds a stamp
        ↓
After 10 stamps, a free coffee reward is created
        ↓
Staff redeems the reward when used

## What I Learned
This project helped me practice building a role-based web app with authentication, backend authorization, and protected actions. I also learned how to improve a project from a simple frontend-only approach into a more realistic architecture using Supabase Auth, RLS, and Edge Functions.

## Setup
1. Clone the repository
2. Open the project files locally
3. Connect the app to your Supabase project
4. Configure environment values as needed
5. Run locally in your browser

## How It Works
1. A customer creates an account
2. The app generates a QR-based loyalty card
3. Staff search by phone/name or scan the QR code
4. A stamp is added after each purchase
5. After 10 stamps, a free coffee reward is created
6. Staff redeem the reward when it is used
