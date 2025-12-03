/* =========================================
   CIVICLOKA: MISSION 1 LOGIC (CODE PANCASILA)
   Fokus: Refleks Toleransi, Anti-Hoax, Musyawarah
   ========================================= */

// --- 1. GAME CONFIGURATION & STATE ---
const GAME_CONFIG = {
    initialTime: 120, // 2 Menit untuk seluruh misi
    maxLives: 3,
    scorePerCorrect: 20,
    penaltyPerWrong: -10
};

let state = {
    currentQuestionIndex: 0,
    score: 0,
    lives: GAME_CONFIG.maxLives,
    timeLeft: GAME_CONFIG.initialTime,
    timerInterval: null,
    isGameOver: false
};

// --- 2. DATABASE SOAL (ADAPTASI MODUL PDF) ---
// Tipe: 'reflex' (2 Tombol), 'hoax' (2 Tombol), 'chat' (Simulasi)
const missionData = [
// --- ZONA 1: REFLEKS TOLERANSI (SILA 1 & 2) [cite: 97-104] ---
    {
        type: 'reflex',
        category: 'ZONA 1: REFLEKS SILA 1',
        text: "Temanmu yang berbeda agama sedang berdoa sebelum makan di kantin.",
        options: ["Ajak Ngobrol", "Diam & Hormati"],
        correctIndex: 1,
        feedback: "Sila 1: Hormati kebebasan beribadah orang lain."
    },
    {
        type: 'reflex',
        category: 'ZONA 1: REFLEKS SILA 2',
        text: "Ada penggalangan dana untuk korban banjir di daerah lain.",
        options: ["Ikut Donasi", "Cuek Saja"],
        correctIndex: 0,
        feedback: "Sila 2: Gemar melakukan kegiatan kemanusiaan."
    },
    {
        type: 'reflex',
        category: 'ZONA 1: REFLEKS SILA 5',
        text: "Melihat teman menyontek saat ujian.",
        options: ["Ikut Menyontek", "Tegur / Lapor"],
        correctIndex: 1,
        feedback: "Sila 5: Berani bersikap jujur dan adil."
    },

// --- ZONA 2: HOAX BUSTER (SILA 3) [cite: 180-183] ---
    {
        type: 'hoax',
        category: 'ZONA 2: FILTER INFORMASI',
        text: "JUDUL BERITA: 'Pulau Bali Dijual ke Negara Asing demi Bayar Utang!'",
        options: ["FAKTA", "HOAKS"],
        correctIndex: 1,
        feedback: "Ini adalah HOAKS provokatif yang memecah belah persatuan."
    },
    {
        type: 'hoax',
        category: 'ZONA 2: FILTER INFORMASI',
        text: "JUDUL BERITA: 'Pemerintah Tetapkan Batik sebagai Warisan Budaya Takbenda.'",
        options: ["FAKTA", "HOAKS"],
        correctIndex: 0,
        feedback: "Benar. Kita harus bangga pada budaya bangsa (Sila 3)."
    },

    // --- ZONA 3: MUSYAWARAH (CHAT SIMULATION - SILA 4) [cite: 110-112] ---
    {
        type: 'chat',
        category: 'ZONA 3: SIMULASI KELAS',
        text: "Diskusi Pentas Seni sedang memanas di Grup WA...",
        chatHistory: [
            { sender: "Ketua Kelas", text: "Gais, kita fix pakai baju adat Jawa aja ya buat pensi. Murah.", side: "left" },
            { sender: "Budi", text: "Yah kok gitu? Voting dulu dong, jangan otoriter!", side: "left" },
            { sender: "Siti", text: "Iya ih, aku maunya baju profesi aja.", side: "left" }
        ],
        options: [
            "Woi Ketua! Jangan seenaknya sendiri dong!", // Salah (Kasar)
            "Setuju sama Ketua, biar cepet kelar.",      // Salah (Apatis)
            "Usul Ketua ditampung dulu, mari kita voting bersama." // Benar (Musyawarah)
        ],
        correctIndex: 2,
        feedback: "Sila 4: Mengutamakan musyawarah untuk mufakat, tidak memaksakan kehendak."
    }
];

// --- 3. CORE FUNCTIONS ---

// A. Inisialisasi
window.onload = function() {
    // Cek Login
    if(!sessionStorage.getItem('agent_name')) {
        window.location.href = 'index.html';
        return;
    }
    // Update HUD Awal
    updateHUD();
};

// B. Mulai Game
function startGame() {
    // Sembunyikan Briefing, Tampilkan Game
    document.getElementById('stage-briefing').classList.remove('active-stage');
    document.getElementById('stage-briefing').style.display = 'none';
    
    document.getElementById('stage-game').classList.add('active-stage');
    document.getElementById('stage-game').classList.add('fade-up');
    
    // Jalankan Timer
    state.timerInterval = setInterval(gameLoop, 1000);
    
    // Load Soal Pertama
    loadQuestion();
}

// C. Game Loop (Timer)
function gameLoop() {
    state.timeLeft--;
    updateHUD();

    // Efek Kritis (Kurang dari 10 detik)
    const timerEl = document.getElementById('timerDisplay');
    if(state.timeLeft <= 10) {
        timerEl.classList.add('pulse-critical');
        timerEl.style.color = "var(--neon-red)";
    }

    // Game Over jika waktu habis
    if(state.timeLeft <= 0) {
        endGame("WAKTU HABIS! Misi Gagal.");
    }
}

// D. Load Soal
function loadQuestion() {
    const q = missionData[state.currentQuestionIndex];
    const questionTitle = document.getElementById('questionText');
    const categoryBadge = document.getElementById('questionCategory');
    const btnContainer = document.getElementById('answerButtons');
    const chatContainer = document.getElementById('chatContainer');

    // Update UI Teks
    categoryBadge.innerText = q.category;
    questionTitle.innerText = q.text;

    // Reset Tampilan
    btnContainer.innerHTML = ''; 
    btnContainer.style.display = 'grid';
    chatContainer.style.display = 'none';

    // Logika Tampilan Berdasarkan Tipe Soal
    if (q.type === 'reflex' || q.type === 'hoax') {
        // Mode Tombol Biasa
        q.options.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.className = 'btn-tactical';
            btn.style.width = '100%';
            btn.innerText = opt;
            btn.onclick = () => checkAnswer(index);
            
            // Styling khusus Hoax (Merah/Hijau)
            if(q.type === 'hoax') {
                if(opt === 'HOAKS') btn.style.borderColor = 'var(--neon-red)';
                if(opt === 'FAKTA') btn.style.borderColor = 'var(--neon-green)';
            }
            
            btnContainer.appendChild(btn);
        });

    } else if (q.type === 'chat') {
        // Mode Chatting
        btnContainer.style.display = 'none'; // Sembunyikan tombol biasa
        chatContainer.style.display = 'flex'; // Tampilkan chat
        chatContainer.classList.add('fade-up');

        const chatBox = document.getElementById('chatBox');
        const chatOptions = document.getElementById('chatOptions');
        
        // Render History Chat
        chatBox.innerHTML = '';
        q.chatHistory.forEach(msg => {
            const bubble = document.createElement('div');
            bubble.className = `chat-bubble chat-${msg.side}`;
            bubble.innerHTML = `<strong>${msg.sender}:</strong><br>${msg.text}`;
            chatBox.appendChild(bubble);
        });

        // Render Opsi Jawaban Chat
        chatOptions.innerHTML = '';
        q.options.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.className = 'btn-tactical';
            btn.style.textAlign = 'left';
            btn.style.fontSize = '0.8rem';
            btn.innerText = `> ${opt}`;
            btn.onclick = () => checkAnswer(index);
            chatOptions.appendChild(btn);
        });
        
        // Auto scroll ke bawah
        setTimeout(() => chatBox.scrollTop = chatBox.scrollHeight, 100);
    }

    // Update Progress Bar
    const progress = ((state.currentQuestionIndex) / missionData.length) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

// E. Cek Jawaban
function checkAnswer(selectedIndex) {
    const q = missionData[state.currentQuestionIndex];
    const container = document.getElementById('stage-game');

    if (selectedIndex === q.correctIndex) {
        // BENAR
        state.score += GAME_CONFIG.scorePerCorrect;
        // Visual Feedback: Flash Hijau
        container.style.borderColor = "var(--neon-green)";
        setTimeout(() => container.style.borderColor = "var(--glass-border)", 300);
    } else {
        // SALAH
        state.score += GAME_CONFIG.penaltyPerWrong; // Bisa minus
        state.lives--;
        
        // Visual Feedback: Shake & Merah
        container.classList.add('shake');
        setTimeout(() => container.classList.remove('shake'), 500);
        
        // Alert Kecil (Feedback Edukasi)
        alert(`KURANG TEPAT!\n${q.feedback}`);

        if (state.lives <= 0) {
            endGame("NYAWA HABIS! Misi Gagal.");
            return;
        }
    }

    // Lanjut ke soal berikutnya
    state.currentQuestionIndex++;
    
    if (state.currentQuestionIndex < missionData.length) {
        loadQuestion();
    } else {
        finishMission(); // Misi Selesai
    }
    
    updateHUD();
}

// F. Update HUD (Tampilan Atas)
function updateHUD() {
    document.getElementById('scoreDisplay').innerText = state.score;
    
    // Format Waktu MM:SS
    const m = Math.floor(state.timeLeft / 60).toString().padStart(2, '0');
    const s = (state.timeLeft % 60).toString().padStart(2, '0');
    document.getElementById('timerDisplay').innerText = `${m}:${s}`;
    
    // Update Nyawa
    let hearts = "";
    for(let i=0; i<state.lives; i++) hearts += "❤️";
    document.getElementById('livesDisplay').innerText = hearts;
}

// G. Selesai Misi (Menang)
function finishMission() {
    clearInterval(state.timerInterval);
    
    document.getElementById('stage-game').style.display = 'none';
    document.getElementById('stage-finish').style.display = 'block';
    document.getElementById('stage-finish').classList.add('fade-up');
    
    // Tampilkan Skor Akhir
    // Bonus Waktu: 1 poin per detik tersisa
    const timeBonus = state.timeLeft; 
    const finalScore = state.score + timeBonus;
    
    document.getElementById('finalScore').innerText = finalScore;
    
    // Update Progress Full
    document.getElementById('progressBar').style.width = '100%';
}

// H. Game Over (Kalah)
function endGame(reason) {
    clearInterval(state.timerInterval);
    alert(reason);
    window.location.reload(); // Restart Misi
}