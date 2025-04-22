# COOC Members Club Management System

A sophisticated member management system designed for the COOC gentlemen's club, optimized for iPad usage in landscape orientation.

## Features

- **Secure Reception Login**: Email/password authentication with password management
- **Member Management**: Search, add, and edit member information
- **Check-in System**: Track member and guest visits
- **Guestlist Management**: Create and manage guestlists by date
- **Member Status Tracking**: Monitor active/inactive status with timeline
- **Note System**: Add and view notes for each member
- **Mailing List**: Opt-in functionality for promotional opportunities

## Tech Stack

- React with TypeScript
- Tailwind CSS for styling
- Supabase for authentication and database
- Zustand for state management
- React Router for navigation
- Lucide React for icons

## Getting Started

1. Connect to Supabase using the "Connect to Supabase" button
2. Run the development server:

```
npm run dev
```

3. Create a reception staff account:
   - Use Supabase Auth to create an account
   - Add entry to the `profiles` table with role "reception"

## Database Schema

The system uses the following tables:

- `profiles`: Reception staff accounts
- `members`: Club members information
- `guestlists`: Guestlists organized by date
- `guests`: Individuals on guestlists (may be linked to members)
- `check_ins`: Member check-in records
- `notes`: Notes about members

## Usage Guide

### Reception Login
Reception staff can log in with their email and password. The system is designed for iPad usage in landscape orientation.

### Home Dashboard
- Search for members
- Add new members
- Create guestlists
- View today's guestlists

### Member Management
- Search members by name, email, or phone
- View member details and history
- Add notes to member profiles
- Check members in and out
- Edit member information
- Track membership status (active/inactive)

### Guestlist Management
- Create guestlists for specific dates
- Add existing members to guestlists
- Add new guests
- Check guests in and out
- View guestlist status and details

## iPad Optimization

The interface is specifically designed for iPad usage in landscape orientation (1024×768px) with:
- Appropriate font sizes for touchscreen
- Touch-friendly buttons and controls
- Efficient use of screen real estate
- Landscape-optimized layouts