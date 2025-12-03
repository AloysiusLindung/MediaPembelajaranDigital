/* =========================================
   CIVICLOKA: MISSION 2 LOGIC (GLOBAL STRATEGY)
   Fokus: Analisis SWOT, Data Korupsi, & Leitstar
   ========================================= */

// --- 1. GAME CONFIGURATION ---
const GAME_CONFIG = {
    initialTime: 300, // 5 Menit (Lebih lama karena ada analisis)
    maxLives: 3,
    scorePerCorrect: 30,
    penaltyPerWrong: -15
};

let state = {
    score: 0,
    lives: GAME_CONFIG.maxLives,
    timeLeft: GAME_CONFIG.initialTime,
    timerInterval: null,
    currentStage: 1, // 1: SWOT, 2: CHART, 3: PUZZLE
    
    // State Khusus SWOT
    swotIndex: 0,
    
    // State Khusus Puzzle
    currentPuzzleAnswer: []
};

// --- 2. DATABASE KONTEN (DARI PDF & RANCANGAN) ---

// A. Data SWOT
const swotData = [
    { text: "Bonus Demografi", type: "strength", hint: "Penduduk usia produktif melimpah (Internal +)" },
    { text: "Korupsi Tinggi", type: "weakness", hint: "Masalah integritas pejabat (Internal -)" },
    { text: "Kemajuan IPTEK", type: "opportunity", hint: "Peluang inovasi dari luar (Eksternal +)" },
    { text: "Rawan Bencana Alam", type: "threat", hint: "Posisi di Ring of Fire (Eksternal -)" },
    { text: "Kekayaan Alam", type: "strength", hint: "Biodiversitas & Tambang (Internal +)" },
    { text: "Ideologi Asing", type: "threat", hint: "Radikalisme & Konsumerisme (Eksternal -)" }
];

// B. Data Chart (Korupsi ICW)
const chartData = {
    labels: ['2017', '2018', '2019', '2020', '2021'],
    values: [6.5, 5.6, 8.4, 18.6, 29.4], // Dalam Triliun Rupiah
    question: "Klik pada batang tahun dengan KERUGIAN NEGARA TERTINGGI!",
    correctLabel: '2021' // Jawaban Benar
};

// C. Data Puzzle (Leitstar)
const puzzleSentence = "PANCASILA ADALAH BINTANG PENUNTUN ARAH BANGSA";
const puzzleWords = puzzleSentence.split(" "); // Array kata

// --- 3. CORE FUNCTIONS & INITIALIZATION ---

window.onload = function() {
    // Cek Login (Opsional, matikan jika ingin testing langsung)
    if(!sessionStorage.getItem('agent_name')) {
        console.warn("User belum login. Menggunakan mode tamu/debug.");
    }
    updateHUD();
};

// --- FITUR BARU: LOGIKA MODAL MATERI (INTEL) ---

function openIntel() {
    const modal = document.getElementById('intelModal');
    if(modal) {
        modal.style.display = 'flex'; // Munculkan modal
    } else {
        console.error("Modal Intel tidak ditemukan di HTML!");
    }
}

function closeIntel() {
    const modal = document.getElementById('intelModal');
    if(modal) {
        modal.style.display = 'none'; // Sembunyikan modal
    }
}

function startActualGame() {
    // 1. Tutup Modal Materi
    closeIntel();
    
    // 2. Jalankan Game
    startGame();
}

// --- GAME LOGIC ---

function startGame() {
    // Sembunyikan Briefing
    const briefing = document.getElementById('stage-briefing');
    briefing.classList.remove('active-stage');
    briefing.style.display = 'none';
    
    // Mulai Timer
    state.timerInterval = setInterval(gameLoop, 1000);
    
    // Masuk Zona 1
    initSWOT();
}

function gameLoop() {
    state.timeLeft--;
    updateHUD();

    // Efek Kritis
    if(state.timeLeft <= 10) {
        document.getElementById('timerDisplay').classList.add('pulse-critical');
    }
    
    // Game Over Waktu Habis
    if(state.timeLeft <= 0) {
        endGame("WAKTU HABIS! Misi Analisis Gagal.");
    }
}

// --- 4. ZONA 1: SWOT LOGIC ---

function initSWOT() {
    state.currentStage = 1;
    const stage = document.getElementById('stage-swot');
    stage.style.display = 'block';
    stage.classList.add('fade-up');
    
    loadNextSwotItem();
    setupDragAndDrop();
}

function loadNextSwotItem() {
    const container = document.getElementById('swotSource');
    
    // Cek jika semua item sudah habis
    if (state.swotIndex >= swotData.length) {
        completeSWOT();
        return;
    }

    const itemData = swotData[state.swotIndex];
    
    // Render Kartu Soal Baru (Menggantikan "LOADING...")
    container.innerHTML = `
        <div class="draggable-item" draggable="true" id="currentItem" data-type="${itemData.type}">
            ${itemData.text}
            <div style="font-size: 0.7rem; font-weight: normal; margin-top: 5px; opacity: 0.8;">${itemData.hint}</div>
        </div>
    `;
    
    // Re-attach event listener ke item baru
    const newItem = document.getElementById('currentItem');
    newItem.addEventListener('dragstart', dragStart);
    
    // Support Touch untuk HP (Klik item -> Klik Zona)
    newItem.addEventListener('click', () => {
        // Beri highlight bahwa item ini terpilih
        newItem.style.border = "2px solid white";
        setTimeout(() => newItem.style.border = "", 500);
    });
}

function setupDragAndDrop() {
    const zones = document.querySelectorAll('.swot-zone');
    
    zones.forEach(zone => {
        // Event Drag (Desktop)
        zone.addEventListener('dragover', dragOver);
        zone.addEventListener('dragleave', dragLeave);
        zone.addEventListener('drop', dropItem);
        
        // Event Click (Mobile Fallback)
        // Jika user klik zona, kita anggap dia ingin menaruh item di situ
        zone.addEventListener('click', () => manualSelectZone(zone));
    });
}

// Logic Drag & Drop
function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.type);
    e.target.style.opacity = '0.5';
}

function dragOver(e) {
    e.preventDefault(); // Wajib agar bisa di-drop
    e.currentTarget.classList.add('drag-over');
}

function dragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function dropItem(e) {
    e.preventDefault();
    const zone = e.currentTarget;
    zone.classList.remove('drag-over');
    
    const itemType = e.dataTransfer.getData('text/plain');
    validateSwotAnswer(zone, itemType);
}

// Logic Manual Click (Mobile)
function manualSelectZone(zone) {
    const currentItem = document.getElementById('currentItem');
    if(currentItem) {
        const itemType = currentItem.dataset.type;
        validateSwotAnswer(zone, itemType);
    }
}

// Validasi Jawaban (Dipakai oleh Drag & Click)
function validateSwotAnswer(zone, itemType) {
    const zoneType = zone.dataset.type;
    const currentItem = document.getElementById('currentItem');

    if (itemType === zoneType) {
        // BENAR
        state.score += GAME_CONFIG.scorePerCorrect;
        state.swotIndex++;
        
        // Efek Visual Benar
        const originalColor = zone.style.backgroundColor;
        zone.style.backgroundColor = "rgba(16, 185, 129, 0.3)"; // Hijau
        
        // Tampilkan centang sebentar
        const originalContent = zone.innerHTML;
        
        setTimeout(() => {
            zone.style.backgroundColor = originalColor;
            loadNextSwotItem(); // Lanjut soal berikutnya
        }, 300);
        
    } else {
        // SALAH
        state.score += GAME_CONFIG.penaltyPerWrong;
        state.lives--;
        updateHUD();
        
        // Efek Visual Salah (Shake)
        zone.classList.add('shake');
        setTimeout(() => zone.classList.remove('shake'), 500);
        
        if(currentItem) currentItem.style.opacity = '1'; 
        
        alert("SALAH KUADRAN! Perhatikan petunjuk (Internal/Eksternal).");
        
        if (state.lives <= 0) endGame("ANALISIS GAGAL! Terlalu banyak kesalahan.");
    }
}

function completeSWOT() {
    document.getElementById('stage-swot').style.display = 'none';
    initChart();
}


// --- 5. ZONA 2: CHART LOGIC (CHART.JS) ---

let corruptionChart = null; 

function initChart() {
    state.currentStage = 2;
    document.getElementById('stage-chart').style.display = 'block';
    document.getElementById('stage-chart').classList.add('fade-up');
    document.getElementById('chartQuestion').innerText = chartData.question;

    const canvas = document.getElementById('corruptionChart');
    if (!canvas) {
        console.error("Canvas Chart tidak ditemukan!");
        return;
    }
    const ctx = canvas.getContext('2d');

    // Cek Library Chart.js
    if(typeof Chart === 'undefined') {
        alert("Error: Library Chart.js tidak terdeteksi. Cek folder assets/lib/");
        return;
    }

    // Render Chart
    corruptionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Kerugian Negara (Triliun Rp)',
                data: chartData.values,
                backgroundColor: 'rgba(6, 182, 212, 0.5)', // Neon Cyan
                borderColor: '#06B6D4',
                borderWidth: 2,
                hoverBackgroundColor: '#F59E0B', // Gold
                hoverBorderColor: '#F59E0B'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { color: '#94A3B8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#fff' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
            },
            // Event Klik pada Batang Grafik
            onClick: (e) => {
                // Kompatibilitas Chart.js v3/v4
                const points = corruptionChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);

                if (points.length) {
                    const firstPoint = points[0];
                    const index = firstPoint.index;
                    const label = corruptionChart.data.labels[index];
                    
                    checkChartAnswer(label);
                }
            },
            onHover: (event, chartElement) => {
                event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
            }
        }
    });
}

function checkChartAnswer(selectedLabel) {
    if (selectedLabel === chartData.correctLabel) {
        // BENAR
        state.score += GAME_CONFIG.scorePerCorrect;
        alert(`TEPAT! Tahun ${selectedLabel} mencatat kerugian tertinggi (Rp 29.4 T).`);
        
        if(corruptionChart) corruptionChart.destroy();
        completeChart();
    } else {
        // SALAH
        state.score += GAME_CONFIG.penaltyPerWrong;
        state.lives--;
        updateHUD();
        alert("ANALISIS TIDAK TEPAT. Cari batang yang paling tinggi!");
        
        if (state.lives <= 0) endGame("GAGAL MEMBACA DATA!");
    }
}

function completeChart() {
    document.getElementById('stage-chart').style.display = 'none';
    initPuzzle();
}


// --- 6. ZONA 3: PUZZLE LOGIC ---

function initPuzzle() {
    state.currentStage = 3;
    document.getElementById('stage-puzzle').style.display = 'block';
    document.getElementById('stage-puzzle').classList.add('fade-up');
    
    const sourceArea = document.getElementById('puzzleSource');
    
    // Acak kata-kata
    const shuffled = [...puzzleWords].sort(() => Math.random() - 0.5);
    
    sourceArea.innerHTML = ""; // Bersihkan area
    shuffled.forEach(word => {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece';
        piece.innerText = word;
        piece.onclick = () => moveWord(piece); // Klik untuk pindah
        sourceArea.appendChild(piece);
    });
}

function moveWord(element) {
    const targetArea = document.getElementById('puzzleTarget');
    const sourceArea = document.getElementById('puzzleSource');
    
    // Pindahkan elemen antar parent (Source <-> Target)
    if (element.parentElement === sourceArea) {
        targetArea.appendChild(element);
        element.style.background = "var(--neon-cyan)";
        element.style.color = "#000";
    } else {
        sourceArea.appendChild(element);
        element.style.background = ""; 
        element.style.color = "";
    }
}

function checkPuzzle() {
    const targetArea = document.getElementById('puzzleTarget');
    // Ambil kata dari elemen yang ada di target
    const userWords = Array.from(targetArea.children)
        .filter(el => el.classList.contains('puzzle-piece'))
        .map(el => el.innerText);
    
    const userSentence = userWords.join(" ");
    
    if (userSentence === puzzleSentence) {
        // MENANG TOTAL
        state.score += 50;
        finishMission();
    } else {
        state.score += GAME_CONFIG.penaltyPerWrong;
        state.lives--;
        updateHUD();
        
        targetArea.classList.add('shake');
        setTimeout(() => targetArea.classList.remove('shake'), 500);
        
        alert("SUSUNAN KATA SALAH! Cek kembali urutannya.");
        
        if (state.lives <= 0) endGame("GAGAL MENYUSUN STRATEGI!");
    }
}

// --- 7. GLOBAL HELPERS ---

function updateHUD() {
    const scoreEl = document.getElementById('scoreDisplay');
    const timerEl = document.getElementById('timerDisplay');
    const livesEl = document.getElementById('livesDisplay');
    const progressEl = document.getElementById('progressBar');

    if(scoreEl) scoreEl.innerText = state.score;
    
    if(timerEl) {
        const m = Math.floor(state.timeLeft / 60).toString().padStart(2, '0');
        const s = (state.timeLeft % 60).toString().padStart(2, '0');
        timerEl.innerText = `${m}:${s}`;
    }
    
    if(livesEl) {
        let hearts = "";
        for(let i=0; i<state.lives; i++) hearts += "❤️";
        livesEl.innerText = hearts;
    }
    
    if(progressEl) {
        let progress = 0;
        if (state.currentStage === 1) progress = 10 + (state.swotIndex * 10);
        else if (state.currentStage === 2) progress = 60;
        else if (state.currentStage === 3) progress = 80;
        progressEl.style.width = `${progress}%`;
    }
}

function finishMission() {
    clearInterval(state.timerInterval);
    
    document.getElementById('stage-puzzle').style.display = 'none';
    document.getElementById('stage-finish').style.display = 'block';
    document.getElementById('stage-finish').classList.add('fade-up');
    
    const timeBonus = state.timeLeft; 
    const finalScore = state.score + timeBonus;
    document.getElementById('finalScore').innerText = finalScore;
    document.getElementById('progressBar').style.width = '100%';
}

function endGame(reason) {
    clearInterval(state.timerInterval);
    alert(reason);
    window.location.reload();
}