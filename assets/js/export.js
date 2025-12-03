/* =========================================
   CIVICLOKA: RESULT & EXPORT LOGIC
   File: assets/js/export.js
   Fokus: Render Data Hasil & Generate Gambar
   ========================================= */

// --- 1. INISIALISASI HALAMAN (SAAT DIMUAT) ---
window.onload = function() {
    // Ambil data dari Session Storage (yang disimpan saat login & selesai game)
    const name = sessionStorage.getItem('agent_name');
    const unit = sessionStorage.getItem('agent_class');
    const score = sessionStorage.getItem('last_score') || 0;
    const mission = sessionStorage.getItem('last_mission') || 'TRAINING MODE';
    
    // Security Check: Jika siswa mencoba buka halaman ini tanpa login
    if (!name) {
        alert("AKSES DITOLAK: Harap login terlebih dahulu.");
        window.location.href = 'index.html';
        return;
    }

    // Render Data ke Elemen HTML
    document.getElementById('resName').innerText = name.toUpperCase();
    document.getElementById('resClass').innerText = unit.toUpperCase();
    document.getElementById('resMission').innerText = mission.toUpperCase();
    document.getElementById('resScore').innerText = score;
    
    // Timestamp Real-time (Waktu saat ini)
    const now = new Date();
    // Format: DD/MM/YYYY HH:MM
    const timeString = now.toLocaleDateString('id-ID') + ' ' + now.toLocaleTimeString('id-ID').slice(0, 5);
    document.getElementById('resTime').innerText = timeString;

    // Kalkulasi Rank / Badge berdasarkan Skor
    calculateRank(parseInt(score));
};

// --- 2. LOGIKA PENENTUAN RANKING ---
function calculateRank(score) {
    const badgeEl = document.getElementById('resBadge');
    const rankTextEl = document.getElementById('resRankText');
    const cardEl = document.getElementById('accessCard');

    // Reset Class Animasi
    badgeEl.className = "rank-badge fade-up";

    if (score >= 150) { // Skor Tinggi (Misi Sempurna + Bonus Waktu)
        badgeEl.innerText = "👑";
        rankTextEl.innerText = "ELITE AGENT";
        rankTextEl.style.color = "var(--neon-gold)";
        cardEl.style.borderTopColor = "var(--neon-gold)";
        cardEl.style.boxShadow = "0 0 30px rgba(245, 158, 11, 0.3)"; // Gold Glow
    } else if (score >= 80) { // Skor Menengah
        badgeEl.innerText = "⭐";
        rankTextEl.innerText = "OPERATIVE";
        rankTextEl.style.color = "var(--neon-cyan)";
        cardEl.style.borderTopColor = "var(--neon-cyan)";
        cardEl.style.boxShadow = "0 0 30px rgba(6, 182, 212, 0.3)"; // Cyan Glow
    } else { // Skor Rendah
        badgeEl.innerText = "🔰";
        rankTextEl.innerText = "ROOKIE";
        rankTextEl.style.color = "var(--text-dim)";
        cardEl.style.borderTopColor = "var(--text-dim)";
    }
}

// --- 3. FITUR UTAMA: DOWNLOAD GAMBAR (html2canvas) ---
function downloadCard() {
    const cardElement = document.getElementById('accessCard');
    const btn = document.querySelector('.btn-start'); // Tombol Download
    
    // A. Ubah status tombol agar user tahu sistem sedang bekerja
    const originalText = btn.innerText;
    btn.innerText = "⏳ MEMPROSES GAMBAR...";
    btn.style.opacity = "0.7";
    btn.disabled = true;

    // B. Eksekusi Library html2canvas
    // Fungsi ini "memotret" elemen HTML dan menjadikannya Canvas
    html2canvas(cardElement, {
        backgroundColor: null, // Transparan di luar border
        scale: 2,              // Resolusi tinggi (agar tidak pecah di HP)
        useCORS: true,         // Izin akses gambar eksternal (jika ada)
        logging: false         // Matikan log debug agar console bersih
    }).then(canvas => {
        
        // C. Membuat Link Download Palsu
        const link = document.createElement('a');
        
        // Format Nama File: HASIL_Nama_Misi.png
        const cleanName = sessionStorage.getItem('agent_name').replace(/[^a-zA-Z0-9]/g, '_');
        link.download = `HASIL_${cleanName}.png`;
        
        // Konversi Canvas ke Data URL (Format Gambar)
        link.href = canvas.toDataURL("image/png");
        
        // Klik link secara otomatis
        link.click();

        // D. Kembalikan Status Tombol
        setTimeout(() => {
            btn.innerText = "✅ BERHASIL DISIMPAN";
            btn.style.borderColor = "var(--neon-green)";
            btn.style.color = "var(--neon-green)";
            
            // Reset tombol ke semula setelah 2 detik
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.borderColor = "";
                btn.style.color = "";
                btn.style.opacity = "1";
                btn.disabled = false;
            }, 2000);
        }, 500);

    }).catch(err => {
        console.error("Gagal generate gambar:", err);
        alert("ERROR: Browser tidak mendukung fitur ini. Silakan Screenshot manual (Tombol Power + Volume).");
        btn.innerText = originalText;
        btn.disabled = false;
    });
}

// --- 4. NAVIGASI KEMBALI ---
function returnToBase() {
    // Hapus skor terakhir agar jika login lagi skornya bersih
    sessionStorage.removeItem('last_score');
    sessionStorage.removeItem('last_mission');
    
    // Kembali ke Dashboard Utama
    window.location.href = 'index.html';
}