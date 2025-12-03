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
    const btn = document.querySelector('.btn-start');
    const originalText = btn.innerText;
    
    btn.innerText = "⏳ MEMPROSES GAMBAR...";
    btn.disabled = true;
    
    // STEP 1: Create a SIMPLIFIED version for capture
    const simplifiedHTML = `
        <div style="
            width: 400px;
            padding: 30px;
            background: #0F172A;
            border-top: 8px solid var(--neon-gold);
            border-radius: 16px;
            color: white;
            font-family: 'Outfit', sans-serif;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        ">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 25px;">
                <div>
                    <h3 style="margin: 0; font-size: 1.8rem; color: white;">CIVICLOKA</h3>
                    <span style="font-family: monospace; font-size: 0.7rem; color: #F59E0B;">OFFICIAL AGENT RECORD</span>
                </div>
                <div style="width: 40px; height: 28px; background: linear-gradient(to bottom, #EF4444 50%, #F1F5F9 50%); border-radius: 4px;"></div>
            </div>
            
            <!-- Data -->
            <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding: 8px 0;">
                    <span style="color: #94A3B8; font-size: 0.8rem; font-family: monospace;">CODENAME</span>
                    <span style="color: #06B6D4; font-weight: bold; text-transform: uppercase;" id="renderName">${sessionStorage.getItem('agent_name') || 'ANON'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding: 8px 0;">
                    <span style="color: #94A3B8; font-size: 0.8rem; font-family: monospace;">UNIT / KELAS</span>
                    <span style="font-weight: bold; text-transform: uppercase;">${sessionStorage.getItem('agent_class') || '-'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding: 8px 0;">
                    <span style="color: #94A3B8; font-size: 0.8rem; font-family: monospace;">MISI OPERASI</span>
                    <span style="font-weight: bold; text-transform: uppercase;">${sessionStorage.getItem('last_mission') || 'TRAINING'}</span>
                </div>
            </div>
            
            <!-- Score Box -->
            <div style="text-align: center; margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="font-family: monospace; font-size: 0.75rem; color: #94A3B8; margin-bottom: 5px;">TOTAL SKOR</div>
                <div style="font-size: 4rem; font-weight: 800; color: white; line-height: 1;">${sessionStorage.getItem('last_score') || '0'}</div>
                <div style="font-size: 3rem; margin: 10px 0;">👑</div>
                <div style="font-family: monospace; letter-spacing: 3px; font-weight: bold; font-size: 1.1rem; color: #F59E0B;">ELITE AGENT</div>
            </div>
            
            <!-- Watermark -->
            <div style="position: absolute; bottom: 10px; right: -10px; font-size: 3.5rem; color: rgba(255,255,255,0.03); transform: rotate(-30deg); font-weight: 800; pointer-events: none;">CONFIDENTIAL</div>
        </div>
    `;
    
    // STEP 2: Create hidden div with simplified HTML
    const hiddenDiv = document.createElement('div');
    hiddenDiv.style.position = 'fixed';
    hiddenDiv.style.left = '-9999px';
    hiddenDiv.style.top = '0';
    hiddenDiv.innerHTML = simplifiedHTML;
    document.body.appendChild(hiddenDiv);
    
    // STEP 3: Capture the simplified version
    const elementToCapture = hiddenDiv.firstElementChild;
    
    html2canvas(elementToCapture, {
        backgroundColor: '#0F172A',
        scale: 3, // Higher quality
        logging: false,
        allowTaint: true,
        useCORS: true,
        width: elementToCapture.offsetWidth,
        height: elementToCapture.offsetHeight,
        onclone: function(clonedDoc) {
            // Optional: modify cloned document if needed
        }
    }).then(canvas => {
        // Create download
        const link = document.createElement('a');
        const cleanName = sessionStorage.getItem('agent_name')?.replace(/[^a-zA-Z0-9]/g, '_') || 'agent';
        link.download = `HASIL_${cleanName}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        // Clean up
        document.body.removeChild(hiddenDiv);
        
        // Success feedback
        btn.innerText = "✅ BERHASIL DISIMPAN";
        btn.style.borderColor = "var(--neon-green)";
        btn.style.color = "var(--neon-green)";
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.borderColor = "";
            btn.style.color = "";
            btn.disabled = false;
        }, 2000);
        
    }).catch(err => {
        console.error("Capture failed:", err);
        document.body.removeChild(hiddenDiv);
        
        alert("Gagal generate gambar. Silakan screenshot manual.");
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
