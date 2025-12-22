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
        desc: "멜이라는 이름의 양민이 추천한 만두집의 만두.",
        icon: "🥟", // 구글 아이콘 코드
        type: "consumable" // 소모품
    }
};
