
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

import {
    collection,
    getDocs
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
const graph = document.getElementById("graph");


//funny rest messages
let rest = 1;
let underZero = false;



// When register button is pressed
registerButton.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value; 
    debugPrint("Button was Clicked!!!!!!!!!!")

    createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            currentUser = userCredential.user;

            alert("Account Created Successfully :)");

            registerBox.classList.add("hidden");
            tracker.classList.remove("hidden");
            graph.classList.remove("hidden")

            document.getElementById("login-box")
                .classList.add("hidden");
            

            await loadTarget();
            await loadData();
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
        .then(async (userCredential) => {
            currentUser = userCredential.user;
            alert("Login Successful!");
            console.log(
                "Logged in user:",
                userCredential.user
            );
            registerBox.classList.add("hidden");
            loginBox.classList.add("hidden");
            tracker.classList.remove("hidden");
            graph.classList.remove("hidden");

            await loadTarget();
            await loadData();
        })
        .catch((error) => {
            alert("Login Error: " + error.message);
        });
});



// Variables
const average_target = 120;
const max_offset = 60;
let random_target = null;//Math.floor(average_target + (Math.random() * 2 - 1) * max_offset);

let current_progress = 0;


// References
const targetLabel = document.getElementById('target-display');
const progressLabel = document.getElementById('progress-display');
const add10Button = document.getElementById('btn-add-10');
const sub10Button = document.getElementById('btn-sub-10');
const add1Button = document.getElementById('btn-add-1');
const sub1Button = document.getElementById('btn-sub-1');
const resetButton = document.getElementById('btn-reset');

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const nextMonthButton = document.getElementById('next-month');
const previousMonthButton = document.getElementById('previous-month');
const reloadGraph = document.getElementById('reload-graph');

const debtLabel = document.getElementById("debt");

debtLabel.innerText = "reload graph";

// Find current date
function getToday() {
    const date = new Date();

    return date.getFullYear() + "-" +
        String(date.getMonth()+1).padStart(2,"0") + "-" +
        String(date.getDate()).padStart(2,"0");
}


// Load compelted pushups for ever day.
async function loadAllDays() {

    const daysRef = collection(
        db,
        "users",
        currentUser.uid,
        "days"
    );

    const snapshot = await getDocs(daysRef);

    snapshot.forEach((doc) => {
        console.log(doc.id);       // 2026-07-10
        console.log(doc.data());   // { pushups: 83 }
    });
}


// Load all targets
async function loadAllTargets() {

    const targetRef = collection(db, "dailyTargets");

    const snapshot = await getDocs(targetRef);

    snapshot.forEach((doc) => {
        // Data is loaded here
        //console.log(doc.id);
        //console.log(doc.data());
    });

}


// Save amount of pushups
async function saveData() {
    debugPrint("SAVING")
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


// Load Individual Data
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
    } 
    else {
        current_progress = 0;
        await saveData();
    }
    debugPrint("Data Loaded")
    updateUI();
}



// Load Global Data
async function loadTarget() {
    const today = getToday();
    const todayDate = new Date();
    const targetRef = doc(db, "dailyTargets", today);
    const snapshot = await getDoc(targetRef);

    if (snapshot.exists()) {
        random_target = snapshot.data().target;
    }
    else {
        if (today === 0) {
            random_target = 0;
        } else {
            random_target = Math.floor(
                average_target + (Math.random() * 2 - 1) * max_offset
            );
        }
        await setDoc(targetRef, {
            target: random_target
        });
    }
}

async function loadMonthData(year, month) {
    new Date(year, month, 0).getDate();
    ctx.fillStyle = "rgba(0, 120, 255, 0.25)";
    ctx.fillStyle = "rgba(0, 120, 255, 0.7)";
}


const graphBackground = "#CBBD93";
const graphWidth = 400;
const graphHeight = 250;


let pushupDebt = 0;

function updateUI() {
    if (current_progress < 0 && underZero == false) {
        current_progress = 0;
    }

    if (current_progress > 240) {
        current_progress = 240;
        if (rest < 2) {
            alert("have a rest");
            current_progress = 230;
            updateUI();
        }
        else if (rest == 2) {
            alert("I said have a rest...");
            current_progress = 220;
            updateUI();
            updateGraph();
        }
        else if (rest == 3) {
            alert("are you even listening? I said have a rest. geez");
            current_progress = 200;
            updateUI();
            updateGraph();
        }
        else if (rest == 4) {
            alert("do you just like clicking the button or something?");
            current_progress = 180;
            updateUI();
            updateGraph();
        }
        else if (rest == 5) {
            alert("Please stop!!!");
            current_progress = 150;
            updateUI();
            updateGraph();
        }
        else if (rest == 6) {
            alert("Ok I admit it! There is no room to fit your pushups on the graph :(");
            current_progress = 100;
            updateUI();
            updateGraph();
        }
        else if (rest == 7) {
            alert("wHy ArE YoU sTiLl PrEsSiING tHE bUtToN???");
            current_progress = 50;
            updateUI();
            updateGraph();
        }
        else if (rest > 7) {
            alert("if you like pressing the button so much then press it some more :D");
            current_progress = -999;
            underZero = true;
            updateUI();
            updateGraph();
        }
        rest ++;        
    }


    if (current_progress > 0) {
        underZero = false;
    }

    

    targetLabel.innerText = random_target;
    progressLabel.innerText = current_progress;
}


//graph
let displayedDate = new Date();
async function updateGraph() {
    // Draw Background
    ctx.fillStyle = graphBackground;
    ctx.fillRect(
        0,   // x
        30,   // y
        graphWidth,  
        graphHeight
    );
    // Get year and month
    const year = displayedDate.getFullYear();
    const month = displayedDate.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();

    //Draw Columns
    let colWidth = 10;
    let colHeightMax = 200;
    let colSpacing = 2;

    const daysRef = collection(db, "users", currentUser.uid, "days");
    const snapshot = await getDocs(daysRef);

    const targetRef = collection(db, "dailyTargets");
    const targetSnapshot = await getDocs(targetRef);

    const monthData = {};

    const targetData = {};

    snapshot.forEach((doc) => {
        monthData[doc.id] = doc.data();
    });

    targetSnapshot.forEach((doc) => {
        targetData[doc.id] = doc.data();
    });
    let targetSum = 0;
    let pushupSum = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

        const target = targetData[dateString]?.target ?? 0;
        const pushups = monthData[dateString]?.pushups ?? 0;

        ctx.fillStyle = "rgba(0, 120, 255, 0.25)";
        ctx.fillRect((day - 1) * (colWidth + colSpacing) + colSpacing, 200-target + 70, colWidth, target);
        targetSum += target;

        ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
        ctx.fillRect((day - 1) * (colWidth + colSpacing) + colSpacing, 200-pushups + 70, colWidth, pushups);
        pushupSum += pushups;

        
    }
    pushupDebt = targetSum - pushupSum
    debtLabel.innerText = pushupDebt;
}

const monthTitle = document.getElementById("month-title");
function updateMonthText() {
    monthTitle.innerText = displayedDate.toLocaleString("en-AU", {
        month: "long",
        year: "numeric"
    });
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


// Graph Buttons
reloadGraph.addEventListener('click', () => {
    updateGraph();
});

nextMonthButton.addEventListener('click', () => {
    displayedDate.setMonth(displayedDate.getMonth() + 1);
    updateGraph();
    updateMonthText();
});

previousMonthButton.addEventListener('click', () => {
    displayedDate.setMonth(displayedDate.getMonth() - 1);
    updateGraph();
    updateMonthText();
});



updateUI();
updateMonthText();

updateGraph();
