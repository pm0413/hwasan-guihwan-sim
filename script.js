document.addEventListener("DOMContentLoaded", function () {

    // ================= 1. 설정 및 상수 정의 =================

    // 관계 단계 설정
    const REL_LEVELS = {
        intimacy: [{
                score: 0,
                title: "아는사이"
            },
            {
                score: 100,
                title: "친우"
            },
            {
                score: 300,
                title: "절친"
            },
            {
                score: 500,
                title: "금란지교"
            },
            {
                score: 700,
                title: "지기지우"
            },
            {
                score: 1000,
                title: "관포지교"
            }
        ],
        affection: [{
                score: 0,
                title: "-"
            },
            {
                score: 10,
                title: "관심있음"
            },
            {
                score: 50,
                title: "호감"
            },
            {
                score: 100,
                title: "썸타는 관계"
            },
            {
                score: 200,
                title: "연인"
            },
            {
                score: 500,
                title: "부부"
            }
        ]
    };


    // 계절 정보
    const seasonInfo = {
        spring: {
            name: "봄",
            icon: "🌸",
            filter: "none"
        },
        summer: {
            name: "여름",
            icon: "☀️",
            filter: "saturate(1.2) brightness(1.1)"
        },
        autumn: {
            name: "가을",
            icon: "🍁",
            filter: "sepia(0.4) contrast(1.1)"
        },
        winter: {
            name: "겨울",
            icon: "❄️",
            filter: "brightness(0.9) hue-rotate(10deg) grayscale(0.3)"
        }
    };


    function addItem(charId, itemId, count = 1) {
        const char = charData[charId];
        if (!char) return;

        const currentCount = char.inventory.filter(id => id === itemId).length;

        if (currentCount >= 10) {
            return;
        }

        const addableCount = Math.min(count, 10 - currentCount);

        for (let i = 0; i < addableCount; i++) {
            char.inventory.push(itemId);
        }

        const itemInfo = itemDB[itemId];
        saveCharacterSettings(true);
        if (currentUserId === charId && currentTab === 'inventory') renderInfoContent();
    }

    function useItem(charId, itemId) {
        const char = charData[charId];
        const idx = char.inventory.indexOf(itemId);

        if (idx > -1) {
            char.inventory.splice(idx, 1);
            const itemInfo = itemDB[itemId];
            saveCharacterSettings(true);
            if (currentUserId === charId && currentTab === 'inventory') renderInfoContent();
            return true;
        }
        return false;
    }

    // ================= 2. 캐릭터 데이터 =================
    const charData = {
        'dangbo': {
            name: "당보",
            title: "암존(暗尊)",
            gender: "남성",
            position: "left",
            intimacy: 0,
            affection: 0,
            maxIntimacyLevelIdx: 0,
            maxAffectionLevelIdx: 0,
            relationshipTitle: "아는사이",
            loveTitle: "-",
            inventory: ['chuhonbi', 'anterior_sac'],
            relations: [{
                target: "청명",
                desc: "나의 도사형님"
            }],
            img: "character/당보.gif",
            color: "#4CAF50",
            x: 30,
            y: 60
        },
        'chung': {
            name: "청명",
            title: "매화검존(梅花劍尊)",
            gender: "남성",
            position: "right",
            intimacy: 0,
            affection: 0,
            maxIntimacyLevelIdx: 0,
            maxAffectionLevelIdx: 0,
            relationshipTitle: "아는사이",
            loveTitle: "-",
            inventory: ["maehwa_sword", "jasodan"],
            relations: [{
                target: "당보",
                desc: "귀찮지만 믿음직한 녀석."
            }],
            img: "character/청명.gif",
            color: "#F44336",
            x: 70,
            y: 60
        }
    };

    // ================= 3. 전역 변수 및 시간 시스템 =================
    let currentUserId = 'dangbo';
    let currentTab = 'profile';
    let isInteracting = false;
    const DAY_IN_MS = 40000;

    let gameData = JSON.parse(localStorage.getItem('hapsa_game_data')) || {
        visitedTrips: [],
        tripInfo: null
    };

    let gameDate = JSON.parse(localStorage.getItem('savedGameDate')) || {
        month: 3,
        day: 1
    };
    let gameLogs = JSON.parse(localStorage.getItem('hapsa_game_logs')) || [];
    let lastTimeCheck = Date.now();
    let lastDialogTime = parseInt(localStorage.getItem('savedLastDialogTime')) || 0;

    function getSeason(month) {
        if (month >= 3 && month <= 5) return 'spring';
        if (month >= 6 && month <= 8) return 'summer';
        if (month >= 9 && month <= 11) return 'autumn';
        return 'winter';
    }

    function updateTime() {
        const now = Date.now();
        if (now - lastTimeCheck >= DAY_IN_MS) {
            lastTimeCheck = now;
            advanceDay();
        }
        updateDateUI();
        requestAnimationFrame(updateTime);
    }

    function advanceDay() {
        gameDate.day++;
        if (gameDate.day > 30) {
            gameDate.day = 1;
            gameDate.month++;
            if (gameDate.month > 12) gameDate.month = 1;
        }

        const isEventDay = (gameDate.day === 10 || gameDate.day === 20 || gameDate.day === 30);
        addLog(`${gameDate.month}월 ${gameDate.day}일이 되었습니다`, true);

        if (isEventDay) {
            setTimeout(triggerSpecialEvent, 1000);
        }

        localStorage.setItem('savedGameDate', JSON.stringify(gameDate));
        updateDateUI();
        updateBgmStatus();
    }

    function triggerSpecialEvent() {
        const season = getSeason(gameDate.month);
        const commonEvents = specialEventDB.common || [];
        const seasonEvents = specialEventDB[season] || [];
        const allPossibleEvents = [...commonEvents, ...seasonEvents];

        if (allPossibleEvents.length === 0) return;

        const event = allPossibleEvents[Math.floor(Math.random() * allPossibleEvents.length)];
        const processedLog = processText(event.log);

        let processedDangboTalk = "";
        let processedChungTalk = "";

        if (event.talk) {
            processedDangboTalk = processText(event.talk.dangbo);
            processedChungTalk = processText(event.talk.chung);
        }

        const popup = document.getElementById('event-popup');
        if (popup) {
            document.getElementById('popup-title').innerText = event.title;
            document.getElementById('popup-desc').innerText = processedLog;
            popup.classList.add('show');
            setTimeout(() => popup.classList.remove('show'), 3000);
        }

        addLog(`[${event.title}] ${processedLog}`, false, null, 'purple');

        if (event.talk) {
            setTimeout(() => {
                showBubble('dangbo', processedDangboTalk, 'high');
                setTimeout(() => {
                    showBubble('chung', processedChungTalk, 'low');
                }, 1500);
            }, 1000);
        }

        if (event.action) {
            event.action();
        }

        saveCharacterSettings(true);
        renderInfoContent();
    }

    function updateDateUI() {
        if (isOnTrip) return;

        const seasonKey = getSeason(gameDate.month);
        const season = seasonInfo[seasonKey];
        const header = document.getElementById('log-header-text');
        if (header) header.innerText = `${season.icon} ${season.name} | ${gameDate.month}월 ${gameDate.day}일의 기록`;

        const bg = document.getElementById('game-bg');
        if (bg) bg.style.backgroundImage = `url('bg/${seasonKey}.jpg')`;
    }

    // ================= 4. UI 및 렌더링 =================
    function toggleInfoPanel() {
        const panel = document.getElementById('info-panel');
        const btn = document.getElementById('mobile-toggle-btn');
        panel.classList.toggle('open');
        btn.innerText = panel.classList.contains('open') ? '▲' : '▼';
    }

    function selectCharacter(id) {
        currentUserId = id;
        document.querySelectorAll('.char-select-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById(id === 'dangbo' ? 'btn-dangbo' : 'btn-chung');
        if (btn) btn.classList.add('active');
        renderInfoContent();
    }

    function switchTab(tabName) {
        currentTab = tabName;
        document.querySelectorAll('.sub-tab-btn').forEach(b => {
            b.classList.remove('active');
            const tabMap = {
                'profile': '프로필',
                'inventory': '소지품',
                'relation': '관계'
            };
            if (b.innerText === tabMap[tabName]) b.classList.add('active');
        });
        renderInfoContent();
    }

    // [정보창 렌더링] (프로필 / 인벤토리 / 관계)
    function renderInfoContent() {
        const data = charData[currentUserId];
        const display = document.getElementById('info-display-area');
        if (!display) return;

        let html = '';

        // 1. 프로필
        if (currentTab === 'profile') {
            const nameTagColor = getContrastYIQ(data.color);

            html = `
            <div class="profile-header-area">
                <h2 id="char-name-display" class="char-signature-font char-name-text" style="color:${data.color};">${data.name}</h2>
                <span id="char-title-display" class="char-signature-font char-title-badge" style="background:${data.color}; color:${nameTagColor};">${data.title}</span>
            </div>
            <div class="profile-row">
                <div class="info-box profile-col">
                    <span class="info-label">📍 위치 (공/수)</span>
                    <select class="custom-select" onchange="updateCharSetting('position', this.value)">
                        <option value="left" ${data.position === 'left' ? 'selected' : ''}>왼쪽 (공)</option>
                        <option value="right" ${data.position === 'right' ? 'selected' : ''}>오른쪽 (수)</option>
                    </select>
                </div>
                <div class="info-box profile-col">
                    <span class="info-label">⚧ 성별</span>
                    <select class="custom-select" onchange="updateCharSetting('gender', this.value)">
                        <option value="남성" ${data.gender === '남성' ? 'selected' : ''}>남성 ♂️</option>
                        <option value="여성" ${data.gender === '여성' ? 'selected' : ''}>여성 ♀️</option>
                    </select>
                </div>
            </div>
            <div class="info-box">
                <span class="info-label">🎨 대표 컬러 설정</span>
                <div class="color-picker-row">
                    <input type="color" value="${data.color}" onchange="updateCharSetting('color', this.value)" class="color-input">
                    <span class="color-help-text">클릭하여 변경</span>
                </div>
            </div>
            <button class="save-btn" onclick="saveCharacterSettings()">💾 설정 저장하기</button>
            `;

            // 2. 인벤토리
        } else if (currentTab === 'inventory') {
            const rawItems = data.inventory || [];
            const totalSlots = 24;

            const itemCounts = {};
            rawItems.forEach(id => {
                itemCounts[id] = (itemCounts[id] || 0) + 1;
            });
            const uniqueItems = Object.keys(itemCounts);

            let detailHtml = `
                <div class="item-detail-view" id="inv-detail-view">
                    <div class="inv-detail-guide">
                        아이템을 클릭하면<br>여기에 상세 설명이 뜹니다.
                    </div>
                </div>
            `;

            let gridHtml = '<div class="inventory-grid">';
            uniqueItems.forEach(itemId => {
                const item = itemDB[itemId];
                const count = itemCounts[itemId];
                const countBadge = count > 1 ? `<span class="item-count">x${count}</span>` : '';

                if (item) {
                    gridHtml += `
                        <div class="item-slot" onclick="selectInventoryItem('${itemId}', this)">
                            <span class="item-icon-emoji">${item.icon}</span>
                            <span class="item-name">${item.name}</span>
                            ${countBadge}
                        </div>
                    `;
                } else {
                    gridHtml += `
                        <div class="item-slot">
                            <span class="item-name">${itemId}</span>
                            ${countBadge}
                        </div>`;
                }
            });
            for (let i = 0; i < totalSlots - uniqueItems.length; i++) {
                gridHtml += `<div class="item-slot empty"></div>`;
            }
            gridHtml += '</div>';

            html = `<div class="inv-wrapper">
                <div class="inv-label">🎒 소지품 (${uniqueItems.length}/${totalSlots})</div>
                ${detailHtml}
                ${gridHtml}
            </div>`;

            // 3. 관계
        } else if (currentTab === 'relation') {
            html = `<div class="rel-wrapper">`;
            html += `
                <div class="rel-stat-box">
                    <div class="stat-header">📊 현재 관계도</div>
                    <div class="stat-row">
                        <span>🤝 친밀도: <b>${data.intimacy}</b></span>
                        <span class="badge-title badge-base badge-intimacy">${data.relationshipTitle}</span>
                    </div>
                    ${data.affection > 0 || data.maxAffectionLevelIdx > 0 ? `
                    <div class="stat-row love-row">
                        <span>💕 호감도: <b>${data.affection}</b></span>
                        <span class="badge-love badge-base badge-affection">${data.loveTitle}</span>
                    </div>` : ''}
                </div>
            `;

            if (data.relations) {
                data.relations.forEach((r, idx) => {
                    const displayText = fillTitle(r.desc, data.title);
                    html += `
                    <div class="rel-card">
                        <div class="rel-card-header">
                            <strong class="rel-target-name">To. ${r.target}</strong>
                        </div>
                        <div id="rel-view-${idx}" class="rel-view-mode">
                            <div class="rel-desc-text">${displayText}</div>
                            <button class="btn-edit-rel" onclick="editRelDesc(${idx})" title="수정하기">✏️</button>
                        </div>
                        <div id="rel-edit-${idx}" class="rel-edit-mode">
                            <textarea id="rel-input-${idx}" class="rel-edit-input" placeholder="설명을 입력하세요...">${r.desc}</textarea>
                            <div class="rel-btn-group">
                                <button class="btn-cancel-rel" onclick="renderInfoContent()">취소</button>
                                <button class="btn-save-rel" onclick="saveRelDesc(${idx})">저장</button>
                            </div>
                        </div>
                    </div>`;
                });
            }
            html += `</div>`; // 관계도 카드 목록 닫기

            const isDisabled = data.intimacy < 200;
            const btnOpacity = isDisabled ? "0.5" : "1";
            const btnCursor = isDisabled ? "not-allowed" : "pointer";
            const btnText = isDisabled ? `✈️ 유람 보내기 (친밀도 ${data.intimacy}/200)` : `✈️ 유람 보내기 (친밀도 200 소모)`;

            // [리팩토링] trip-action-btn 클래스 추가, 인라인 스타일 일부 유지 (동적 값 때문)
            html += `
                <button class="save-btn trip-action-btn" 
                    style="opacity:${btnOpacity}; cursor:${btnCursor};" 
                    onclick="${isDisabled ? "alert('친밀도가 200 이상이어야 유람을 떠날 수 있습니다!')" : "openTripModal()"}"
                    ${isDisabled ? "" : ""}>
                    ${btnText}
                </button>`;
        }
        display.innerHTML = html;
    }

    function saveCharacterSettings(isSilent = false) {
        localStorage.setItem('hapsa_char_settings', JSON.stringify(charData));
        if (!isSilent) {
            // alert("설정이 저장되었습니다.");
        }
    }

    function saveGameData() {
        localStorage.setItem('hapsa_game_data', JSON.stringify(gameData));
    }

    function loadCharacterSettings() {
        const saved = localStorage.getItem('hapsa_char_settings');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.keys(parsed).forEach(key => {
                if (charData[key]) {
                    charData[key].gender = parsed[key].gender;
                    if (parsed[key].color) charData[key].color = parsed[key].color;
                    if (parsed[key].position) charData[key].position = parsed[key].position;
                    if (parsed[key].intimacy !== undefined) charData[key].intimacy = parsed[key].intimacy;
                    if (parsed[key].affection !== undefined) charData[key].affection = parsed[key].affection;
                    if (parsed[key].maxIntimacyLevelIdx !== undefined) charData[key].maxIntimacyLevelIdx = parsed[key].maxIntimacyLevelIdx;
                    if (parsed[key].maxAffectionLevelIdx !== undefined) charData[key].maxAffectionLevelIdx = parsed[key].maxAffectionLevelIdx;
                    if (parsed[key].relationshipTitle) charData[key].relationshipTitle = parsed[key].relationshipTitle;
                    if (parsed[key].loveTitle) charData[key].loveTitle = parsed[key].loveTitle;
                    if (parsed[key].inventory) charData[key].inventory = parsed[key].inventory;
                    if (parsed[key].relations) {
                        parsed[key].relations.forEach((savedRel, idx) => {
                            if (charData[key].relations[idx]) {
                                charData[key].relations[idx].desc = savedRel.desc;
                            }
                        });
                    }
                }
            });
        }
    }

    function updateCharSetting(key, value) {
        if (charData[currentUserId]) {
            charData[currentUserId][key] = value;
            if (key === 'color') {
                const nameEl = document.getElementById('char-name-display');
                if (nameEl) nameEl.style.color = value;
                const titleEl = document.getElementById('char-title-display');
                if (titleEl) {
                    titleEl.style.backgroundColor = value;
                    titleEl.style.color = getContrastYIQ(value);
                }
            }
        }
    }

    function addLog(msg, isSpecial = false, customTime = null, type = null) {
        const processedMsg = processText(msg);
        const box = document.getElementById('log-box');
        if (!box) return;

        const timeStr = customTime || new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const d = document.createElement('div');
        if (isSpecial) {
            d.className = 'log-entry log-date';
            // [리팩토링] 인라인 스타일 제거 -> 클래스로 변경
            d.innerHTML = `<div class="log-date-divider">─ ${processedMsg} ─</div>`;
        } else {
            d.className = 'log-entry';

            // [리팩토링] JS에서 style 직접 조작 대신 클래스 추가로 변경
            if (type === 'purple') {
                d.classList.add('log-type-purple');
            } else if (msg.includes('[Love 이벤트 발동!]')) {
                d.classList.add('log-type-love');
            } else if (msg.includes('[대화]')) {
                d.classList.add('log-social');
            } else {
                d.classList.add('log-system');
            }

            // [리팩토링] 볼드 처리 인라인 스타일 제거 -> 클래스로 변경
            const formattedMsg = processedMsg.replace(/\[(.*?)\]/g, '<span class="log-highlight-bracket">[$1]</span>');

            d.innerHTML = `<span class="log-time">${timeStr}</span>${formattedMsg}`;
        }

        box.prepend(d);
        requestAnimationFrame(() => {
            box.scrollTop = 0;
        });

        if (box.children.length > 50) box.lastChild.remove();

        if (!customTime) {
            gameLogs.push({
                msg,
                isSpecial,
                time: timeStr,
                type: type
            });
            if (gameLogs.length > 50) gameLogs.shift();
            localStorage.setItem('hapsa_game_logs', JSON.stringify(gameLogs));
        }
    }

    function restoreLogs() {
        gameLogs.forEach(log => {
            addLog(log.msg, log.isSpecial, log.time, log.type);
        });
    }

    // ================= 5. 이동 및 상호작용 =================
    function initCharacters() {
        const stage = document.getElementById('game-stage');
        if (!stage) return;

        for (const [id, data] of Object.entries(charData)) {
            const el = document.createElement('div');
            el.className = 'character-sprite';
            el.id = `char-${id}`;
            el.style.left = data.x + '%';
            el.style.top = data.y + '%';
            // [리팩토링] 인라인 스타일 제거 -> 클래스 사용
            el.innerHTML = `
                    <div class="bubble" id="bubble-${id}">...</div>
                    <img src="${data.img}" onerror="this.src='https://via.placeholder.com/100?text=${data.name}'">
                    <div class="char-nametag">${data.name}</div>
                `;
            el.onclick = () => {
                selectCharacter(id);
                if (window.innerWidth <= 768) toggleInfoPanel();
            };
            stage.appendChild(el);
            scheduleNextMove(id);
        }
    }

    function moveTo(id, targetX, targetY, callback) {
        const el = document.getElementById(`char-${id}`);
        const data = charData[id];
        if (!el) return;

        const dist = Math.sqrt(Math.pow(targetX - data.x, 2) + Math.pow(targetY - data.y, 2));
        const speedFactor = 0.05;
        const duration = Math.max(1.5, dist * speedFactor);

        el.style.transition = `top ${duration}s linear, left ${duration}s linear`;
        el.classList.add('walking');
        el.style.left = targetX + '%';
        el.style.top = targetY + '%';

        data.x = targetX;
        data.y = targetY;

        setTimeout(() => {
            el.classList.remove('walking');
            if (callback) callback();
        }, duration * 1000);
    }

    function scheduleNextMove(id) {
        if (isOnTrip) return;
        if (isInteracting && (Date.now() - lastDialogTime > 30000)) {
            console.warn("상호작용 락이 걸려 강제로 해제합니다.");
            isInteracting = false;
        }

        if (isInteracting) return;

        const waitTime = Math.random() * 2000 + 1000;

        setTimeout(() => {
            if (isInteracting) {
                scheduleNextMove(id);
                return;
            }

            const rand = Math.random();
            const isCooltime = (Date.now() - lastDialogTime) < 3000;

            if (id === 'dangbo' && rand < 0.4 && !isCooltime) {
                triggerInteraction();
            } else if (rand < 0.7) {
                triggerMonologue(id);
                const tx = Math.random() * 80 + 10;
                const ty = Math.random() * 60 + 20;
                moveTo(id, tx, ty, () => scheduleNextMove(id));
            } else {
                const tx = Math.random() * 80 + 10;
                const ty = Math.random() * 60 + 20;
                moveTo(id, tx, ty, () => scheduleNextMove(id));
            }
        }, waitTime);
    }

    function triggerInteraction() {
        if (isInteracting || isOnTrip) return;
        isInteracting = true;

        const c1 = charData['dangbo'];
        const c2 = charData['chung'];
        let meetX = 50;
        const meetY = (c1.y + c2.y) / 2;
        let arrivedCount = 0;
        const onArrive = () => {
            arrivedCount++;
            if (arrivedCount === 2) startDialog();
        };

        const gap = window.innerWidth <= 768 ? 16 : 8;
        const isDangboLeft = c1.position === 'left';
        const dangboTargetX = isDangboLeft ? (meetX - gap) : (meetX + gap);
        const chungTargetX = isDangboLeft ? (meetX + gap) : (meetX - gap);

        moveTo('dangbo', dangboTargetX, meetY, onArrive);
        moveTo('chung', chungTargetX, meetY, onArrive);
    }

    function processText(text) {
        if (!text) return "";

        const dangboGender = charData.dangbo.gender;
        const chungGender = charData.chung.gender;

        let honorific = "형님";

        if (dangboGender === '여성' && chungGender === '여성') {
            honorific = "언니";
        } else if (dangboGender === '남성' && chungGender === '여성') {
            honorific = "누님";
        }

        return text.replace(/{호칭}/g, honorific);
    }

    // ================= 6. 대화 및 점수 로직 =================
    function startDialog() {
        const isDangboStarts = Math.random() < 0.5;
        const starterId = isDangboStarts ? 'dangbo' : 'chung';
        const listenerId = isDangboStarts ? 'chung' : 'dangbo';
        const starterData = charData[starterId];

        let title = "형님";
        if (charData['dangbo'].gender === '여성' && charData['chung'].gender === '여성') title = "언니";
        else if (charData['dangbo'].gender === '남성' && charData['chung'].gender === '여성') title = "누님";
        else if (starterId === 'dangbo') title = "도사 형님";

        const currentSeason = getSeason(gameDate.month);

        let isLoveMode = false;
        if (starterData.affection >= 10 && Math.random() < 0.4) {
            isLoveMode = true;
        }

        let candidateScenarios = [];

        const getScenarios = (db, type) => {
            if (!db) return [];
            if (type === 'love') {
                if (db.love_interaction && db.love_interaction[starterId]) {
                    return db.love_interaction[starterId];
                }
            } else {
                const groupKey = (starterId === 'dangbo') ? 'dangbo_start' : 'chung_start';
                if (db[groupKey]) {
                    return db[groupKey];
                }
            }
            return [];
        };

        const commonList = getScenarios(dialogDB.common, isLoveMode ? 'love' : 'normal');
        const seasonList = getScenarios(dialogDB[currentSeason], isLoveMode ? 'love' : 'normal');

        candidateScenarios = [...commonList, ...seasonList];

        if (candidateScenarios.length === 0) {
            isLoveMode = false;
            candidateScenarios = getScenarios(dialogDB.common, 'normal');
        }

        if (candidateScenarios.length > 0) {
            const scenario = candidateScenarios[Math.floor(Math.random() * candidateScenarios.length)];

            showBubble(starterId, fillTitle(scenario.t1, title), starterId === 'dangbo' ? 'high' : 'low');

            if (scenario.action1) setTimeout(() => scenario.action1(), 500);

            setTimeout(() => {
                showBubble(listenerId, fillTitle(scenario.t2, title), listenerId === 'dangbo' ? 'high' : 'low');

                if (scenario.action2) setTimeout(() => scenario.action2(), 500);

                if (isLoveMode) {
                    addLog(`[Love 이벤트 발동!] 💕 ${fillTitle(scenario.log, title)}`);
                } else {
                    addLog(`[대화] ${fillTitle(scenario.log, title)}`);
                }

                calculateInteractionScore('dangbo', isLoveMode);
                calculateInteractionScore('chung', isLoveMode);

                setTimeout(() => {
                    isInteracting = false;
                    lastDialogTime = Date.now();
                    localStorage.setItem('savedLastDialogTime', lastDialogTime);
                    scheduleNextMove('dangbo');
                    scheduleNextMove('chung');
                }, 2500);
            }, 2000);

        } else {
            isInteracting = false;
        }
    }

    function calculateInteractionScore(charId, isLoveInteraction = false) {
        const char = charData[charId];
        let baseScore = 1;

        char.intimacy += Math.round(baseScore * 2);

        const currentSeason = getSeason(gameDate.month);
        if (currentSeason === 'spring') {
            if (char.affection < 10 || isLoveInteraction) {
                const loveScore = Math.max(0, Math.round(baseScore / 2));
                char.affection += loveScore;
                if (char.affection > 500) char.affection = 500;
            }
        }

        checkMilestones(charId);
        saveCharacterSettings(true);
        if (currentUserId === charId && currentTab === 'relation') {
            renderInfoContent();
        }
    }

    function checkMilestones(charId) {
        const char = charData[charId];
        let currentIntLevelIdx = 0;
        REL_LEVELS.intimacy.forEach((level, idx) => {
            if (char.intimacy >= level.score) currentIntLevelIdx = idx;
        });

        if (currentIntLevelIdx > char.maxIntimacyLevelIdx) {
            char.maxIntimacyLevelIdx = currentIntLevelIdx;
            const newTitle = REL_LEVELS.intimacy[currentIntLevelIdx].title;
            char.relationshipTitle = newTitle;
            triggerMilestoneEvent(charId, 'intimacy', REL_LEVELS.intimacy[currentIntLevelIdx].score, newTitle);
        }

        let currentAffLevelIdx = 0;
        REL_LEVELS.affection.forEach((level, idx) => {
            if (char.affection >= level.score) currentAffLevelIdx = idx;
        });

        if (currentAffLevelIdx > char.maxAffectionLevelIdx) {
            char.maxAffectionLevelIdx = currentAffLevelIdx;
            const newTitle = REL_LEVELS.affection[currentAffLevelIdx].title;
            char.loveTitle = newTitle;
            triggerMilestoneEvent(charId, 'affection', REL_LEVELS.affection[currentAffLevelIdx].score, newTitle);
        }
    }

    function triggerMilestoneEvent(charId, type, score, title) {
        const char = charData[charId];
        const typeName = type === 'intimacy' ? '친밀도' : '호감도';
        addLog(`[경축] 🌸 ${char.name}님과 <${title}> 단계를 달성했습니다! (${typeName} ${score}) 🌸`, true);

        if (charId === 'dangbo' && type === 'intimacy' && score === 1000) {
            setTimeout(() => {
                showBubble('dangbo', "형님, 이제 우린 죽어도 같이 죽는 겁니다.", 'high');
                setTimeout(() => showBubble('chung', "말이라도 못하면... 술이나 따라봐.", 'low'), 1500);
            }, 500);
        }
    }

    function triggerMonologue(id) {
        const currentSeason = getSeason(gameDate.month);
        let lines = [];

        if (dialogDB[currentSeason] && dialogDB[currentSeason].solo && dialogDB[currentSeason].solo[id]) {
            lines = dialogDB[currentSeason].solo[id];
        }

        if ((!lines || lines.length === 0) && dialogDB.common && dialogDB.common.solo && dialogDB.common.solo[id]) {
            lines = dialogDB.common.solo[id];
        }

        if (!lines || lines.length === 0) return;

        const picked = lines[Math.floor(Math.random() * lines.length)];

        let text = "";
        let action = null;

        if (typeof picked === 'string') {
            text = picked;
        } else {
            text = picked.t;
            action = picked.action;
        }

        const dangbo = charData['dangbo'];
        const chung = charData['chung'];

        let title = "형님";
        if (dangbo.gender === '여성' && chung.gender === '여성') title = "언니";
        else if (dangbo.gender === '남성' && chung.gender === '여성') title = "누님";
        else if (id === 'dangbo') title = "도사 형님";

        text = fillTitle(text, title);

        showBubble(id, text);

        if (action) {
            setTimeout(() => {
                action();
            }, 500);
        }
    }

    // ================= 7. 유틸리티 및 설정 함수 =================
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        const bodyElement = document.body;

        function applyTheme(theme) {
            if (theme === 'dark') bodyElement.classList.add('dark-theme');
            else bodyElement.classList.remove('dark-theme');
            themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        themeToggleBtn.addEventListener('click', () => {
            bodyElement.classList.toggle('dark-theme');
            applyTheme(bodyElement.classList.contains('dark-theme') ? 'dark' : 'light');
        });
    }

    function fillTitle(text, title) {
        if (!text) return "";
        let result = text.replace(/{호칭}/g, title);
        const regex = new RegExp(`(${title})(은|는|이|가|을|를|과|와)`, 'g');
        return result.replace(regex, (match, word, josa) => {
            const lastChar = word.charCodeAt(word.length - 1);
            if (lastChar < 0xAC00 || lastChar > 0xD7A3) return match;
            const hasBatchim = (lastChar - 0xAC00) % 28 > 0;
            if (josa === '은' || josa === '는') return word + (hasBatchim ? '은' : '는');
            if (josa === '이' || josa === '가') return word + (hasBatchim ? '이' : '가');
            if (josa === '을' || josa === '를') return word + (hasBatchim ? '을' : '를');
            if (josa === '과' || josa === '와') return word + (hasBatchim ? '과' : '와');
            return match;
        });
    }

    function getContrastYIQ(hexcolor) {
        if (!hexcolor) return 'black';
        const r = parseInt(hexcolor.substr(1, 2), 16);
        const g = parseInt(hexcolor.substr(3, 2), 16);
        const b = parseInt(hexcolor.substr(5, 2), 16);
        return (((r * 299) + (g * 587) + (b * 114)) / 1000) >= 128 ? 'black' : 'white';
    }

    function showBubble(charId, text, styleType = 'normal') {
        const d = charData[charId];
        const charEl = document.getElementById(`char-${charId}`);
        if (!charEl) return;

        const oldBubble = document.getElementById(`bubble-${charId}`);
        if (oldBubble) oldBubble.remove();

        const bubble = document.createElement('div');
        bubble.id = `bubble-${charId}`;
        bubble.className = 'char-bubble';

        if (styleType === 'high') bubble.classList.add('pos-high');
        else if (styleType === 'low') bubble.classList.add('pos-low');

        if (styleType !== 'normal') {
            if (d.x > 50) bubble.classList.add('is-right');
            else bubble.classList.add('is-left');
        }

        if (d.x < 10) bubble.classList.add('edge-left');
        if (d.x > 90) bubble.classList.add('edge-right');

        const bgColor = d.color || "#ffffff";
        bubble.style.setProperty('--bubble-bg', bgColor);
        bubble.style.setProperty('--bubble-text', getContrastYIQ(bgColor));
        bubble.innerText = text;

        charEl.appendChild(bubble);
        requestAnimationFrame(() => bubble.classList.add('show'));
        setTimeout(() => {
            bubble.classList.remove('show');
            setTimeout(() => bubble.remove(), 300);
        }, 3500);
    }

    function selectInventoryItem(itemId, element) {
        const item = itemDB[itemId];
        if (!item) return;

        const view = document.getElementById('inv-detail-view');
        if (view) {
            view.innerHTML = `
                <span class="detail-icon">${item.icon}</span>
                <div class="detail-text">
                    <div class="detail-name">${item.name}</div>
                    <div class="detail-desc">${item.desc}</div>
                </div>
            `;
        }
        document.querySelectorAll('.item-slot').forEach(el => el.classList.remove('selected'));
        if (element) element.classList.add('selected');
    }

    function editRelDesc(idx) {
        document.getElementById(`rel-view-${idx}`).style.display = 'none';
        document.getElementById(`rel-edit-${idx}`).style.display = 'flex';
        document.getElementById(`rel-input-${idx}`).focus();
    }

    function saveRelDesc(idx) {
        const input = document.getElementById(`rel-input-${idx}`);
        const newDesc = input.value;
        if (charData[currentUserId] && charData[currentUserId].relations[idx]) {
            charData[currentUserId].relations[idx].desc = newDesc;
            saveCharacterSettings(true);
            renderInfoContent();
            addLog(`[시스템] 📝 관계 설명이 수정되었습니다.`, false);
        }
    }

    let isOnTrip = false;

    function openTripModal() {
        const grid = document.getElementById('trip-grid');
        if (!grid) return;
        grid.innerHTML = '';

        Object.keys(tripDB).forEach(key => {
            const place = tripDB[key];
            const isVisited = gameData.visitedTrips && gameData.visitedTrips.includes(key);

            const btn = document.createElement('button');
            btn.classList.add('trip-btn');
            if (!isVisited) {
                btn.classList.add('unvisited');
            }
            // [예외] 배경 이미지는 데이터에 따라 다르므로 JS에서 유지
            btn.style.backgroundImage = `url('bg/${place.img}')`;

            btn.onclick = () => startTrip(key);

            grid.appendChild(btn);
        });

        document.getElementById('trip-modal').classList.add('open');
    }

    // ================= [유람 시스템 전체 코드] =================

    function startTrip(placeKey) {
        if (isOnTrip) return;

        const place = tripDB[placeKey];
        const durationSeconds = 40;
        const now = Date.now();

        charData['dangbo'].intimacy -= 100;
        charData['chung'].intimacy -= 100;

        gameData.tripInfo = {
            placeKey: placeKey,
            startTime: now,
            endTime: now + (durationSeconds * 1000),
            gift: place.gift,
            receiver: place.receiver || 'chung'
        };
        saveGameData();

        isOnTrip = true;
        updateBgmStatus();
        isInteracting = true;

        document.getElementById('trip-modal').classList.remove('open');
        document.querySelectorAll('.character-sprite').forEach(el => el.style.display = 'none');

        const bg = document.getElementById('game-bg');
        bg.style.backgroundImage = `url('bg/${place.img}')`;
        bg.classList.add('trip-blur');

        const tripStartMsg = `[유람] ${place.name}(으)로 유람을 떠납니다. ${place.startLog}`;
        addLog(tripStartMsg, false);

        setTimeout(() => {
            const firstLog = document.querySelector('.log-container .log-entry');
            if (firstLog) firstLog.classList.add('log-special');
        }, 10);

        checkTripLoop();
    }

    function checkTripLoop() {
        if (!gameData.tripInfo) return;

        const now = Date.now();
        const info = gameData.tripInfo;

        if (now >= info.endTime) {
            finishTrip();
            return;
        }

        isOnTrip = true;

        const place = tripDB[info.placeKey];
        const bg = document.getElementById('game-bg');

        if (!bg.style.backgroundImage.includes(place.img)) {
            bg.style.backgroundImage = `url('bg/${place.img}')`;
            bg.classList.add('trip-blur');
            document.querySelectorAll('.character-sprite').forEach(el => el.style.display = 'none');
            updateBgmStatus();
        }

        const nextLogTime = Math.random() * 4000 + 3000;

        setTimeout(() => {
            if (!gameData.tripInfo) return;

            const randomLog = place.midLogs[Math.floor(Math.random() * place.midLogs.length)];
            addLog(`[유람] ${randomLog}`);

            checkTripLoop();
        }, nextLogTime);
    }

    function finishTrip() {
        if (!gameData.tripInfo) return;

        const info = gameData.tripInfo;

        isOnTrip = false;
        isInteracting = false;
        gameData.tripInfo = null;
        saveGameData();

        updateBgmStatus();
        const bg = document.getElementById('game-bg');
        bg.classList.remove('trip-blur');
        document.querySelectorAll('.character-sprite').forEach(el => el.style.display = 'flex');

        if (!gameData.visitedTrips.includes(info.placeKey)) {
            gameData.visitedTrips.push(info.placeKey);
            saveGameData();
        }

        const receiverName = charData[info.receiver].name;
        addLog(`[유람 완료] 무사히 돌아왔습니다. ${receiverName}님이 선물 <${itemDB[info.gift].name}>을(를) 챙겼습니다.`, true);
        addItem(info.receiver, info.gift);

        setTimeout(() => {
            if (!isInteracting) triggerInteraction();
        }, 1000);

        scheduleNextMove('dangbo');
        scheduleNextMove('chung');
        updateDateUI();
        renderInfoContent();
    }

    function closeTripModal() {
        document.getElementById('trip-modal').classList.remove('open');
    }

    function handleTripButtonClick(isDisabled) {
        if (isDisabled) {
            alert('친밀도가 200 이상이어야 유람을 떠날 수 있습니다!');
        } else {
            openTripModal();
        }
    }


    // ================= 8. 관리자/디버그 기능 =================
    function toggleDebugMenu() {
        const modal = document.getElementById('debug-modal');
        modal.classList.toggle('open');
        if (modal.classList.contains('open')) {
            document.getElementById('debug-month').value = gameDate.month;
            document.getElementById('debug-day').value = gameDate.day;
        }
    }

    function warpDate() {
        const m = parseInt(document.getElementById('debug-month').value);
        const d = parseInt(document.getElementById('debug-day').value);
        if (isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 30) {
            alert("날짜를 정확히 입력해주세요!");
            return;
        }
        gameDate.month = m;
        gameDate.day = d;
        localStorage.setItem('savedGameDate', JSON.stringify(gameDate));
        updateDateUI();
        addLog(`[시스템] ⚙️ 관리자 권한으로 시간을 ${m}월 ${d}일로 돌렸습니다.`, true);
        toggleDebugMenu();
    }

    function resetGameData() {
        if (!confirm("정말 초기화하시겠습니까?\n모든 데이터가 삭제되고 새로고침됩니다.")) return;

        localStorage.removeItem('savedGameDate');
        localStorage.removeItem('hapsa_game_logs');
        localStorage.removeItem('hapsa_char_settings');

        alert("초기화 완료! 처음부터 다시 시작합니다.");
        location.reload();
    }

    function addDebugIntimacy() {
        charData['dangbo'].intimacy += 200;
        charData['chung'].intimacy += 200;

        checkMilestones('dangbo');
        checkMilestones('chung');

        saveCharacterSettings(true);
        renderInfoContent();

        addLog(`[디버그] 관리자 권한으로 친밀도가 200 증가했습니다.`, true);
        alert("친밀도가 200 추가되었습니다!");
    }


    // ================= 10. BGM 시스템 (유튜브 버전) =================

    const bgmIds = {
        spring: "vwrjDNeiIQA",
        summer: "noazF7LeCTA",
        autumn: "sxG45y_2_8c",
        winter: "wepNc69Dos4",
        trip: "WcztU41Fo-8"
    };

    let ytPlayer = null;
    let currentBgmKey = null;
    let isBgmEnabled = true;

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = function () {
        ytPlayer = new YT.Player('youtube-bgm-player', {
            height: '0',
            width: '0',
            playerVars: {
                'playsinline': 1,
                'controls': 0,
                'loop': 1,
                'disablekb': 1
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    };

    function onPlayerReady(event) {
        ytPlayer.setVolume(30);
        updateBgmStatus();
    }

    function onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.ENDED) {
            ytPlayer.playVideo();
        }
    }

    function playBgm(key) {
        if (!ytPlayer || !ytPlayer.loadVideoById || currentBgmKey === key) return;

        const videoId = bgmIds[key];
        if (!videoId) return;

        currentBgmKey = key;

        ytPlayer.loadVideoById({
            videoId: videoId,
            startSeconds: 0,
            suggestedQuality: 'small'
        });

        if (isBgmEnabled) {
            ytPlayer.playVideo();
            console.log(`[BGM] 유튜브 재생 시작: ${key}`);

            const btn = document.getElementById('bgm-toggle-btn');
            const icon = document.getElementById('bgm-icon');
            if (btn) btn.classList.add('playing');
            if (icon) icon.innerText = '🔊';
        }
    }

    window.toggleBgm = function () {
        if (!ytPlayer || !ytPlayer.playVideo) return;

        isBgmEnabled = !isBgmEnabled;

        const btn = document.getElementById('bgm-toggle-btn');
        const icon = document.getElementById('bgm-icon');

        if (isBgmEnabled) {
            ytPlayer.playVideo();
            addLog("[시스템] 🎵 배경음악을 켰습니다.", false);
            if (btn) btn.classList.add('playing');
            if (icon) icon.innerText = '🔊';
        } else {
            ytPlayer.pauseVideo();
            addLog("[시스템] 🔇 배경음악을 껐습니다.", false);
            if (btn) btn.classList.remove('playing');
            if (icon) icon.innerText = '🔇';
        }
    };

    function updateBgmStatus() {
        if (isOnTrip) {
            playBgm('trip');
        } else {
            const season = getSeason(gameDate.month);
            playBgm(season);
        }
    }


    // ================= 9. 실행 및 외부 노출 =================
    loadCharacterSettings();
    renderInfoContent();
    initCharacters();
    updateDateUI();
    updateTime();
    restoreLogs();

    window.selectCharacter = selectCharacter;
    window.addItem = addItem;
    window.useItem = useItem;
    window.switchTab = switchTab;
    window.toggleInfoPanel = toggleInfoPanel;
    window.saveCharacterSettings = saveCharacterSettings;
    window.updateCharSetting = updateCharSetting;
    window.toggleDebugMenu = toggleDebugMenu;
    window.warpDate = warpDate;
    window.resetGameData = resetGameData;
    window.editRelDesc = editRelDesc;
    window.saveRelDesc = saveRelDesc;
    window.selectInventoryItem = selectInventoryItem;
    window.openTripModal = openTripModal;
    window.startTrip = startTrip;
    window.closeTripModal = closeTripModal;
    window.addDebugIntimacy = addDebugIntimacy;
    window.handleTripButtonClick = handleTripButtonClick;
});