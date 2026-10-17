
let tasks = [];
let currentDate = new Date();

// Get today's date in local time
function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Save tasks without deleting existing data
function saveTasks() {
    try {
        localStorage.setItem("planwiseTasks", JSON.stringify(tasks));
    } catch (error) {
        alert("Tasks could not be saved. Please check browser storage.");
        console.error(error);
    }
}

// Load previously saved tasks
function loadTasks() {
    try {
        const savedTasks = localStorage.getItem("planwiseTasks");

        if (savedTasks !== null) {
            const parsedTasks = JSON.parse(savedTasks);

            if (Array.isArray(parsedTasks)) {
                tasks = parsedTasks;
            } else {
                alert("Saved task data is invalid. Your saved data was not overwritten.");
            }
        }
    } catch (error) {
        alert("Saved task data could not be read. Please do not clear browser storage.");
        console.error(error);
    }

    displayTasks();
    displayCalendar();
}

// Add a new task
function addTask() {
    const subject = document.getElementById("subject").value.trim();
    const deadline = document.getElementById("deadline").value;
    const duration = Number(document.getElementById("duration").value);
    const priority = document.getElementById("priority").value;

    if (!subject || !deadline || !document.getElementById("duration").value) {
        alert("Please fill in all fields.");
        return;
    }

    if (!Number.isFinite(duration) || duration <= 0) {
        alert("Study duration must be greater than zero.");
        return;
    }

    const newTask = {
        subject: subject,
        deadline: deadline,
        duration: duration,
        priority: priority,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();
    displayTasks();
    displayCalendar();

    document.getElementById("subject").value = "";
    document.getElementById("deadline").value = "";
    document.getElementById("duration").value = "";
    document.getElementById("priority").value = "High";
}

// Sort tasks by deadline and priority
function sortTasks() {
    const priorityOrder = { High: 1, Medium: 2, Low: 3 };

    tasks.sort(function (a, b) {
        if (a.deadline !== b.deadline) {
            return a.deadline.localeCompare(b.deadline);
        }

        return (priorityOrder[a.priority] || 4) -
               (priorityOrder[b.priority] || 4);
    });
}

// Display tasks and schedule
function displayTasks() {
    const taskContainer = document.getElementById("taskContainer");
    const scheduleContainer = document.getElementById("scheduleContainer");
    const upcomingContainer = document.getElementById("upcomingContainer");

    taskContainer.innerHTML = "";
    scheduleContainer.innerHTML = "";
    upcomingContainer.innerHTML = "";

    sortTasks();

    const today = getTodayString();

    tasks.forEach(function (task, index) {
        const isOverdue = task.deadline < today && !task.completed;

        const taskElement = document.createElement("div");
        taskElement.className = "task";

        if (task.completed) {
            taskElement.classList.add("completed");
        }

        if (isOverdue) {
            taskElement.style.borderLeft = "5px solid red";
        }

        const title = document.createElement("h4");
        title.textContent = task.subject;
        taskElement.appendChild(title);

        const deadlineText = document.createElement("p");
        deadlineText.textContent = "Deadline: " + task.deadline;
        taskElement.appendChild(deadlineText);

        const durationText = document.createElement("p");
        durationText.textContent = "Study Duration: " + task.duration + " hours";
        taskElement.appendChild(durationText);

        const priorityText = document.createElement("p");
        priorityText.textContent = "Priority: " + task.priority;
        taskElement.appendChild(priorityText);

        if (isOverdue) {
            const overdueText = document.createElement("p");
            overdueText.textContent = "Overdue — Reschedule Needed";
            overdueText.style.color = "red";
            overdueText.style.fontWeight = "bold";
            taskElement.appendChild(overdueText);
        }

        const completeButton = document.createElement("button");
        completeButton.type = "button";
        completeButton.textContent = task.completed ? "Completed ✓" : "Complete";
        completeButton.disabled = task.completed;
        completeButton.onclick = function () {
            completeTask(index);
        };
        taskElement.appendChild(completeButton);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.onclick = function () {
            deleteTask(index);
        };
        taskElement.appendChild(deleteButton);

        if (isOverdue) {
            const rescheduleButton = document.createElement("button");
            rescheduleButton.type = "button";
            rescheduleButton.textContent = "Reschedule";
            rescheduleButton.onclick = function () {
                rescheduleTask(index);
            };
            taskElement.appendChild(rescheduleButton);
        }

        taskContainer.appendChild(taskElement);

        // Study Schedule
        const scheduleItem = document.createElement("div");
        scheduleItem.className = "schedule-item";

        const scheduleTitle = document.createElement("strong");
        scheduleTitle.textContent = task.subject;
        scheduleItem.appendChild(scheduleTitle);

        const scheduleDeadline = document.createElement("p");
        scheduleDeadline.textContent = "Deadline: " + task.deadline;
        scheduleItem.appendChild(scheduleDeadline);

        const scheduleDuration = document.createElement("p");
        scheduleDuration.textContent = "Duration: " + task.duration + " hours";
        scheduleItem.appendChild(scheduleDuration);

        const schedulePriority = document.createElement("p");
        schedulePriority.textContent = "Priority: " + task.priority;
        scheduleItem.appendChild(schedulePriority);

        scheduleContainer.appendChild(scheduleItem);

        // Upcoming Tasks: today through the next seven days
        const todayDate = new Date(today + "T00:00:00");
        const deadlineDate = new Date(task.deadline + "T00:00:00");
        const daysLeft = Math.round(
            (deadlineDate - todayDate) / (1000 * 60 * 60 * 24)
        );

        if (!task.completed && daysLeft >= 0 && daysLeft <= 7) {
            const upcomingItem = document.createElement("div");
            upcomingItem.className = "schedule-item";

            const upcomingTitle = document.createElement("strong");
            upcomingTitle.textContent = task.subject;
            upcomingItem.appendChild(upcomingTitle);

            const upcomingDeadline = document.createElement("p");
            upcomingDeadline.textContent = "Deadline: " + task.deadline;
            upcomingItem.appendChild(upcomingDeadline);

            const daysText = document.createElement("p");
            daysText.textContent = "Days left: " + daysLeft;
            upcomingItem.appendChild(daysText);

            upcomingContainer.appendChild(upcomingItem);
        }
    });

    if (tasks.length === 0) {
        taskContainer.textContent = "No study tasks yet.";
        scheduleContainer.textContent = "No study tasks scheduled yet.";
        upcomingContainer.textContent = "No upcoming tasks yet.";
    } else if (upcomingContainer.children.length === 0) {
        upcomingContainer.textContent = "No upcoming tasks yet.";
    }

    updateProgress();
}

// Complete a task
function completeTask(index) {
    if (!tasks[index]) return;

    tasks[index].completed = true;
    saveTasks();
    displayTasks();
    displayCalendar();
}

// Delete a task
function deleteTask(index) {
    if (!tasks[index]) return;

    if (!confirm("Are you sure you want to delete this task?")) {
        return;
    }

    tasks.splice(index, 1);
    saveTasks();
    displayTasks();
    displayCalendar();
}

// Reschedule an overdue task
/*
function rescheduleTask(index) {
    if (!tasks[index]) return;

    const newDeadline = prompt(
        "Enter the new deadline (YYYY-MM-DD):",
        tasks[index].deadline
    );

    if (newDeadline === null) return;

    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(newDeadline);
    const parsedDate = new Date(newDeadline + "T00:00:00");

    if (!validDate || Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== newDeadline) {
        alert("Please enter a valid date in YYYY-MM-DD format.");
        return;
    }

    if (newDeadline <= getTodayString()) {
        alert("Please choose a future date.");
        return;
    }

    tasks[index].deadline = newDeadline;
    saveTasks();
    displayTasks();
    displayCalendar();

    alert("Task rescheduled successfully!");
}*/

function rescheduleTask(index) {
    if (!tasks[index]) return;

    const newDeadline = prompt(
        "Enter the new deadline (YYYY-MM-DD):",
        tasks[index].deadline
    );

    if (newDeadline === null) return;

    const date = newDeadline.trim();
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
    const parsedDate = new Date(date + "T12:00:00");

    if (
        !validDate ||
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.getFullYear() !== Number(date.slice(0, 4)) ||
        parsedDate.getMonth() + 1 !== Number(date.slice(5, 7)) ||
        parsedDate.getDate() !== Number(date.slice(8, 10))
    ) {
        alert("Please enter a valid date in YYYY-MM-DD format.");
        return;
    }

    if (date <= getTodayString()) {
        alert("Please choose a future date.");
        return;
    }

    tasks[index].deadline = date;

    saveTasks();
    displayTasks();
    displayCalendar();

    alert("Task rescheduled successfully!");
}


// Update dashboard and progress
function updateProgress() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(function (task) {
        return task.completed;
    }).length;

    const pendingTasks = totalTasks - completedTasks;
    const progress = totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);

    document.getElementById("totalTasks").textContent = totalTasks;
    document.getElementById("completedTasks").textContent = completedTasks;
    document.getElementById("pendingTasks").textContent = pendingTasks;
    document.getElementById("progressText").textContent =
        "Progress: " + progress + "%";
}

// Display calendar
function displayCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    document.getElementById("calendarMonth").textContent =
        monthNames[month] + " " + year;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendarDays = document.getElementById("calendarDays");

    calendarDays.innerHTML = "";

    for (let i = 0; i < firstDay; i++) {
        calendarDays.appendChild(document.createElement("div"));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement("div");
        dayElement.textContent = day;

        const dayDate = year + "-" +
            String(month + 1).padStart(2, "0") + "-" +
            String(day).padStart(2, "0");

        const hasTask = tasks.some(function (task) {
            return task.deadline === dayDate;
        });

        if (hasTask) {
            dayElement.style.backgroundColor = "#3498db";
            dayElement.style.color = "white";
            dayElement.style.fontWeight = "bold";
        }

        calendarDays.appendChild(dayElement);
    }
}

function previousMonth() {
    currentDate.setDate(1);
    currentDate.setMonth(currentDate.getMonth() - 1);
    displayCalendar();
}

function nextMonth() {
    currentDate.setDate(1);
    currentDate.setMonth(currentDate.getMonth() + 1);
    displayCalendar();
}

// Start the application
loadTasks();

