// 🟢 Initialize the tasks array and taskId if not already initialized
let tasks = []; // Initialize tasks array
let taskId = 1; // Initialize taskId (ensure this doesn't conflict with other parts of your code)

// Initialize calendar first
$(document).ready(function() {
    $('#calendar').fullCalendar({
        // your calendar options here
        events: [], // Start with empty events
        // other calendar config
    });
    
    // Then load tasks from localStorage
    loadFromLocalStorage();
});

// Clear the task list when loading from localStorage to avoid duplicates
function loadFromLocalStorage() {
    // Load tasks from localStorage
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }

    // Load progress data from localStorage
    completedTasks = parseInt(localStorage.getItem('completedTasks') || 0);

    // Rebuild task list and progress chart from loaded data
    updateProgressChart();

    // Clear existing events first
    $('#calendar').fullCalendar('removeEvents');
    
    // Clear the task list to avoid duplicates
    document.getElementById("task-list").innerHTML = "";
    
    // Re-render tasks in FullCalendar and task list
    tasks.forEach(task => {
        // Add task to FullCalendar
        $('#calendar').fullCalendar('renderEvent', {
            id: task.id,
            title: task.text,
            start: task.start,
            end: task.end,
            allDay: false,
            backgroundColor: task.completed ? '#d3d3d3' : '#3498db' // Set color based on completion status
        }, true);

        // Add task to task list in the UI using our improved function
        addTaskToList(task);
    });
    
    // Make sure taskId is higher than any existing task ID
    if (tasks.length > 0) {
        const highestId = Math.max(...tasks.map(task => task.id));
        taskId = highestId + 1;
    }
}

// 🟢 Save Tasks and Progress to Local Storage
function saveToLocalStorage() {
    // Convert tasks array to JSON and save it to localStorage
    localStorage.setItem('tasks', JSON.stringify(tasks));

    // Save chart data to localStorage
    localStorage.setItem('completedTasks', completedTasks);
    localStorage.setItem('totalTasks', totalTasks);
    localStorage.setItem('dailyActivities', JSON.stringify(dailyActivities));
    localStorage.setItem('weeklyData', JSON.stringify(weeklyData));
}


// Improved function to add task to the list with proper data attributes
function addTaskToList(task) {
    const taskList = document.getElementById("task-list");
    const li = document.createElement("li");
    
    // Set a data attribute to store the task ID with the list item
    li.setAttribute('data-task-id', task.id);
    li.className = "task-item"; // Ensure it has a class for styling

    // Task text
    const taskText = document.createElement("span");
    taskText.textContent = task.text;
    taskText.className = "task-text"; // Class for styling

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.className = "task-checkbox";
    checkbox.onclick = function() {
        toggleTaskCompletion(task.id, checkbox);
    };

    // Create the delete button for each task
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "x";
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = function() {
        deleteTask(task.id);
    };

    //Create container for buttons
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";

    buttonContainer.appendChild(checkbox);
    buttonContainer.appendChild(deleteBtn);
    
    li.appendChild(taskText);

    li.appendChild(buttonContainer);
    taskList.appendChild(li);
}

// 🟢 Load Data on Page Load
document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("progressChart");
    if (!canvas) {
        console.error("Canvas element not found!");
    } else {
        const ctx = canvas.getContext("2d");
        console.log("Canvas loaded successfully", ctx);
    }
    loadFromLocalStorage();  // Load tasks and progress data when the page loads
});

// 🟢 Global Variables for Data Tracking
let totalTasks = 0;
let completedTasks = 0;
let totalHours = 0;

const taskCtx = document.getElementById('progressChart').getContext('2d');
// 🟢 Task Progress Chart (Doughnut) for Completed vs Remaining Tasks
const progressChart = new Chart(taskCtx, {
    type: 'doughnut',
    data: {
        labels: ['Completed Tasks', 'Remaining Tasks'],
        datasets: [{
            data: [0, 1],
            backgroundColor: ['#4CAF50', '#FF9800']
        }]
    }
});

// 🟢 Function to Update Task Progress (Doughnut Chart)
function updateProgressChart() {
    completedTasks = tasks.filter(task => task.status === 'completed').length;
    const remainingTasks = tasks.filter(task => task.status === 'remaining').length;
    progressChart.data.datasets[0].data = [completedTasks, remainingTasks];
    progressChart.update();
}

// Update your addTask function to use the improved addTaskToList function
function addTask() {
    const taskInput = document.getElementById("task-input");
    const startTimeInput = document.getElementById("start-time");
    const endTimeInput = document.getElementById("end-time");
    const taskText = taskInput.value.trim();
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;

    if (taskText === "" || !startTime || !endTime) {
        alert("Please fill out all fields.");
        return;
    }
    //Added this in
    let taskId = Date.now();

    // Create new task object
    const task = {
        id: taskId++,  // Unique task ID
        text: taskText,
        start: startTime,  // Start time
        end: endTime,      // End time
        status: 'remaining',  // Status of the task
        completed: false   // Task is not completed by default
    };

    // Add task to tasks array
    tasks.push(task);

    // Clear the input fields after task is created
    taskInput.value = ""; 
    startTimeInput.value = ""; 
    endTimeInput.value = "";

    // Add task to the list using our improved function
    addTaskToList(task);

    // Add task to FullCalendar
    $('#calendar').fullCalendar('renderEvent', {
        id: task.id,
        title: taskText,
        start: task.start, // Task start time
        end: task.end,     // Task end time
        allDay: false,     // Not an all-day event
        backgroundColor: '#3498db' // Default color for new tasks
    }, true);

    // Save tasks to localStorage after adding a task
    saveToLocalStorage();

    // Update the task progress chart
    updateProgressChart();

    console.log("New Task: ", task);
}

function deleteTask(taskId) {
    // Find the task index
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
        alert("Task not found.");
        return;
    }
    
    // Get the task
    const task = tasks[taskIndex];
    
    // Remove the task from FullCalendar
    $('#calendar').fullCalendar('removeEvents', taskId);
    
    // Remove the task from the tasks array
    tasks.splice(taskIndex, 1);
    
    // Remove the task from the task list in HTML
    const taskListItems = document.querySelectorAll("#task-list li");
    for (let i = 0; i < taskListItems.length; i++) {
        // Check if this li element has the data-task-id attribute matching our taskId
        if (taskListItems[i].getAttribute('data-task-id') == taskId) {
            taskListItems[i].remove();
            break;
        }
    }
    
    // Save updated tasks to localStorage
    saveToLocalStorage();
    
    // Update the progress chart
    updateProgressChart();
}

// Function to save tasks to localStorage (you need to implement this)
function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));

    // Save chart data to localStorage
    localStorage.setItem('completedTasks', completedTasks);
}

// Function to update progress chart (you need to implement this)
function updateProgressChart() {
    completedTasks = tasks.filter(task => task.status === 'completed').length;  // Count completed tasks
    const remainingTasks = tasks.filter(task => task.status === 'remaining').length;  // Count remaining tasks
    progressChart.data.datasets[0].data = [completedTasks, remainingTasks];  // Update chart data
    progressChart.update();  // Re-render the chart
}


// 🟢 Update Calendar Task Status (Gray Out Completed Tasks)
function updateCalendarTaskCompletion(taskId, isCompleted) {
    // Find task event in the calendar and update it
    const events = $('#calendar').fullCalendar('clientEvents');
    const taskEvent = events.find(event => event.title === tasks.find(t => t.id === taskId).text);
    if (taskEvent) {
        // Change background color for completed tasks (gray)
        taskEvent.backgroundColor = isCompleted ? '#d3d3d3' : '#3498db'; // Gray for completed, blue for remaining
        $('#calendar').fullCalendar('updateEvent', taskEvent);
    }
}

// Keep only this version of toggleTaskCompletion
function toggleTaskCompletion(taskId, checkbox) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        // Update the task's completion status
        task.completed = checkbox.checked;
        task.status = checkbox.checked ? 'completed' : 'remaining'; // Update status

        // Update the task in localStorage
        saveToLocalStorage();

        // Update the progress chart
        updateProgressChart();

        // Update calendar task completion status
        updateCalendarTaskCompletion(taskId, checkbox.checked);
    }
}