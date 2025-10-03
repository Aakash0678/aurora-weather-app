# ⚡ Aurora Weather App

A real-time, aesthetically pleasing weather application featuring a Glassmorphism design and dynamic visual effects.

## ✨ Features

- **Real-Time Data:** Fetches current weather using the Open-Meteo API.
- **Dynamic Backgrounds:** Fetches relevant city backgrounds using the Pexels API (securely hidden).
- **Interactive Visuals:** Displays CSS-based rain and snow animations based on the current weather condition (e.g., "Thunderstorm").
- **Modern UI:** Utilizes a clean, blurred Glassmorphism card for a professional look.

## 🛠️ Tech Stack

* **HTML5** & **CSS3** (Flexbox, CSS Animations, Custom Fonts)
* **Vanilla JavaScript (ES6+):** Async/Await for API calls.
* **APIs Used:**
    * Open-Meteo (Weather Data)
    * Pexels (Dynamic Background Images)

## 🚀 Setup & Installation

1.  **Clone the Repository:**
    ```bash
    git clone [Your Repository URL]
    ```
2.  **API Key:** To run the background image fetch locally, you must set your Pexels API key.
3.  **Run:** Open `index.html` in your browser.

---

## 🔒 Security Note

The Pexels API key used for fetching images is handled via environment variables on the live hosting platform (e.g., Netlify/Vercel) and is **not** exposed in the public source code.
