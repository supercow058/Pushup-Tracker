
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// Custom Debugger
function debugPrint(message) {
    const debugElement = document.getElementById('debug-text');
    if (debugElement) {
        debugElement.innerText = message;
    }
}

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHfo2xHQnPjo_RzsmI3bENmWPz4cOQfic",
  authDomain: "pushuptracker-a0d81.firebaseapp.com",
  projectId: "pushuptracker-a0d81",
  storageBucket: "pushuptracker-a0d81.firebasestorage.app",
  messagingSenderId: "49232730782",
  appId: "1:49232730782:web:19894b12c2646a2484798f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const emailInput = document.getElementById('reg-email')
const passwordInput = document.getElementById('reg-password');
const registerButton = document.getElementById('btn-register');

const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginButton = document.getElementById('btn-login');

debugPrint("Debugger online")

let currentUser = null;

const registerBox = document.getElementById("register-box");
const loginBox = document.getElementById("login-box");
const tracker = document.getElementById("pushup-tracker");

// When register button is pressed
registerButton.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value; 
    debugPrint("Button was Clicked!!!!!!!!!!")

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            currentUser = userCredential.user;

            alert("Account Created Successfully :)");

            registerBox.classList.add("hidden");
            tracker.classList.remove("hidden");

            document.getElementById("login-box")
                .classList.add("hidden");
            

            loadData();
        })
        .catch((error) => {
            alert("Error: " + error.message)
        });
});

// Login Button
loginButton.addEventListener('click', () => {
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;
    debugPrint("Logging in...");
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            currentUser = userCredential.user;
            alert("Login Successful!");
            console.log(
                "Logged in user:",
                userCredential.user
            );
            registerBox.classList.add("hidden");
            loginBox.classList.add("hidden");
            tracker.classList.remove("hidden");

            loadData();
        })
        .catch((error) => {
            alert("Login Error: " + error.message);
        });
});



// Variables
const average_target = 120;
const max_offset = 60;
let random_target = Math.floor(average_target + (Math.random() * 2 - 1) * max_offset);

let current_progress = 0;


// References
const targetLabel = document.getElementById('target-display');
const progressLabel = document.getElementById('progress-display');
const add10Button = document.getElementById('btn-add-10');
const sub10Button = document.getElementById('btn-sub-10');
const add1Button = document.getElementById('btn-add-1');
const sub1Button = document.getElementById('btn-sub-1');
const resetButton = document.getElementById('btn-reset');

// Find current date
function getToday() {
    const date = new Date();

    return date.getFullYear() + "-" +
        String(date.getMonth()+1).padStart(2,"0") + "-" +
        String(date.getDate()).padStart(2,"0");
}


// Save amount of pushups
async function saveData() {
    if (!currentUser) return;
    try {
        const today = getToday();
        await setDoc(
            doc(db, "users", currentUser.uid, "days", today),
            {
                pushups: current_progress,
                target: random_target
            }
        );
        debugPrint("data saved")
    } catch(error) {
        debugPrint(error)
    }
    
}


// Load Data
async function loadData() {
    const today = getToday();
    const dataRef = doc(
        db,
        "users",
        currentUser.uid,
        "days",
        today
    );
    const snapshot = await getDoc(dataRef);
    if (snapshot.exists()) {

        const data = snapshot.data();

        current_progress = data.pushups;
        random_target = data.target;
    } 
    else {
        current_progress = 0;
        random_target = Math.floor(
            average_target +
            (Math.random() * 2 - 1) * max_offset
        );
        saveData();
    }
    debugPrint("Data Loaded")
    updateUI();
}



function updateUI() {
    if (current_progress < 0) {
        current_progress = 0;
    }
    if (current_progress > random_target) {
        current_progress = random_target;
    }
    targetLabel.innerText = random_target;
    progressLabel.innerText = current_progress;
}

// Add 10 Pushups
add10Button.addEventListener('click', () => {
    current_progress = current_progress + 10;
    updateUI(); // Refresh the text on screen
    saveData();
});


// Subtract 10 pushup, clamp above 0
sub10Button.addEventListener('click', () => {
    current_progress = current_progress - 10;    
    updateUI();
    saveData();
});


// Add 1 Pushups
add1Button.addEventListener('click', () => {
    current_progress = current_progress + 1;
    updateUI(); // Refresh the text on screen
    saveData();
});


// Subtract 1 pushup, clamp above 0
sub1Button.addEventListener('click', () => {
    current_progress = current_progress - 1;   
    updateUI();
    saveData();
});


// Reset Pushups
resetButton.addEventListener('click', () => {
    current_progress = 0;
    updateUI();
    saveData();
});


updateUI();



 