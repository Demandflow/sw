let timeLeft;
let timerId = null;
let isWorkMode = true;

const timeDisplay = document.getElementById('time');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const modeToggle = document.getElementById('modeToggle');
const modeText = document.getElementById('modeText');
const themeToggle = document.getElementById('themeToggle');

const WORK_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds
const THEMES = ['default', 'modern', 'retro', 'minimal'];
const THEME_NAMES = {
    'default': 'Default',
    'modern': 'Modern',
    'retro': 'Retro',
    'minimal': 'Minimal'
};

function updateModeUI(isWork) {
    const modeToggle = document.querySelector('.mode-toggle');
    const workLabel = document.getElementById('workLabel');
    const breakLabel = document.getElementById('breakLabel');
    
    modeToggle.setAttribute('data-mode', isWork ? 'work' : 'break');
    workLabel.classList.toggle('active', isWork);
    breakLabel.classList.toggle('active', !isWork);
}

function updateMode() {
    isWorkMode = !modeToggle.checked;
    updateModeUI(isWorkMode);
    resetTimer();
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updatePageTitle(time) {
    document.title = time + ' - Pomodoro Timer';
}

function playCompletionSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Function to play one sequence of notes
    function playSequence(startTime) {
        const oscillator = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const gainNode2 = audioContext.createGain();

        oscillator.connect(gainNode);
        oscillator2.connect(gainNode2);
        gainNode.connect(audioContext.destination);
        gainNode2.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator2.type = 'triangle';

        const notes = [523.25, 659.25, 783.99, 1046.50, 783.99]; // C5, E5, G5, C6, G5
        
        oscillator.start(startTime);
        oscillator2.start(startTime);

        for (let i = 0; i < 5; i++) {
            const time = startTime + (i * 0.4);
            
            oscillator.frequency.setValueAtTime(notes[i], time);
            oscillator2.frequency.setValueAtTime(notes[i] * 1.01, time);

            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(0.3, time + 0.05);
            gainNode.gain.linearRampToValueAtTime(0, time + 0.3);

            gainNode2.gain.setValueAtTime(0, time);
            gainNode2.gain.linearRampToValueAtTime(0.1, time + 0.05);
            gainNode2.gain.linearRampToValueAtTime(0, time + 0.3);
        }

        oscillator.stop(startTime + 2);
        oscillator2.stop(startTime + 2);
    }

    // Play the sequence twice with a small gap
    playSequence(audioContext.currentTime);
    playSequence(audioContext.currentTime + 2.5); // Start second sequence after 2.5 seconds
}

function celebrateCompletion() {
    playCompletionSound();
    
    // First burst
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });

    // Follow up bursts
    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
        });
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
        });
    }, 250);
}

function startTimer() {
    if (timerId !== null) {
        clearInterval(timerId);
        startBtn.textContent = 'Start';
        timerId = null;
        document.title = 'Pomodoro Timer';
        return;
    }

    startBtn.textContent = 'Pause';
    document.querySelector('.container').classList.add('running');
    timerId = setInterval(() => {
        timeLeft--;
        const formattedTime = formatTime(timeLeft);
        timeDisplay.textContent = formattedTime;
        updatePageTitle(formattedTime);

        if (timeLeft === 0) {
            clearInterval(timerId);
            timerId = null;
            startBtn.textContent = 'Start';
            document.title = 'Pomodoro Timer';
            celebrateCompletion();
            // Switch modes automatically without the alert
            modeToggle.checked = !modeToggle.checked;
            updateMode();
            document.querySelector('.container').classList.remove('running');
        }
    }, 1000);
}

function resetTimer() {
    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }
    timeLeft = isWorkMode ? WORK_TIME : BREAK_TIME;
    const formattedTime = formatTime(timeLeft);
    timeDisplay.textContent = formattedTime;
    startBtn.textContent = 'Start';
    document.title = 'Pomodoro Timer';
    document.querySelector('.container').classList.remove('running');
}

function toggleTheme() {
    if (themeToggle.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

function setThemeStyle(styleTheme) {
    document.documentElement.setAttribute('data-theme-style', styleTheme);
    document.querySelector('.theme-name').textContent = THEME_NAMES[styleTheme];
}

function cycleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme-style') || 'default';
    const currentIndex = THEMES.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setThemeStyle(THEMES[nextIndex]);
}

// Event listeners
startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);
modeToggle.addEventListener('change', updateMode);
themeToggle.addEventListener('change', toggleTheme);

// Add click handlers for the labels
document.getElementById('workLabel').addEventListener('click', () => {
    if (modeToggle.checked) {
        modeToggle.checked = false;
        updateMode();
    }
});

document.getElementById('breakLabel').addEventListener('click', () => {
    if (!modeToggle.checked) {
        modeToggle.checked = true;
        updateMode();
    }
});

// Add this with the other event listeners
document.querySelector('.theme-cycle-btn').addEventListener('click', cycleTheme);

// Initialize timer
resetTimer();

// Make sure to call updateModeUI on initial load
updateModeUI(true);

// Initialize with default theme
setThemeStyle('default'); 