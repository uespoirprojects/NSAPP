# NS App - Screen Structure

This document describes the planned screens for implementation.

## 📱 Current Implementation

### 1. **Login Screen** (`app/login.tsx`) ✅
- Simple login form with email and password fields
- Basic text input placeholders
- No functionality implemented - ready for collaborators to build

## 🎯 Planned Screens for Implementation

### Authentication Screens

### 1. **Login Screen** (`app/login.tsx`) ✅ Current
- User authentication entry point
- Email and password input fields
- Basic structure only - no logic implemented

### 2. **Sign Up Screen** (To be implemented)
- User registration interface
- Name, email, and password fields
- Link to login page

### Content Screens

### 3. **Category Screen** (To be implemented)
- Browse available course categories
- Shows category name and video count
- Navigate to videos list for selected category

### 4. **Videos List Screen** (To be implemented)
- Displays video lessons for a category
- Shows video thumbnails, titles, and durations
- Navigation to video player or quiz

### 5. **Quiz Screen** (To be implemented)
- Interactive quiz interface
- Question display with multiple choice options
- Progress indicator
- Submit answer functionality

### 6. **Quiz Result Screen** (To be implemented)
- Shows quiz performance summary
- Displays score percentage and pass/fail status
- Correct answers count
- Options to retake quiz or return to learning

### Learning Screens

### 7. **My Learning Screen** (To be implemented)
- User's learning progress dashboard
- Shows enrolled courses with completion status
- Progress bars for each course
- Quick access to continue learning

### 8. **Profile Screen** (To be implemented)
- User profile information
- Profile picture and user details
- Statistics (courses, certificates)
- Edit profile, settings, and logout options

## 🎨 Design System

All screens use:
- **Font:** Poppins (Regular, Medium, SemiBold, Bold)
- **Primary Color:** Blue `#155DFC`
- **Background:** Light `#FFFFFF`
- **Component:** Typography from `@/components/ui`

## 📝 For Collaborators

Each screen should be implemented with:
1. Proper authentication logic for Login/SignUp
2. Real data fetching for Categories and Videos
3. Quiz engine for Quiz screen
4. Backend API integration for data persistence
5. State management for user progress
6. Navigation flow based on app requirements

The current login screen is a starting point - build the rest as needed!