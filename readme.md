# Nutrilio
### An AI-driven, precise nutrition recommendation system for balanced health

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-red.svg)](https://pytorch.org)
[![React Native](https://img.shields.io/badge/React%20Native-0.72+-61DAFB.svg)](https://reactnative.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com)

## 📖 Overview

Nutrilio is a fully functional, AI-driven nutrition management system that combines cutting-edge machine learning with comprehensive dietary analysis to help users maintain balanced, healthy diets. The system features real-time food recognition, automated nutrition analysis, and intuitive mobile interfaces, making healthy eating accessible and trackable for everyone.

**🎯 Current Status**: **LIVE & FUNCTIONAL** - All core features are implemented and working!

## 🎯 Key Features

### 🍽️ **Multi-Modal Meal Logging**
- **Image Recognition**: Upload food photos for automatic identification using Vision Transformers
- **Text Input**: Log meals via text descriptions with NLP-powered parsing
- **Voice Logging**: Speak your meals for hands-free tracking

### 📊 **Intelligent Nutrition Analysis**
- **Real-time Nutrient Breakdown**: Automatic calculation of macros, micros, and calories
- **Deficiency Detection**: AI-powered analysis identifies nutritional gaps
- **Historical Tracking**: Long-term dietary pattern analysis and trend visualization

### 🤖 **AI-Powered Features**
- **RAG Chatbot**: Ask questions about your nutrition using natural language
- **Habit Analysis**: Detects eating patterns, timing, and portion irregularities
- **Smart Recommendations**: Personalized meal suggestions based on WHO/ICMR standards

### 📱 **Cross-Platform Access**
- Native mobile apps (iOS & Android) built with React Native
- Responsive web interface
- Real-time synchronization across devices

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Web Client    │    │   Voice Input   │
│  (React Native) │    │    (React)      │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼───────────────┐
                    │      FastAPI Server         │
                    │    (Authentication &        │
                    │     Request Routing)        │
                    └─────────────┬───────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
┌───────▼────────┐    ┌─────────▼─────────┐    ┌─────────▼─────────┐
│ Food Recognition│    │  Habit Analysis   │    │ Recommendation    │
│    Module       │    │     Module        │    │     Engine        │
│ (Vision Trans.) │    │  (Pattern Det.)   │    │ (Collaborative +  │
└────────┬───────┘    └─────────┬─────────┘    │   Rule-based)     │
         │                      │              └─────────┬─────────┘
         │              ┌───────▼───────┐                │
         │              │  Query Bot    │                │
         │              │ (RAG + LLM)   │                │
         │              └───────────────┘                │
         │                                               │
    ┌────▼─────────────────────────────────────────────────▼────┐
    │                Database Layer                            │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
    │  │   Firebase  │  │  Supabase   │  │ Nutrition DBs   │   │
    │  │ (Real-time) │  │   (SQL)     │  │ (USDA, WHO/FAO) │   │
    │  └─────────────┘  └─────────────┘  └─────────────────┘   │
    └──────────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- **Python 3.8+**
- **Node.js 16+** and npm
- **Firebase Account** ([Create one here](https://firebase.google.com/))
- **Gemini API Key** ([Get it here](https://makersuite.google.com/app/apikey))
- **Expo CLI** (installed via npm)
- **Mobile Device or Emulator** for testing

### Project Structure
```
Nutrilio/
├── App/                    # React Native mobile application
│   ├── app/               # Expo Router pages
│   ├── Components/         # Reusable UI components
│   ├── assets/            # Images and static assets
│   └── utils/             # Utility functions and contexts
│       ├── Config.js      # Server configuration
│       └── firebaseConfig.js  # Firebase configuration
├── Backend/               # FastAPI server
│   ├── Engines/           # Core AI/ML engines
│   ├── routes/            # API endpoints
│   ├── main.py            # Server entry point
│   ├── req.txt            # Python dependencies
│   ├── .env               # Environment variables
│   └── firebaseSecret.json  # Firebase admin credentials
└── README.md             # Project documentation
```

## 🔧 Installation & Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/Priyansh6747/nutrilio.git
cd nutrilio
```

### Step 2: Backend Setup

#### 2.1 Create Python Virtual Environment
```bash
cd Backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

#### 2.2 Install Python Dependencies
```bash
pip install -r req.txt
```

#### 2.3 Configure Firebase Admin SDK
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Navigate to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the downloaded JSON file as `firebaseSecret.json`
6. Place `firebaseSecret.json` in the **Backend root directory**

#### 2.4 Set Up Environment Variables
Create a `.env` file in the **Backend** directory:

```env
# Your local IPv4 address (find using ipconfig/ifconfig)
HOST=192.168.1.100

# Server port
PORT=8000

# Get your Gemini API key from https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here
```

**To find your IPv4 address:**
- **Windows**: Open CMD and run `ipconfig`, look for "IPv4 Address"
- **macOS/Linux**: Open Terminal and run `ifconfig` or `ip addr`, look for inet address

#### 2.5 Start the Backend Server
```bash
python3 main.py
```

**Expected output:**
```
INFO:     Started server process
INFO:     Uvicorn running on http://192.168.1.100:8000
```

**📝 Important**: Copy the server URL (e.g., `http://192.168.1.100:8000`) - you'll need it for frontend configuration.

---

### Step 3: Frontend (Mobile App) Setup

#### 3.1 Navigate to App Directory
```bash
cd ../App
```

#### 3.2 Install Node Dependencies
```bash
npm install
```

#### 3.3 Configure Server URL
Open `App/utils/Config.js` and update the `BaseURL` with your backend server URL:

```javascript
const ServerConfig = {
    BaseURL: 'http://192.168.1.100:8000', // Replace with YOUR server URL
}

export default ServerConfig;
```

#### 3.4 Configure Firebase for Mobile App
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Add a new app (iOS or Android)
4. Copy the Firebase configuration object

Open `App/utils/firebaseConfig.js` and update with your Firebase credentials:

```javascript
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456",
    measurementId: "G-XXXXXXXXXX"
};

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
```

#### 3.5 Start the Development Server

**Option A: Using Android/iOS Emulator**
```bash
# Start Expo development server
npx expo start

# In the Expo Dev Tools (terminal menu):
# Press 'a' for Android emulator
# Press 'i' for iOS simulator
# Press 'w' for web browser
```

**Option B: Using Expo Go App (Physical Device)**
1. Install **Expo Go** from App Store (iOS) or Play Store (Android)
2. Run `npx expo start` in the terminal
3. Scan the QR code displayed in the terminal with:
    - **iOS**: Camera app
    - **Android**: Expo Go app

**⚠️ Important Note about Expo Go:**
If Expo Go prompts you to upgrade the project or use a different SDK version:
- **Recommended**: Use **Expo Go SDK 53** (the app will provide a download link)
- This ensures compatibility with the current project configuration

---

## 🎯 Quick Start Guide

### 1. Start the Backend
```bash
cd Backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python3 main.py
```

### 2. Start the Mobile App
```bash
cd App
npx expo start
```

### 3. Test the App
- **Register**: Create a new account
- **Scan Food**: Use camera to identify food items
- **Log Meals**: Track your daily nutrition
- **Track Water**: Monitor hydration
- **View Analytics**: Check your nutrition trends

---

## 🛠️ Technology Stack

### **AI/ML Framework**
- **PyTorch 2.8.0**: Deep learning model development and training
- **Transformers 4.56.2**: Hugging Face transformers for NLP and vision models
- **Hugging Face Hub**: Model hosting and deployment
- **NumPy 2.3.3**: Numerical computing and data processing
- **Pillow 11.3.0**: Image processing and manipulation

### **Backend**
- **FastAPI 0.116.2**: High-performance Python web framework
- **Uvicorn 0.35.0**: ASGI server for concurrent request handling
- **Firebase Admin 7.1.0**: Real-time database and authentication
- **Google Cloud Firestore 2.21.0**: NoSQL database for structured data
- **Pydantic 2.11.9**: Data validation and serialization

### **Mobile Frontend**
- **React Native 0.79.5**: Cross-platform mobile development
- **Expo SDK 53.0.20**: Development platform and tools
- **Expo Router 5.1.4**: File-based routing system
- **React Native Chart Kit 6.12.0**: Data visualization components
- **React Native SVG 15.11.2**: SVG rendering for charts
- **Expo Camera 17.0.8**: Camera functionality for food scanning
- **Expo Barcode Scanner 13.0.1**: Barcode scanning capabilities

### **Key Dependencies**
- **Firebase 12.0.0**: Real-time database and authentication
- **React 19.0.0**: Core React library
- **TypeScript 5.8.3**: Type safety and development experience
- **AsyncStorage 2.1.2**: Local data persistence
- **Expo Image Picker 16.1.4**: Image selection and capture

### **Data Sources**
- **USDA FoodData Central**: Comprehensive nutrition database
- **Food-101**: Training dataset for food recognition
- **IndianFood-101**: Region-specific food dataset
- **WHO/FAO Guidelines**: Evidence-based nutrition standards

## 🎯 Core Modules

### 1. Food Identification Module ✅ **IMPLEMENTED**
```python
# Vision-based food recognition with ML model
def predict_food(image_bytes):
    # Uses trained model for food classification
    prediction = predict_food(image_bytes)
    return {
        "result": prediction["result"],
        "confidence": prediction["confidence"]
    }
```

**Features Implemented:**
- Image-based food recognition using trained ML model
- Confidence scoring for predictions
- Integration with nutrition analysis pipeline
- Support for multiple food items in single image

### 2. Nutrition Analysis Engine ✅ **IMPLEMENTED**
```python
# Comprehensive nutrient breakdown
def nutrient_analysis(food_name, description, amount):
    # Analyzes nutritional content and provides detailed breakdown
    return nutrient_breakdown
```

**Features Implemented:**
- Real-time nutrient calculation
- Macro and micronutrient analysis
- Portion size adjustments
- Database integration for accurate nutrition data

### 3. Barcode Scanning Module ✅ **IMPLEMENTED**
```python
# Product identification via barcode
def read_barcode(code):
    # Scans barcode and retrieves product information
    return product_data
```

**Features Implemented:**
- Barcode scanning for packaged foods
- Product database integration
- Automatic nutrition data retrieval

### 4. Meal Logging System ✅ **IMPLEMENTED**
- **Text Input**: Manual meal entry with description
- **Image Upload**: Photo-based food logging
- **Barcode Scan**: Product-based logging
- **Background Processing**: Asynchronous nutrition analysis

### 5. Water Tracking Module ✅ **IMPLEMENTED**
- Daily water intake logging
- Hydration goal tracking
- Historical water consumption analysis
- Visual progress indicators

### 6. User Authentication & Profile ✅ **IMPLEMENTED**
- Firebase-based authentication
- User profile management
- Secure data storage
- Cross-device synchronization

## 📊 Expected Model Performance

**Note: These are target performance metrics based on literature review and similar systems.**

### Food Recognition Goals
- **Food-101 Dataset**: Target 95%+ classification accuracy
- **Portion Estimation**: Target 80-90% accuracy
- **Multi-food Detection**: Support for complex meal images
- **Real-time Inference**: Target <3 seconds on mobile devices

### Nutrition Analysis Targets
- **Macro Accuracy**: Target 90%+ for common foods
- **Micro Estimation**: Target 80%+ for tracked vitamins/minerals
- **Calorie Prediction**: Target ±15% margin for portion-controlled foods

*Actual performance metrics will be updated as development progresses.*

## 🔧 API Documentation

**✅ APIs are fully implemented and functional!**

### Base URL
```
http://localhost:8000
```

### Authentication Endpoints
```http
# User Registration
POST /api/v1/user/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe"
}

# User Login
POST /api/v1/user/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Food Recognition & Analysis
```http
# Image-based Food Prediction
POST /api/v1/log/predict
Content-Type: multipart/form-data

{
  "name": "Apple",
  "image": <file>,
  "description": "Red apple" (optional)
}

# Response:
{
  "result": {
    "name": "Apple",
    "confidence": 0.95,
    "nutrition": {...}
  },
  "suggested_food": "Apple",
  "confidence": 0.95,
  "original_ml_confidence": 0.92,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Meal Logging
```http
# Log Meal with Analysis
POST /api/v1/log/analyse
Content-Type: application/json

{
  "username": "user123",
  "name": "Chicken Breast",
  "description": "Grilled chicken breast",
  "amnt": 200
}

# Response:
{
  "status": "started",
  "doc_id": "meal_12345"
}
```

### Water Tracking
```http
# Log Water Intake
POST /api/v1/water/log
Content-Type: application/json

{
  "username": "user123",
  "amount": 250,
  "timestamp": "2024-01-15T10:30:00Z"
}

# Get Water History
GET /api/v1/water/history/{username}
```

### Barcode Scanning
```http
# Get Product by Barcode
GET /api/v1/log/barcode/read/{barcode}

# Response:
{
  "name": "Product Name",
  "brand": "Brand Name",
  "nutrition": {...},
  "barcode": "1234567890"
}
```

### Available Endpoints Summary
- `POST /api/v1/user/register` - User registration
- `POST /api/v1/user/login` - User authentication
- `POST /api/v1/log/predict` - Food image recognition
- `POST /api/v1/log/analyse` - Meal nutrition analysis
- `GET /api/v1/log/barcode/read/{code}` - Barcode product lookup
- `POST /api/v1/water/log` - Water intake logging
- `GET /api/v1/water/history/{username}` - Water consumption history

## 📱 Mobile App Features

### **Implemented UI Components**
- **Onboarding Flow**: Step-by-step user introduction
- **Authentication Screens**: Login, registration, and email verification
- **Tab Navigation**: Home, Journal, Log, and Profile tabs
- **Food Logging**: Camera scan, barcode scanner, and manual entry
- **Water Tracking**: Hydration dashboard with progress visualization
- **Charts & Analytics**: Comprehensive data visualization
- **Profile Management**: User settings and preferences

### **Key Mobile Features**
- **Camera Integration**: Direct food photo capture and analysis
- **Barcode Scanner**: Instant product identification
- **Real-time Sync**: Firebase-powered data synchronization
- **Offline Support**: Local data storage with AsyncStorage
- **Responsive Design**: Optimized for various screen sizes
- **Gesture Support**: Intuitive touch interactions

## 🐛 Troubleshooting

### Backend Issues

**Problem: `ModuleNotFoundError` when running the server**
```bash
# Solution: Ensure virtual environment is activated and dependencies installed
source venv/bin/activate  # macOS/Linux
pip install -r req.txt
```

**Problem: Firebase authentication error**
```bash
# Solution: Verify firebaseSecret.json is in Backend root directory
# Check that the file has valid JSON credentials
```

**Problem: Server not accessible from mobile device**
```bash
# Solution: Ensure HOST in .env is your local network IP (not 127.0.0.1)
# Check that your device is on the same WiFi network
# Disable firewall temporarily to test connectivity
```

### Frontend Issues

**Problem: Metro bundler error or dependency issues**
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start --clear
```

**Problem: Expo Go SDK version mismatch**
```bash
# Solution: Download Expo Go SDK 53 from the link provided in the app
# Or upgrade project: npx expo install expo@latest
```

**Problem: Camera/Barcode scanner not working**
```bash
# Solution: Ensure permissions are granted in device settings
# For iOS: Settings → Nutrilio → Allow Camera
# For Android: Settings → Apps → Nutrilio → Permissions
```

## 🤝 Contributing

**This project is actively maintained and welcomes contributions!**

### For Contributors:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines:
- Follow existing code style and patterns
- Add tests for new features
- Update documentation for API changes
- Ensure mobile app compatibility
- Test on both iOS and Android platforms

### Areas for Contribution:
- **UI/UX Improvements**: Enhanced user interface design
- **Performance Optimization**: Faster API responses and app loading
- **New Features**: Additional nutrition tracking capabilities
- **Testing**: Comprehensive test coverage
- **Documentation**: Improved API and user documentation

## 📋 Project Status

**🎉 This project is actively developed and functional!**

### ✅ Completed Features
- [x] **Backend API Implementation**: Complete FastAPI server with all endpoints
- [x] **Food Recognition**: ML-powered image classification system
- [x] **Nutrition Analysis**: Comprehensive nutrient breakdown engine
- [x] **Barcode Scanning**: Product identification and nutrition lookup
- [x] **Meal Logging**: Multi-modal food logging (text, image, barcode)
- [x] **Water Tracking**: Hydration monitoring and goal tracking
- [x] **User Authentication**: Firebase-based user management
- [x] **Mobile App**: React Native app with Expo Router
- [x] **Database Integration**: Firebase Firestore for data persistence
- [x] **UI Components**: Comprehensive component library
- [x] **Charts & Visualization**: Data visualization with React Native Chart Kit

### 🚧 Currently In Progress
- [ ] **Model Optimization**: Improving food recognition accuracy
- [ ] **Performance Tuning**: Optimizing API response times
- [ ] **UI/UX Enhancements**: Improving user experience
- [ ] **Testing**: Comprehensive test coverage

### 📝 Upcoming Features
- [ ] **Habit Analysis**: Pattern detection and insights
- [ ] **Recommendation Engine**: Personalized meal suggestions
- [ ] **RAG Chatbot**: AI-powered nutrition assistant
- [ ] **Social Features**: Community and sharing capabilities
- [ ] **Advanced Analytics**: Detailed nutrition insights
- [ ] **Export Features**: Data export and reporting

### 🎯 Current Status
**Project Status**: **FUNCTIONAL** - Core features are implemented and working
**Development Phase**: Active development and feature enhancement
**Deployment**: Ready for testing and user feedback

## 🏆 Project Achievements

### **Technical Milestones Reached**
- ✅ **Complete Backend API**: Full FastAPI implementation with all endpoints
- ✅ **ML Model Integration**: Working food recognition with confidence scoring
- ✅ **Mobile App Development**: Cross-platform React Native application
- ✅ **Database Integration**: Firebase Firestore for real-time data sync
- ✅ **Authentication System**: Secure user management with Firebase Auth
- ✅ **Multi-modal Input**: Image, barcode, and text-based food logging
- ✅ **Nutrition Analysis**: Comprehensive nutrient breakdown engine
- ✅ **Data Visualization**: Interactive charts and progress tracking

### **Key Technical Features**
- **Real-time Food Recognition**: Instant food identification from photos
- **Barcode Product Lookup**: Automatic nutrition data from product codes
- **Background Processing**: Asynchronous nutrition analysis
- **Cross-platform Compatibility**: iOS, Android, and Web support
- **Offline Capability**: Local data storage with sync
- **Scalable Architecture**: Modular design for easy feature additions

### **Development Statistics**
- **Backend**: 7 API endpoints, 3 core engines, Firebase integration
- **Mobile App**: 15+ screens, 20+ components, full navigation
- **AI/ML**: Trained model with 25,500+ training steps
- **Database**: Real-time sync with Firebase Firestore
- **Dependencies**: 90+ packages across backend and frontend

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- WHO/FAO for nutrition guidelines and standards
- USDA for comprehensive food nutrition database
- Food-101 and IndianFood-101 dataset contributors
- Open source community for amazing tools and frameworks

---

## 📞 Support

For project-related queries during development phase, please contact the team members directly.

*Public support channels will be established upon project completion and deployment.*

---

**Happy Exploring! 🎉**

*Advancing AI-driven nutrition management for better health outcomes*