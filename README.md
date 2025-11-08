# 🔮 Madame Mystique's Crystal Ball

An interactive web application that uses a hybrid AI system (rule-based logic + machine learning) to predict names based on user responses to a series of questions. Built with vanilla JavaScript, CSS animations, and TensorFlow.js.

## ✨ Features

- **Interactive Quiz**: Engaging question-based interface with multiple question types (multiple choice, sliders, maps)
- **Hybrid AI System**: Combines rule-based decision trees with TensorFlow.js neural networks for accurate predictions
- **Comprehensive Database**: 47,689+ names from Social Security Administration data (1880-2024)
- **State-Specific Predictions**: Uses geographic data from all 50 US states plus DC and territories
- **Inclusive Design**: Supports non-binary gender with gender-balanced name identification
- **Research-Based Algorithm**: Incorporates findings from NPR research, Namerology studies, and academic research on naming patterns
- **Privacy-First**: All data processing happens locally in the browser - no server-side data collection
- **Real-Time Learning**: Machine learning model improves with user feedback (stored locally)
- **Beautiful UI**: Mystical-themed design with CSS animations and responsive layout

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (for development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/guess-my-name.git
cd guess-my-name
```

2. Start a local web server:

**Option 1: Using Python**
```bash
cd src
python3 -m http.server 8000
```

**Option 2: Using Node.js (if you have http-server installed)**
```bash
cd src
npx http-server -p 8000
```

3. Open your browser and navigate to:
```
http://localhost:8000
```

### Direct File Access

You can also open `src/index.html` directly in your browser, though using a local server is recommended to avoid CORS issues.

## 📁 Project Structure

```
guess-my-name/
├── src/
│   ├── index.html          # Main HTML file
│   ├── script.js           # Main JavaScript application logic
│   ├── nameDatabase.js     # Name database and indexing system
│   ├── styles.css          # Styling and animations
│   └── us.svg              # US state map SVG
├── assets/                 # Image assets and maps
├── fonts/                  # Custom fonts
├── names/                  # Name data files (SSA data 1880-2024)
├── namesbystate/           # State-specific name data
├── namesbyterritory/       # Territory-specific name data
└── README.md               # This file
```

## 🎯 How It Works

1. **Data Collection**: The quiz asks questions about:
   - Gender identity
   - Birth decade
   - Birth state/location
   - Name length preferences
   - Vowel/consonant preferences
   - Popularity preferences
   - Political/cultural values
   - Language preferences
   - Religious/cultural background

2. **Hybrid Prediction System**:
   - **Rule-Based (70%)**: Decision tree filtering based on research-backed factors
   - **Machine Learning (30%)**: TensorFlow.js neural network for pattern recognition

3. **Scoring Algorithm**: Names are scored based on:
   - Political/cultural identity (strongest predictor per NPR research)
   - State of birth
   - Name length & structure
   - Popularity level
   - Gender identity
   - Cultural background

4. **Results**: Top 5 name predictions with confidence scores

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Advanced animations, responsive design, custom fonts
- **JavaScript (ES6+)**: Vanilla JS, no frameworks
- **TensorFlow.js**: Client-side machine learning
- **SVG**: Interactive maps for state/country selection

## 📊 Data Sources

- **Social Security Administration**: Baby name data (1880-2024)
- **NPR Research**: Political polarization in naming patterns
- **Namerology**: Rural vs urban naming trends
- **Academic Studies**: Socioeconomic determinants of naming choices

## 🔒 Privacy

This application is completely privacy-focused:
- ✅ No personal information collected
- ✅ All data stays in your browser (localStorage only)
- ✅ No servers, no third parties, no data transmission
- ✅ No tracking or analytics
- ✅ Machine learning training happens locally

## 👩‍💻 Developer

**Charlotte Larson Freeman**  
Software Engineer (New Grad, March 2026)

- 📧 Email: charlottelf@protonmail.com
- 💼 LinkedIn: [linkedin.com/in/clarsonfreeman](https://www.linkedin.com/in/clarsonfreeman)
- 🐙 GitHub: [github.com/char-lotte-anne](https://github.com/char-lotte-anne)

## 📝 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

- Social Security Administration for name data
- NPR for research on political polarization in naming
- Laura Wattenberg (Namerology) for naming trend research
- All the researchers whose work informed the algorithm

---

**Note**: This is a fun, educational project. Name prediction accuracy varies based on available research data and user responses. Results are for entertainment purposes.
