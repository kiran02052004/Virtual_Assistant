let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");

// Function to get and set a female voice
function getFemaleVoice() {
    return new Promise((resolve) => {
        let voices = window.speechSynthesis.getVoices();

        // Wait if voices are not loaded yet
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

// Function to select a female voice
function selectFemaleVoice(voices) {
    return voices.find(voice => 
        voice.name.includes("Female") || 
        voice.name.includes("Aditi") || 
        voice.name.includes("Samantha") || 
        voice.name.includes("Google हिंदी")
    ) || voices[0]; // Fallback to first available voice
}

async function speak(text) { 
    let text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1;
    text_speak.pitch = 1.3; // Slightly higher pitch for a natural female voice
    text_speak.volume = 1;
    text_speak.lang = "hi-IN"; // Hindi-India accent

    text_speak.voice = await getFemaleVoice();
    window.speechSynthesis.speak(text_speak);
}

// Greeting Function
function wishMe() {
    let hours = new Date().getHours();
    if (hours >= 0 && hours < 12) {
        speak("Good Morning Kiran");
    } else if (hours >= 12 && hours < 18) {
        speak("Good Afternoon Kiran");
    } else {
        speak("Good Evening Kiran");
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

    if (message.includes("hello") || message.includes("hi")) {
        speak("How can I help you?");
    } else if (message.includes("who are you")) {
        speak("I am your virtual assistant created by Kiran.");
    } else if (message.includes("open youtube")) {
        speak("Opening YouTube.");
        window.open("https://www.youtube.com/");
    } else if (message.includes("open google")) {
        speak("Opening Google.");
        window.open("https://www.google.com/");
    } else {
        speak(`This is what I found on Google: ${message}`);
        window.open(`https://www.google.com/search?q=${message}`);
    }
}
