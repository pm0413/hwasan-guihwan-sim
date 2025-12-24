// [item_data.js] 아이템 데이터베이스
// 키(Key)는 영어 ID, 값(Value)은 정보입니다.

const itemDB = {
    "maehwa_sword": {
        name: "매화검",
        desc: "청명이 지니고 다니는 검.",
        icon: "⚔️",
        type: "equip" // 장비
    },
    "chuhonbi": {
        name: "추혼비",
        desc: "당보가 지니고 다니는 비도.",
        icon: "🗡️",
        type: "equip"
    },
    "dukangju": {
        name: "두강주",
        desc: "곡물을 누룩으로 발효시켜 먹는 탁주.",
        icon: "🍶",
        type: "consumable"
    },
    "dang_gwa": {
        name: "당과",
        desc: "화산의 매화틀로 찍어낸 당과.",
        icon: "🥮",
        type: "consumable"
    },
    "raspberry": {
        name: "산딸기",
        desc: "새콤달콤한 산딸기",
        icon: "🍓",
        type: "consumable"
    },
    "anterior_sac": {
        name: "전낭",
        desc: "돈주머니.",
        icon: "💰",
        type: "consumable"
    },
    "jasodan": {
        name: "자소단",
        desc: "화산의 영약.",
        icon: "💮", // 구글 아이콘 코드
        type: "consumable" // 소모품
    },
    "mandu": {
        name: "만두",
        desc: "매애루라는 이름의 양민이 추천한 만두집의 만두.",
        icon: "🥟",
        type: "consumable"
    },
    "sweet_potato": {
        name: "군고구마",
        desc: "맛잇게 잘 익은 군 고구마.",
        icon: "🍠",
        type: "consumable"
    },
    "chestnut": {
        name: "군밤",
        desc: "맛잇게 잘 익은 군밤.",
        icon: "🌰",
        type: "consumable"
    },
    "mandarin": {
        name: "귤",
        desc: "호남의 귤림에서 따온 귤.",
        icon: "🍊", 
        type: "consumable" 
    },
    "honey": {
        name: "유채꿀",
        desc: "운남의 유채꽃밭에서 난 꿀. 엄청 달다!!",
        icon: "🍯",
        type: "consumable"
    },
    "paperweight": {
        name: "산둥성의 벚꽃 문진",
        desc: "청명이 사준 벚꽃 문진. 투명한 유리안에 그날 당보가 손으로 잡았던 벚꽃이 들어가있다.",
        icon: "🌸",
        type: "consumable"
    },
    "Shaoxing_wine": {
        name: "소흥주",
        desc: "낙양 객잔에서 제일 비쌌던 소흥주. 청명이 장문사형에게도 주고 싶다며 챙겼다만.. 과연?",
        icon: "🍾", 
        type: "consumable" 
    },
    "Fresh_Lotus_Seeds": {
        name: "연밥",
        desc: "배 위에서 갓 딴 연밥을 까먹으며 무료함을 달랬다. 쌉쌀하면서도 고소한 맛이 일품이었다.",
        icon: "🪷", 
        type: "consumable" 
    },
    "fan": {
        name: "부채",
        desc: "사공의 노랫소리에 맞춰 당보가 흔들던 부채.",
        icon: "🪭", 
        type: "consumable" 
    },
    "conch": {
        name: "하얀색 고둥",
        desc: "주산열도의 해안가를 걸으며 당보가 주웠던 소라껍질.",
        icon: "🐚", 
        type: "consumable" 
    },
    "hourglass": {
        name: "모래시계",
        desc: "아모이 해안에서 가져온 모래로 당보가 만들어준 모래시계.",
        icon: "⏳", 
        type: "consumable" 
    },
    "Junshan_Silver_Needle": {
        name: "군산은침",
        desc: "호남성 동정호의 군산에서 나는 명차. 청나라 시대에는 황실에 바치는 공차(貢茶)였을 정도로 귀했다.",
        icon: "🍵", 
        type: "consumable" 
    },
    "painting": {
        name: "산수화",
        desc: "아쉬워 하던 당보를 보며 청명이 구해다준 산수화.",
        icon: "📜", 
        type: "consumable" 
    },
    "winter_bell": {
        name: "은색 종",
        desc: "당보가 청명의 안녕을 빌며 소원을 빌었던 작은 종.",
        icon: "🔔", 
        type: "consumable" 
    },
    "Rainy_Day": {
        name: "비오던 날의 기억",
        desc: "나란히 처마 밑에 앉아 들었던 날의 기억",
        icon: "🌧️", 
        type: "consumable" 
    },
    "maple_leaf": {
        name: "단풍잎",
        desc: "당보의 너스레에 청명이 제일 예쁘다며 골라줬던 단풍잎",
        icon: "🍁", 
        type: "consumable" 
    },// [운남 나평]
    "canola_flower": {
        name: "유채꽃",
        desc: "나평의 들판에서 꺾어온 노란 꽃. 당보가 머리에 꽂아주려다 매만 맞았다.",
        icon: "🌼",
        type: "consumable"
    },
    "butterfly": {
        name: "호접몽(나비)",
        desc: "꽃밭을 날아다니던 나비. 잡으려다 놓쳤지만, 그 날갯짓이 기억에 남았다.",
        icon: "🦋",
        type: "consumable"
    },

    // [산둥성]
    "peach_blossom": {
        name: "산벚꽃 가지",
        desc: "노산의 봄을 알리는 분홍빛 꽃가지. 술잔에 띄우니 풍류가 따로 없다.",
        icon: "🌸",
        type: "consumable"
    },
    "liquor_bottle": {
        name: "산동 고량주",
        desc: "목이 타들어가도록 독한 술. 청명이 한 모금 마시고 '캬!' 하며 좋아했다.",
        icon: "🍶",
        type: "consumable"
    },

    // [낙양]
    "peony": {
        name: "낙양 모란",
        desc: "황실의 정원보다 화려하다는 낙양의 모란. 꽃 중의 왕이라 불릴 만하다.",
        icon: "🌺",
        type: "consumable"
    },
    "gemstone": {
        name: "비취 보석",
        desc: "낙양의 시장에서 당보가 '형님 눈동자 색이랑 같습니다'라며 집어 든 보석.",
        icon: "💎",
        type: "consumable"
    },

    // [항주]
    "lotus_flower": {
        name: "서호 연꽃",
        desc: "서호의 물안개 속에서 피어난 연꽃. 진흙 속에서도 맑은 자태를 뽐낸다.",
        icon: "🪷",
        type: "consumable"
    },
    "silk_fan": {
        name: "항주 비단 부채",
        desc: "최고급 항주 비단으로 만든 부채. 펼칠 때마다 은은한 묵향이 난다.",
        icon: "🪭",
        type: "consumable"
    },

    // [강소 태호]
    "pearl": {
        name: "태호 진주",
        desc: "달빛을 머금은 듯 영롱한 빛을 내는 진주. 강남의 부유함이 느껴진다.",
        icon: "🦪",
        type: "consumable"
    },
    "fresh_fish": {
        name: "태호 은어",
        desc: "방금 잡아 올려 비늘이 반짝이는 은어. 횟감으로도, 구이로도 일품이다.",
        icon: "🐟",
        type: "consumable"
    },

    // [절강 주산]
    "coral": {
        name: "붉은 산호",
        desc: "깊은 바다에서 건져 올린 산호. 기묘한 모양이 마치 무림의 기보 같다.",
        icon: "🪸",
        type: "consumable"
    },
    "salt_bag": {
        name: "주산 천일염",
        desc: "바닷바람과 햇살이 만들어낸 소금. 짠내 속에 바다의 활력이 담겨 있다.",
        icon: "🧂",
        type: "consumable"
    },

    // [복건 구랑위]
    "mango": {
        name: "남국 망고",
        desc: "남쪽 나라의 태양을 받고 자란 과일. 한 입 베어 물면 달콤한 즙이 흐른다.",
        icon: "🥭",
        type: "consumable"
    },
    "palm_leaf": {
        name: "야자수 잎",
        desc: "더위를 식히기에 제격인 커다란 잎. 부채 대신 흔들며 해변을 거닐었다.",
        icon: "🌴",
        type: "consumable"
    },

    // [호남 상강]
    "feather": {
        name: "기러기 깃털",
        desc: "상강의 모래톱에 떨어진 가을 기러기의 깃털. 쓸쓸하고도 고즈넉한 정취가 있다.",
        icon: "🪶",
        type: "consumable"
    },
    "red_chili": {
        name: "호남 고추",
        desc: "보기만 해도 땀이 나는 붉은 고추. 당보가 장난삼아 건넸다 호되게 당했다.",
        icon: "🌶️",
        type: "consumable"
    },

    // [광서 계림]
    "bamboo": {
        name: "대나무 조각",
        desc: "이강을 떠다니던 뗏목의 조각. 그 위에서 신선놀음하던 기억이 난다.",
        icon: "🎍",
        type: "consumable"
    },
    "bird_feather": {
        name: "가마우지 깃털",
        desc: "물고기를 잡던 가마우지의 검은 깃털. 강물에 젖어 윤기가 흐른다.",
        icon: "🪶",
        type: "consumable"
    },

    // [안휘 구화산]
    "snow_crystal": {
        name: "눈꽃 결정",
        desc: "구화산 정상에서 손바닥에 내려앉은 눈. 녹아 없어지기 전 찰나의 아름다움.",
        icon: "❄️",
        type: "consumable"
    },
    "prayer_beads": {
        name: "오래된 염주",
        desc: "산사에서 얻은 낡은 염주. 쥐고 있으면 마음이 차분해지는 기분이 든다.",
        icon: "📿",
        type: "consumable"
    },

    // [둘만의 비밀 안가]
    "corn": {
        name: "잘 익은 옥수수",
        desc: "텃밭에서 갓 따서 쪄낸 옥수수. 호호 불어가며 나눠 먹던 소박한 맛.",
        icon: "🌽",
        type: "consumable"
    },
    "wildflower": {
        name: "이름 모를 들꽃",
        desc: "안가 주변에 피어 있던 작은 꽃. 화려하진 않지만 은은한 향이 난다.",
        icon: "🌻",
        type: "consumable"
    },

    // [북경 향산]
    "kite": {
        name: "방패연",
        desc: "북경의 가을 하늘 높이 날렸던 연. 줄을 끊어 액운을 멀리 날려 보냈다.",
        icon: "🪁",
        type: "consumable"
    },
    "old_book": {
        name: "낡은 시집",
        desc: "향산의 정자에서 주운 시집. 가을을 노래한 옛 시인의 구절이 적혀 있다.",
        icon: "📖",
        type: "consumable"
    }
};
