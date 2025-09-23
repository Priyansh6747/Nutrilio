# Nutrilio
### An AI-driven, precise nutrition recommendation system for balanced health

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-red.svg)](https://pytorch.org)
[![React Native](https://img.shields.io/badge/React%20Native-0.72+-61DAFB.svg)](https://reactnative.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com)

## 📖 Overview

Nutrilio is an intelligent nutrition management system that combines cutting-edge AI technologies with comprehensive dietary analysis to help users maintain balanced, healthy diets. By leveraging deep learning for food recognition, natural language processing for user interactions, and evidence-based nutritional databases, Nutrilio provides personalized meal recommendations and dietary insights.

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

**⚠️ Note: This project is currently under development. The following setup instructions represent the planned implementation.**

### Prerequisites
- Python 3.8+
- Node.js 16+
- CUDA-compatible GPU (recommended for model training)
- Firebase account (for future database setup)
- Supabase account (for future SQL database)

### Current Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/Priyansh6747/nutrilio.git
cd nutrilio
```

2. **Project Structure** (Planned)
```
nutrilio/
├── backend/          # FastAPI server (in development)
├── frontend/         # React web app (planned)
├── mobile/           # React Native app (in development)
├── ml-models/        # AI/ML model training scripts
├── docs/             # Project documentation
└── data/             # Datasets and nutrition databases
```

### Development Roadmap Setup

**Phase 1: Backend Foundation**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn pytorch torchvision
```

**Phase 2: Mobile App Development**
```bash
cd mobile
npm install -g @expo/cli
npx create-expo-app --template
```

**Phase 3: Model Training Environment**
```bash
cd ml-models
pip install torch torchvision opencv-python scikit-learn
# Download Food-101 dataset for training
```

## 🛠️ Technology Stack

### **AI/ML Framework**
- **PyTorch/TensorFlow**: Deep learning model development
- **OpenCV**: Image preprocessing and computer vision
- **scikit-learn**: Traditional ML algorithms for pattern analysis
- **ONNX/TensorFlow Lite**: Model optimization for mobile inference

### **Backend**
- **FastAPI**: High-performance Python web framework
- **Uvicorn**: ASGI server for concurrent request handling
- **Firebase**: Real-time database and authentication
- **Supabase**: SQL database for structured data

### **Frontend**
- **React Native (Expo)**: Cross-platform mobile development
- **React**: Web application framework
- **Victory Native**: Data visualization for mobile
- **React Native SVG Charts**: Advanced charting capabilities

### **Data Sources**
- **USDA FoodData Central**: Comprehensive nutrition database
- **Food-101**: Training dataset for food recognition
- **IndianFood-101**: Region-specific food dataset
- **WHO/FAO Guidelines**: Evidence-based nutrition standards

## 🎯 Core Modules (In Development)

### 1. Food Identification Module
```python
# Currently in development - Vision Transformer training on Food-101
def identify_food(image):
    # Planned implementation
    preprocessed = preprocess_image(image)
    prediction = vit_model.predict(preprocessed)
    nutrition_data = map_to_nutrition_db(prediction)
    return nutrition_data
```

### 2. Habit Analysis Module (Planned)
- Track meal timing patterns
- Analyze portion size consistency
- Identify nutritional deficiency trends
- Detect irregular eating behaviors

### 3. Recommendation Engine (In Design)
- **Collaborative Filtering**: Learn from similar user patterns
- **Rule-based Logic**: Apply WHO/ICMR nutritional guidelines
- **Deficiency Correction**: Suggest meals to address gaps

### 4. RAG-powered Chatbot (Future Implementation)
- Natural language query processing
- Context-aware responses using nutrition guidelines
- Integration with user's personal dietary history

*Implementation details will be updated as development progresses.*

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

## 🔧 Planned API Documentation

**⚠️ APIs are currently in design phase. Documentation will be updated as implementation progresses.**

### Authentication (Planned)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

### Food Recognition (In Development)
```http
POST /api/food/analyze
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  "image": <file>,
  "user_id": "string"
}
```

### Meal Logging (Planned)
```http
POST /api/meals/log
Content-Type: application/json
Authorization: Bearer <token>

{
  "foods": ["apple", "chicken breast"],
  "portions": [1, 200],
  "timestamp": "2025-09-19T12:00:00Z"
}
```

*Complete API documentation will be available upon implementation completion.*

## 🤝 Contributing

**This is an academic project currently under development by JIIT students. External contributions are welcome once the initial implementation is complete.**

### For Current Development Team:
1. Follow the project timeline and milestones
2. Create feature branches for specific modules
3. Document code thoroughly for academic evaluation
4. Regular progress updates in team meetings

### For Future Contributors:
1. Fork the repository (once public)
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

*Contribution guidelines will be expanded upon project completion.*

## 📋 Project Status

**⚠️ This project is currently in development as part of a Minor Project-1 course.**

### ✅ Completed
- [x] Project proposal and literature review
- [x] System architecture design
- [x] Technology stack selection
- [x] Database schema planning
- [x] UI/UX wireframes and mockups

### 🚧 Currently In Progress
- [ ] Food recognition model development and training
- [ ] Backend API implementation (FastAPI)
- [ ] Database setup (Firebase + Supabase integration)
- [ ] Mobile app development (React Native)
- [ ] Basic meal logging functionality

### 📝 Upcoming Milestones
- [ ] Image preprocessing pipeline
- [ ] Vision Transformer model training on Food-101 dataset
- [ ] Nutrition database integration (USDA FoodData Central)
- [ ] RAG-based chatbot implementation
- [ ] Habit analysis module
- [ ] Recommendation engine development
- [ ] Testing and performance optimization
- [ ] Final project documentation and presentation

### 🎯 Expected Completion
**Academic Timeline**: End of 5th Semester (2025-2026)


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