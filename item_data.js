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
    "honey": {
        name: "유채꿀",
        desc: "멜이라는 이름의 양민이 추천한 만두집의 만두.",
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
    "Longjing_Tea": {
        name: "용정차",
        desc: "최고급 용정차. 당보가 청문 진인께 대신 전해달라며 청명에게 건냈다.",
        icon: "🍵", 
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
    "mandarin": {
        name: "귤",
        desc: "호남의 귤림에서 따온 귤. 청명이 당보에게 직접 따주었다.",
        icon: "🍊", 
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
    }
};
