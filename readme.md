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
- Python 3.8+
- Node.js 16+
- CUDA-compatible GPU (recommended for model training)
- Firebase account (for database and authentication)
- Expo CLI for mobile development

### Project Structure
```
Nutrilio/
├── App/                    # React Native mobile application
│   ├── app/               # Expo Router pages
│   ├── Components/         # Reusable UI components
│   ├── assets/            # Images and static assets
│   └── utils/             # Utility functions and contexts
├── Backend/               # FastAPI server
│   ├── Engines/           # Core AI/ML engines
│   ├── routes/            # API endpoints
│   └── Documentation/     # API documentation
└── readme.md             # Project documentation
```

### Setup Instructions

#### 1. Clone the Repository
```bash
git clone https://github.com/Priyansh6747/nutrilio.git
cd nutrilio
```

#### 2. Backend Setup (FastAPI Server)
```bash
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r req.txt

# Set up environment variables
# Create a .env file with your Firebase credentials
# Copy firebaseSecret.json to Backend directory

# Run the server
python main.py
```

#### 3. Mobile App Setup (React Native with Expo)
```bash
cd App

# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platforms
npm run android  # For Android
npm run ios      # For iOS
npm run web      # For web
```

#### 4. Environment Configuration
Create a `.env` file in the Backend directory with:
```env
HOST=127.0.0.1
PORT=8000
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

### Quick Start
1. **Start Backend**: `cd Backend && python main.py`
2. **Start Mobile App**: `cd App && npm start`
3. **Access API**: Visit `http://localhost:8000` for API documentation
4. **Test Features**: Use the mobile app to scan food, log meals, and track water

### Demo Features
- **Food Recognition**: Take a photo of food to get instant nutrition analysis
- **Barcode Scanning**: Scan product barcodes for nutrition information
- **Water Tracking**: Log daily water intake with visual progress
- **Meal Logging**: Record meals with detailed nutritional breakdown
- **Data Visualization**: View your nutrition trends and patterns

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


For project-related queries during development phase, please contact the team members directly.

*Public support channels will be established upon project completion and deployment.*

---

*Advancing AI-driven nutrition management for better health outcomes*