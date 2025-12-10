# Akademix

**Akademix** is an educational learning platform that delivers video courses organized by categories and subjects, with content streamed from YouTube playlists. Users can watch instructional videos, take quizzes after each lesson to test their knowledge, and track their learning progress including completed videos, quiz scores, and watch time. The app supports multiple languages (French, Haitian Creole, English, Spanish) and includes an admin panel for managing courses, subjects, and users. Users can access their personalized learning dashboard to view in-progress and completed courses, making it a complete mobile learning management system for structured educational content.

## 🚀 Features

- **Video Learning**: Stream educational videos from YouTube playlists organized by categories and subjects
- **Interactive Quizzes**: Take quizzes after each lesson with automatic scoring and progress tracking
- **Progress Tracking**: Monitor completed videos, quiz scores, watch time, and learning statistics
- **Multi-language Support**: Available in French, Haitian Creole, English, and Spanish
- **User Authentication**: Secure login/signup with email/password or Google authentication
- **Admin Panel**: Manage categories, subjects, users, and content through Firebase Firestore
- **Learning Dashboard**: View in-progress and completed courses with detailed progress metrics
- **Offline Support**: Cached quiz content and progress synchronization

## 🛠️ Tech Stack

- **Framework**: Expo React Native with TypeScript
- **Styling**: NativeWind (Tailwind CSS) + Gluestack UI
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Navigation**: Expo Router
- **State Management**: React Context API
- **Internationalization**: Custom i18n implementation

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Firebase project with Authentication and Firestore enabled
- Google OAuth credentials (for Google Sign-In)

## 🔧 Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ns_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add fonts**: Download Poppins fonts from [Google Fonts](https://fonts.google.com/specimen/Poppins) → place in `assets/fonts/`:
   - `Poppins-Regular.ttf`
   - `Poppins-Medium.ttf`
   - `Poppins-SemiBold.ttf`
   - `Poppins-Bold.ttf`

4. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google Sign-In)
   - Enable Firestore Database
   - Copy your Firebase config to `lib/firebase.ts`

5. **Set up Firestore Security Rules**
   - Copy the security rules from the project documentation to Firebase Console → Firestore → Rules
   - Ensure rules allow authenticated users to read/write their own progress data

6. **Run the app**
   ```bash
   npm run start
   # Then press 'i' for iOS, 'a' for Android, or 'w' for web
   ```

## 📁 Project Structure

```
ns_app/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── home.tsx       # Home/Categories screen
│   │   ├── my-learning.tsx # Learning progress dashboard
│   │   └── profile.tsx    # User profile
│   ├── admin/             # Admin panel screens
│   ├── video/             # Video player and quiz screens
│   ├── login.tsx          # Login screen
│   └── signup.tsx         # Signup screen
├── assets/                 # Images, fonts, quizzes
│   ├── fonts/             # Poppins font files
│   ├── images/            # App icons and images
│   └── quizzes/           # Quiz JSON files
├── components/            # Reusable UI components
├── contexts/              # React Context providers
│   ├── auth-context.tsx   # Authentication state
│   ├── i18n-context.tsx   # Internationalization
│   └── theme-context.tsx  # Theme management
├── services/              # Business logic and API calls
│   ├── authService.ts     # Authentication service
│   ├── progressService.ts # User progress tracking
│   ├── quizService.ts     # Quiz management
│   └── adminService.ts   # Admin operations
├── lib/                   # Firebase configuration
└── types/                 # TypeScript type definitions
```

## 🎨 Brand Assets

**Font:** Poppins (Regular, Medium, SemiBold, Bold)  
**Colors:** 
- Blue `#155DFC`
- Light Blue `#F2F8FF`
- Grey `#ECECF0`
- Red `#EA222B`
- Black `#030213`
- White Smoke `#F3F3F5`

## 💻 Usage

### Styling

**Gluestack UI + NativeWind (Tailwind classes)**

**Pre-built Components:**
```tsx
import { Typography } from '@/components/ui';

<Typography variant="h1" color="#155DFC">Heading</Typography>
```

**Fonts:**
```tsx
<Text className="font-poppins-bold">Bold text</Text>
<Text style={{fontFamily: 'Poppins-Regular'}}>Regular text</Text>
```

**Colors:**
```tsx
<View className="bg-brand-blue">
  <Text className="text-brand-black">Blue background, black text</Text>
</View>
```

**Available classes:** `font-poppins`, `font-poppins-medium`, `font-poppins-semibold`, `font-poppins-bold`  
**Available colors:** `bg-brand-blue`, `text-brand-blue`, `bg-brand-light-blue`, `bg-brand-grey`, `bg-brand-red`, `bg-brand-black`, `bg-brand-white-smoke`

## 🔐 Firebase Configuration

### Firestore Security Rules

The app requires specific Firestore security rules for:
- **users**: Users can read/update their own profile
- **userProgress**: Users can read/write their own progress data
- **categories**: Public read, admin write
- **subjects**: Public read, admin write

See Firebase Console → Firestore → Rules for the complete rule set.

### Collections Structure

- **users**: User profiles and authentication data
- **userProgress**: User learning progress (completed videos, quiz results, watch time)
- **categories**: Course categories
- **subjects**: Course subjects with YouTube playlist IDs and quiz slugs

## 📱 Recent Updates

### Authentication & Security
- ✅ Implemented Firestore security rules for user data and progress tracking
- ✅ Added permission error handling and suppression during auth state transitions
- ✅ Improved authentication state management with proper cleanup on logout

### Performance Optimizations
- ✅ Quiz prefetching now occurs only after authentication (not on app start)
- ✅ Quizzes are prefetched once per session to reduce unnecessary network calls
- ✅ Improved loading states and error handling throughout the app

### Features
- ✅ Video progress tracking with watch time and completion status
- ✅ Quiz result saving and progress synchronization
- ✅ Multi-language support (FR, HT, EN, ES)
- ✅ Admin panel for content management
- ✅ Learning dashboard with progress statistics

## 🐛 Troubleshooting

- **Fonts not loading:** Check `assets/fonts/` directory has all 4 Poppins files
- **Cache issues:** `npm run start -- --clear`
- **Build issues:** Delete `node_modules` → `npm install`
- **Firebase permission errors:** Verify Firestore security rules are properly configured
- **Quiz not loading:** Ensure quiz JSON files exist in `assets/quizzes/[subject]/[language].json`

## 📄 License

This project is owned by **UESPOIR**.

## 👥 Contributing

See `SCREENS.md` for detailed documentation of screens and planned features.
