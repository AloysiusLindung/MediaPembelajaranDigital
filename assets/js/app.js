/* =========================================
   CIVICLOKA: CORE LOGIC (APP.JS)
   Menangani Login, Session, dan Navigasi
   ========================================= */

// 1. FUNGSI START SESSION (LOGIN)
function startSession() {
    // Ambil nilai dari input
    const nameInput = document.getElementById('agentName');
    const classInput = document.getElementById('agentClass');
    const loginBox = document.querySelector('.glass-panel');

    // Cek apakah elemen ditemukan (untuk debug)
    if (!nameInput || !classInput) {
        console.error("Elemen input tidak ditemukan! Cek ID di index.html");
        return;
    }

    const nameVal = nameInput.value.trim();
    const classVal = classInput.value.trim();

    // Validasi: Tidak boleh kosong
    if (!nameVal || !classVal) {
        alert("PERINGATAN: Identitas Agen wajib diisi!");
        
        // Tambahkan efek getar (Shake) jika salah
        if(loginBox) {
            loginBox.classList.add('shake');
            setTimeout(() => {
                loginBox.classList.remove('shake');
            }, 500);
        }
        return;
    }

    // Simpan data ke Session Storage (Hilang saat browser ditutup)
    sessionStorage.setItem('agent_name', nameVal);
    sessionStorage.setItem('agent_class', classVal);

    // Pindah ke Dashboard
    goToDashboard();
}

// 2. FUNGSI PINDAH TAMPILAN (UI SWITCHER)
function goToDashboard() {
    const name = sessionStorage.getItem('agent_name');

    // Update teks nama di dashboard
    if (name) {
        const nameDisplay = document.getElementById('displayAgentName');
        if(nameDisplay) nameDisplay.innerText = name.toUpperCase();
    }

    // Sembunyikan Login, Tampilkan Dashboard
    const loginScreen = document.getElementById('login-screen');
    const missionDashboard = document.getElementById('mission-dashboard');

    if(loginScreen) loginScreen.style.display = 'none';
    if(missionDashboard) missionDashboard.style.display = 'flex';
}

// 3. FUNGSI RESET / LOGOUT
function resetSession() {
    if (confirm("AKSES DIHENTIKAN: Anda yakin ingin keluar?")) {
        sessionStorage.clear(); // Hapus data
        location.reload();      // Refresh halaman
    }
}

// 4. CEK SESSION SAAT HALAMAN DIMUAT (AUTO LOGIN)
window.onload = function() {
    // Jika sudah ada nama tersimpan, langsung ke dashboard
    if (sessionStorage.getItem('agent_name')) {
        goToDashboard();
    }
}; 