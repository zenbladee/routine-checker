// Global variables to keep track of timer intervals
let timers = [];

// Load timers from local storage when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadTimersFromStorage();
});

// Function to save timers to local storage
function saveTimersToStorage() {
    // Create a copy of timers without the interval property (can't be serialized)
    const timersToSave = timers.map(timer => {
        // Create a copy without the interval property
        const { interval, isRunning, ...timerData } = timer;
        return {
            ...timerData,
            isRunning: false // Always save as not running
        };
    });
    
    localStorage.setItem('timers', JSON.stringify(timersToSave));
}

// Function to load timers from local storage
function loadTimersFromStorage() {
    const savedTimers = localStorage.getItem('timers');
    
    if (savedTimers) {
        const parsedTimers = JSON.parse(savedTimers);
        
        // Clear the container first
        document.getElementById("timers-container").innerHTML = '';
        
        // Restore each timer
        parsedTimers.forEach(timer => {
            if (timer.type === 'timer') {
                restoreTimer(timer);
            } else if (timer.type === 'stopwatch') {
                restoreStopwatch(timer);
            }
        });
    }
}

// Function to restore a timer from saved data
function restoreTimer(timerData) {
    const container = document.getElementById("timers-container");

    // Create the HTML structure for the timer
    const timerDiv = document.createElement("div");
    timerDiv.classList.add("timer");

    const timerId = timerData.id;
    
    // Add name input
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Timer Name";
    nameInput.id = `timer-name-${timerId}`;
    nameInput.classList.add("timer-name");
    nameInput.value = timerData.name || '';
    
    // Create time inputs
    const timeInputsDiv = document.createElement("div");
    timeInputsDiv.classList.add("time-inputs");
    
    const hoursInput = document.createElement("input");
    hoursInput.type = "number";
    hoursInput.min = "0";
    hoursInput.max = "23";
    hoursInput.value = timerData.hours || 0;
    hoursInput.id = `hours-${timerId}`;
    
    const minutesInput = document.createElement("input");
    minutesInput.type = "number";
    minutesInput.min = "0";
    minutesInput.max = "59";
    minutesInput.value = timerData.minutes || 0;
    minutesInput.id = `minutes-${timerId}`;
    
    const secondsInput = document.createElement("input");
    secondsInput.type = "number";
    secondsInput.min = "0";
    secondsInput.max = "59";
    secondsInput.value = timerData.seconds || 0;
    secondsInput.id = `seconds-${timerId}`;
    
    // Add labels
    const hoursLabel = document.createElement("span");
    hoursLabel.textContent = "h";
    
    const minutesLabel = document.createElement("span");
    minutesLabel.textContent = "m";
    
    const secondsLabel = document.createElement("span");
    secondsLabel.textContent = "s";
    
    // Add inputs and labels to timeInputsDiv
    timeInputsDiv.appendChild(hoursInput);
    timeInputsDiv.appendChild(hoursLabel);
    timeInputsDiv.appendChild(minutesInput);
    timeInputsDiv.appendChild(minutesLabel);
    timeInputsDiv.appendChild(secondsInput);
    timeInputsDiv.appendChild(secondsLabel);

    const timerDisplay = document.createElement("p");
    timerDisplay.id = `timer-display-${timerId}`;
    timerDisplay.textContent = formatTime(timerData);
    timerDisplay.classList.add("timer-display");

    // Create buttons container
    const buttonsDiv = document.createElement("div");
    buttonsDiv.classList.add("timer-buttons");

    const setButton = document.createElement("button");
    setButton.textContent = "Set";
    setButton.onclick = function() {
        setTimer(timerId);
    };

    const startButton = document.createElement("button");
    startButton.textContent = "Start";
    startButton.onclick = function() {
        startTimer(timerId);
    };

    const pauseButton = document.createElement("button");
    pauseButton.textContent = "Pause";
    pauseButton.onclick = function() {
        pauseTimer(timerId);
    };

    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset";
    resetButton.onclick = function() {
        resetTimer(timerId);
    };

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-button");
    deleteButton.onclick = function() {
        deleteTimer(timerId);
    };

    // Add buttons to container
    buttonsDiv.appendChild(setButton);
    buttonsDiv.appendChild(startButton);
    buttonsDiv.appendChild(pauseButton);
    buttonsDiv.appendChild(resetButton);
    buttonsDiv.appendChild(deleteButton);

    // Add all elements to the timer div
    timerDiv.appendChild(nameInput);
    timerDiv.appendChild(timeInputsDiv);
    timerDiv.appendChild(timerDisplay);
    timerDiv.appendChild(buttonsDiv);
    
    container.appendChild(timerDiv);

    // Add the timer object to the timers array
    timers.push({
        id: timerId,
        type: 'timer',
        name: timerData.name || '',
        seconds: timerData.seconds || 0,
        minutes: timerData.minutes || 0,
        hours: timerData.hours || 0,
        isRunning: false,
        interval: null
    });
}

// Function to restore a stopwatch from saved data
function restoreStopwatch(stopwatchData) {
    const container = document.getElementById("timers-container");

    // Create the HTML structure for the stopwatch
    const stopwatchDiv = document.createElement("div");
    stopwatchDiv.classList.add("stopwatch");

    const stopwatchId = stopwatchData.id;
    
    // Add name input
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Stopwatch Name";
    nameInput.id = `stopwatch-name-${stopwatchId}`;
    nameInput.classList.add("stopwatch-name");
    nameInput.value = stopwatchData.name || '';
    
    const stopwatchDisplay = document.createElement("p");
    stopwatchDisplay.id = `stopwatch-display-${stopwatchId}`;
    stopwatchDisplay.textContent = formatTime(stopwatchData);
    stopwatchDisplay.classList.add("stopwatch-display");

    // Create buttons container
    const buttonsDiv = document.createElement("div");
    buttonsDiv.classList.add("stopwatch-buttons");

    const startButton = document.createElement("button");
    startButton.textContent = "Start";
    startButton.onclick = function() {
        startStopwatch(stopwatchId);
    };

    const pauseButton = document.createElement("button");
    pauseButton.textContent = "Pause";
    pauseButton.onclick = function() {
        pauseStopwatch(stopwatchId);
    };

    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset";
    resetButton.onclick = function() {
        resetStopwatch(stopwatchId);
    };

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-button");
    deleteButton.onclick = function() {
        deleteStopwatch(stopwatchId);
    };

    // Add buttons to container
    buttonsDiv.appendChild(startButton);
    buttonsDiv.appendChild(pauseButton);
    buttonsDiv.appendChild(resetButton);
    buttonsDiv.appendChild(deleteButton);

    // Add all elements to the stopwatch div
    stopwatchDiv.appendChild(nameInput);
    stopwatchDiv.appendChild(stopwatchDisplay);
    stopwatchDiv.appendChild(buttonsDiv);
    
    container.appendChild(stopwatchDiv);

    // Add the stopwatch object to the timers array
    timers.push({
        id: stopwatchId,
        type: 'stopwatch',
        name: stopwatchData.name || '',
        seconds: stopwatchData.seconds || 0,
        minutes: stopwatchData.minutes || 0,
        hours: stopwatchData.hours || 0,
        isRunning: false,
        interval: null
    });
}

// Function to create a new Timer
function addTimer() {
    const container = document.getElementById("timers-container");

    // Create the HTML structure for a new timer
    const timerDiv = document.createElement("div");
    timerDiv.classList.add("timer");

    const timerId = Date.now();  // Unique ID based on current timestamp
    
    // Add name input
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Timer Name";
    nameInput.id = `timer-name-${timerId}`;
    nameInput.classList.add("timer-name");
    
    // Create time inputs with scrollable numbers
    const timeInputsDiv = document.createElement("div");
    timeInputsDiv.classList.add("time-inputs");
    
    const hoursInput = document.createElement("input");
    hoursInput.type = "number";
    hoursInput.min = "0";
    hoursInput.max = "23";
    hoursInput.value = "0";
    hoursInput.id = `hours-${timerId}`;
    
    const minutesInput = document.createElement("input");
    minutesInput.type = "number";
    minutesInput.min = "0";
    minutesInput.max = "59";
    minutesInput.value = "0";
    minutesInput.id = `minutes-${timerId}`;
    
    const secondsInput = document.createElement("input");
    secondsInput.type = "number";
    secondsInput.min = "0";
    secondsInput.max = "59";
    secondsInput.value = "0";
    secondsInput.id = `seconds-${timerId}`;
    
    // Add labels
    const hoursLabel = document.createElement("span");
    hoursLabel.textContent = "h";
    
    const minutesLabel = document.createElement("span");
    minutesLabel.textContent = "m";
    
    const secondsLabel = document.createElement("span");
    secondsLabel.textContent = "s";
    
    // Add inputs and labels to timeInputsDiv
    timeInputsDiv.appendChild(hoursInput);
    timeInputsDiv.appendChild(hoursLabel);
    timeInputsDiv.appendChild(minutesInput);
    timeInputsDiv.appendChild(minutesLabel);
    timeInputsDiv.appendChild(secondsInput);
    timeInputsDiv.appendChild(secondsLabel);

    const timerDisplay = document.createElement("p");
    timerDisplay.id = `timer-display-${timerId}`;
    timerDisplay.textContent = "00:00:00";
    timerDisplay.classList.add("timer-display");

    // Create buttons container
    const buttonsDiv = document.createElement("div");
    buttonsDiv.classList.add("timer-buttons");

    const setButton = document.createElement("button");
    setButton.textContent = "Set";
    setButton.onclick = function() {
        setTimer(timerId);
    };

    const startButton = document.createElement("button");
    startButton.textContent = "Start";
    startButton.onclick = function() {
        startTimer(timerId);
    };

    const pauseButton = document.createElement("button");
    pauseButton.textContent = "Pause";
    pauseButton.onclick = function() {
        pauseTimer(timerId);
    };

    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset";
    resetButton.onclick = function() {
        resetTimer(timerId);
    };

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-button");
    deleteButton.onclick = function() {
        deleteTimer(timerId);
    };

    // Add buttons to container
    buttonsDiv.appendChild(setButton);
    buttonsDiv.appendChild(startButton);
    buttonsDiv.appendChild(pauseButton);
    buttonsDiv.appendChild(resetButton);
    buttonsDiv.appendChild(deleteButton);

    // Add all elements to the timer div
    timerDiv.appendChild(nameInput);
    timerDiv.appendChild(timeInputsDiv);
    timerDiv.appendChild(timerDisplay);
    timerDiv.appendChild(buttonsDiv);
    
    container.appendChild(timerDiv);

    // Create a new timer object
    timers.push({
        id: timerId,
        type: 'timer',
        name: '',
        seconds: 0,
        minutes: 0,
        hours: 0,
        isRunning: false,
        interval: null
    });

    saveTimersToStorage();
}

// Function to create a new Stopwatch
function addStopwatch() {
    const container = document.getElementById("timers-container");

    // Create the HTML structure for a new stopwatch
    const stopwatchDiv = document.createElement("div");
    stopwatchDiv.classList.add("stopwatch");

    const stopwatchId = Date.now();  // Unique ID based on current timestamp
    
    // Add name input
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Stopwatch Name";
    nameInput.id = `stopwatch-name-${stopwatchId}`;
    nameInput.classList.add("stopwatch-name");
    
    const stopwatchDisplay = document.createElement("p");
    stopwatchDisplay.id = `stopwatch-display-${stopwatchId}`;
    stopwatchDisplay.textContent = "00:00:00";
    stopwatchDisplay.classList.add("stopwatch-display");

    // Create buttons container
    const buttonsDiv = document.createElement("div");
    buttonsDiv.classList.add("stopwatch-buttons");

    const startButton = document.createElement("button");
    startButton.textContent = "Start";
    startButton.onclick = function() {
        startStopwatch(stopwatchId);
    };

    const pauseButton = document.createElement("button");
    pauseButton.textContent = "Pause";
    pauseButton.onclick = function() {
        pauseStopwatch(stopwatchId);
    };

    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset";
    resetButton.onclick = function() {
        resetStopwatch(stopwatchId);
    };

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-button");
    deleteButton.onclick = function() {
        deleteStopwatch(stopwatchId);
    };

    // Add buttons to container
    buttonsDiv.appendChild(startButton);
    buttonsDiv.appendChild(pauseButton);
    buttonsDiv.appendChild(resetButton);
    buttonsDiv.appendChild(deleteButton);

    // Add all elements to the stopwatch div
    stopwatchDiv.appendChild(nameInput);
    stopwatchDiv.appendChild(stopwatchDisplay);
    stopwatchDiv.appendChild(buttonsDiv);
    
    container.appendChild(stopwatchDiv);

    // Create a new stopwatch object
    timers.push({
        id: stopwatchId,
        type: 'stopwatch',
        name: '',
        seconds: 0,
        minutes: 0,
        hours: 0,
        isRunning: false,
        interval: null
    });

    saveTimersToStorage();
}

// Set timer duration (countdown)
function setTimer(timerId) {
    const timer = timers.find(timer => timer.id === timerId);
    
    // Get values from input fields
    const hours = parseInt(document.getElementById(`hours-${timerId}`).value) || 0;
    const minutes = parseInt(document.getElementById(`minutes-${timerId}`).value) || 0;
    const seconds = parseInt(document.getElementById(`seconds-${timerId}`).value) || 0;
    const name = document.getElementById(`timer-name-${timerId}`).value;

    // Validate input
    if (hours === 0 && minutes === 0 && seconds === 0) {
        alert("Please set a time greater than zero.");
        return;
    }
    
    // Update timer object
    timer.hours = hours;
    timer.minutes = minutes;
    timer.seconds = seconds;
    timer.name = name;
    
    // Update display
    const timerDisplay = document.getElementById(`timer-display-${timerId}`);
    timerDisplay.textContent = formatTime(timer);

    saveTimersToStorage();
}

// Start the timer (countdown)
function startTimer(timerId) {
    const timer = timers.find(timer => timer.id === timerId);

    if (timer.isRunning) return;  // Prevent multiple intervals
    
    // If timer has no time set, prompt user
    if (timer.hours === 0 && timer.minutes === 0 && timer.seconds === 0) {
        alert("Please set a time first.");
        return;
    }

    timer.isRunning = true;
    timer.interval = setInterval(function() {
        if (timer.seconds === 0 && timer.minutes === 0 && timer.hours === 0) {
            clearInterval(timer.interval);
            timer.isRunning = false;
            alert(`Timer ${timer.name ? `"${timer.name}"` : ""} finished!`);
            return;
        }

        if (timer.seconds === 0) {
            if (timer.minutes === 0) {
                timer.hours--;
                timer.minutes = 59;
            } else {
                timer.minutes--;
            }
            timer.seconds = 59;
        } else {
            timer.seconds--;
        }

        const timerDisplay = document.getElementById(`timer-display-${timerId}`);
        timerDisplay.textContent = formatTime(timer);
    }, 1000);
}

// Pause the timer
function pauseTimer(timerId) {
    const timer = timers.find(timer => timer.id === timerId);
    clearInterval(timer.interval);
    timer.isRunning = false;

    saveTimersToStorage();
}

// Reset the timer
function resetTimer(timerId) {
    const timer = timers.find(timer => timer.id === timerId);
    clearInterval(timer.interval);
    timer.isRunning = false;
    
    // Get original values from input fields
    timer.hours = parseInt(document.getElementById(`hours-${timerId}`).value) || 0;
    timer.minutes = parseInt(document.getElementById(`minutes-${timerId}`).value) || 0;
    timer.seconds = parseInt(document.getElementById(`seconds-${timerId}`).value) || 0;

    const timerDisplay = document.getElementById(`timer-display-${timerId}`);
    timerDisplay.textContent = formatTime(timer);

    saveTimersToStorage();
}

// Delete the timer
function deleteTimer(timerId) {
    const timerIndex = timers.findIndex(timer => timer.id === timerId);
    if (timerIndex !== -1) {
        const timer = timers[timerIndex];
        if (timer.isRunning) {
            clearInterval(timer.interval);
        }
        timers.splice(timerIndex, 1);
        const timerDiv = document.getElementById(`timer-display-${timerId}`).parentElement;
        timerDiv.remove();
    }

    saveTimersToStorage();
}

// Start the stopwatch (count up)
function startStopwatch(stopwatchId) {
    const stopwatch = timers.find(timer => timer.id === stopwatchId);

    if (stopwatch.isRunning) return;  // Prevent multiple intervals
    
    // Update name
    stopwatch.name = document.getElementById(`stopwatch-name-${stopwatchId}`).value;

    stopwatch.isRunning = true;
    stopwatch.interval = setInterval(function() {
        stopwatch.seconds++;

        if (stopwatch.seconds === 60) {
            stopwatch.seconds = 0;
            stopwatch.minutes++;
        }
        if (stopwatch.minutes === 60) {
            stopwatch.minutes = 0;
            stopwatch.hours++;
        }

        const stopwatchDisplay = document.getElementById(`stopwatch-display-${stopwatchId}`);
        stopwatchDisplay.textContent = formatTime(stopwatch);
    }, 1000);
}

// Pause the stopwatch
function pauseStopwatch(stopwatchId) {
    const stopwatch = timers.find(timer => timer.id === stopwatchId);
    clearInterval(stopwatch.interval);
    stopwatch.isRunning = false;

    saveTimersToStorage();
}

// Reset the stopwatch
function resetStopwatch(stopwatchId) {
    const stopwatch = timers.find(timer => timer.id === stopwatchId);
    clearInterval(stopwatch.interval);
    stopwatch.isRunning = false;
    stopwatch.seconds = 0;
    stopwatch.minutes = 0;
    stopwatch.hours = 0;

    const stopwatchDisplay = document.getElementById(`stopwatch-display-${stopwatchId}`);
    stopwatchDisplay.textContent = formatTime(stopwatch);

    saveTimersToStorage();
}

// Delete the stopwatch
function deleteStopwatch(stopwatchId) {
    const stopwatchIndex = timers.findIndex(timer => timer.id === stopwatchId);
    if (stopwatchIndex !== -1) {
        const stopwatch = timers[stopwatchIndex];
        if (stopwatch.isRunning) {
            clearInterval(stopwatch.interval);
        }
        timers.splice(stopwatchIndex, 1);
        const stopwatchDiv = document.getElementById(`stopwatch-display-${stopwatchId}`).parentElement;
        stopwatchDiv.remove();
    }

    saveTimersToStorage();
}

// Helper function to format the time (hh:mm:ss)
function formatTime(timer) {
    let hours = String(timer.hours).padStart(2, '0');
    let minutes = String(timer.minutes).padStart(2, '0');
    let seconds = String(timer.seconds).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Save timers when page is about to unload
window.addEventListener('beforeunload', function() {
    saveTimersToStorage();
});


// Add event listeners for name changes
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('timer-name') || e.target.classList.contains('stopwatch-name')) {
        // Extract the ID from the element ID
        const fullId = e.target.id;
        const idParts = fullId.split('-');
        const type = idParts[0]; // 'timer' or 'stopwatch'
        const id = parseInt(idParts[2]);
        
        // Find the timer/stopwatch and update its name
        const timerObj = timers.find(t => t.id === id);
        if (timerObj) {
            timerObj.name = e.target.value;
            saveTimersToStorage();
        }
    }
});

// Add periodic saving for running timers/stopwatches
setInterval(function() {
    if (timers.some(timer => timer.isRunning)) {
        saveTimersToStorage();
    }
}, 10000); // Save every 10 seconds if any timer is running