//地圖初始化
function createMap(width, height, walls = []) {
    // 一樣先有一個陣列來儲存整個地圖
    const map = [];

    // 熟悉的雙層迴圈，這次是直接用寬高的數值來計算
    for (let y = 0; y < height; y++) {

        // 用來記錄這一行的每一個座標
        const row = [];

        for (let x = 0; x < width; x++) {

            // 判斷是不是牆壁
            const isWall = walls.find(wall => x === wall.x && y === wall.y);
            if (isWall) {
                row.push('#')
            } else {
                row.push(' ')
            }

        }

        map.push(row)
    }

    return map
}

function createVillage() {
    let walls = [];
    let npc;
    let exit;

    // 之後換地圖只要改這裡
    const village = [
        '##############################',
        '#           ##               #',
        '#           ##    ##         #',
        '#           ## P  ##         #',
        '#     ##    ########   ##    #',
        '#     ##               ##   %#',
        '#     ##         ########    #',
        '#     ##         ##          #',
        '##############################',
    ]

    for (let y = 0; y < village.length; y++) {

        for (let x = 0; x < village[y].length; x++) {

            if (village[y][x] === '#') {
                walls.push({ x: x, y: y })

            }
            if (village[y][x] === 'P') {
                npc = { x, y }
            }
            if (village[y][x] === '%') {
                exit = { x, y }
            }
        }

    }


    return { walls, npc, exit };
}

function createForest() {
    let walls = [];
    let trees = [];
    let herbs = [];
    let exit;

    // 之後換地圖只要改這裡
    const forest = [
        '##############################',
        '#           TTT  H           #',
        '#           TTTTT   H        #',
        '#              TTTT    TTT   #',
        '#     T     TTTTT      TTT   #',
        '#%    TT               TTT   #',
        '#     TTT H      TTTTTH      #',
        '#     TTTT       TTT         #',
        '##############################',
    ]

    for (let y = 0; y < forest.length; y++) {

        for (let x = 0; x < forest[y].length; x++) {

            if (forest[y][x] === '#') {
                walls.push({ x: x, y: y })

            }
            if (forest[y][x] === 'T') {
                trees.push({ x: x, y: y })
            }
            if (forest[y][x] === 'H') {
                herbs.push({ x: x, y: y, status: 'floor' })
            }
            if (forest[y][x] === '%') {
                exit = { x, y }
            }
        }

    }


    return { walls, trees, herbs, exit };
}

function movePlayer(map, dx, dy) {
    // 藉由傳入的 dx 和 dy 來定位下一個座標，這樣我們就知道要往哪邊走
    const nextX = player.x + dx; // 下一個 x  
    const nextY = player.y + dy; // 下一個 y 
    const isTree = trees.some(tree => tree.x === nextX && tree.y === nextY);

    if (currentMap === "forest" && isTree) {
        return;
    }

    if (map[nextY][nextX] === ' ') {
        player.x = nextX; // player 的座標移動到下一個位置
        player.y = nextY;
    }
}

function resetCameraVertex(map) {
    // 先讓玩家位於畫面中央，再把相機限制在地圖範圍內。
    const maxCameraX = Math.max(0, map[0].length - viewWidth);
    const maxCameraY = Math.max(0, map.length - viewHeight);

    cameraVertex.x = Math.max(
        0,
        Math.min(player.x - Math.floor(viewWidth / 2), maxCameraX)
    );
    cameraVertex.y = Math.max(
        0,
        Math.min(player.y - Math.floor(viewHeight / 2), maxCameraY)
    );
}

function openNPCTalk() {
    const NPCX = npc.x;
    const NPCY = npc.y;

    const surroundingCells = [
        { x: NPCX, y: NPCY },
        { x: NPCX - 1, y: NPCY },
        { x: NPCX + 1, y: NPCY },
        { x: NPCX, y: NPCY - 1 },
        { x: NPCX, y: NPCY + 1 },
    ]

    const isNext = surroundingCells.some(cell => (cell.x === player.x && cell.y === player.y))

    if (isNext && (npcStatus === 'notStarted' || npcStatus === 'getTask')) {

        // 是的話就清除畫面
        process.stdout.write(`\x1b[${viewHeight}A`); // 上移游標
        process.stdout.write('\x1b[J'); // 清除畫面
        process.stdout.write("\n".repeat(firstTalk.length));//推出空間

        // 顯示對話畫面

        let frame = '';

        if (npcStatus === 'notStarted') {

            npcStatus = 'firstTalk';

            for (let i = 0; i < firstTalk.length; i++) {
                frame += firstTalk[i] + '\n'
            }

            process.stdout.write(`\x1b[${firstTalk.length}A`);//上移游標

        } else if (npcStatus === 'getTask') {

            npcStatus = 'thirdTalk';

            for (let i = 0; i < thirdTalk.length; i++) {
                if (bag < 3 && i === 4) {
                    continue;
                }
                frame += thirdTalk[i] + '\n'
            }

            process.stdout.write(`\x1b[${thirdTalk.length}A`);//上移游標

        }

        process.stdout.write(frame);//印出

    }

}

function pushNPCStatus() {
    if (npcStatus === "firstTalk") {
        npcStatus = "secondTalk";
        // 清除畫面
        process.stdout.write(`\x1b[${firstTalk.length}A`); // 上移游標
        process.stdout.write('\x1b[J'); // 清除畫面
        process.stdout.write("\n".repeat(secondTalk.length));//推出空間

        // 顯示對話畫面

        let frame = '';
        for (let i = 0; i < secondTalk.length; i++) {
            frame += secondTalk[i] + '\n'
        }

        process.stdout.write(`\x1b[${secondTalk.length}A`);//上移游標
        process.stdout.write(frame);//印出


    } else if (npcStatus === "secondTalk") {
        npcStatus = "getTask";
        task += 1;

        // 清除畫面
        process.stdout.write(`\x1b[${secondTalk.length}A`); // 上移游標
        process.stdout.write('\x1b[J'); // 清除畫面
        process.stdout.write('\n'.repeat(viewHeight));//推出空間
        render();
    } else if (npcStatus === "thirdTalk") {

        if (bag.content.herbs.num < 3) {
            return;
        }

        npcStatus = "forthTalk";
        bag.content.herbs.num -= 3;

        // 清除畫面
        process.stdout.write(`\x1b[${thirdTalk.length}A`); // 上移游標
        process.stdout.write('\x1b[J'); // 清除畫面
        process.stdout.write("\n".repeat(fourthTalk.length));//推出空間

        // 顯示對話畫面

        let frame = '';
        for (let i = 0; i < fourthTalk.length; i++) {
            frame += fourthTalk[i] + '\n'
        }

        process.stdout.write(`\x1b[${fourthTalk.length}A`);//上移游標
        process.stdout.write(frame);//印出
    } else if (npcStatus === "forthTalk") {
        npcStatus = "complete";
        task -= 1;
        bag.content.chickenSoup.num += 1;

        // 清除畫面
        process.stdout.write(`\x1b[${fourthTalk.length}A`); // 上移游標
        process.stdout.write('\x1b[J'); // 清除畫面
        process.stdout.write('\n'.repeat(viewHeight));//推出空間
        render();
    }
}

function pickUpHerbs() {

    for (let i = 0; i < herbs.length; i++) {
        const herbX = herbs[i].x;
        const herbY = herbs[i].y;

        const surroundingCells = [
            { x: herbX, y: herbY },
            { x: herbX - 1, y: herbY },
            { x: herbX + 1, y: herbY },
            { x: herbX, y: herbY - 1 },
            { x: herbX, y: herbY + 1 },
        ]

        const isNext = surroundingCells.some(cell => (cell.x === player.x && cell.y === player.y))

        if (isNext && herbs[i].status === 'floor') {
            herbs[i].status = 'bag';
            bag.content.herbs.num += 1;
        }
    }

}

function putDownHerbs() {
    // 找到第一個 status 為 bag 的項目
    let hasHerb = herbs.find(herb => herb.status === 'bag');

    // 修改狀態、背包
    hasHerb.x = player.x;
    hasHerb.y = player.y;
    hasHerb.status = 'floor';
    bag.content.herbs.num -= 1;
}

function showBag() {
    // 計算背包畫面需要多少空間
    const bagHeight = 2 + Object.keys(bag.content).length;

    if (bag.status === 'close') {
        bag.status = 'open'
        // 清除畫面
        process.stdout.write(`\x1b[${viewHeight}A`); // 上移游標
        process.stdout.write('\x1b[J'); // 清除畫面
        const itemLines = Object.values(bag.content)
            .map(item => `${item.name} ${item.num}`);

        const frame = [
            '背包',
            '--------',
            ...itemLines,
        ].join('\n') + '\n';

        process.stdout.write("\n".repeat(bagHeight));//推出空間
        process.stdout.write(`\x1b[${bagHeight}A`); //上移游標
        process.stdout.write(frame);//印出
    } else if (bag.status === 'open') {
        bag.status = 'close';
        // 清除畫面
        process.stdout.write(`\x1b[${bagHeight}A`); // 上移游標
        process.stdout.write('\x1b[J'); // 清除畫面
        process.stdout.write('\n'.repeat(viewHeight));
        render();
    }

}

//渲染畫面
function render() {

    if (npcStatus === 'firstTalk' || npcStatus === 'secondTalk' || npcStatus === 'thirdTalk' || npcStatus === 'forthTalk') {
        return;
    }

    //儲存整個畫面的字串
    let frame = ''

    if (currentMap === 'village') {

        // 每次開始 render 前先重算一次
        resetCameraVertex(villageMap);
        const canvaMinX = cameraVertex.x;
        const canvaMaxX = cameraVertex.x + viewWidth - 1;
        const canvaMinY = cameraVertex.y;
        const canvaMaxY = cameraVertex.y + viewHeight - 1;

        for (let y = 0; y < villageMap.length; y++) {

            if (y < canvaMinY || y > canvaMaxY) {
                continue;
            }

            let row = ''

            for (let x = 0; x < villageMap[y].length; x++) {

                if (x < canvaMinX || x > canvaMaxX) {
                    continue;
                }

                // 小優化，把常用的寫法儲存成變數
                const cell = villageMap[y][x]

                if (player.x === x && player.y === y) {
                    row += `\x1b[33m@\x1b[0m`
                } else if (npc.x === x && npc.y === y) {
                    row += `\x1b[34mP\x1b[0m`
                } else if (villageExit.x === x && villageExit.y === y) {
                    row += `\x1b[37m%\x1b[0m`
                } else {
                    row += `\x1b[32m${cell}\x1b[0m`
                }

            }

            if (y === canvaMinY) {
                row += ` 任務:${task}`;
            } else if (y === canvaMinY + 1) {
                const bagTotal = Object.values(bag.content)
                    .reduce((total, item) => total + item.num, 0); 
                row += ` 背包:${ bagTotal}`;
            }

            //把這行儲存進去 frame，並記得結尾換行
            frame += row + '\n'
        }

    } else if (currentMap === 'forest') {
        // 每次開始 render 前先重算一次
        resetCameraVertex(forestMap);
        const canvaMinX = cameraVertex.x;
        const canvaMaxX = cameraVertex.x + viewWidth - 1;
        const canvaMinY = cameraVertex.y;
        const canvaMaxY = cameraVertex.y + viewHeight - 1;

        for (let y = 0; y < forestMap.length; y++) {

            if (y < canvaMinY || y > canvaMaxY) {
                continue;
            }

            let row = ''

            for (let x = 0; x < forestMap[y].length; x++) {

                if (x < canvaMinX || x > canvaMaxX) {
                    continue;
                }

                // 小優化，把常用的寫法儲存成變數
                const cell = forestMap[y][x]

                if (player.x === x && player.y === y) {
                    row += `\x1b[33m@\x1b[0m`
                } else if (trees.some(tree => tree.x === x && tree.y === y)) {
                    row += `\x1b[36mT\x1b[0m`
                } else if (herbs.some(herb => herb.x === x && herb.y === y && herb.status === 'floor')) {
                    row += `\x1b[35mH\x1b[0m`
                } else if (forestExit.x === x && forestExit.y === y) {
                    row += `\x1b[37m%\x1b[0m`
                } else {
                    row += `\x1b[32m${cell}\x1b[0m`
                }

            }

            if (y === canvaMinY) {
                row += ` 任務:${task}`;
            } else if (y === canvaMinY + 1) {
                const bagTotal = Object.values(bag.content)
                    .reduce((total, item) => total + item.num, 0); 
                row += ` 背包:${ bagTotal}`;
            }

            //把這行儲存進去 frame，並記得結尾換行
            frame += row + '\n'
        }
    }

    // 一樣先印出來看看結果
    process.stdout.write(`\x1b[${viewHeight}A`);
    process.stdout.write(frame);

}

export function startRPG(backToMenu) {

    //初次渲染
    process.stdout.write("\n".repeat(viewHeight));
    render()

    // stdin 為了節省資源，預設是暫停的，因此我們需要先喚醒才能使用
    process.stdin.resume();
    // 把監聽到的資料轉換成我們看得懂的語言
    process.stdin.setEncoding('utf8');

    // 加入這一段，讓他能正確地把資料傳給 node
    process.stdin.setRawMode(true);

    // 接收到這些狀況的時候被觸發，'data' 指有新資料進來的時候
    function handleRPGInput(key) {

        let map = [];
        let exit;
        if (currentMap === 'village') {
            map = villageMap;
            exit = villageExit;
        } else if (currentMap === 'forest') {
            map = forestMap;
            exit = forestExit;
        }

        // 如果按下字母 'q' 或是 'Q'，就回到選單
        if (key === 'q' || key === 'Q') {
            process.stdout.write(`\x1b[${viewHeight}A`);
            process.stdout.write('\x1b[J');
            backToMenu();
            return;
        }

        // 如果按下 Ctrl + C (在 Raw Mode 下對應的編碼是 '\x03')，這是強制退出遊戲
        if (key === '\x03') {
            process.stdin.setRawMode(false);
            process.exit(130);
        }

        // 按下空白鍵
        if (key === ' ') {
            openNPCTalk();
            return;
        }

        // 按下 A 按鍵
        if ((key === 'a' || key === 'A') && (npcStatus === 'firstTalk' || npcStatus === 'secondTalk' || npcStatus === 'thirdTalk' || npcStatus === 'forthTalk')) {
            pushNPCStatus();
            return;
        }

        // 按下 B 按鍵
        if ((key === 'b' || key === 'B') && (npcStatus === 'firstTalk' || npcStatus === 'secondTalk' || npcStatus === 'thirdTalk')) {
            npcStatus = 'notStarted';

            // 按下 B 後回到遊戲畫面
            process.stdout.write(`\x1b[${firstTalk.length}A`);
            process.stdout.write('\x1b[J');
            process.stdout.write('\n'.repeat(viewHeight));
            render();

            return;
        }

        if ((key === 'f' || key === 'F')) {
            pickUpHerbs();
        }

        if ((key === 'g' || key === 'G')) {
            putDownHerbs();
        }

        if ((key === 'o' || key === 'O')) {
            showBag();
            return;
        }

        // 監聽器內四個方向換上這個邏輯
        if (key === '\x1b[A') {
            movePlayer(map, 0, -1)
        }
        if (key === '\x1b[B') {

            movePlayer(map, 0, 1)
        }
        if (key === '\x1b[C') {

            movePlayer(map, 1, 0)
        }
        if (key === '\x1b[D') {
            movePlayer(map, -1, 0)
        }

        // 重新渲染
        render();

        // player 是否在 % 上
        if (player.x === exit.x && player.y === exit.y) {

            process.stdin.off('data', handleRPGInput);
            // 是的話就清除畫面
            process.stdout.write(`\x1b[${viewHeight}A`);
            process.stdout.write('\x1b[J');

            // 顯示地圖轉換中
            process.stdout.write(`\x1b[32m地圖轉換中...\x1b[0m`);

            setTimeout(() => {
                process.stdout.write('\r'); // 游標回到該行行首
                process.stdout.write('\x1b[J');
                //轉換地圖
                currentMap = currentMap === 'village' ? 'forest' : 'village';
                // 這裡要重新計算 exit 和 map
                if (currentMap === 'village') {
                    map = villageMap;
                    exit = villageExit;
                } else if (currentMap === 'forest') {
                    map = forestMap;
                    exit = forestExit;
                }
                // 指定 player 位置到新的 exit
                player.x = exit.x;
                player.y = exit.y
                process.stdout.write("\n".repeat(viewHeight));
                render()
                process.stdin.on('data', handleRPGInput);
            }, 1000)

        }

    }

    process.stdin.on('data', handleRPGInput);
}


// 玩家
let player = { x: 1, y: 1 };

// 任務與對話
let task = 0;
let bag = {
    status: 'close', //open close
    content: {
        herbs: {
            name: "草藥",
            num: 0,
        },
        chickenSoup: {
            name: '雞湯',
            num: 0,
        }
    }
};
let npcStatus = 'notStarted'; // notStarted -> firstTalk -> secondTalk -> getTask -> thirdTalk ->fourthTalk -> completed
const firstTalk = [
    '村民：',
    '年輕人，我們這裡很久沒有人來了。',
    '',
    '你：',
    'A: 你看起來不舒服，需要幫忙嗎？',
    'B: 看起來是這樣，那我走啦。'
]
const secondTalk = [
    '村民：',
    '是的，我這是老毛病了，你願意到村子外面的森林幫我採點草藥嗎？',
    '',
    '你：',
    'A: 當然可以。',
    'B: 抱歉，我趕時間。'
]
const thirdTalk = [
    '村民：',
    '年輕人，你回來啦？狀況如何？',
    '',
    '你：',
    'A: 我拿到 3 個草藥了。',
    'B: 我還沒去。'
]
const fourthTalk = [
    '村民：',
    '太感謝你了，這是我自己熬煮的雞湯，你帶著路上喝吧。',
    '',
    '你：',
    'A: 謝謝你。'
]


// 村莊物件
const village = createVillage();
const npc = village.npc;
const villageExit = village.exit;
const villageWalls = village.walls;

// 森林物件
const forest = createForest();
const trees = forest.trees;
const herbs = forest.herbs;
const forestExit = forest.exit;
const forestWalls = forest.walls;

//地圖
const villageMap = createMap(30, 9, villageWalls);
const forestMap = createMap(30, 9, forestWalls);

// 當前地圖
let currentMap = 'village';

//視窗大小
let viewWidth = 10;
let viewHeight = 8;

// 相機頂點
let cameraVertex = { x: 0, y: 0 };



startRPG(() => process.exit(0));
