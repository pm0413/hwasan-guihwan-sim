document.addEventListener("DOMContentLoaded", function () {

    // ================= 1. 설정 및 상수 정의 =================

    // 관계 단계 설정
    const REL_LEVELS = {
        intimacy: [
            {
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
        affection: [
            {
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

    // 성격 목록
    const personalityList = ["능글맞음", "무던함", "질투많음"];

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


    // [수정된 아이템 획득 함수]
    function addItem(charId, itemId, count = 1) {
        const char = charData[charId];
        if (!char) return;

        // 1. 현재 이 아이템을 몇 개 가지고 있는지 셉니다.
        const currentCount = char.inventory.filter(id => id === itemId).length;

        // 2. 최대 10개까지만 가질 수 있게 제한 (이미 10개면 획득 불가)
        if (currentCount >= 10) {
            addLog(`[시스템] ${char.name}님의 가방이 꽉 차서 <${itemDB[itemId].name}>을(를) 더 가질 수 없습니다.`, true);
            return;
        }

        // 3. 10개를 넘지 않는 선에서 추가할 수 있는 개수 계산
        const addableCount = Math.min(count, 10 - currentCount);

        // 4. 개수만큼 인벤토리 배열에 아이템 ID(문자열)를 밀어 넣음
        for (let i = 0; i < addableCount; i++) {
            char.inventory.push(itemId);
        }

        // 5. 로그 및 저장
        const itemInfo = itemDB[itemId];
        //addLog(`[획득] ${char.name}님이 <${itemInfo ? itemInfo.name : itemId}>을(를) ${addableCount}개 얻었습니다.`, true);

        saveCharacterSettings(true);
        if (currentUserId === charId && currentTab === 'inventory') renderInfoContent();
    }

    // [아이템 사용 함수]
    function useItem(charId, itemId) {
        const char = charData[charId];
        const idx = char.inventory.indexOf(itemId);

        if (idx > -1) {
            char.inventory.splice(idx, 1);
            const itemInfo = itemDB[itemId];
            //addLog(`[사용]${char.name}님이 <${itemInfo ? itemInfo.name : itemId}>을(를) 사용했습니다.`, true);

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
            trait: "능글맞음",
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
            trait: "무던함",
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
    }

    // [script.js] triggerSpecialEvent 함수 수정
    function triggerSpecialEvent() {
        const season = getSeason(gameDate.month);

        // 1. 공통 이벤트와 현재 계절 이벤트를 합칩니다.
        const commonEvents = specialEventDB.common || [];
        const seasonEvents = specialEventDB[season] || [];
        const allPossibleEvents = [...commonEvents, ...seasonEvents];

        if (allPossibleEvents.length === 0) return;

        // 2. 전체 목록에서 랜덤으로 하나 선택
        const event = allPossibleEvents[Math.floor(Math.random() * allPossibleEvents.length)];

        const popup = document.getElementById('event-popup');
        if (popup) {
            document.getElementById('popup-title').innerText = event.title;
            document.getElementById('popup-desc').innerText = event.log;
            popup.classList.add('show');
            setTimeout(() => popup.classList.remove('show'), 3000);
        }

        // 보라색 스타일로 로그 기록 (이벤트 타이틀 포함)
        addLog(`[${event.title}] ${event.log}`, false, null, 'purple');

        if (event.talk) {
            setTimeout(() => {
                showBubble('dangbo', event.talk.dangbo, 'high');
                setTimeout(() => showBubble('chung', event.talk.chung, 'low'), 1500);
            }, 1000);
        }

        if (event.action) event.action();
    }

    function updateDateUI() {
        // 유람 중이면 배경을 바꾸지 않고 함수를 종료합니다.
        if (isOnTrip) return; // ★ 유람 중이면 배경 업데이트를 건너뜀 (배경 고정)

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
            const traitOptions = personalityList.map(p =>
                `<option value="${p}" ${data.trait === p ? 'selected' : ''}>${p}</option>`
            ).join('');
            const nameTagColor = getContrastYIQ(data.color);

            html = `
            <div style="text-align:center; margin-bottom:20px; padding-bottom:10px; border-bottom:1px solid #eee;">
                <h2 id="char-name-display" class="char-signature-font" style="color:${data.color}; margin-bottom:5px;">${data.name}</h2>
                <span id="char-title-display" class="char-signature-font" style="background:${data.color}; color:${nameTagColor}; padding:3px 8px; border-radius:10px; font-size:0.8rem;">${data.title}</span>
            </div>
            <div style="display:flex; gap:10px; width:100%;">
                <div class="info-box" style="flex:1; margin-bottom:10px;">
                    <span class="info-label">📍 위치 (공/수)</span>
                    <select class="custom-select" onchange="updateCharSetting('position', this.value)">
                        <option value="left" ${data.position === 'left' ? 'selected' : ''}>왼쪽 (공)</option>
                        <option value="right" ${data.position === 'right' ? 'selected' : ''}>오른쪽 (수)</option>
                    </select>
                </div>
                <div class="info-box" style="flex:1; margin-bottom:10px;">
                    <span class="info-label">⚧ 성별</span>
                    <select class="custom-select" onchange="updateCharSetting('gender', this.value)">
                        <option value="남성" ${data.gender === '남성' ? 'selected' : ''}>남성 ♂️</option>
                        <option value="여성" ${data.gender === '여성' ? 'selected' : ''}>여성 ♀️</option>
                    </select>
                </div>
            </div>
            <div class="info-box">
                <span class="info-label">🧠 성격 설정</span>
                <select class="custom-select" onchange="updateCharSetting('trait', this.value)">
                    ${traitOptions}
                </select>
            </div>
            <div class="info-box">
                <span class="info-label">🎨 대표 컬러 설정</span>
                <div style="display:flex; align-items:center; gap:10px;">
                    <input type="color" value="${data.color}" onchange="updateCharSetting('color', this.value)" style="width:50px; height:30px; padding:0; border:none; background:none; cursor:pointer;">
                    <span style="font-size:0.8rem; color:#666;">클릭하여 변경</span>
                </div>
            </div>
            <button class="save-btn" onclick="saveCharacterSettings()">💾 설정 저장하기</button>
            `;

            // 2. 인벤토리 (이모지 적용)
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
                    <div style="text-align:center; width:100%; color:#aaa; font-size:0.85rem;">
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

            html = `<div style="padding:5px;">
                <div style="margin-bottom:5px; font-weight:bold; color:#555;">🎒 소지품 (${uniqueItems.length}/${totalSlots})</div>
                ${detailHtml}
                ${gridHtml}
            </div>`;

            // 3. 관계 (수정 기능 포함, rel 제거됨)
        } else if (currentTab === 'relation') {
            html = `<div style="padding:5px;">`;
            html += `
                <div class="info-box" style="margin-bottom:15px; background:#f9f9f9;">
                    <div style="font-weight:bold; margin-bottom:5px; color:#333;">📊 현재 관계도</div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <span>🤝 친밀도: <b>${data.intimacy}</b></span>
                        <span class="badge-title" style="background:#ddd; padding:2px 6px; border-radius:4px; font-size:0.8rem;">${data.relationshipTitle}</span>
                    </div>
                    ${data.affection > 0 || data.maxAffectionLevelIdx > 0 ? `
                    <div style="display:flex; justify-content:space-between; color:#e91e63;">
                        <span>💕 호감도: <b>${data.affection}</b></span>
                        <span class="badge-love" style="background:#fce4ec; padding:2px 6px; border-radius:4px; font-size:0.8rem;">${data.loveTitle}</span>
                    </div>` : ''}
                </div>
            `;

            if (data.relations) {
                data.relations.forEach((r, idx) => {
                    const displayText = fillTitle(r.desc, data.title);
                    html += `
                    <div class="rel-card">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px dashed #eee; padding-bottom:5px;">
                            <strong style="font-size:1rem;">To. ${r.target}</strong>
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

            // ★ 친밀도 조건 없이 버튼 표시 (400 미만이면 클릭 불가)
            const isDisabled = data.intimacy < 400;
            const btnOpacity = isDisabled ? "0.5" : "1";
            const btnCursor = isDisabled ? "not-allowed" : "pointer";
            const btnText = isDisabled ? `✈️ 유람 보내기 (친밀도 ${data.intimacy}/400)` : `✈️ 유람 보내기 (친밀도 400 소모)`;

            html += `
                <button class="save-btn" 
                    style="background:#673AB7; margin-top:10px; opacity:${btnOpacity}; cursor:${btnCursor};" 
                    onclick="${isDisabled ? "alert('친밀도가 400 이상이어야 유람을 떠날 수 있습니다!')" : "openTripModal()"}"
                    ${isDisabled ? "" : ""}>
                    ${btnText}
                </button>`;
        }
        display.innerHTML = html;
    }

    function saveCharacterSettings(isSilent = false) {
        localStorage.setItem('hapsa_char_settings', JSON.stringify(charData));
        if (!isSilent) {
            // alert("설정이 저장되었습니다."); // 너무 자주 뜨면 주석 처리
        }
    }

    function loadCharacterSettings() {
        const saved = localStorage.getItem('hapsa_char_settings');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.keys(parsed).forEach(key => {
                if (charData[key]) {
                    charData[key].gender = parsed[key].gender;
                    charData[key].trait = parsed[key].trait;
                    if (parsed[key].color) charData[key].color = parsed[key].color;
                    if (parsed[key].position) charData[key].position = parsed[key].position;
                    if (parsed[key].intimacy !== undefined) charData[key].intimacy = parsed[key].intimacy;
                    if (parsed[key].affection !== undefined) charData[key].affection = parsed[key].affection;
                    if (parsed[key].maxIntimacyLevelIdx !== undefined) charData[key].maxIntimacyLevelIdx = parsed[key].maxIntimacyLevelIdx;
                    if (parsed[key].maxAffectionLevelIdx !== undefined) charData[key].maxAffectionLevelIdx = parsed[key].maxAffectionLevelIdx;
                    if (parsed[key].relationshipTitle) charData[key].relationshipTitle = parsed[key].relationshipTitle;
                    if (parsed[key].loveTitle) charData[key].loveTitle = parsed[key].loveTitle;
                    if (parsed[key].inventory) charData[key].inventory = parsed[key].inventory;
                    // 관계 설명 로드 추가
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

    // [로그 함수]
    function addLog(msg, isSpecial = false, customTime = null, type = null) {
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
            d.innerHTML = `<div style="font-weight:bold; font-style:italic; opacity:0.8;">─ ${msg} ─</div>`;
        } else {
            d.className = 'log-entry';

            // 1. 보라색 특수 이벤트 (우선 순위 1번)
            if (type === 'purple') {
                d.style.backgroundColor = "#f3e5f5";
                d.style.borderLeft = "4px solid #9c27b0";
                d.style.color = "#6a1b9a";
            }
            // 2. Love 이벤트 (분홍색)
            else if (msg.includes('[Love 이벤트 발동!]')) {
                d.style.backgroundColor = "#fff0f5";
                d.style.borderLeft = "4px solid #e91e63";
                d.style.color = "#d81b60";
            }
            // 3. 일반 대화 (파란색)
            else if (msg.includes('[대화]')) {
                d.classList.add('log-social');
            }
            // 4. 기타 시스템 로그
            else {
                d.classList.add('log-system');
            }

            const formattedMsg = msg.replace(/\[(.*?)\]/g, '<span style="font-weight:bold;">[$1]</span>');
            d.innerHTML = `<span class="log-time">${timeStr}</span>${formattedMsg}`;
        }

        box.prepend(d);
        if (box.children.length > 50) box.lastChild.remove();

        if (!customTime) {
            gameLogs.push({
                msg,
                isSpecial,
                time: timeStr,
                type: type
            }); // type도 저장
            if (gameLogs.length > 50) gameLogs.shift();
            localStorage.setItem('hapsa_game_logs', JSON.stringify(gameLogs));
        }
    }

    function restoreLogs() {
        gameLogs.forEach(log => {
            // 네 번째 인자로 저장되어 있던 type(purple 등)을 전달합니다.
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
            el.innerHTML = `
                    <div class="bubble" id="bubble-${id}">...</div>
                    <img src="${data.img}" onerror="this.src='https://via.placeholder.com/100?text=${data.name}'">
                    <div style="background:rgba(0,0,0,0.6); color:white; font-size:11px; padding:2px 6px; border-radius:10px; margin-top:5px; font-weight:bold;">${data.name}</div>
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
        if (isOnTrip) return; // 유람 중이면 다음 움직임이나 대화를 예약하지 않음
        // [안전장치] 대화 락이 30초 이상 걸려있으면 강제 해제
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
        isInteracting = true; // 대화 시작 시 잠금 설정

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

    // ================= 6. 대화 및 점수 로직 =================
    function startDialog() {
        const isDangboStarts = Math.random() < 0.5;
        const starterId = isDangboStarts ? 'dangbo' : 'chung';
        const listenerId = isDangboStarts ? 'chung' : 'dangbo';

        const starterData = charData[starterId];
        const listenerData = charData[listenerId];

        let title = "형님";
        if (charData['dangbo'].gender === '여성' && charData['chung'].gender === '여성') title = "언니";
        else if (charData['dangbo'].gender === '남성' && charData['chung'].gender === '여성') title = "누님";
        else if (starterId === 'dangbo') title = "도사 형님";

        let isLoveMode = false;
        if (starterData.affection >= 10 && Math.random() < 0.4) {
            isLoveMode = true;
        }

        let dbSection;
        let starterPers = starterData.trait;
        let listenerPers = listenerData.trait;

        if (isLoveMode && dialogDB.love_interaction && dialogDB.love_interaction[starterId]) {
            const loveDB = dialogDB.love_interaction[starterId];
            if (loveDB[starterPers]) {
                dbSection = loveDB[starterPers];
            } else {
                const defaultTrait = (starterId === 'dangbo') ? "능글맞음" : "무던함";
                dbSection = loveDB[defaultTrait] || loveDB[Object.keys(loveDB)[0]];
            }
        } else {
            isLoveMode = false;
            if (starterId === 'dangbo') {
                dbSection = dialogDB.dangbo_start[starterPers] || dialogDB.dangbo_start["능글맞음"];
            } else {
                dbSection = dialogDB.chung_start[starterPers] || dialogDB.chung_start["무던함"];
            }
        }

        const scenario = dbSection[Math.floor(Math.random() * dbSection.length)];
        const response = scenario.reaction[listenerPers] || scenario.reaction["무던함"];

        showBubble(starterId, fillTitle(scenario.t1, title), starterId === 'dangbo' ? 'high' : 'low');
        if (scenario.action) {
            setTimeout(() => scenario.action(), 500);
        }

        setTimeout(() => {
            showBubble(listenerId, fillTitle(response.t2, title), listenerId === 'dangbo' ? 'high' : 'low');
            if (response.action) {
                setTimeout(() => response.action(), 500);
            }

            if (isLoveMode) {
                addLog(`[Love 이벤트 발동!] 💕 ${fillTitle(response.log, title)}`);
            } else {
                addLog(`[대화] ${fillTitle(response.log, title)}`);
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
    }

    function calculateInteractionScore(charId, isLoveInteraction = false) {
        const char = charData[charId];
        let baseScore = 1;
        if (char.trait === '능글맞음') baseScore = 1.2;
        else if (char.trait === '질투많음') baseScore = 0.8;

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
        if (!dialogDB.solo || !dialogDB.solo[id]) return;

        const lines = dialogDB.solo[id];
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

    // [관계도 수정 기능]
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

    let isOnTrip = false; // 유람 중인지 확인하는 변수

    function openTripModal() {
        const grid = document.getElementById('trip-grid');
        if (!grid) return;
        grid.innerHTML = '';
        Object.keys(tripDB).forEach(key => {
            const place = tripDB[key];
            // 텍스트(span)를 제거하고 이미지만 출력하도록 수정
            grid.innerHTML += `
            <button class="trip-btn" 
                    style="background-image:url('bg/${place.img}'); 
                           background-size: cover; 
                           background-position: center; 
                           border-radius: 8px; 
                           border: 2px solid #ddd; 
                           transition: transform 0.2s;" 
                    onclick="startTrip('${key}')"
                    onmouseover="this.style.transform='scale(1.05)'"
                    onmouseout="this.style.transform='scale(1)'">
            </button>`;
        });
        document.getElementById('trip-modal').classList.add('open');
    }

    function startTrip(placeKey) {
        if (isOnTrip) return;
        const place = tripDB[placeKey];

        // 1. 자원 소모 및 상태 변경
        charData['dangbo'].intimacy -= 400;
        charData['chung'].intimacy -= 400;
        isOnTrip = true;
        isInteracting = true; // 유람 중 대화/이동 방지

        document.getElementById('trip-modal').classList.remove('open');

        // 2. 캐릭터 숨기기 및 유람지 배경 교체 + 블러 추가
        document.querySelectorAll('.character-sprite').forEach(el => el.style.display = 'none');
        const bg = document.getElementById('game-bg'); // 배경 요소 가져오기
        bg.style.backgroundImage = `url('bg/${place.img}')`;
        bg.classList.add('trip-blur'); // ★ 블러 효과 켜기

        // 3. 첫날 황금색 로그 출력
        const tripStartMsg = `[유람] ${place.name}(으)로 유람을 떠납니다. ${place.startLog}`;
        addLog(tripStartMsg, false);

        setTimeout(() => {
            const firstLog = document.querySelector('.log-container .log-entry');
            if (firstLog) firstLog.classList.add('log-special');
        }, 10);

        // 4. 4일간의 여행 기록 로그 (5초 간격)
        for (let i = 1; i <= 4; i++) {
            setTimeout(() => {
                if (!isOnTrip) return;
                const randomLog = place.midLogs[Math.floor(Math.random() * place.midLogs.length)];
                addLog(`[유람] ${randomLog}`);
            }, i * 5000);
        }

        // [script.js] startTrip 함수 내부의 5. 복귀 로직 부분 수정
        setTimeout(() => {
            isOnTrip = false;
            isInteracting = false;

            bg.classList.remove('trip-blur');

            document.querySelectorAll('.character-sprite').forEach(el => {
                el.style.display = 'flex';
            });

            // ★ 수정된 부분: 지정된 receiver가 있으면 그 사람에게, 없으면 기본적으로 청명에게 지급
            const receiverId = place.receiver || 'chung';
            const receiverName = charData[receiverId].name;

            addLog(`[유람 완료] 무사히 돌아왔습니다. ${receiverName}님이 선물 <${itemDB[place.gift].name}>을(를) 챙겼습니다.`, true);

            // 지정된 사람에게 아이템 추가
            addItem(receiverId, place.gift);

            setTimeout(() => {
                if (!isInteracting) triggerInteraction();
            }, 1000);

            scheduleNextMove('dangbo');
            scheduleNextMove('chung');
            updateDateUI();
            renderInfoContent();
        }, 25000);
    }

    function closeTripModal() {
        document.getElementById('trip-modal').classList.remove('open');
    }

    // 버튼 클릭 시 조건 체크 함수
    function handleTripButtonClick(isDisabled) {
        if (isDisabled) {
            alert('친밀도가 400 이상이어야 유람을 떠날 수 있습니다!');
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

        // 1. 저장된 모든 데이터를 삭제합니다.
        localStorage.removeItem('savedGameDate');
        localStorage.removeItem('hapsa_game_logs');
        localStorage.removeItem('hapsa_char_settings'); // ★ 핵심: 이걸 지워야 저장된 빈 가방이 사라집니다.

        // 2. 페이지를 새로고침합니다.
        // (새로고침을 해야 작성하신 코드의 초기 설정(전낭 보유)을 다시 읽어옵니다)
        alert("초기화 완료! 처음부터 다시 시작합니다.");
        location.reload();
    }

    // [script.js] 친밀도 치트 함수 추가
    function addDebugIntimacy() {
        // 당보와 청명 모두에게 400점 추가
        charData['dangbo'].intimacy += 400;
        charData['chung'].intimacy += 400;

        // 단계(칭호) 업데이트 확인
        checkMilestones('dangbo');
        checkMilestones('chung');

        // 변경사항 저장 및 UI 반영
        saveCharacterSettings(true);
        renderInfoContent();

        addLog(`[디버그] 관리자 권한으로 친밀도가 400 증가했습니다.`, true);
        alert("친밀도가 400 추가되었습니다!");
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
