// --- Greeting & Motivational Quotes ---
const greetingEl = document.getElementById("greeting");
const quoteEl = document.getElementById("motivationalQuote");

// Greeting based on time
const hours = new Date().getHours();
let greeting = "Hello";
if (hours < 12) greeting = "Good Morning 😊";
else if (hours < 18) greeting = "Good Afternoon 🌤️";
else greeting = "Good Evening 🌙";

greetingEl.textContent = `${greeting}!`;

// Fetch quotes from external JSON file
let quotes = [];
fetch("quotes.json")
  .then((res) => res.json())
  .then((data) => {
    quotes = data;
    displayRandomQuote();
  })
  .catch((err) => {
    console.error("Failed to load quotes:", err);
    quoteEl.textContent = "You got this! 💪"; // fallback
  });

// Function to display a random quote
function displayRandomQuote() {
  if (quotes.length === 0) return;

  // Pick a random quote
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  // Fade out
  quoteEl.classList.remove("show");

  setTimeout(() => {
    // Change text
    quoteEl.textContent = quote;

    // Fade in
    quoteEl.classList.add("show");
  }, 200); // 200ms fade-out before fade-in
}

// Optional: refresh quote every 5 minutes
setInterval(displayRandomQuote, 300000); // 300000 ms = 5 minutes

// --- DOM Elements ---
const addTaskBtn = document.getElementById("addTaskBtn");
const modal = document.getElementById("modal");
const saveTaskBtn = document.getElementById("saveTask");
const cancelTaskBtn = document.getElementById("cancelTask");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const pointsEl = document.getElementById("points");
const badgesEl = document.getElementById("badges");

// --- Tasks & Gamification ---
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let points = JSON.parse(localStorage.getItem("points")) || 0;
let streak = JSON.parse(localStorage.getItem("streak")) || 0;
let badges = JSON.parse(localStorage.getItem("badges")) || [];
let newBadges = [];

// --- Functions ---
function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = task.completed ? "completed" : "";
    li.setAttribute("draggable", "true");
    li.innerHTML = `<span>${task.text}</span><button class="delete-btn">🗑️</button>`;

    // Toggle complete
    li.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) return;
      toggleTask(index);
    });

    // Delete
    li.querySelector(".delete-btn").addEventListener("click", () =>
      confirmDeleteTask(index)
    );

    // Drag and Drop
    li.addEventListener("dragstart", dragStart);
    li.addEventListener("dragover", dragOver);
    li.addEventListener("drop", (e) => dropTask(e, index));

    taskList.appendChild(li);
  });

  updateProgress();
  updatePoints();
  renderBadges();
  saveLocal();
}

// --- Add Task ---
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.push({ text, completed: false });
  taskInput.value = "";
  modal.classList.add("hidden");
  renderTasks();
}

// --- Toggle Task Complete ---
function toggleTask(index) {
  const wasCompleted = tasks[index].completed;
  tasks[index].completed = !tasks[index].completed;

  if (tasks[index].completed) {
    confetti({ particleCount: 30, spread: 60 });
    // Refresh quote only when completing a task
    displayRandomQuote();
  }

  recalcPoints();
  recalcStreak();
  checkBadges();
  renderTasks();
}

// --- Delete Confirmation Modal ---
let deleteIndex = null;

function confirmDeleteTask(index) {
  deleteIndex = index;
  document.getElementById("confirmModal").classList.remove("hidden");
}

document.getElementById("cancelDelete").addEventListener("click", () => {
  document.getElementById("confirmModal").classList.add("hidden");
  deleteIndex = null;
});

document.getElementById("confirmDelete").addEventListener("click", () => {
  if (deleteIndex !== null) {
    deleteTask(deleteIndex);
    deleteIndex = null;
  }
  document.getElementById("confirmModal").classList.add("hidden");
});

// --- Actual Task Deletion ---
function deleteTask(index) {
  tasks.splice(index, 1);
  recalcPoints();
  recalcStreak();
  renderTasks();
}

// --- Recalculate Points & Streak ---
function recalcPoints() {
  points = tasks.filter((t) => t.completed).length * 10;
  updatePoints();
}

function recalcStreak() {
  streak = 0;
  for (let t of tasks) {
    if (t.completed) streak++;
    else break;
  }
}

// --- Update Progress ---
function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  progressBar.style.width = percent + "%";
  progressText.textContent = percent + "% completed";
}

// --- Update Points ---
function updatePoints() {
  pointsEl.textContent = `Points: ${points} | Streak: ${streak}🔥`;
}

// --- Badges ---
function checkBadges() {
  const milestones = [5, 10, 20, 50];
  newBadges = [];
  milestones.forEach((m) => {
    if (points >= m * 10 && !badges.includes(m)) {
      badges.push(m);
      newBadges.push(m);

      const colors = [
        "#f94144",
        "#f3722c",
        "#f8961e",
        "#f9c74f",
        "#90be6d",
        "#43aa8b",
        "#577590",
      ];
      for (let i = 0; i < 3; i++) {
        confetti({
          particleCount: 40,
          spread: 120,
          startVelocity: 30 + i * 10,
          origin: { x: Math.random(), y: 0 },
          colors: colors,
        });
      }
    }
  });
}

function renderBadges() {
  badgesEl.innerHTML = "";
  badges.forEach((b) => {
    const span = document.createElement("span");
    span.textContent = `🏅${b} Tasks`;
    span.classList.add("badge");

    if (newBadges.includes(b)) {
      span.style.animation = "badge-pop 0.5s ease";
    }

    badgesEl.appendChild(span);
  });
}

// --- Modal ---
addTaskBtn.addEventListener("click", () => modal.classList.remove("hidden"));
cancelTaskBtn.addEventListener("click", () => modal.classList.add("hidden"));
saveTaskBtn.addEventListener("click", addTask);

// --- Drag and Drop ---
let dragStartIndex;
function dragStart(e) {
  dragStartIndex = [...taskList.children].indexOf(e.target);
}
function dragOver(e) {
  e.preventDefault();
}
function dropTask(e, dropIndex) {
  const draggedTask = tasks[dragStartIndex];
  tasks.splice(dragStartIndex, 1);
  tasks.splice(dropIndex, 0, draggedTask);
  renderTasks();
}

// --- Local Storage ---
function saveLocal() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("points", points);
  localStorage.setItem("streak", streak);
  localStorage.setItem("badges", JSON.stringify(badges));
}

// --- Initial Render ---
renderTasks();
