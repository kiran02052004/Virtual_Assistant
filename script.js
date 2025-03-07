let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");

// API Key for OpenWeather (Replace with your own key)
const weatherAPIKey = "YOUR_OPENWEATHER_API_KEY";

// Function to get and set a female voice
function getFemaleVoice() {
    return new Promise((resolve) => {
        let voices = window.speechSynthesis.getVoices();

        if (!voices.length) {
            window.speechSynthesis.onvoiceschanged = () => {
                voices = window.speechSynthesis.getVoices();
                resolve(selectFemaleVoice(voices));
            };
        } else {
            resolve(selectFemaleVoice(voices));
        }
    });
}

function selectFemaleVoice(voices) {
    return voices.find(voice => 
        voice.name.includes("Female") || 
        voice.name.includes("Aditi") || 
        voice.name.includes("Samantha") || 
        voice.name.includes("Google हिंदी")
    ) || voices[0]; 
}

async function speak(text) { 
    let text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1;
    text_speak.pitch = 1.3;
    text_speak.volume = 1;
    text_speak.lang = "hi-IN";

    text_speak.voice = await getFemaleVoice();
    window.speechSynthesis.speak(text_speak);
}

// Greeting Function
function wishMe() {
    let hours = new Date().getHours();
    if (hours >= 0 && hours < 12) {
        speak("Good Morning ");
    } else if (hours >= 12 && hours < 18) {
        speak("Good Afternoon ");
    } else {
        speak("Good Evening ");
    }
}

// Run greeting on page load
window.addEventListener("load", wishMe);

// Voice Recognition Setup
let speechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
let recognition = new speechRecognition();

// Ensure microphone access
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(() => console.log("Microphone is accessible."))
    .catch(err => alert("Please check your microphone settings!"));

// Handle Speech Recognition
recognition.onresult = function(event) {
    let transcript = event.results[event.resultIndex][0].transcript;
    content.innerText = transcript;
    takeCommand(transcript.toLowerCase());
};

// Button Click Event
btn.addEventListener("click", () => {
    recognition.start();
    console.log("Listening...");
    btn.style.display = "none";
    voice.style.display = "block";

    setTimeout(() => {
        btn.style.display = "flex";
        voice.style.display = "none";
    }, 5000);
});

// Command Processing
function takeCommand(message) {
    btn.style.display = "flex";
    voice.style.display = "none";

    if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
        speak("Hello, How can I help you?");
    } else if (message.includes("who are you")) {
        speak("I am your virtual assistant created by Kiran.");
    } else if (message.includes("open youtube")) {
        speak("Opening YouTube.");
        window.open("https://www.youtube.com/");
    } else if (message.includes("open google")) {
        speak("Opening Google.");
        window.open("https://www.google.com/");
    } else if (message.includes("what is the time")) {
        let time = new Date().toLocaleTimeString();
        speak(`The current time is ${time}`);
    } else if (message.includes("what is today's date")) {
        let date = new Date().toLocaleDateString();
        speak(`Today's date is ${date}`);
    } else if (message.includes("tell me a joke")) {
        getJoke();
    } else if (message.includes("search wikipedia for")) {
        let searchQuery = message.replace("search wikipedia for", "").trim();
        speak(`Searching Wikipedia for ${searchQuery}`);
        window.open(`https://en.wikipedia.org/wiki/${searchQuery}`);
    } else if (message.includes("play music")) {
        speak("Opening Spotify.");
        window.open("https://open.spotify.com/");
    } else if (message.includes("shutdown assistant")) {
        speak("Shutting down. Goodbye!");
        setTimeout(() => {
            window.close();
        }, 2000);
    } else if (message.includes("what's the weather in")) {
        let city = message.replace("what's the weather in", "").trim();
        getWeather(city);
    } else if (message.includes("what day is today")) {
        let day = new Date().toLocaleDateString(undefined, { weekday: "long" });
        speak(`Today is ${day}`);
    } else if (message.includes("remind me to")) {
        setReminder(message);
    } else if (message.includes("open facebook")) {
        speak("Opening Facebook.");
        window.open("https://www.facebook.com/");
    } else if (message.includes("open instagram")) {
        speak("Opening Instagram.");
        window.open("https://www.instagram.com/");
    } else if (message.match(/\d+ [\+\-\*\/] \d+/)) {
        calculate(message);
    } else {
        speak(`This is what I found on Google: ${message}`);
        window.open(`https://www.google.com/search?q=${message}`);
    }
}

// Function to Get a Joke from API
async function getJoke() {
    try {
        let response = await fetch("https://official-joke-api.appspot.com/random_joke");
        let jokeData = await response.json();
        let joke = `${jokeData.setup} ... ${jokeData.punchline}`;
        speak(joke);
    } catch (error) {
        speak("Sorry, I couldn't fetch a joke right now.");
    }
}

// Function to Get Weather Data
async function getWeather(city) {
    try {
        let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherAPIKey}&units=metric`);
        let weatherData = await response.json();

        if (weatherData.cod === 200) {
            let temp = weatherData.main.temp;
            let description = weatherData.weather[0].description;
            let weatherReport = `The current temperature in ${city} is ${temp} degrees Celsius with ${description}`;
            speak(weatherReport);
        } else {
            speak("Sorry, I couldn't fetch the weather details.");
        }
    } catch (error) {
        speak("There was an error retrieving the weather data.");
    }
}

// Function to Perform Simple Calculations
function calculate(expression) {
    try {
        let result = eval(expression);
        speak(`The result is ${result}`);
    } catch (error) {
        speak("Sorry, I couldn't perform the calculation.");
    }
}

// Function to Set a Reminder
function setReminder(message) {
    let timeMatch = message.match(/in (\d+) (seconds|minutes|hours)/);
    if (timeMatch) {
        let timeValue = parseInt(timeMatch[1]);
        let timeUnit = timeMatch[2];

        let timeInMs = 
            timeUnit === "seconds" ? timeValue * 1000 : 
            timeUnit === "minutes" ? timeValue * 60000 : 
            timeValue * 3600000;

        speak(`Okay, I will remind you in ${timeValue} ${timeUnit}`);
        setTimeout(() => {
            speak("Reminder: " + message.replace(/remind me to|in \d+ (seconds|minutes|hours)/g, "").trim());
        }, timeInMs);
    } else {
        speak("I couldn't understand the reminder time.");
    }
}
