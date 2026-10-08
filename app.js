document.addEventListener('DOMContentLoaded', () => {
    // Check theme preference on load
    const themeCheckbox = document.getElementById('theme-checkbox');
    const body = document.body;

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        if (themeCheckbox) themeCheckbox.checked = true;
    } else {
        body.classList.add('light-theme');
        body.classList.remove('dark-theme');
        if (themeCheckbox) themeCheckbox.checked = false;
    }

    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', () => {
            if (themeCheckbox.checked) {
                body.classList.remove('light-theme');
                body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                body.classList.add('light-theme');
                body.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
            }
            updateChartThemes();
        });
    }

    // Lucide Icons Initialization
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    /* --- SIDEBAR TAB NAVIGATION --- */
    const menuItems = document.querySelectorAll('.menu-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');

    const tabSubtitles = {
        'overview': 'Refleksi dan Rekapitulasi Hasil Praktik Mengajar Mandiri (PPL II)',
        'rancangan': 'Analisis produk rancangan/perencanaan pembelajaran untuk praktik mengajar mandiri',
        'materi': 'Analisis materi pembelajaran yang sudah disusun dan diterapkan praktik mengajar mandiri',
        'media': 'Analisis media pembelajaran yang dipergunakan dalam praktik mengajar mandiri',
        'video': 'Analisis video pelaksanaan praktik mengajar mandiri',
        'nonmengajar': 'Analisis kegiatan nonmengajar',
        'penilaian': 'Instrumen penilaian yang dirancang berserta analisisnya'
    };

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active classes
            menuItems.forEach(mi => mi.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            
            // Add active class to clicked menu item
            item.classList.add('active');
            
            // Show corresponding tab content
            const tabId = item.getAttribute('data-tab');
            const targetSection = document.getElementById(tabId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // Dynamic Header Text
            pageTitle.textContent = item.querySelector('span').textContent;
            pageSubtitle.textContent = tabSubtitles[tabId] || '';
            
            // Re-render Lucide icons for active tab
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

            // Trigger chart animations if navigation occurred
            resizeAndAnimateCharts();
        });
    });

    /* --- ACCORDIONS --- */
    // Tab 6 Non-Mengajar Accordions
    const activityHeaders = document.querySelectorAll('.activity-header');
    activityHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const parentCard = header.parentElement;
            const isActive = parentCard.classList.contains('active');
            
            // Close all
            document.querySelectorAll('.activity-card').forEach(card => {
                card.classList.remove('active');
            });
            
            // Toggle clicked
            if (!isActive) {
                parentCard.classList.add('active');
            }
        });
    });

    /* --- TAB SUB-TABS LOGIC (CYCLE FILTERING & EVALUATION DETAILS) --- */
    // 1. Cycle-Based Filtering Tabs (Synchronized globally!)
    const cycleSubTabs = document.querySelectorAll('.sub-tab[data-cycle]');
    cycleSubTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const cycleVal = tab.getAttribute('data-cycle');

            // Synchronize active sub-tabs in all containers
            document.querySelectorAll('.sub-tab[data-cycle]').forEach(s => {
                const sVal = s.getAttribute('data-cycle');
                const isMatch = (sVal === cycleVal) || 
                                (sVal === 'siklus3-4' && (cycleVal === 'siklus3' || cycleVal === 'siklus4')) ||
                                ((sVal === 'siklus3' || sVal === 'siklus4') && cycleVal === 'siklus3-4');
                if (isMatch) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });

            // Toggle active cycle sections in all tabs
            document.querySelectorAll('.tab-content').forEach(parentSection => {
                const cycleSections = parentSection.querySelectorAll('.cycle-section');
                cycleSections.forEach(sec => {
                    const cVal = sec.getAttribute('data-cycle-content');
                    const isMatch = (cVal === cycleVal) || 
                                    (cVal === 'siklus3-4' && (cycleVal === 'siklus3' || cycleVal === 'siklus4')) ||
                                    ((cVal === 'siklus3' || cVal === 'siklus4') && cycleVal === 'siklus3-4');
                    if (isMatch) {
                        sec.classList.add('active');
                    } else {
                        sec.classList.remove('active');
                    }
                });
            });

            // Smooth scroll to the active cycle section in the current tab
            const parentSection = tab.closest('.tab-content');
            if (parentSection) {
                const activeSection = parentSection.querySelector('.cycle-section.active');
                if (activeSection) {
                    setTimeout(() => {
                        activeSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 50);
                }
            }

            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    });

    // 2. Evaluation Type Sub-Tabs (Cognitive/Affective/Analisis Soal)
    const detailSubTabs = document.querySelectorAll('.sub-tab[data-subtab]');
    const detailSubTabContents = document.querySelectorAll('.sub-tab-content');
    detailSubTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const parentSection = tab.closest('.tab-content');
            if (!parentSection) return;

            const siblings = tab.parentElement.querySelectorAll('.sub-tab[data-subtab]');
            siblings.forEach(s => s.classList.remove('active'));
            tab.classList.add('active');

            detailSubTabContents.forEach(content => {
                content.classList.remove('active');
            });

            const targetId = tab.getAttribute('data-subtab');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    /* --- TAB 7: GRADING SIMULATOR --- */
    const selectLogika = document.getElementById('rubrik-logika');
    const selectKerja = document.getElementById('rubrik-kerja');
    const selectKreativitas = document.getElementById('rubrik-kreativitas');
    const scoreText = document.getElementById('simulated-score');
    const badgeStatus = document.getElementById('simulated-badge');
    const feedbackText = document.getElementById('simulated-feedback');

    function calculateSimulatedScore() {
        if (!selectLogika || !selectKerja || !selectKreativitas) return;
        const valMap = { "4": 100, "3": 85, "2": 70, "1": 55 };
        
        const scoreLogika = valMap[selectLogika.value];
        const scoreKerja = valMap[selectKerja.value];
        const scoreKreativitas = valMap[selectKreativitas.value];
        
        // Weighted: 40% logic, 30% teamwork, 30% creativity
        const finalScore = (scoreLogika * 0.4) + (scoreKerja * 0.3) + (scoreKreativitas * 0.3);
        scoreText.textContent = finalScore.toFixed(1);

        // Update Badge Status
        if (finalScore >= 75) {
            badgeStatus.textContent = "TUNTAS";
            badgeStatus.className = "badge badge-success";
        } else {
            badgeStatus.textContent = "TIDAK TUNTAS / REMEDIAL";
            badgeStatus.className = "badge badge-danger";
        }

        // Custom Feedback Logic
        let feedback = "";
        if (finalScore >= 90) {
            feedback = "Siswa menunjukkan tingkat pemahaman ilmiah tingkat lanjut (HOTS) serta ketelitian praktikum yang luar biasa. Dapat dilibatkan sebagai tutor sebaya (Peer Tutor).";
        } else if (finalScore >= 75) {
            feedback = "Siswa telah mencapai Kriteria Ketercapaian Tujuan Pembelajaran (KKTP). Direkomendasikan mengikuti pengayaan berupa analisis penyajian grafik lanjutan.";
        } else if (finalScore >= 65) {
            feedback = "Siswa berada di batas remedial. Perlu pendampingan individual (scaffolding) untuk memperkuat pemahaman prosedur variabel kontrol di kelas.";
        } else {
            feedback = "Siswa memerlukan remedial total. Perlu penjelasan ulang secara terpandu menggunakan kit laboratorium dasar secara personal.";
        }
        feedbackText.textContent = feedback;
    }

    if (selectLogika) {
        selectLogika.addEventListener('change', calculateSimulatedScore);
        selectKerja.addEventListener('change', calculateSimulatedScore);
        selectKreativitas.addEventListener('change', calculateSimulatedScore);
        calculateSimulatedScore(); // Run initial calc
    }

    /* --- MOCK VIDEO PLAYER INTERACTIVITY (MULTI-CYCLE SUPPORT) --- */
    function setupMockPlayer(config) {
        const playBtn = document.getElementById(config.playBtnId);
        const playIconToggle = document.getElementById(config.playIconToggleId);
        const playIcon = document.getElementById(config.playIconId);
        const videoOverlay = document.getElementById(config.overlayId);
        const videoPlaying = document.getElementById(config.playingStateId);
        const progressFill = document.getElementById(config.progressFillId);
        const timeDisplay = document.getElementById(config.timeDisplayId);
        const playingTimestamp = document.getElementById(config.timestampId);
        const playingDesc = document.getElementById(config.descId);
        const timelineSteps = document.querySelectorAll(config.timelineSelector);

        if (!playBtn && !playIconToggle) return;

        let videoInterval = null;
        let isPlaying = false;
        let videoCurrentSeconds = 0;
        const totalVideoSeconds = 900; // 15 mins

        function formatTime(secs) {
            const m = Math.floor(secs / 60).toString().padStart(2, '0');
            const s = Math.floor(secs % 60).toString().padStart(2, '0');
            return `${m}:${s}`;
        }

        function updateMockPlayerDisplay() {
            if (!progressFill || !timeDisplay) return;
            progressFill.style.width = `${(videoCurrentSeconds / totalVideoSeconds) * 100}%`;
            timeDisplay.textContent = `${formatTime(videoCurrentSeconds)} / ${formatTime(totalVideoSeconds)}`;
            if (playingTimestamp) playingTimestamp.textContent = formatTime(videoCurrentSeconds);
            
            let activeStepIndex = 0;
            timelineSteps.forEach((step, idx) => {
                const stepTime = parseInt(step.getAttribute('data-time'));
                if (videoCurrentSeconds >= stepTime) {
                    activeStepIndex = idx;
                }
            });

            timelineSteps.forEach((step, idx) => {
                if (idx === activeStepIndex) {
                    step.classList.add('active');
                    if (playingDesc) {
                        const h5 = step.querySelector('h5');
                        if (h5) playingDesc.textContent = "Memutar: " + h5.textContent;
                    }
                } else {
                    step.classList.remove('active');
                }
            });
        }

        function togglePlay() {
            if (isPlaying) {
                isPlaying = false;
                clearInterval(videoInterval);
                if (typeof lucide !== 'undefined' && playIcon) {
                    playIcon.setAttribute('data-lucide', 'play');
                    lucide.createIcons();
                }
            } else {
                isPlaying = true;
                if (videoOverlay) videoOverlay.classList.add('hidden');
                if (videoPlaying) videoPlaying.classList.remove('hidden');
                if (typeof lucide !== 'undefined' && playIcon) {
                    playIcon.setAttribute('data-lucide', 'pause');
                    lucide.createIcons();
                }
                videoInterval = setInterval(() => {
                    videoCurrentSeconds += 2;
                    if (videoCurrentSeconds >= totalVideoSeconds) {
                        videoCurrentSeconds = 0;
                        togglePlay();
                    }
                    updateMockPlayerDisplay();
                }, 500);
            }
        }

        if (playBtn) playBtn.addEventListener('click', togglePlay);
        if (playIconToggle) playIconToggle.addEventListener('click', togglePlay);

        timelineSteps.forEach(step => {
            step.addEventListener('click', () => {
                const targetTime = parseInt(step.getAttribute('data-time'));
                videoCurrentSeconds = targetTime;
                if (!isPlaying) {
                    togglePlay();
                }
                updateMockPlayerDisplay();
            });
        });
    }

    // Initialize Player for Terbimbing
    setupMockPlayer({
        playBtnId: 'play-video-btn-tb',
        playIconToggleId: 'btn-toggle-play-tb',
        playIconId: 'btn-play-icon-tb',
        overlayId: 'video-overlay-play-tb',
        playingStateId: 'video-playing-state-tb',
        progressFillId: 'progress-bar-fill-tb',
        timeDisplayId: 'video-time-display-tb',
        timestampId: 'playing-timestamp-tb',
        descId: 'playing-desc-tb',
        timelineSelector: '#timeline-steps-tb .timeline-step'
    });

    // Initialize Player for Siklus 1
    setupMockPlayer({
        playBtnId: 'play-video-btn-s1',
        playIconToggleId: 'btn-toggle-play-s1',
        playIconId: 'btn-play-icon-s1',
        overlayId: 'video-overlay-play-s1',
        playingStateId: 'video-playing-state-s1',
        progressFillId: 'progress-bar-fill-s1',
        timeDisplayId: 'video-time-display-s1',
        timestampId: 'playing-timestamp-s1',
        descId: 'playing-desc-s1',
        timelineSelector: '#timeline-steps-s1 .timeline-step'
    });

    // Initialize Player for Siklus 2
    setupMockPlayer({
        playBtnId: 'play-video-btn-s2',
        playIconToggleId: 'btn-toggle-play-s2',
        playIconId: 'btn-play-icon-s2',
        overlayId: 'video-overlay-play-s2',
        playingStateId: 'video-playing-state-s2',
        progressFillId: 'progress-bar-fill-s2',
        timeDisplayId: 'video-time-display-s2',
        timestampId: 'playing-timestamp-s2',
        descId: 'playing-desc-s2',
        timelineSelector: '#timeline-steps-s2 .timeline-step'
    });

    // Initialize Player for Siklus 3
    setupMockPlayer({
        playBtnId: 'play-video-btn-s3',
        playIconToggleId: 'btn-toggle-play-s3',
        playIconId: 'btn-play-icon-s3',
        overlayId: 'video-overlay-play-s3',
        playingStateId: 'video-playing-state-s3',
        progressFillId: 'progress-bar-fill-s3',
        timeDisplayId: 'video-time-display-s3',
        timestampId: 'playing-timestamp-s3',
        descId: 'playing-desc-s3',
        timelineSelector: '#timeline-steps-s3 .timeline-step'
    });

    // Initialize Player for Siklus 4 / 3-4
    setupMockPlayer({
        playBtnId: 'play-video-btn-s4',
        playIconToggleId: 'btn-toggle-play-s4',
        playIconId: 'btn-play-icon-s4',
        overlayId: 'video-overlay-play-s4',
        playingStateId: 'video-playing-state-s4',
        progressFillId: 'progress-bar-fill-s4',
        timeDisplayId: 'video-time-display-s4',
        timestampId: 'playing-timestamp-s4',
        descId: 'playing-desc-s4',
        timelineSelector: '#timeline-steps-s4 .timeline-step'
    });

    // Phase Badges Click Handler
    document.querySelectorAll('.video-phase-badge').forEach(badge => {
        badge.addEventListener('click', () => {
            const parentSection = badge.closest('.cycle-section');
            if (parentSection) {
                const timeline = parentSection.querySelector('.timeline-container');
                if (timeline) {
                    timeline.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        });
    });

    /* --- CHART.JS VISUALIZATIONS --- */
    let charts = {};

    function initCharts() {
        const isDark = body.classList.contains('dark-theme');
        const textColor = isDark ? '#94a3b8' : '#6b7280';
        const gridColor = isDark ? '#334155' : '#e5e7eb';

        // 1. Overview Chart
        const overviewEl = document.getElementById('overviewChart');
        if (overviewEl) {
            const overviewCtx = overviewEl.getContext('2d');
            charts.overview = new Chart(overviewCtx, {
                type: 'line',
                data: {
                    labels: ['Siklus 1 (Zat & Perubahan)', 'Siklus 2 (Suhu & Kalor)', 'Siklus 3 (Gaya & Gerak)', 'Siklus 4 (Klasifikasi MH)'],
                    datasets: [
                        {
                            label: 'Nilai Rerata Kelas',
                            data: [76.5, 79.2, 81.8, 84.5],
                            borderColor: '#4f46e5',
                            backgroundColor: 'rgba(79, 70, 229, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.3
                        },
                        {
                            label: 'Target Ketuntasan (KKTP)',
                            data: [75, 75, 75, 75],
                            borderColor: '#f43f5e',
                            borderWidth: 1.5,
                            borderDash: [5, 5],
                            pointRadius: 0,
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: textColor, font: { family: 'Poppins' } }
                        }
                    },
                    scales: {
                        y: {
                            min: 60,
                            max: 100,
                            ticks: { color: textColor },
                            grid: { color: gridColor }
                        },
                        x: {
                            ticks: { color: textColor },
                            grid: { display: false }
                        }
                    }
                }
            });
        }

        // 2. Cognitive Distribution Chart
        const cognitiveEl = document.getElementById('cognitiveChart');
        if (cognitiveEl) {
            const cognitiveCtx = cognitiveEl.getContext('2d');
            charts.cognitive = new Chart(cognitiveCtx, {
                type: 'bar',
                data: {
                    labels: ['Sangat Baik (>=85)', 'Baik (75-84)', 'Remedial (<75)'],
                    datasets: [
                        {
                            label: 'Pre-Test',
                            data: [2, 10, 20],
                            backgroundColor: '#f43f5e',
                            borderRadius: 6
                        },
                        {
                            label: 'Post-Test',
                            data: [12, 18, 2],
                            backgroundColor: '#10b981',
                            borderRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: textColor, font: { family: 'Poppins' } }
                        }
                    },
                    scales: {
                        y: {
                            ticks: { color: textColor },
                            grid: { color: gridColor }
                        },
                        x: {
                            ticks: { color: textColor },
                            grid: { display: false }
                        }
                    }
                }
            });
        }

        // 3. Non-Mengajar Time Chart
        const nonMengajarEl = document.getElementById('nonMengajarChart');
        if (nonMengajarEl) {
            const nonMengajarCtx = nonMengajarEl.getContext('2d');
            charts.nonMengajar = new Chart(nonMengajarCtx, {
                type: 'doughnut',
                data: {
                    labels: [
                        'Pembiasaan Karakter & Religius',
                        'Kepanitiaan & Event Kultural',
                        'Kedisiplinan & Pelayanan Piket',
                        'Akademik, Asesmen & P5',
                        'Budaya Literasi Sekolah'
                    ],
                    datasets: [{
                        data: [28.0, 17.0, 15.5, 18.0, 10.0],
                        backgroundColor: ['#10b981', '#f59e0b', '#6366f1', '#06b6d4', '#ec4899'],
                        borderWidth: isDark ? 2 : 0,
                        borderColor: isDark ? '#1e293b' : 'transparent'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: textColor,
                                font: { family: 'Poppins', size: 11 },
                                boxWidth: 12,
                                padding: 8
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const val = context.raw || 0;
                                    const pct = ((val / 88.5) * 100).toFixed(1);
                                    return ' ' + context.label + ': ' + val + ' Jam (' + pct + '%)';
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    function updateChartThemes() {
        const isDark = body.classList.contains('dark-theme');
        const textColor = isDark ? '#94a3b8' : '#6b7280';
        const gridColor = isDark ? '#334155' : '#e5e7eb';

        Object.keys(charts).forEach(key => {
            const chart = charts[key];
            if (!chart) return;

            // Update axes
            if (chart.options.scales) {
                if (chart.options.scales.x && chart.options.scales.x.ticks) {
                    chart.options.scales.x.ticks.color = textColor;
                }
                if (chart.options.scales.y && chart.options.scales.y.ticks) {
                    chart.options.scales.y.ticks.color = textColor;
                    chart.options.scales.y.grid.color = gridColor;
                }
            }
            
            // Update legend labels
            if (chart.options.plugins && chart.options.plugins.legend && chart.options.plugins.legend.labels) {
                chart.options.plugins.legend.labels.color = textColor;
            }

            // Update doughnut border
            if (key === 'nonMengajar' && chart.data.datasets[0]) {
                chart.data.datasets[0].borderWidth = isDark ? 2 : 0;
                chart.data.datasets[0].borderColor = isDark ? '#1e293b' : 'transparent';
            }

            chart.update();
        });
    }

    function resizeAndAnimateCharts() {
        setTimeout(() => {
            Object.keys(charts).forEach(key => {
                if (charts[key]) {
                    charts[key].resize();
                    charts[key].update('active');
                }
            });
        }, 100);
    }

    // Initialize all charts on load
    initCharts();

    /* --- MOCK DOCUMENT CONTENTS DATABASE (In-App Previewer) --- */
    /* --- MOCK DOCUMENT CONTENTS DATABASE (In-App Previewer) --- */
    const docDatabase = {
        // ==========================================
        // 1. RPP / MODUL AJAR (14 DOKUMEN)
        // ==========================================
        'RPP_Terbimbing_1_Merancang_Percobaan.pdf': {
            type: 'PDF Rencana Pembelajaran',
            gdrive: 'https://drive.google.com/file/d/13J1Hm1CJA_a7zO13TID6PCYUo4r3COkF/view?usp=drive_link',
            html: `
                <div class="viewer-paper">
                    <div style="border-bottom: 3px double #4f46e5; padding-bottom: 0.75rem; margin-bottom: 1.5rem; text-align: center;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 1px;">MODUL AJAR INKUIRI TERBIMBING • FASE D / KELAS VII</span>
                        <h1 style="margin: 0.4rem 0; color: #1e1b4b; font-size: 1.5rem;">PERTEMUAN 1: HAKIKAT SAINS & METODE ILMIAH</h1>
                        <p style="margin: 0; font-size: 0.9rem; color: #475569;">Topik: Merancang Desain Penyelidikan & Identifikasi 3 Variabel • SMP Negeri 5 Yogyakarta</p>
                    </div>

                    <h2>I. TUJUAN PEMBELAJARAN</h2>
                    <p>Peserta didik mampu merumuskan hipotesis sains dari suatu fenomena kontekstual serta mengidentifikasi dan menetapkan tiga variabel penyelidikan (variabel manipulasi/bebas, variabel respon/terikat, dan variabel kontrol) secara tepat menggunakan kerangka kerja ilmiah (fair test).</p>

                    <h2>II. MODEL & PENDEKATAN</h2>
                    <p><strong>Pendekatan:</strong> Inkuiri Terbimbing (Guided Inquiry) berbantuan <em>Scaffolded Template</em>.<br>
                    <strong>Integrasi:</strong> Literasi Sains Prosedural & Etika Keamanan Laboratorium.</p>

                    <h2>III. KEGIATAN INTI PEMBELAJARAN</h2>
                    <ol style="margin-left: 1.25rem; line-height: 1.6; font-size: 0.9rem;">
                        <li><strong>Orientasi Masalah:</strong> Guru menyajikan demonstrasi fenomena pelarutan zat pada suhu berbeda untuk memantik pertanyaan penyelidikan ilmiah.</li>
                        <li><strong>Perumusan Masalah & Hipotesis:</strong> Kelompok menyusun rumusan masalah dan hipotesis terarah dengan bantuan pertanyaan penuntun pada template LKPD.</li>
                        <li><strong>Identifikasi Variabel:</strong> Siswa memetakan variabel bebas (suhu pelarut), terikat (waktu larut), dan kontrol (volume pelarut, ukuran butir zat, wadah pengaduk).</li>
                        <li><strong>Checkpoint Rancangan:</strong> Verifikasi rancangan kerja dan rambu keselamatan laboratorium oleh guru pamong sebelum izin praktikum diterbitkan.</li>
                    </ol>

                    <h2>IV. ASESMEN & EVALUASI</h2>
                    <p>Penilaian formatif autentik menggunakan lembar observasi desain inkuiri dan rubrik kelengkapan penetapan variabel penyelidikan.</p>
                </div>
            `
            
        },
        'RPP_Terbimbing_2_Melakukan_Percobaan.pdf': {
            type: 'PDF Rencana Pembelajaran',
            gdrive: 'https://drive.google.com/file/d/1dp_Es5a9cGkgYSgdo1E8PriROh00M-OZ/view?usp=drive_link',
            html: `
                <div class="viewer-paper">
                    <div style="border-bottom: 3px double #4f46e5; padding-bottom: 0.75rem; margin-bottom: 1.5rem; text-align: center;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 1px;">MODUL AJAR INKUIRI TERBIMBING • FASE D / KELAS VII</span>
                        <h1 style="margin: 0.4rem 0; color: #1e1b4b; font-size: 1.5rem;">PERTEMUAN 2: EKSEKUSI PRAKTIKUM & PENGUMPULAN DATA</h1>
                        <p style="margin: 0; font-size: 0.9rem; color: #475569;">Topik: Pengoperasian Alat Lab, Pengukuran Presisi & Analisis Bukti Empiris</p>
                    </div>

                    <h2>I. TUJUAN PEMBELAJARAN</h2>
                    <p>Peserta didik terampil mengoperasikan peralatan laboratorium IPA secara aman, melakukan pengukuran dan pencatatan data kuantitatif secara presisi, serta mengolah bukti empiris untuk menarik kesimpulan yang valid.</p>

                    <h2>II. SINTAKS INKUIRI TERBIMBING</h2>
                    <ol style="margin-left: 1.25rem; line-height: 1.6; font-size: 0.9rem;">
                        <li><strong>Safety Induction:</strong> Penjelasan kepatuhan SOP laboratorium, pemakaian jas praktikum, dan mitigasi bahaya pemanas spiritus.</li>
                        <li><strong>Pengambilan Data:</strong> Pelaksanaan eksperimen sesuai tabel rancangan kerja terbimbing, pembacaan meniskus fluida, dan pengukuran waktu stopwatch.</li>
                        <li><strong>Analisis Bukti:</strong> Pengelompokan data, penghitungan rerata waktu, dan pembuatan representasi grafik hubungan antarvariabel.</li>
                        <li><strong>Penarikan Kesimpulan & Refleksi:</strong> Komparasi hipotesis awal dengan data nyata serta presentasi singkat hasil kelompok.</li>
                    </ol>
                </div>
            `
            
        },
        'RPP_Mandiri_Siklus1_Wujud_Zat.pdf': {
            type: 'PDF Rencana Pembelajaran',
            gdrive: 'https://drive.google.com/file/d/1g-haAMRkz3MXNIzhqc88aVIira-_0r6G/view?usp=drive_link',
            html: `
                <div class="viewer-paper">
                    <div style="border-bottom: 3px double #059669; padding-bottom: 0.75rem; margin-bottom: 1.5rem; text-align: center;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 1px;">MODUL AJAR SIKLUS 1 (PERTEMUAN 1) • KELAS VII</span>
                        <h1 style="margin: 0.4rem 0; color: #064e3b; font-size: 1.5rem;">PENGUKURAN KONSEPTUAL & BESARAN STANDAR</h1>
                        <p style="margin: 0; font-size: 0.9rem; color: #475569;">Pendekatan: Understanding by Design (UbD) • Inquiry-Based Learning</p>
                    </div>

                    <h2>I. TUJUAN PEMBELAJARAN (UbD)</h2>
                    <p>Peserta didik memahami secara mendalam definisi besaran pokok, besaran turunan, pentingnya standarisasi satuan internasional (SI) dalam sains, serta mampu membedakan alat ukur baku dan tidak baku.</p>

                    <h2>II. CATATAN IMPLEMENTASI & REFLEKSI RANCANGAN</h2>
                    <p>Realitas kelas menunjukkan pemahaman awal siswa melampaui perkiraan. Materi teori konseptual terasa terlalu sederhana dan berpotensi memicu kepatuhan pasif tanpa tantangan kognitif cukup. Tanggapan adaptif segera diambil dengan menggeser orientasi pertemuan kedua ke arah praktikum manipulatif penuh guna menyajikan tantangan berpikir tingkat tinggi.</p>
                </div>
            `
            
        },
        'RPP_Mandiri_Siklus1_Perubahan_Zat.pdf': {
            type: 'PDF Rencana Pembelajaran',
            gdrive: 'https://drive.google.com/file/d/1pgv9rIy9FSObueCyCeyX8Mxk6w5as_dz/view?usp=drive_link',
            html: `
                <div class="viewer-paper">
                    <div style="border-bottom: 3px double #059669; padding-bottom: 0.75rem; margin-bottom: 1.5rem; text-align: center;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 1px;">MODUL AJAR SIKLUS 1 (PERTEMUAN 2) • KELAS VII</span>
                        <h1 style="margin: 0.4rem 0; color: #064e3b; font-size: 1.5rem;">PRAKTIKUM MANIPULATIF ALAT UKUR & INTEGRASI PSE</h1>
                        <p style="margin: 0; font-size: 0.9rem; color: #475569;">Topik: Presisi Jangka Sorong, Neraca Ohaus & Mitigasi Galat Paralaks</p>
                    </div>

                    <h2>I. TUJUAN PEMBELAJARAN</h2>
                    <p>Peserta didik terampil mengoperasikan jangka sorong dan neraca Ohaus, membaca skala nonius secara presisi, serta mengidentifikasi potensi galat paralaks pada pengukuran objek riil laboratorium.</p>

                    <h2>II. FLEKSIBILITAS MODUL MENYIKAPI PEMANGKASAN WAKTU</h2>
                    <p>Menghadapi pemangkasan alokasi waktu mendadak 25-30% oleh agenda sekolah. Fleksibilitas modul menyelamatkan tahap inti pengambilan data praktikum dengan memotong durasi ceramah awal dan menerapkan latihan pernapasan sadar teknik STOP di awal sesi untuk menstabilkan fokus kelas secara cepat.</p>
                </div>
            `
            
        },
        'RPP_Mandiri_Siklus1_Massa_Jenis.pdf': {
            type: 'PDF Rencana Pembelajaran',
            gdrive: 'https://drive.google.com/file/d/1iZaezfb9oNWSuGEFx3ikLyvZegbyvFUg/view?usp=drive_link',
            html: `
                <div class="viewer-paper">
                    <div style="border-bottom: 3px double #059669; padding-bottom: 0.75rem; margin-bottom: 1.5rem; text-align: center;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 1px;">MODUL AJAR SIKLUS 1 (PERTEMUAN 3) • KELAS VII</span>
                        <h1 style="margin: 0.4rem 0; color: #064e3b; font-size: 1.5rem;">WUJUD ZAT & PENALARAN SUBMIKROSKOPIS</h1>
                        <p style="margin: 0; font-size: 0.9rem; color: #475569;">Model: Blended Learning Berbantuan Web Interaktif & LKPD Cetak Fisik</p>
                    </div>

                    <h2>I. TUJUAN PEMBELAJARAN</h2>
                    <p>Peserta didik mampu menalar karakteristik susunan partikel, kekuatan gaya tarik antarmolekul, dan energi kinetik pada zat padat, cair, dan gas melampaui pengamatan mata telanjang.</p>

                    <h2>II. STRATEGI PENGAMAN CONTINUITY</h2>
                    <p>Modul menyertakan LKPD cetak fisik sebagai jangkar pencatatan data belajar siswa guna menjaga kontinuitas pengamatan saat sistem digital gawai mengalami reset sesi otomatis ketika layar terkunci.</p>
                </div>
            `
            
        },
        'RPP_Mandiri_Siklus2_Perubahan_Wujud.pdf': {
            type: 'PDF Rencana Pembelajaran',
            gdrive: 'https://drive.google.com/file/d/1Yd15iYl2LlOqE21x-LNBw7KlfEB6nB_L/view?usp=drive_link',
            html: `
                <div class="viewer-paper">
                    <div style="border-bottom: 3px double #e11d48; padding-bottom: 0.75rem; margin-bottom: 1.5rem; text-align: center;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: #e11d48; text-transform: uppercase; letter-spacing: 1px;">MODUL AJAR SIKLUS 2 (PERTEMUAN 1) • KELAS VII</span>
                        <h1 style="margin: 0.4rem 0; color: #881337; font-size: 1.5rem;">PERUBAHAN WUJUD ZAT BERBASIS TaRL</h1>
                        <p style="margin: 0; font-size: 0.9rem; color: #475569;">Model: Teaching at the Right Level (Diferensiasi 3 Level) • SMP Negeri 5 Yogyakarta</p>
                    </div>

                    <h2>I. PENDEKATAN & SINTAKS TaRL</h2>
                    <p>Pembelajaran dirancang mengakomodasi kesiapan belajar siswa melalui tiga tingkatan lembar kerja yang saling melengkapi:</p>
                    <ul style="margin-left: 1.25rem; line-height: 1.6; font-size: 0.9rem;">
                        <li><strong>Level Dasar:</strong> Mengidentifikasi ciri makroskopis perubahan wujud zat dan arah perubahannya.</li>
                        <li><strong>Level Cakap:</strong> Menganalisis aspek penyerapan dan pelepasan kalor pada proses perubahan wujud.</li>
                        <li><strong>Level Mahir:</strong> Membedah representasi grafik perubahan wujud zat terhadap fluktuasi suhu dan kalor laten.</li>
                    </ul>

                    <h2>II. SIKLUS PRESENTASI SALING MELENGKAPI</h2>
                    <p>Sintaks presentasi kelompok dirancang terintegrasi sehingga tercipta saling ketergantungan positif; seluruh siswa memiliki tanggung jawab nyata untuk menyimak paparan kelompok lain guna melengkapi lembar kerja akhir secara komprehensif.</p>
                </div>
            `
            
        },
        'RPP_Mandiri_Siklus2_Fisika_Kimia.pdf': {
            type: 'PDF Rencana Pembelajaran',
            gdrive: 'https://drive.google.com/file/d/1uwRK_78oRwKvxKJl-kLivVjOanOqfDEt/view?usp=drive_link',
            html: `
                <div class="viewer-paper">
                    <div style="border-bottom: 3px double #e11d48; padding-bottom: 0.75rem; margin-bottom: 1.5rem; text-align: center;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: #e11d48; text-transform: uppercase; letter-spacing: 1px;">MODUL AJAR SIKLUS 2 (PERTEMUAN 2) • KELAS VII</span>
                        <h1 style="margin: 0.4rem 0; color: #881337; font-size: 1.5rem;">PERUBAHAN FISIKA DAN KIMIA</h1>
                        <p style="margin: 0; font-size: 0.9rem; color: #475569;">Topik: Indikator Reaksi Kimia & Gamifikasi Interaktif Edukatif</p>
                    </div>

                    <h2>I. TUJUAN PEMBELAJARAN</h2>
                    <p>Peserta didik dapat membedakan perubahan fisika (reversibel, tanpa zat baru) dan perubahan kimia (pembentukan endapan, gas, perubahan warna, dan suhu) melalui investigasi fenomena sehari-hari.</p>

                    <h2>II. KEGIATAN INTI & GAMIFIKASI</h2>
                    <p>Setelah pengamatan fenomena lilin terbakar dan cuka dengan soda kue, pembelajaran ditutup dengan game edukatif interaktif untuk mengecek pemahaman konsep secara seru dan menyenangkan, menjaga ritme fokus siswa tetap optimal.</p>
                </div>
            `
            
        },
        'RPP_Mandiri_Siklus2_Kerapatan_Zat.pdf': {
            type: 'PDF Rencana Pembelajaran',
            gdrive: 'https://drive.google.com/file/d/16M5fqItnjKC4FnhFXVMZW_fBjyDuqf22/view?usp=drive_link',
            html: `
                <div class="viewer-paper">
                    <div style="border-bottom: 3px double #e11d48; padding-bottom: 0.75rem; margin-bottom: 1.5rem; text-align: center;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: #e11d48; text-transform: uppercase; letter-spacing: 1px;">MODUL AJAR SIKLUS 2 (PERTEMUAN 3) • KELAS VII</span>
                        <h1 style="margin: 0.4rem 0; color: #881337; font-size: 1.5rem;">KERAPATAN ZAT (MASSA JENIS)</h1>
                        <p style="margin: 0; font-size: 0.9rem; color: #475569;">Topik: Problem Kontekstual Daya Apung & Logika Kapal Selam</p>
                    </div>

                    <h2>I. TUJUAN PEMBELAJARAN</h2>
                    <p>Peserta didik mampu menghitung nilai massa jenis (rho = m/v) serta mengaitkannya dengan fenomena benda terapung, melayang, dan tenggelam pada fluida.</p>

                    <h2>II. PENGUATAN RASA INGIN TAHU</h2>
                    <p>Fleksibilitas modul memberi ruang menaikkan taraf instruksi menanggapi rasa ingin tahu siswa yang melonjak hingga 89%. Siswa secara antusias meneliti prinsip kerja ballast tank pada kapal selam.</p>
                </div>
            `
            
        },
        'RPP_Mandiri_Siklus3_Prototipe_Apung.pdf': {
            type: 'PDF Rencana Pembelajaran',
            gdrive: 'https://drive.google.com/file/d/1diVWqBsDjmYhU5HTN4lGzP7YxiBDkGhB/view?usp=drive_link',
            html: `
                <div class="viewer-paper">
                    <div style="border-bottom: 3px double #d97706; padding-bottom: 0.75rem; margin-bottom: 1.5rem; text-align: center;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: #d97706; text-transform: uppercase; letter-spacing: 1px;">MODUL AJAR SIKLUS 3 (PERTEMUAN 1) • KELAS VII</span>
                        <h1 style="margin: 0.4rem 0; color: #78350f; font-size: 1.5rem;">PEMBELAJARAN SIKLUS AIR</h1>
                        <p style="margin: 0; font-size: 0.9rem; color: #475569;">Pendekatan: Inquiry & Model Visual • Evaporasi, Kondensasi, Presipitasi</p>
                    </div>

                    <h2>I. TUJUAN PEMBELAJARAN</h2>
                    <p>Peserta didik mampu menganalisis tahapan siklus air (evaporasi, kondensasi, presipitasi, dan infiltrasi) serta dampaknya terhadap ketersediaan air bersih di lingkungan.</p>

                    <h2>II. SINTAKS PEMBELAJARAN</h2>
                    <p>Pengamatan model terrarium/simulasi siklus air sederhana, pengelompokan proses pergerakan zat cair dan gas, serta diskusi konservasi sumber daya air.</p>
                </div>
            `
            
        },
        'RPP_Mandiri_Siklus3_Pemisahan_Campuran.pdf': {
            type: 'PDF Rencana Pembelajaran',
            gdrive: 'https://drive.google.com/file/d/1d-z_T_aoGvLYV1pWyZUQoTrnYW4IwtXU/view?usp=drive_link',
            html: `
                <div class="viewer-paper">
                    <div style="border-bottom: 3px double #d97706; padding-bottom: 0.75rem; margin-bottom: 1.5rem; text-align: center;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: #d97706; text-transform: uppercase; letter-spacing: 1px;">MODUL AJAR SIKLUS 3 (PERTEMUAN 2) • KELAS VII</span>
                        <h1 style="margin: 0.4rem 0; color: #78350f; font-size: 1.5rem;">PRAKTIKUM MASSA JENIS</h1>
                        <p style="margin: 0; font-size: 0.9rem; color: #475569;">Metode: Pengukuran Massa & Volume Benda Teratur dan Tidak Teratur</p>
                    </div>

                    <h2>I. TUJUAN PEMBELAJARAN</h2>
                    <p>Siswa terampil mengukur massa jenis berbagai objek padat (batu, kubus kayu, logam) menggunakan neraca dan gelas ukur dengan perhitungan matematis rho = m/v.</p>
                </div>
            `
            
        },
        'RPP_Mandiri_Siklus3_Gallery_Walk.pdf': {
            type: 'PDF Rencana Pembelajaran',
            html: `
                <div class="viewer-paper">
                    <div style="border-bottom: 3px double #d97706; padding-bottom: 0.75rem; margin-bottom: 1.5rem; text-align: center;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: #d97706; text-transform: uppercase; letter-spacing: 1px;">MODUL AJAR SIKLUS 3 (PERTEMUAN 3) • KELAS VII</span>
                        <h1 style="margin: 0.4rem 0; color: #78350f; font-size: 1.5rem;">PRAKTIKUM PERUBAHAN FISIKA & KIMIA</h1>
                        <p style="margin: 0; font-size: 0.9rem; color: #475569;">Status: Dalam Proses Penyusunan / Upload Dokumen Lanjutan</p>
                    </div>

                    <h2>I. TUJUAN & DOKUMEN</h2>
                    <p>Rancangan praktikum lanjutan untuk pembuktian reaksi kimia dan perubahan fisika secara langsung di laboratorium.</p>
                </div>
            `
            
        },
        'RPP_Mandiri_Siklus4_Hakikat_Suhu.pdf': {
            type: 'PDF Rencana Pembelajaran',
            gdrive: 'https://drive.google.com/file/d/1RNi6fNNCvPMu5fAt9H1vEVAYEthG_S9S/view?usp=drive_link',
            html: `
                <div class="viewer-paper">
                    <div style="border-bottom: 3px double #0891b2; padding-bottom: 0.75rem; margin-bottom: 1.5rem; text-align: center;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: #0891b2; text-transform: uppercase; letter-spacing: 1px;">MODUL AJAR SIKLUS 4 (PERTEMUAN 1) • KELAS VII</span>
                        <h1 style="margin: 0.4rem 0; color: #164e63; font-size: 1.5rem;">HAKIKAT SUHU & SKALA TERMOMETER</h1>
                        <p style="margin: 0; font-size: 0.9rem; color: #475569;">Topik: Uji Paradoks 3 Bejana Air & Konversi Skala Suhu</p>
                    </div>

                    <h2>I. TUJUAN PEMBELAJARAN</h2>
                    <p>Peserta didik mampu membuktikan indra peraba bukan alat ukur suhu yang objektif melalui eksperimen 3 bejana serta menguasai teknik membaca skala termometer secara presisi.</p>
                </div>
            `
            
        },
        'RPP_Mandiri_Siklus4_Konversi_Skala.pdf': {
            type: 'PDF Rencana Pembelajaran',
            gdrive: 'https://drive.google.com/file/d/1KCVU0V6fpcP9-M3ni6QzYSUKc0FFC9gz/view?usp=drive_link',
            html: `
                <div class="viewer-paper">
                    <div style="border-bottom: 3px double #0891b2; padding-bottom: 0.75rem; margin-bottom: 1.5rem; text-align: center;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: #0891b2; text-transform: uppercase; letter-spacing: 1px;">MODUL AJAR SIKLUS 4 (PERTEMUAN 2) • KELAS VII</span>
                        <h1 style="margin: 0.4rem 0; color: #164e63; font-size: 1.5rem;">PERPINDAHAN KALOR KONTEKSTUAL</h1>
                        <p style="margin: 0; font-size: 0.9rem; color: #475569;">Topik: Konduksi, Konveksi, dan Radiasi Termal</p>
                    </div>

                    <h2>I. TUJUAN PEMBELAJARAN</h2>
                    <p>Peserta didik mampu menganalisis mekanisme perpindahan kalor (konduksi, konveksi, radiasi) pada kehidupan sehari-hari secara empiris.</p>
                </div>
            `
            
        },
        'RPP_Mandiri_Siklus4_Perpindahan_Kalor.pdf': {
            type: 'PDF Rencana Pembelajaran',
            gdrive: 'https://drive.google.com/file/d/1KCVU0V6fpcP9-M3ni6QzYSUKc0FFC9gz/view?usp=drive_link',
            html: `
                <div class="viewer-paper">
                    <div style="border-bottom: 3px double #0891b2; padding-bottom: 0.75rem; margin-bottom: 1.5rem; text-align: center;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: #0891b2; text-transform: uppercase; letter-spacing: 1px;">MODUL AJAR SIKLUS 4 (PERTEMUAN 3) • KELAS VII</span>
                        <h1 style="margin: 0.4rem 0; color: #164e63; font-size: 1.5rem;">PERPINDAHAN ENERGI KALOR</h1>
                        <p style="margin: 0; font-size: 0.9rem; color: #475569;">Topik: Investigasi Mekanisme Konduksi, Konveksi, dan Radiasi Termal</p>
                    </div>

                    <h2>I. TUJUAN PEMBELAJARAN</h2>
                    <p>Peserta didik mampu membuktikan secara eksperimen tiga mekanisme perpindahan kalor serta menganalisis penerapannya dalam teknologi termos dan ventilasi rumah ramah lingkungan.</p>
                </div>
            `
            
        },

        // ==========================================
        // 2. PPT PRESENTASI DECK (5 DOKUMEN)
        // ==========================================
        'PPT_Terbimbing_Hakikat_Sains.pptx': {
            type: 'PPT Presentasi',
            slides: [
                {
                    title: 'Metode Ilmiah & Keselamatan Lab',
                    text: 'Materi IPA Kelas VII - Mengajar Terbimbing<br>SMP Negeri 5 Yogyakarta<br><br><strong>Oleh: Wahyu Puji Saputri, S.Pd.</strong>'
                },
                {
                    title: 'Variabel Penyelidikan Ilmiah',
                    text: 'Tiga pilar fair test dalam sains:<br>â€¢ <strong>Variabel Bebas (Manipulasi):</strong> Faktor yang sengaja diubah.<br>â€¢ <strong>Variabel Terikat (Respon):</strong> Nilai yang diukur akibat perlakuan.<br>â€¢ <strong>Variabel Kontrol:</strong> Kondisi yang sengaja dibuat tetap.'
                },
                {
                    title: 'Alur Kerja Ilmiah (Guided Inquiry)',
                    text: '1. Mengamati Fenomena -> 2. Merumuskan Masalah -> 3. Menyusun Hipotesis -> 4. Menguji Eksperimen -> 5. Menganalisis Bukti -> 6. Menyimpulkan.'
                }
            ]
        },
        'PPT_Materi_Siklus_1_Zat.pptx': {
            type: 'PPT Presentasi',
            slides: [
                {
                    title: 'Bahan Ajar Siklus 1: Pengukuran & Wujud Zat',
                    text: 'Materi IPA Kelas VII - SMP Negeri 5 Yogyakarta<br><br><strong>Gradasi Materi Pembelajaran:</strong><br>1. Pemahaman Konseptual (Besaran & Satuan Baku)<br>2. Keterampilan Prosedural (Skala Nonius & Galat Paralaks)<br>3. Penalaran Submikroskopis (Teori Kinetik Partikel)'
                },
                {
                    title: '1. Pengukuran Konseptual & Prosedural',
                    text: 'â€¢ <strong>Besaran & Satuan Baku:</strong> Standarisasi SI dalam penyelidikan sains.<br>â€¢ <strong>Ketelitian Instrumen Ukur:</strong> Pembacaan skala nonius jangka sorong dan neraca Ohaus.<br>â€¢ <strong>Identifikasi Galat Paralaks:</strong> Posisi tegak lurus mata untuk mencegah deviasi data ukur riil.'
                },
                {
                    title: '2. Penalaran Submikroskopis Wujud Zat',
                    text: 'Menjembatani pengamatan konkret menuju representasi partikel molekuler:<br>â€¢ <strong>Susunan Partikel:</strong> Keteraturan kisi padat vs mobilitas fluida.<br>â€¢ <strong>Gaya Tarik Antarpartikel:</strong> Kohesi kuat pada zat padat hingga gaya tarik sangat lemah pada gas.<br>â€¢ <strong>Energi Kinetik:</strong> Tingkat vibrasi dan translasi partikel pada zat padat, cair, dan gas.'
                }
            ]
        },
        'PPT_Materi_Siklus_2_Zat_dan_Perubahannya.pptx': {
            type: 'PPT Presentasi',
            slides: [
                {
                    title: 'Siklus 2: Zat & Perubahannya Berbasis TaRL',
                    text: 'IPA Kelas VII - Diferensiasi Kesiapan Belajar Tiga Tingkat<br>SMP Negeri 5 Yogyakarta'
                },
                {
                    title: 'Perubahan Fisika vs Perubahan Kimia',
                    text: 'â€¢ <strong>Perubahan Fisika:</strong> Tidak menghasilkan zat baru, susunan molekul tetap, dapat kembali (contoh: es mencair, pelarutan garam).<br>â€¢ <strong>Perubahan Kimia:</strong> Terbentuk zat baru dengan sifat berbeda, disertai tanda-tanda reaksi: endapan, gas, perubahan warna, fluktuasi suhu.'
                },
                {
                    title: 'Kerapatan Zat (Massa Jenis)',
                    text: 'Rumus: &rho; = m / V<br>â€¢ Jika &rho; benda < &rho; fluida &rarr; Terapung<br>â€¢ Jika &rho; benda = &rho; fluida &rarr; Melayang<br>â€¢ Jika &rho; benda > &rho; fluida &rarr; Tenggelam'
                }
            ]
        },
        'PPT_Materi_Siklus_3_STEM_Proyek.pptx': {
            type: 'PPT Presentasi',
            slides: [
                {
                    title: 'Siklus 3: Rekayasa STEM Prototipe Benda Apung',
                    text: 'Penerapan Konsep Massa Jenis & Gaya Angkat Archimedes Melalui PjBL Mandiri'
                },
                {
                    title: 'Engineering Design Process (EDP)',
                    text: '1. <strong>Ask:</strong> Apa masalah daya apung yang ingin dipecahkan?<br>2. <strong>Imagine:</strong> Brainstorming desain prototipe.<br>3. <strong>Plan:</strong> Gambar sketsa dan penentuan bahan ramah lingkungan.<br>4. <strong>Create:</strong> Perakitan model miniatur kapal selam.<br>5. <strong>Improve:</strong> Uji coba stabilitas di bejana air.'
                },
                {
                    title: 'Science Gallery Walk',
                    text: 'Mekanisme showcase karya: Masing-masing tim menugaskan 2 siswa sebagai pemandu stand dan 2 siswa sebagai peninjau pameran untuk saling bertukar peer-assessment.'
                }
            ]
        },
        'PPT_Materi_Siklus_4_Suhu_Kalor.pptx': {
            type: 'PPT Presentasi',
            slides: [
                {
                    title: 'Siklus 4: Suhu, Kalor, & Pemuaian Termal',
                    text: 'Pendalaman Konsep Pascakomparasi AKM & Penguatan Literasi Numerasi IPA'
                },
                {
                    title: 'Perbandingan 4 Skala Termometer',
                    text: 'Celsius : Reamur : Fahrenheit : Kelvin = 5 : 4 : 9 : 5<br><br>â€¢ Celsius ke Reamur: 4/5 &times; C<br>â€¢ Celsius ke Fahrenheit: (9/5 &times; C) + 32<br>â€¢ Celsius ke Kelvin: C + 273'
                },
                {
                    title: 'Mekanisme Perpindahan Panas (Kalor)',
                    text: '1. <strong>Konduksi:</strong> Melalui zat padat tanpa perpindahan partikel.<br>2. <strong>Konveksi:</strong> Disertai perpindahan fluida zat perantara (aliran air/udara).<br>3. <strong>Radiasi:</strong> Tanpa medium zat perantara (gelombang elektromagnetik cahaya matahari).'
                }
            ]
        },

        // ==========================================
        // 3. MEDIA PEMBELAJARAN & LKPD (15 DOKUMEN)
        // ==========================================
        'LKPD_Terbimbing_Guided_Investigation_Canvas.pdf': {
            type: 'PDF Lembar Kerja',
            html: `
                <div class="viewer-paper">
                    <h1 style="color: #4f46e5; text-align: center;">GUIDED INVESTIGATION CANVAS</h1>
                    <p style="text-align: center; font-weight: 600;">LEMBAR KERJA METODE ILMIAH TERBIMBING â€¢ KELAS VII</p>
                    <hr style="margin: 1rem 0;">
                    <h2>MATRIKS PERUMUSAN VARIABEL PENYELIDIKAN</h2>
                    <table>
                        <thead>
                            <tr><th>Jenis Variabel</th><th>Definisi Operasional</th><th>Komponen dalam Percobaan</th></tr>
                        </thead>
                        <tbody>
                            <tr><td><strong>Variabel Bebas</strong></td><td>Faktor yang diubah oleh peneliti</td><td>Suhu air pelarut (dingin, ruang, panas)</td></tr>
                            <tr><td><strong>Variabel Terikat</strong></td><td>Faktor yang diukur dampaknya</td><td>Waktu pelarutan zat sampai habis (detik)</td></tr>
                            <tr><td><strong>Variabel Kontrol</strong></td><td>Faktor yang dijaga konstan</td><td>Volume air (100 mL), massa gula (5 gram), kecepatan aduk</td></tr>
                        </tbody>
                    </table>
                </div>
            `
            
        },
        'Instrumen_Laboratorium_Riil_Terbimbing.pdf': {
            type: 'Panduan Media Konkret',
            html: `
                <div class="viewer-paper">
                    <h1 style="text-align: center; color: #1e1b4b;">KIT INSTRUMEN LABORATORIUM RIIL</h1>
                    <p style="text-align: center; font-weight: 600;">GELAS KIMIA, TERMOMETER BATANG, STOPWATCH & STATIF</p>
                    <hr style="margin: 1rem 0;">
                    <p>Memberikan pengalaman konkret (hands-on) bagi siswa untuk menyelaraskan penglihatan mata dengan meniskus cairan pada termometer skala 0 - 100Â°C.</p>
                </div>
            `
            
        },
        'Modul_Grafik_Digital_Gawai_Siswa.pdf': {
            type: 'Spesifikasi Media Digital',
            html: `
                <div class="viewer-paper">
                    <h1>MODUL GRAFIK DIGITAL GAWAI SISWA</h1>
                    <hr style="margin: 1rem 0;">
                    <p>Memandu siswa mengubah tabel pengamatan empiris menjadi grafik linier waktu vs suhu secara interaktif pada lembar gawai smartphone masing-masing.</p>
                </div>
            `
            
        },
        'LKPD_Siklus_1_Massa_Jenis.pdf': {
            type: 'PDF Lembar Kerja',
            html: `
                <div class="viewer-paper">
                    <h1 style="color: #059669; text-align: center;">LKPD FISIK EKSPLORASI SIKLUS 1</h1>
                    <p style="text-align: center; font-weight: 600;">JANGKAR PENCATATAN DATA LAB & DUAL-MODE DIGITAL â€¢ KELAS VII</p>
                    <hr style="margin: 1rem 0;">
                    <h2>TABEL PENGUKURAN PRESISI NONIUS</h2>
                    <table>
                        <thead>
                            <tr><th>Objek Benda</th><th>Skala Utama (SU)</th><th>Skala Nonius (SN)</th><th>Hasil Akhir (&plusmn;0.01 mm)</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Diameter Kelereng</td><td>15 mm</td><td>7 &times; 0.05 mm</td><td>15.35 mm</td></tr>
                            <tr><td>Tebal Balok Kayu</td><td>22 mm</td><td>4 &times; 0.05 mm</td><td>22.20 mm</td></tr>
                        </tbody>
                    </table>
                </div>
            `
            
        },
        'Alat_Ukur_Laboratorium_Siklus1.pdf': {
            type: 'Panduan Media Konkret',
            html: `
                <div class="viewer-paper">
                    <h1 style="text-align: center; color: #065f46;">INSTRUMEN LABORATORIUM RIIL SIKLUS 1</h1>
                    <p style="text-align: center; font-weight: 600;">JANGKA SORONG, MIKROMETER SEKRUP & NERACA OHAUS</p>
                    <hr style="margin: 1rem 0;">
                    <p>Digunakan dalam model praktikum inkuiri manipulatif. Siswa berlatih menyelaraskan garis skala nol nonius dan mengidentifikasi potensi kesalahan paralaks secara langsung.</p>
                </div>
            `
            
        },
        'Web_Interaktif_Wujud_Zat.pdf': {
            type: 'Spesifikasi Media Digital',
            html: `
                <div class="viewer-paper">
                    <h1 style="color: #0284c7; text-align: center;">APLIKASI WEB INTERAKTIF WUJUD ZAT</h1>
                    <p style="text-align: center; font-weight: 600;">SIMULASI MOBILE DINAMIKA PARTIKEL SUBMIKROSKOPIS</p>
                    <hr style="margin: 1rem 0;">
                    <p>Memvisualisasikan susunan kisi molekuler dan energi getar atom pada fasa padat, cair, dan gas yang tidak dapat dijangkau oleh mata telanjang.</p>
                </div>
            `
            
        },
        'Web_Petualangan_Zat_Update_Menu.pdf': {
            type: 'Spesifikasi Media Digital',
            html: `
                <div class="viewer-paper">
                    <h1 style="color: #e11d48; text-align: center;">WEB PETUALANGAN ZAT (UPDATE MENU SISTEM)</h1>
                    <p style="text-align: center; font-weight: 600;">NAVIGASI MENU MANDIRI & BEBAS RE-INITIALIZATION SIKLUS 2</p>
                    <hr style="margin: 1rem 0;">
                    <h2>UPDATE SISTEM v2.0:</h2>
                    <ul style="line-height: 1.6;">
                        <li>Penambahan tombol navigasi kembali langsung ke sub-topik tanpa me-reset tes awal.</li>
                        <li>Penyimpanan cache otomatis di peramban gawai siswa untuk mencegah hilangnya progres saat aplikasi di-minimize.</li>
                    </ul>
                </div>
            `
            
        },
        'Game_Edukasi_Perubahan_Fisika_Kimia.pdf': {
            type: 'Media Gamifikasi',
            html: `
                <div class="viewer-paper">
                    <h1 style="color: #e11d48; text-align: center;">GAME EDUKASI PERUBAHAN FISIKA & KIMIA</h1>
                    <hr style="margin: 1rem 0;">
                    <p>Kuis drag-and-drop interaktif untuk menguji respon cepat siswa dalam mengklasifikasikan fenomena fotosintesis, perkaratan besi, es mencair, dan lilin meleleh.</p>
                </div>
            `
            
        },
        'LKPD_TaRL_Berdiferensiasi_Siklus2.pdf': {
            type: 'PDF Lembar Kerja',
            html: `
                <div class="viewer-paper">
                    <h1 style="color: #e11d48; text-align: center;">LKPD DIFERENSIASI TaRL 3 TINGKAT</h1>
                    <p style="text-align: center; font-weight: 600;">MATERI ZAT & PERUBAHANNYA â€¢ KELAS VII</p>
                    <hr style="margin: 1rem 0;">
                    <p>Berisi tiga varian penugasan terstruktur: Tingkat Pemula (Visual Diagram), Tingkat Cakap (Keseimbangan Kalor), dan Tingkat Mahir (Interpretasi Kurva Pemanasan Grafis).</p>
                </div>
            `
            
        },
        'Maker_Materials_Ramah_Lingkungan_Siklus3.pdf': {
            type: 'Panduan Media Konkret',
            html: `
                <div class="viewer-paper">
                    <h1 style="color: #d97706; text-align: center;">MAKER MATERIALS RAMAH LINGKUNGAN</h1>
                    <p style="text-align: center; font-weight: 600;">BAHAN REKAYASA PROTOTIPE STEM SIKLUS 3</p>
                    <hr style="margin: 1rem 0;">
                    <p>Koleksi bahan daur ulang (botol plastik 330ml, plastisin pemberat, selang aerator akuarium, sedotan fleksibel) untuk membangun model kapal selam yang stabil.</p>
                </div>
            `
            
        },
        'Web_Galeri_Showcase_Portofolio_Siklus3.pdf': {
            type: 'Spesifikasi Media Digital',
            html: `
                <div class="viewer-paper">
                    <h1 style="color: #d97706; text-align: center;">WEB SHOWCASE PORTOFOLIO STEM</h1>
                    <hr style="margin: 1rem 0;">
                    <p>Laman digital kelas tempat kelompok mengunggah foto prototipe, video uji coba mengapung, dan lembar refleksi desain rekayasa.</p>
                </div>
            `
            
        },
        'LKPD_Panduan_Rekayasa_STEM_Siklus3.pdf': {
            type: 'PDF Lembar Kerja',
            html: `
                <div class="viewer-paper">
                    <h1 style="color: #d97706; text-align: center;">LKPD REKAYASA DESAIN STEM SIKLUS 3</h1>
                    <p style="text-align: center; font-weight: 600;">ENGINEERING DESIGN CHALLENGE â€¢ KELAS VII</p>
                    <hr style="margin: 1rem 0;">
                    <p>Memuat lembar tantangan perancangan, kotak gambar sketsa teknis, tabel parameter uji coba stabilitas, dan lembar review antarkelompok (peer-review).</p>
                </div>
            `
            
        },
        'Kit_Eksperimen_3_Bejana_dan_Termometer.pdf': {
            type: 'Panduan Media Konkret',
            html: `
                <div class="viewer-paper">
                    <h1 style="color: #0891b2; text-align: center;">KIT EKSPERIMEN 3 BEJANA & TERMOMETER</h1>
                    <p style="text-align: center; font-weight: 600;">PEMBUKTIAN INDRA PERABA BUKAN PENGUKUR SUHU OBJEKTIF</p>
                    <hr style="margin: 1rem 0;">
                    <p>Panduan eksperimen meletakkan tangan pada air es, air hangat, dan air kran untuk membuktikan perlunya alat ukur berskala baku (termometer laboratorium).</p>
                </div>
            `
            
        },
        'Web_Simulasi_Skala_Dinamis_Suhu.pdf': {
            type: 'Spesifikasi Media Digital',
            html: `
                <div class="viewer-paper">
                    <h1 style="color: #0891b2; text-align: center;">WEB SIMULASI SKALA DINAMIS SUHU</h1>
                    <hr style="margin: 1rem 0;">
                    <p>Simulasi interaktif slider suhu dengan komparasi langsung empat skala (Celsius, Reamur, Fahrenheit, Kelvin) secara real-time disertai rumus visual.</p>
                </div>
            `
            
        },
        'Media_Demonstrasi_Perpindahan_Kalor.pdf': {
            type: 'Panduan Media Konkret',
            html: `
                <div class="viewer-paper">
                    <h1 style="color: #0891b2; text-align: center;">KIT DEMONSTRASI PERPINDAHAN KALOR</h1>
                    <hr style="margin: 1rem 0;">
                    <p>Aparatus batang logam konduksi (tembaga, aluminium, besi) dengan lilin penanda waktu luruh serta bejana konveksi air berwarna serbuk gergaji.</p>
                </div>
            `
            
        },

        // ==========================================
        // 4. JURNAL REFLEKSI & RUBRIK (10 DOKUMEN)
        // ==========================================
        'Jurnal_Refleksi_Terbimbing.pdf': {
            type: 'Jurnal Refleksi',
            html: `
                <div class="viewer-paper" style="max-width: 750px; line-height: 1.7;">
                    <h1 style="text-align: center; color: #1e1b4b; border-bottom: 2px solid #4f46e5; padding-bottom: 0.5rem;">JURNAL REFLEKSI PRAKTIK MENGAJAR TERBIMBING</h1>
                    <p style="text-align: center; font-weight: 600; margin-bottom: 1.5rem;">FOKUS: LITERASI SAINS PROSEDURAL & GUIDED INQUIRY<br>SMP NEGERI 5 YOGYAKARTA â€¢ KELAS VII</p>

                    <h2 style="color: #4f46e5; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem;">1. Analisis Produk Rancangan Pembelajaran</h2>
                    <p>Pembelajaran difokuskan pada penguatan literasi sains prosedural dan keterampilan proses inkuiri melalui skema kerja ilmiah terbimbing (Guided Inquiry). Modul ajar dirancang dengan struktur scaffolding yang jelas guna membimbing siswa beralih dari sekadar penerima prosedur menjadi perancang penyelidikan. Rambu checkpoint proposal desain sebelum pengambilan alat berhasil memitigasi risiko kesalahan prosedur dan tumpahan bahan praktikum.</p>

                    <h2 style="color: #4f46e5; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">2. Analisis Materi Pembelajaran</h2>
                    <p>Materi Hakikat Sains dan Metode Ilmiah ditata secara hierarkis: membedakan pengamatan kualitatif dan kuantitatif, merumuskan hipotesis yang dapat diuji (testable hypothesis), serta menetapkan tiga variabel fair test. Pendekatan ini efektif melatih logika berpikir deduktif siswa.</p>

                    <h2 style="color: #4f46e5; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">3. Analisis Media Pembelajaran</h2>
                    <p>Integrasi Guided Investigation Canvas dan instrumen laboratorium riil (termometer batang, gelas kimia) melatih keterampilan kinestetik. Hambatan berupa keterbatasan unit alat diatasi dengan manajemen pembagian peran ketua, pengambil data, dan perangkum dalam kelompok.</p>

                    <h2 style="color: #4f46e5; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">4. Analisis Video Pelaksanaan</h2>
                    <p>Video merekam scaffolding guru saat membimbing siswa merumuskan variabel kontrol. Momen penting tampak saat guru tidak langsung memberi tahu jawaban saat kelompok bingung, melainkan memberikan pertanyaan pemantik logika penyeimbang.</p>

                    <h2 style="color: #4f46e5; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">5. Analisis Kegiatan Nonmengajar</h2>
                    <p>Koordinasi preventif bersama laboran IPA dan guru pamong Waldi, M.Pd. dilakukan untuk mengecek kalibrasi alat dan ketersediaan bahan pengaman sebelum kelas dimulai.</p>

                    <h2 style="color: #4f46e5; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">6. Instrumen Penilaian dan Ketercapaian</h2>
                    <p>Sebanyak 91% siswa mencapai kriteria tuntas dalam merumuskan variabel fair test dan 88.9% terampil melakukan unjuk kerja pengukuran secara aman di laboratorium.</p>
                </div>
            `
            
        },
        'Rubrik_Penilaian_Inkuiri_Terbimbing.pdf': {
            type: 'Instrumen Penilaian',
            html: `
                <div class="viewer-paper">
                    <h1 style="color: #4f46e5; text-align: center;">RUBRIK KINERJA INKUIRI TERBIMBING</h1>
                    <hr style="margin: 1rem 0;">
                    <table>
                        <thead>
                            <tr><th>Aspek Penilaian</th><th>Skor 4 (Sangat Baik)</th><th>Skor 3 (Baik)</th><th>Skor 2 (Cukup)</th></tr>
                        </thead>
                        <tbody>
                            <tr><td><strong>Perumusan Hipotesis</strong></td><td>Memuat hubungan variabel sebab-akibat secara eksplisit dan teruji</td><td>Memuat dugaan hubungan namun kurang terarah</td><td>Hanya menyatakan dugaan tanpa menyebutkan variabel</td></tr>
                            <tr><td><strong>Ketepatan Variabel</strong></td><td>3 variabel (bebas, terikat, kontrol) terdefinisi benar & konsisten</td><td>2 variabel terdefinisi benar, 1 variabel tertukar</td><td>Hanya 1 variabel yang terdefinisi dengan tepat</td></tr>
                            <tr><td><strong>Unjuk Kerja Lab</strong></td><td>Mematuhi seluruh SOP keselamatan kerja & membaca skala tanpa paralaks</td><td>Mematuhi SOP dengan sedikit teguran pengawas</td><td>Melanggar SOP atau ceroboh dalam penanganan alat kaca</td></tr>
                        </tbody>
                    </table>
                </div>
            `
            
        },
        'Jurnal_Refleksi_Mengajar_Mandiri_Siklus_1.pdf': {
            type: 'Jurnal Refleksi Komprehensif',
            html: `
                <div class="viewer-paper" style="max-width: 750px; line-height: 1.7;">
                    <h1 style="text-align: center; color: #1e1b4b; border-bottom: 2px solid #059669; padding-bottom: 0.5rem;">JURNAL REFLEKSI SIKLUS 1</h1>
                    <p style="text-align: center; font-weight: 600; margin-bottom: 1.5rem;">PRAKTIK MENGAJAR MANDIRI SIKLUS 1: PENGUKURAN & WUJUD ZAT<br>SMP NEGERI 5 YOGYAKARTA - KELAS VII</p>
                    
                    <h2 style="color: #059669; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem;">1. Analisis Produk Rancangan Pembelajaran (Modul Ajar)</h2>
                    <p>Perencanaan pembelajaran Siklus 1 dirancang dengan pendekatan Understanding by Design yang memadukan model Inquiry-Based Learning untuk topik pengukuran serta Blended Learning berbantuan web interaktif untuk materi wujud zat. Desain modul ajar pada pertemuan pertama awalnya berfokus pada penguatan konsep besaran dan satuan standar secara mendalam melalui telaah teori dan diskusi kelompok. Realitas di kelas menunjukkan bahwa peserta didik memiliki pemahaman awal yang melampaui perkiraan, sehingga materi terasa terlalu sederhana dan berpotensi menimbulkan kepatuhan pasif tanpa tantangan berpikir yang memadai. Tanggapan adaptif segera diambil dengan menggeser orientasi pertemuan kedua ke arah praktikum manipulatif penuh.</p>
                    <p>Pada pertemuan kedua, modul ajar menghadapi kendala eksternal berupa pemangkasan alokasi jam pelajaran secara mendadak oleh agenda sekolah sebesar dua puluh lima hingga tiga puluh persen. Fleksibilitas rancangan modul terbukti krusial; integrasi teknik Pembelajaran Sosial Emosional melalui latihan pernapasan sadar di awal sesi berhasil menstabilkan fokus serta menurunkan kecemasan siswa akibat perubahan jadwal. Keberhasilan transfer konsep pada pertemuan pertama memungkinkan pemotongan durasi ceramah dan penyelamatan tahapan inti pengambilan data praktikum, meskipun tahap refleksi akhir harus disederhanakan menjadi tiket keluar tertulis. Sementara itu, rancangan hibrida pada pertemuan ketiga yang memadukan aplikasi web mandiri di ponsel pintar dengan lembar kerja fisik terbukti menjadi langkah pengaman yang tepat dalam menjaga kontinuitas pencatatan data belajar siswa saat sistem digital mengalami kendala sesi.</p>

                    <h2 style="color: #059669; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">2. Analisis Materi Pembelajaran yang Disusun dan Diterapkan</h2>
                    <p>Gradasi materi pembelajaran bergerak secara bertahap dari pemahaman konseptual, keterampilan prosedural, hingga penalaran submikroskopis. Pada pertemuan awal, materi pengukuran konseptual mengenai definisi besaran pokok dan satuan baku dinilai terlalu abstrak sekaligus terlalu mudah bagi karakteristik kelas yang cepat menyerap instruksi. Untuk mengatasi hal tersebut, taraf kesulitan materi dinaikkan pada pertemuan kedua dengan menggeser fokus kognitif dari sekadar menghafal konversi satuan menuju analisis ketelitian instrumen ukur, pembacaan skala nonius pada jangka sorong dan neraca Ohaus, serta identifikasi galat paralaks dalam pengukuran nyata.</p>
                    <p>Kenaikan level materi berlanjut pada pertemuan ketiga melalui materi wujud zat, di mana siswa ditantang memahami fenomena di luar pengamatan mata telanjang. Materi yang biasanya disajikan sebatas ciri makroskopis seperti bentuk dan volume ditransformasikan ke tingkat representasi partikel, mencakup susunan molekul, kekuatan gaya tarik antarpartikel, dan energi kinetik zat padat, cair, serta gas. Integrasi materi submikroskopis ini efektif menjembatani cara berpikir konkret siswa usia sekolah menengah menuju penalaran abstrak teori kinetik partikel secara alami dan bermakna.</p>

                    <h2 style="color: #059669; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">3. Analisis Media Pembelajaran yang Dipergunakan</h2>
                    <p>Kombinasi media konkret laboratorium dan media digital interaktif digunakan untuk melayani kebutuhan belajar kinestetik sekaligus visual. Penggunaan alat ukur laboratorium riil seperti jangka sorong, mikrometer, dan neraca memberikan pengalaman langsung yang mengasah keterampilan motorik halus dan presisi saintifik siswa. Antusiasme belajar meningkat signifikan saat siswa secara mandiri mencoba menyelaraskan garis skala nonius, meskipun keterbatasan jumlah unit alat menuntut pengelolaan kerja berpasangan secara cermat agar seluruh siswa terlibat aktif.</p>
                    <p>Pada materi wujud zat, pemanfaatan web interaktif berbasis ponsel pintar berhasil memvisualisasikan dinamika partikel yang tidak tampak. Namun, sistem proteksi sesi pada aplikasi web memicu kendala operasional; ketika siswa beralih jendela aplikasi atau layar ponsel terkunci sejenak, sistem mereset sesi secara otomatis sehingga siswa harus mengulang tahap apersepsi dan tes awal. Kendala teknis ini secara tidak terduga menghadirkan nilai pedagogis positif berupa latihan pemanggilan memori berulang terhadap konsep dasar wujud zat dan mendisiplinkan fokus kerja digital siswa. Peran lembar kerja fisik berbasis kertas terbukti sangat strategis sebagai jangkar pencatatan data, memastikan hasil eksplorasi siswa tetap terdokumentasi rapi tanpa terpengaruh gangguan peramban.</p>

                    <h2 style="color: #059669; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">4. Analisis Video Pelaksanaan Praktik Mengajar</h2>
                    <p>Rekaman video pembelajaran memperlihatkan dinamika pengelolaan kelas yang responsif terhadap situasi tidak terduga. Pada menit awal pertemuan kedua, terekam momen penerapan teknik STOP di mana guru memandu relaksasi napas teratur yang secara visual memperlihatkan penurunan ketegangan siswa, mengubah kegelisahan akibat jadwal yang terpotong menjadi kesiapan mental untuk bekerja di laboratorium. Pengelolaan kelas bergeser menjadi pendampingan terarah saat guru berkeliling memfasilitasi meja praktikum, menerapkan teknik pertanyaan pemantik tanpa langsung memberikan jawaban saat siswa ragu membaca skala alat ukur.</p>
                    <p>Pada rekaman sesi wujud zat, terekam insiden ketika sejumlah peserta didik kebingungan akibat laman web mereka kembali ke menu awal setelah membuka aplikasi lain. Video mendokumentasikan pendekatan persuasif dan tenang dari guru dalam mengarahkan siswa masuk kembali ke sistem tanpa memicu kegaduhan kelas, sembari mengalihkan fokus pengisian sementara ke lembar kerja cetak. Mendekati akhir sesi yang terbatas, pengelolaan tempo pembelajaran ditutup secara tertib melalui refleksi lisan singkat dari dua perwakilan siswa yang menyimpulkan prinsip pengukuran, memperlihatkan kemampuan guru menjaga keutuhan penutupan pembelajaran di tengah tekanan durasi waktu.</p>

                    <h2 style="color: #059669; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">5. Analisis Kegiatan Nonmengajar</h2>
                    <p>Aktivitas nonmengajar difokuskan pada penguatan aspek penunjang pembelajaran melalui koordinasi lintas unit sekolah. Sehari sebelum sesi praktikum dilaksanakan, guru berkoordinasi secara intensif dengan pengelola laboratorium IPA untuk menguji kalibrasi instrumen, memeriksa kerapatan baut rahang jangka sorong, serta memastikan keseimbangan titik nol pada neraca. Tindakan persiapan preventif ini berhasil menekan potensi kegagalan teknis alat saat waktu mengajar riil di kelas dipangkas secara mendadak.</p>
                    <p>Selain penyiapan laboratorium, koordinasi teknis dilakukan bersama tim pengelola teknologi informasi sekolah untuk meninjau kestabilan jaringan internet nirkabel dan melakukan uji coba akses tautan web interaktif pada beragam peramban ponsel pintar. Di luar jam pelajaran formal, guru juga memberikan pengarahan singkat kepada para ketua kelompok untuk memastikan tautan modul digital telah tersimpan di gawai masing-masing sebelum kelas dimulai. Rangkaian tindakan nonmengajar ini secara nyata meminimalkan hambatan konektivitas dan mendukung kelancaran transisi aktivitas belajar di ruang kelas.</p>

                    <h2 style="color: #059669; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">6. Instrumen Penilaian dan Analisis Ketercapaian</h2>
                    <p>Penilaian Siklus 1 dirancang secara menyeluruh mencakup ranah psikomotorik, afektif, dan kognitif. Ranah psikomotorik dinilai menggunakan rubrik kinerja praktikum pengukuran yang memuat kriteria penanganan alat ukur, ketelitian pembacaan skala nonius, dan ketepatan penulisan hasil beserta satuan internasional. Hasil pengukuran kinerja menunjukkan bahwa delapan puluh delapan koma lima persen siswa mencapai kategori mahir, membuktikan bahwa bekal konsep teoretis yang matang di pertemuan pertama berhasil diwujudkan menjadi kecakapan operasional alat yang presisi di laboratorium.</p>
                    <p>Pada aspek afektif dan kesejahteraan, lembar refleksi emosi sederhana berbasis skala ekspresi menunjukkan peningkatan rasa nyaman dan fokus belajar dari enam puluh dua persen di awal pertemuan menjadi sembilan puluh satu persen setelah intervensi Pembelajaran Sosial Emosional diterapkan. Sementara itu, pada ranah kognitif wujud zat, tes awal menghasilkan skor rata-rata lima puluh empat koma dua yang mengindikasikan rendahnya konsepsi mikroskopis siswa sebelum perlakuan. Nilai tersebut melonjak menjadi delapan puluh empat koma enam pada tes akhir setelah interaksi dengan web interaktif dan lembar kerja hibrida, mengonfirmasi bahwa penguatan visualisasi molekuler dan proses peninjauan materi yang berulang memberikan dampak signifikan terhadap retensi kognitif peserta didik.</p>
                </div>
            `
            
        },
        'Rubrik_Penilaian_Kinerja_Siklus_1.pdf': {
            type: 'Instrumen Penilaian',
            html: `
                <div class="viewer-paper">
                    <h1 style="text-align: center; color: #064e3b; border-bottom: 2px solid #059669; padding-bottom: 0.5rem;">RUBRIK PENILAIAN KINERJA SIKLUS 1</h1>
                    <p style="text-align: center; font-weight: 600;">REKAPITULASI 3 RANAH: PSIKOMOTORIK, AFEKTIF & KOGNITIF</p>
                    <hr style="margin: 1rem 0;">
                    <table>
                        <thead>
                            <tr><th>Kategori Kinerja</th><th>Rentang Nilai</th><th>Persentase Siswa</th><th>Capaian</th></tr>
                        </thead>
                        <tbody>
                            <tr style="font-weight: 600; background-color: #ecfdf5;"><td>Mahir Presisi</td><td>85 - 100</td><td>88.5%</td><td>Mampu membaca skala nonius tanpa deviasi</td></tr>
                            <tr><td>Cukup Terampil</td><td>75 - 84</td><td>11.5%</td><td>Mampu membaca nonius dengan sedikit bimbingan</td></tr>
                            <tr><td>Perlu Remedial</td><td>< 75</td><td>0.0%</td><td>Seluruh siswa berhasil tuntas melampaui KKTP</td></tr>
                        </tbody>
                    </table>
                </div>
            `
            
        },
        'Jurnal_Refleksi_Mengajar_Mandiri_Siklus_2.pdf': {
            type: 'Jurnal Refleksi Komprehensif',
            html: `
                <div class="viewer-paper" style="max-width: 750px; line-height: 1.7;">
                    <h1 style="text-align: center; color: #881337; border-bottom: 2px solid #e11d48; padding-bottom: 0.5rem;">JURNAL REFLEKSI SIKLUS 2</h1>
                    <p style="text-align: center; font-weight: 600; margin-bottom: 1.5rem;">PRAKTIK MENGAJAR MANDIRI SIKLUS 2: ZAT DAN PERUBAHANNYA (TaRL)<br>SMP NEGERI 5 YOGYAKARTA - KELAS VII</p>

                    <h2 style="color: #e11d48; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem;">1. Analisis Produk Rancangan Pembelajaran (Modul Ajar Berbasis TaRL)</h2>
                    <p>Perencanaan pembelajaran pada Siklus 2 disusun sebagai tindak lanjut langsung atas temuan siklus sebelumnya dengan mengadopsi pendekatan Teaching at the Right Level (TaRL). Modul ajar dirancang mengakomodasi keragaman kesiapan belajar melalui lembar kerja bertingkat tiga level: kelompok dasar (identifikasi perubahan wujud zat makroskopis), kelompok cakap (analisis penyerapan dan pelepasan kalor), serta kelompok mahir (interpretasi grafik kurva kalor terhadap fluktuasi suhu). Sintaks presentasi dirancang saling melengkapi sehingga tercipta saling ketergantungan positif antar-kelompok.</p>

                    <h2 style="color: #e11d48; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">2. Analisis Materi Pembelajaran</h2>
                    <p>Materi zat dan perubahannya disajikan secara kontekstual. Siswa diajak menganalisis fenomena perubahan fisika dan kimia di kehidupan nyata (perkaratan logam, fermentasi, lilin terbakar) serta konsep kerapatan massa jenis fluida yang menopang pemahaman terapung-tenggelam.</p>

                    <h2 style="color: #e11d48; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">3. Analisis Media Pembelajaran</h2>
                    <p>Pembaruan sistem navigasi pada Web Petualangan Zat v2.0 berhasil mengatasi masalah reset sesi yang terjadi di Siklus 1. Penambahan tombol menu mandiri membuat siswa bebas melompat antar-topik tanpa kendala. Integrasi game edukatif di akhir sesi menjaga tempo belajar tetap energik.</p>

                    <h2 style="color: #e11d48; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">4. Analisis Video Pelaksanaan</h2>
                    <p>Rekaman video mendokumentasikan interaksi aktif guru dalam membimbing kelompok dasar sembari memberi tantangan pengayaan pada kelompok mahir. Presentasi berjalan interaktif dengan 93% siswa antusias menyimak dan mencatat data pelengkap.</p>

                    <h2 style="color: #e11d48; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">5. Analisis Kegiatan Nonmengajar</h2>
                    <p>Diskusi kolaboratif bersama guru pamong Waldi, M.Pd. dan forum MGMP IPA difokuskan pada sinkronisasi kisi-kisi soal asesmen tengah semester (AKM/ASTS) berbasis konteks literasi-numerasi.</p>

                    <h2 style="color: #e11d48; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">6. Instrumen Penilaian & Keputusan Siklus PTK</h2>
                    <p>Ketuntasan klasikal meningkat menjadi 86.2% dan indikator afektif rasa ingin tahu melonjak tajam mencapai 89.0%. Karena seluruh kendala teknis media telah terselesaikan dan indikator keberhasilan PTK terlampaui konsisten, pelaksanaan PTK diputuskan untuk dihentikan secara tuntas pada Siklus 2.</p>
                </div>
            `
            
        },
        'Rubrik_Penilaian_TaRL_Siklus_2.pdf': {
            type: 'Instrumen Penilaian',
            html: `
                <div class="viewer-paper">
                    <h1 style="color: #e11d48; text-align: center;">RUBRIK ASESMEN TaRL & AFEKTIF SIKLUS 2</h1>
                    <hr style="margin: 1rem 0;">
                    <table>
                        <thead>
                            <tr><th>Level Kesiapan</th><th>Indikator Kinerja</th><th>Capaian Kelompok</th><th>Ketuntasan</th></tr>
                        </thead>
                        <tbody>
                            <tr><td><strong>Dasar</strong></td><td>Mengidentifikasi ciri makroskopis perubahan wujud zat</td><td>100% Tuntas</td><td>Tuntas Penuh</td></tr>
                            <tr><td><strong>Cakap</strong></td><td>Menganalisis keseimbangan kalor lepas = kalor terima</td><td>91.5% Tuntas</td><td>Tuntas Penuh</td></tr>
                            <tr><td><strong>Mahir</strong></td><td>Menganalisis kurva grafik suhu vs waktu & kalor laten</td><td>88.0% Tuntas</td><td>Tuntas Penuh</td></tr>
                        </tbody>
                    </table>
                </div>
            `
            
        },
        'Jurnal_Refleksi_Mengajar_Mandiri_Siklus_3.pdf': {
            type: 'Jurnal Refleksi Komprehensif',
            html: `
                <div class="viewer-paper" style="max-width: 750px; line-height: 1.7;">
                    <h1 style="text-align: center; color: #78350f; border-bottom: 2px solid #d97706; padding-bottom: 0.5rem;">JURNAL REFLEKSI SIKLUS 3</h1>
                    <p style="text-align: center; font-weight: 600; margin-bottom: 1.5rem;">SIKLUS PENGAYAAN: REKAYASA STEM & PROJECT-BASED LEARNING (PjBL)<br>SMP NEGERI 5 YOGYAKARTA - KELAS VII</p>

                    <h2 style="color: #d97706; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem;">1. Analisis Produk Rancangan Pembelajaran (STEM & PjBL)</h2>
                    <p>Siklus 3 dirancang sebagai siklus pemantapan (enrichment cycle) untuk mentransformasikan antusiasme belajar siswa ke dalam aksi rekayasa nyata melalui Project-Based Learning berpendekatan STEM. Peran pendidik bergeser menjadi mentor inkuiri, memberikan ruang otonomi belajar penuh (student agency) bagi kelompok untuk mendesain prototipe benda apung dan memamerkannya dalam format Science Gallery Walk.</p>

                    <h2 style="color: #d97706; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">2. Analisis Materi Pembelajaran</h2>
                    <p>Materi difokuskan pada aplikasi saintifik massa jenis, gaya angkat zat cair (hukum Archimedes), serta teknik pemisahan campuran sederhana berbasis sifat fisika partikel (filtrasi dan evaporasi).</p>

                    <h2 style="color: #d97706; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">3. Analisis Media Pembelajaran</h2>
                    <p>Pemanfaatan maker-materials ramah lingkungan dipadukan dengan web showcase portofolio digital memungkinkan siswa mengunggah bukti video pengujian prototipe serta dokumentasi refleksi desain secara terorganisir.</p>

                    <h2 style="color: #d97706; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">4. Analisis Video Pelaksanaan</h2>
                    <p>Video memperlihatkan suasana pameran mini Science Gallery Walk di mana siswa saling menguji coba prototipe kapal selam kelompok lain di akuarium transparan serta memberikan feedback konstruktif antarteman.</p>

                    <h2 style="color: #d97706; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">5. Analisis Kegiatan Nonmengajar</h2>
                    <p>Guru mengoordinasikan penataan ruang galeri pameran di laboratorium IPA serta mengelola display poster karya siswa agar alur lalu lintas observasi berjalan tertib dan kondusif.</p>

                    <h2 style="color: #d97706; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">6. Instrumen Penilaian dan Ketercapaian</h2>
                    <p>Sebanyak 94% kelompok berhasil menghasilkan prototipe yang berfungsi stabil, kepuasan kolaborasi antarsiswa mencapai 95%, dan 100% siswa memahami relevansi kontekstual konsep kerapatan zat dalam kehidupan sehari-hari.</p>
                </div>
            `
            
        },
        'Rubrik_Penilaian_Proyek_STEM_Siklus_3.pdf': {
            type: 'Instrumen Penilaian',
            html: `
                <div class="viewer-paper">
                    <h1 style="color: #d97706; text-align: center;">RUBRIK PENILAIAN PROYEK STEM & PEER-ASSESSMENT</h1>
                    <hr style="margin: 1rem 0;">
                    <table>
                        <thead>
                            <tr><th>Kriteria Evaluasi</th><th>Bobot</th><th>Keterangan Capaian</th><th>Rerata Skor</th></tr>
                        </thead>
                        <tbody>
                            <tr><td><strong>Fungsi Prototipe</strong></td><td>35%</td><td>Kapal selam mampu menyelam dan mengapung stabil</td><td>94.0 / 100</td></tr>
                            <tr><td><strong>Orisinalitas Desain</strong></td><td>25%</td><td>Pemanfaatan maker-materials kreatif ramah lingkungan</td><td>92.5 / 100</td></tr>
                            <tr><td><strong>Komunikasi Gallery Walk</strong></td><td>20%</td><td>Artikulasi penjelasan prinsip fisika kepada audiens</td><td>95.0 / 100</td></tr>
                            <tr><td><strong>Kolaborasi & Refleksi</strong></td><td>20%</td><td>Peer-assessment kerja sama dan kepedulian tim</td><td>96.0 / 100</td></tr>
                        </tbody>
                    </table>
                </div>
            `
            
        },
        'Jurnal_Refleksi_Mengajar_Mandiri_Siklus_4.pdf': {
            type: 'Jurnal Refleksi Komprehensif',
            html: `
                <div class="viewer-paper" style="max-width: 750px; line-height: 1.7;">
                    <h1 style="text-align: center; color: #164e63; border-bottom: 2px solid #0891b2; padding-bottom: 0.5rem;">JURNAL REFLEKSI SIKLUS 4</h1>
                    <p style="text-align: center; font-weight: 600; margin-bottom: 1.5rem;">PRAKTIK MENGAJAR MANDIRI SIKLUS 4: SUHU, SKALA & KALOR<br>SMP NEGERI 5 YOGYAKARTA - KELAS VII</p>

                    <h2 style="color: #0891b2; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem;">1. Analisis Produk Rancangan Pembelajaran (Pasca AKM)</h2>
                    <p>Siklus 4 dirancang sebagai fase pemantapan materi pasca asesmen tengah semester (AKM/ASTS). Desain modul ajar mengaitkan konsep empiris suhu dan kalor dengan kemampuan literasi-numerasi, memastikan pemahaman konsep fisika tertanam kuat mendahului rumus aljabar perhitungan konversi skala.</p>

                    <h2 style="color: #0891b2; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">2. Analisis Materi Pembelajaran</h2>
                    <p>Materi disusun mencakup: Hakikat Suhu (pembuktian indra bukan alat ukur objektif melalui uji coba 3 bejana air es, air normal, dan air hangat), Perbandingan Empat Skala Termometer (C:R:F:K = 5:4:9:5), serta Mekanisme Perpindahan Kalor (konduksi, konveksi, radiasi).</p>

                    <h2 style="color: #0891b2; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">3. Analisis Media Pembelajaran</h2>
                    <p>Kombinasi kit laboratorium riil (termometer alkohol dan raksa, kalorimeter sederhana) dengan web simulasi skala dinamis memungkinkan siswa memverifikasi hasil hitung manual dengan pergeseran termometer digital secara instan.</p>

                    <h2 style="color: #0891b2; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">4. Analisis Video Pelaksanaan</h2>
                    <p>Rekaman mendokumentasikan kemampuan guru mengoreksi posisi mata siswa agar sejajar dengan meniskus cekung zat cair termometer secara personal, serta sesi kuis cerdas cermat konversi skala di akhir kelas.</p>

                    <h2 style="color: #0891b2; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">5. Analisis Kegiatan Nonmengajar</h2>
                    <p>Guru berkoordinasi dengan guru mata pelajaran Matematika kelas VII untuk menyinkronkan pemahaman aljabar perbandingan senilai guna mendukung kelancaran pemecahan soal konversi skala suhu.</p>

                    <h2 style="color: #0891b2; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 1.5rem;">6. Instrumen Penilaian dan Ketercapaian</h2>
                    <p>100% siswa berhasil menguasai teknik pembacaan meniskus termometer secara presisi, rerata nilai tes konversi skala mencapai 87.5, dan ketuntasan materi perpindahan kalor mencapai 96.0% tanpa siswa memerlukan remedial lanjutan.</p>
                </div>
            `
            
        },
        'Rubrik_Penilaian_Suhu_Kalor_Siklus_4.pdf': {
            type: 'Instrumen Penilaian',
            html: `
                <div class="viewer-paper">
                    <h1 style="color: #0891b2; text-align: center;">RUBRIK ASESMEN KINERJA & KOGNITIF SIKLUS 4</h1>
                    <hr style="margin: 1rem 0;">
                    <table>
                        <thead>
                            <tr><th>Parameter Uji</th><th>Kriteria Pencapaian</th><th>Persentase Ketercapaian</th><th>Kategori</th></tr>
                        </thead>
                        <tbody>
                            <tr><td><strong>Pembacaan Meniskus</strong></td><td>Posisi mata tegak lurus meniskus cekung tanpa deviasi</td><td>100% Siswa</td><td>Sangat Mahir</td></tr>
                            <tr><td><strong>Konversi 4 Skala</strong></td><td>Ketepatan perhitungan konversi Celsius, Reamur, Fahrenheit, Kelvin</td><td>Rerata Nilai: 87.5</td><td>Tuntas Kognitif</td></tr>
                            <tr><td><strong>Analisis Kalor</strong></td><td>Menjelaskan fenomena konduksi, konveksi, radiasi kontekstual</td><td>96.0% Siswa</td><td>Tuntas Klasikal</td></tr>
                        </tbody>
                    </table>
                </div>
            `
            
        },

        // ==========================================
        // 5. KEGIATAN NONMENGAJAR & DOKUMENTASI
        // ==========================================
        'salam_pagi.jpg': {
            type: 'Dokumentasi Piket',
            html: `
                <div class="viewer-paper" style="text-align: center;">
                    <h1 style="color: #1e1b4b;">DOKUMENTASI PIKET SALAM PAGI (5S)</h1>
                    <p style="text-align: center; font-style: italic;">Piket Gerbang Menyambut Siswa dengan Senyum, Salam, Sapa - SMP Negeri 5 Yogyakarta</p>
                    <hr style="margin: 1.5rem 0;">
                    <img src="salam_pagi.jpg" style="max-height: 72vh; max-width: 100%; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.1); object-fit: contain;" alt="Salam Pagi">
                </div>
            `
            
        },
        'jaga_lobi.png': {
            type: 'Dokumentasi Piket',
            html: `
                <div class="viewer-paper" style="text-align: center;">
                    <h1 style="color: #1e1b4b;">DOKUMENTASI JAGA LOBI PELAYANAN</h1>
                    <p style="text-align: center; font-style: italic;">Piket Lobi & Pelayanan Administrasi Tamu Sekolah - SMP Negeri 5 Yogyakarta</p>
                    <hr style="margin: 1.5rem 0;">
                    <img src="jaga_lobi.png" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Jaga Lobi">
                </div>
            `
            
        },
        'sholat_dhuha_1.jpg': {
            type: 'Dokumentasi Keagamaan',
            html: `
                <div class="viewer-paper" style="text-align: center;">
                    <h1 style="color: #1e1b4b;">DOKUMENTASI SHOLAT DHUHA BERJAMAAH</h1>
                    <p style="text-align: center; font-style: italic;">Pendampingan Ibadah Keagamaan Rutin Siswa - Musholla SMP Negeri 5 Yogyakarta</p>
                    <hr style="margin: 1.5rem 0;">
                    <img src="sholat_dhuha_1.jpg" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Sholat Dhuha">
                </div>
            `
            
        },
        'sholat_dhuha_2.png': {
            type: 'Dokumentasi Keagamaan',
            html: `
                <div class="viewer-paper" style="text-align: center;">
                    <h1 style="color: #1e1b4b;">DOKUMENTASI IBADAH SHOLAT DHUHA</h1>
                    <p style="text-align: center; font-style: italic;">Pendampingan & Pembinaan Karakter Religius Siswa - SMP Negeri 5 Yogyakarta</p>
                    <hr style="margin: 1.5rem 0;">
                    <img src="sholat_dhuha_2.png" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Sholat Dhuha 2">
                </div>
            `
            
        },
        'asmaul_husna.png': {
            type: 'Dokumentasi Keagamaan',
            html: `
                <div class="viewer-paper" style="text-align: center;">
                    <h1 style="color: #1e1b4b;">DOKUMENTASI BIMBINGAN ASMAUL HUSNA</h1>
                    <p style="text-align: center; font-style: italic;">Pembinaan Spiritual Siswi Berhalangan Haid - Aula SMP Negeri 5 Yogyakarta</p>
                    <hr style="margin: 1.5rem 0;">
                    <img src="asmaul_husna.png" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Asmaul Husna">
                </div>
            `
            
        },
        'pilah_sampah.jpg': {
            type: 'Dokumentasi Lingkungan',
            html: `
                <div class="viewer-paper" style="text-align: center;">
                    <h1 style="color: #1e1b4b;">DOKUMENTASI AKSI PILAH SAMPAH</h1>
                    <p style="text-align: center; font-style: italic;">Pilah Sampah & Edukasi Kebersihan Lingkungan Hidup - SMP Negeri 5 Yogyakarta</p>
                    <hr style="margin: 1.5rem 0;">
                    <img src="pilah_sampah.jpg" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Pilah Sampah">
                </div>
            `
            
        },
        'menjaga_asts.jpg': {
            type: 'Dokumentasi Guru Pengganti',
            html: `
                <div class="viewer-paper" style="text-align: center;">
                    <h1 style="color: #1e1b4b;">DOKUMENTASI GURU PENGGANTI (INVAL)</h1>
                    <p style="text-align: center; font-style: italic;">Pendampingan Pembelajaran Kelas saat Guru Mapel Berhalangan Hadir - SMP Negeri 5 Yogyakarta</p>
                    <hr style="margin: 1.5rem 0;">
                    <img src="menjaga_asts.jpg" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Guru Pengganti Inval">
                </div>
            `
            
        },
        'pengawas_ujian.png': {
            type: 'Dokumentasi Asesmen',
            html: `
                <div class="viewer-paper" style="text-align: center;">
                    <h1 style="color: #1e1b4b;">DOKUMENTASI PENGAWASAN UJIAN (AKM / ASTS)</h1>
                    <p style="text-align: center; font-style: italic;">Pengawasan Ujian Asesmen Sumatif Siswa di Ruang Kelas - SMP Negeri 5 Yogyakarta</p>
                    <hr style="margin: 1.5rem 0;">
                    <img src="pengawas_ujian.png" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Pengawasan Ujian">
                </div>
            `
            
        },
        'senam_diy.jpg': {
            type: 'Dokumentasi Kegiatan',
            html: `
                <div class="viewer-paper" style="text-align: center;">
                    <h1 style="color: #1e1b4b;">DOKUMENTASI SENAM SEHAT DIY</h1>
                    <p style="text-align: center; font-style: italic;">Peluncuran Logo Baru HUT DIY - Lapangan SMP Negeri 5 Yogyakarta</p>
                    <hr style="margin: 1.5rem 0;">
                    <img src="senam_diy.jpg" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Senam Sehat DIY">
                </div>
            `
            
        },
        'lomba_hutri.jpg': {
            type: 'Dokumentasi HUT RI',
            html: `
                <div class="viewer-paper" style="text-align: center;">
                    <h1 style="color: #1e1b4b;">DOKUMENTASI KEPANITIAAN LOMBA HUT RI KE-80</h1>
                    <p style="text-align: center; font-style: italic;">Penyelenggaraan & Pendampingan Lomba Kemerdekaan - SMP Negeri 5 Yogyakarta</p>
                    <hr style="margin: 1.5rem 0;">
                    <img src="lomba_hutri.jpg" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Lomba HUT RI">
                </div>
            `
            
        },
        'upacara_hutri.jpg': {
            type: 'Dokumentasi Upacara',
            html: `
                <div class="viewer-paper" style="text-align: center;">
                    <h1 style="color: #1e1b4b;">DOKUMENTASI UPACARA BENDERA HUT RI</h1>
                    <p style="text-align: center; font-style: italic;">Upacara Bendera Peringatan HUT ke-80 RI - SMP Negeri 5 Yogyakarta</p>
                    <hr style="margin: 1.5rem 0;">
                    <img src="upacara_hutri.jpg" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Upacara HUT RI">
                </div>
            `
            
        },
        'maulid_nabi.png': {
            type: 'Dokumentasi Keagamaan',
            html: `
                <div class="viewer-paper" style="text-align: center;">
                    <h1 style="color: #1e1b4b;">DOKUMENTASI PERINGATAN MAULID NABI SAW</h1>
                    <p style="text-align: center; font-style: italic;">Pengajian & Pembinaan Nilai Spiritual Siswa - Aula SMP Negeri 5 Yogyakarta</p>
                    <hr style="margin: 1.5rem 0;">
                    <img src="maulid_nabi.png" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Maulid Nabi SAW">
                </div>
            `
            
        },
        'kartu_perpus.png': {
            type: 'Dokumentasi Perpustakaan',
            html: `
                <div class="viewer-paper" style="text-align: center;">
                    <h1 style="color: #1e1b4b;">DOKUMENTASI PELAYANAN KARTU PERPUSTAKAAN</h1>
                    <p style="text-align: center; font-style: italic;">Pendampingan Pembuatan & Aktivasi Kartu Perpustakaan Siswa - SMP Negeri 5 Yogyakarta</p>
                    <hr style="margin: 1.5rem 0;">
                    <img src="kartu_perpus.png" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Kartu Perpustakaan">
                </div>
            `
            
        },
        'mengajar_terbimbing.png': {
            type: 'Dokumentasi PBM',
            html: `
                <div class="viewer-paper" style="text-align: center;">
                    <h1 style="color: #1e1b4b;">DOKUMENTASI MENGAJAR TERBIMBING</h1>
                    <p style="text-align: center; font-style: italic;">Praktikum Metode Ilmiah Laboratorium IPA Kelas 7I - SMP Negeri 5 Yogyakarta</p>
                    <hr style="margin: 1.5rem 0;">
                    <img src="mengajar_terbimbing.png" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Mengajar Terbimbing">
                </div>
            `
            
        }
    };
    /* --- DOCUMENT MODAL PREVIEW ENGINE --- */
    const docModal = document.getElementById('doc-modal');
    const modalTitle = document.getElementById('modal-doc-title');
    const modalBadge = document.getElementById('modal-doc-badge');
    const modalContent = document.getElementById('modal-content-area');
    const closeModalBtn = document.getElementById('btn-close-modal');

    let currentSlideIndex = 0;
    let currentSlideData = null;

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (docModal) docModal.classList.remove('active');
        });
    }

    if (docModal) {
        docModal.addEventListener('click', (e) => {
            if (e.target === docModal) {
                docModal.classList.remove('active');
            }
        });
    }

    function renderSlide() {
        if (!modalContent || !currentSlideData) return;

        const slide = currentSlideData[currentSlideIndex];
        modalContent.innerHTML = `
            <div class="slide-container">
                <div class="slide-content">
                    <h2>${slide.title}</h2>
                    <p style="color: white; line-height: 1.6; margin-top: 1rem;">${slide.text}</p>
                </div>
                <div class="slide-navigation">
                    <button class="slide-btn" id="btn-slide-prev"><i data-lucide="chevron-left"></i> Prev</button>
                    <span class="slide-counter">Slide ${currentSlideIndex + 1} of ${currentSlideData.length}</span>
                    <button class="slide-btn" id="btn-slide-next">Next <i data-lucide="chevron-right"></i></button>
                </div>
            </div>
        `;
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Attach slide arrow actions
        const btnPrev = document.getElementById('btn-slide-prev');
        const btnNext = document.getElementById('btn-slide-next');

        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                if (currentSlideIndex > 0) {
                    currentSlideIndex--;
                    renderSlide();
                }
            });
        }
        if (btnNext) {
            btnNext.addEventListener('click', () => {
                if (currentSlideIndex < currentSlideData.length - 1) {
                    currentSlideIndex++;
                    renderSlide();
                }
            });
        }
    }

    function openDocumentPreview(fileName) {
        if (!docModal || !modalTitle || !modalBadge || !modalContent) return;

        const doc = docDatabase[fileName];
        
        docModal.classList.add('active');

        // Dynamically update the GDrive button link based on current doc
        const gdriveBtn = document.getElementById('btn-modal-gdrive');
        if (gdriveBtn) {
            let targetUrl = 'https://drive.google.com/drive/folders/1gF3aHAfoY6GvI7J7e2KV7Xvs2ZRKMdqB?usp=sharing';
            if (doc && doc.gdrive) {
                targetUrl = doc.gdrive;
            } else if (fileName.includes('https://') || fileName.includes('http://')) {
                const urlMatch = fileName.match(/(https?:\/\/[^\s\(\)]+)/);
                if (urlMatch) {
                    targetUrl = urlMatch[0];
                }
            }
            gdriveBtn.href = targetUrl;
        }

        if (doc) {
            modalTitle.textContent = fileName;
            if (doc.slides) {
                modalBadge.textContent = 'PPT Slide';
                currentSlideIndex = 0;
                currentSlideData = doc.slides;
                renderSlide();
            } else {
                modalBadge.textContent = doc.type || 'Dokumen';
                currentSlideData = null;
                modalContent.innerHTML = doc.html;
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
        } else {
            // Fallback for document names not fully filled in DB
            modalTitle.textContent = fileName;
            modalBadge.textContent = 'Dokumen Perangkat';
            currentSlideData = null;
            
            modalContent.innerHTML = `
                <div class="viewer-paper" style="padding: 2.5rem;">
                    <h1>${fileName.replace('.pdf', '').replace('.pptx', '').replaceAll('_', ' ')}</h1>
                    <p style="text-align: center; font-style: italic;">Rancangan Perangkat IPA Kelas VII - SMP Negeri 5 Yogyakarta</p>
                    <hr style="margin: 1.5rem 0;">
                    <h2>I. DESKRIPSI PERANGKAT</h2>
                    <p>Dokumen ini merupakan bagian dari kelengkapan perangkat mengajar mandiri Wahyu Puji Saputri, S.Pd. pada bidang studi IPA tingkat SMP Kelas VII.</p>
                    <h2>II. TENTANG MATERI</h2>
                    <p>Pembelajaran dilaksanakan menggunakan pendekatan student-centered dan berbasis penemuan/inkuiri terbimbing sesuai kurikulum merdeka.</p>
                    <div style="border: 1px dashed var(--border-color); padding: 1.5rem; margin-top: 2rem; border-radius: 6px; text-align: center; background-color: var(--bg-app);">
                        <i data-lucide="file-check" style="width: 32px; height: 32px; color: var(--success); margin: 0 auto 8px auto;"></i>
                        <p style="margin: 0; font-weight: 600; color: var(--success);">Dokumen Terverifikasi oleh Guru Pamong Waldi, M.Pd.</p>
                    </div>
                </div>
            `;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }

    // Make the popup content area clickable to open the target material
    if (modalContent) {
        modalContent.addEventListener('click', (e) => {
            // Avoid triggering redirect if they are clicking next/prev slide navigation buttons
            if (e.target.closest('.slide-btn')) {
                return;
            }

            const fileName = modalTitle.textContent;
            const doc = docDatabase[fileName];
            let targetUrl = 'https://drive.google.com/drive/folders/1gF3aHAfoY6GvI7J7e2KV7Xvs2ZRKMdqB?usp=sharing';
            
            if (doc && doc.gdrive) {
                targetUrl = doc.gdrive;
            } else if (fileName.includes('https://') || fileName.includes('http://')) {
                const urlMatch = fileName.match(/(https?:\/\/[^\s\(\)]+)/);
                if (urlMatch) {
                    targetUrl = urlMatch[0];
                }
            }

            window.open(targetUrl, '_blank');
        });
    }

    /* --- WIRE CLICK ACTION TO DEVICE CARDS --- */
    const deviceCards = document.querySelectorAll('.device-card');
    deviceCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const docName = card.getAttribute('data-doc');
            const docLink = card.getAttribute('data-link');

            // 1. Open direct link in a new tab if present
            if (docLink) {
                window.open(docLink, '_blank');
                return;
            }

            // 2. Open link directly if the document title contains a URL
            if (docName && (docName.startsWith('http') || docName.includes('https://') || docName.includes('http://'))) {
                const urlMatch = docName.match(/(https?:\/\/[^\s]+)/);
                if (urlMatch) {
                    window.open(urlMatch[0], '_blank');
                    return;
                }
            }
            
            // Highlight clicked card
            const grid = card.closest('.device-grid');
            if (grid) {
                grid.querySelectorAll('.device-card').forEach(c => c.classList.remove('active'));
            }
            card.classList.add('active');

            if (docName) {
                openDocumentPreview(docName);
            }
        });
    });
});
