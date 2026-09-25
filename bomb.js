// -----------工具區開始

//地圖初始化工具
function createMap(width, height) {

    const map = [];

    for (let y = 0; y < height; y++) {

        const row = [];

        for (let x = 0; x < width; x++) {

            const isBorder = y === 0 || y === height - 1 || x === 0 || x === width - 1;
            const isWall = y % 2 === 0 && x % 2 === 0;
            if (isBorder || isWall) {
                row.push('#')
            } else {
                row.push(' ')
            }

        }

        map.push(row)
    }

    return map
}

// occupied 預設是一個空陣列，這樣也可以避免萬一沒傳入變數的情況，不會報錯
function pickRandomEmptyCell(map, occupied = []) {
    // 用來儲存空白格
    const emptyCell = [];

    for (let y = 0; y < map.length; y++) {

        for (let x = 0; x < map[y].length; x++) {
            // 判斷是不是已被占用
            const isOccupied = occupied.some(cell => cell.x === x && cell.y === y);
            // 如果該位置是空的而且尚未被占用才將這個數值儲存到 emptyCell
            if (map[y][x] === " " && !isOccupied) {
                emptyCell.push({ x, y })
            }
        }
    }

    const randomIndex = Math.floor(Math.random() * emptyCell.length);
    return emptyCell[randomIndex]
}

function createBoxes(map, boxesNum, occupied = []) {

    // 用來儲存箱子們的座標
    let boxes = [];

    // 找到所有的空格
    const emptyCell = [];

    for (let y = 0; y < map.length; y++) {

        for (let x = 0; x < map[y].length; x++) {
            // 判斷是不是已被占用
            const isOccupied = occupied.some(cell => cell.x === x && cell.y === y);
            // 如果該位置是空的而且尚未被占用才將這個數值儲存到 emptyCell
            if (map[y][x] === " " && !isOccupied) {
                emptyCell.push({ x, y })
            }
        }
    }

    // 隨機選 10 個位置
    for (let i = emptyCell.length - 1; i > 0; i--) { // 這裡是由大到小遞減的迴圈
        const j = Math.floor(Math.random() * (i + 1)); // 隨機在小於等於 i 的範圍內選一個數字
        [emptyCell[i], emptyCell[j]] = [emptyCell[j], emptyCell[i]]; // 兩者交換
    }

    // 存進 boxes，這裡要記得帶入 boxesNum
    boxes = emptyCell.slice(0, boxesNum);

    return boxes;
}

//渲染畫面
function render() {

    if(
        (player.x=== enemy1.x && player.y === enemy1.y) || 
        (player.x=== enemy2.x && player.y === enemy2.y) || 
        (player.x=== enemy3.x && player.y === enemy3.y)
    ) {
        HP -= 1;
    }

    // 原本的渲染邏輯
    let frame = ''

    for (let y = 0; y < map.length; y++) {
        let row = ''

        for (let x = 0; x < map[y].length; x++) {

            const cell = map[y][x]

            if (explodeCells.some(explodeCell => explodeCell.x === x && explodeCell.y === y)) {
                row += `\x1b[31m*\x1b[0m` // 用紅色 * 來呈現爆炸
            } else if (player.x === x && player.y === y) {
                row += `\x1b[33m@\x1b[0m`
            } else if (enemy1.x === x && enemy1.y === y && enemy1.live === true) {
                row += `\x1b[35m&\x1b[0m`
            } else if (enemy2.x === x && enemy2.y === y && enemy2.live === true) {
                row += `\x1b[35m&\x1b[0m`
            } else if (enemy3.x === x && enemy3.y === y && enemy3.live === true) {
                row += `\x1b[35m&\x1b[0m`
            } else if (boxes.some(box => box.x === x && box.y === y)) {
                row += `\x1b[34mX\x1b[0m`  // 用藍色和 X 來呈現箱子
            } else if (bombs.some(bomb => bomb.x === x && bomb.y === y)) {
                row += `\x1b[31mB\x1b[0m`  // 用紅色和 B 來呈現炸彈
            } else {
                row += `\x1b[32m${cell}\x1b[0m`
            }

        }

        frame += row + '\n'
    }

    process.stdout.write(`\x1b[${map.length + 1}A`); // 加上儀表板這一行也要一起重新渲染
    process.stdout.write(`\x1b[31mHP:${HP}\x1b[35m 敵人:${enemyNum}\x1b[0m\n`); // 儀表版
    process.stdout.write(frame); // 印出畫面
 
    // 勝負判定
    if (HP <= 0) {
        process.stdout.write("\n失去所有HP，遊戲結束\n");
        process.exit();
    }

    if (enemyNum <= 0) {
        process.stdout.write("\n所有敵人都被消滅，恭喜獲勝\n");
        process.exit();
    }

}

function movePlayer(dx, dy) {
    // 藉由傳入的 dx 和 dy 來定位下一個座標，這樣我們就知道要往哪邊走
    const nextX = player.x + dx; // 下一個 x  
    const nextY = player.y + dy; // 下一個 y 

    // 找到是誰位於下一個位置，記錄下來(這邊用傳參考的方式，所以修改 firstBox 也會修改到原始值)
    const hasBox = boxes.find(box => box.x === nextX && box.y === nextY);
    const hasBomb = bombs.some(bomb => bomb.x === nextX && bomb.y === nextY);

    // 玩家可以離開剛放下炸彈的格子，但不能再走進任何炸彈格。
    if (hasBomb) {
        return;
    }

    // 前面沒有箱子
    if (!hasBox) {
        // 如果前方也是空的
        if (map[nextY][nextX] === ' ') {
            player.x = nextX; // player 的座標移動到下一個位置
            player.y = nextY;
        }
        return; // 截斷函式不往下跑
    }
}

function putBomb(map) {
    let bombX = player.x;
    let bombY = player.y;
    const hasBomb = bombs.some(bomb => bomb.x === bombX && bomb.y === bombY);

    if (hasBomb) {
        return;
    }

    const explodeAt = Date.now() + 3000;
    const bomb = { x: bombX, y: bombY, explodeAt };
    bombs.push(bomb)

    setTimeout(() => explodeBomb(map, bomb), 3000);
}

function explodeBomb(map, bomb) {
    const { x: bombX, y: bombY } = bomb;
    // 找出影響範圍座標
    const surroundingCells = [
        { x: bombX, y: bombY },
        { x: bombX - 1, y: bombY },
        { x: bombX + 1, y: bombY },
        { x: bombX, y: bombY - 1 },
        { x: bombX, y: bombY + 1 },
    ]

    // 扣除牆壁
    for (let i = 0; i < surroundingCells.length; i++) {
        const thisX = surroundingCells[i].x;
        const thisY = surroundingCells[i].y;

        if (map[thisY][thisX] !== '#') {
            explodeCells.push(surroundingCells[i])
        }
    }

    render();

    // 有玩家的處理
    const hasPlayer = surroundingCells.find(cell => cell.x === player.x && cell.y === player.y);
    if (hasPlayer) {
        HP -= 1;
    }

    // 有敵人的處理
    const hasEnemy1 = surroundingCells.find(cell => cell.x === enemy1.x && cell.y === enemy1.y);
    const hasEnemy2 = surroundingCells.find(cell => cell.x === enemy2.x && cell.y === enemy2.y);
    const hasEnemy3 = surroundingCells.find(cell => cell.x === enemy3.x && cell.y === enemy3.y);
    if (hasEnemy1) {
        enemy1.live = false;
    }
    if (hasEnemy2) {
        enemy2.live = false;
    }
    if (hasEnemy3) {
        enemy3.live = false;
    }
    enemyNum = [enemy1, enemy2, enemy3].filter(enemy => enemy.live === true).length;

    // 逐一篩選這顆炸彈的爆炸範圍
    for (let i = 0; i < surroundingCells.length; i++) {
        explodeCells = explodeCells.filter(cell => cell !== surroundingCells[i]);
        boxes = boxes.filter(box => !(box.x === surroundingCells[i].x && box.y === surroundingCells[i].y));
    }

    // 清除炸彈
    bombs = bombs.filter(item => item !== bomb);

    setTimeout(() => render(), 1000);
}

function moveEnemy(map, boxes, enemy, player,bombs,explodeCells) {

    // 計算並重新賦予座標
    if (enemy === enemy1) {
        enemy1 = pickNextEnemy1(map, boxes, enemy1, bombs);
    }

    if (enemy === enemy2) {
        enemy2 = pickNextEnemy2(map, boxes, enemy2, player, bombs);
    }

    if (enemy === enemy3) {
        enemy3 = pickNextEnemy3(map, boxes, enemy3, player,bombs,explodeCells);
    }
}

function pickNextEnemy1(map, boxes, enemy, bombs = []) {
    const enemyX = enemy.x;
    const enemyY = enemy.y;
    let allowCell = [];
    
    // 找出周圍的座標
    const surroundingCells = [
        { x: enemyX - 1, y: enemyY },
        { x: enemyX + 1, y: enemyY },
        { x: enemyX, y: enemyY - 1 },
        { x: enemyX, y: enemyY + 1 },
    ]

    // 找到可前進的選項
    for (let i = 0; i < surroundingCells.length; i++) {
        const thisX = surroundingCells[i].x;
        const thisY = surroundingCells[i].y;
        const isWall = map[thisY][thisX] === '#';
        const isBox = boxes.find(box => box.x === thisX && box.y === thisY);
        const isBomb = bombs.some(bomb => bomb.x === thisX && bomb.y === thisY);

        if (!isWall && !isBox && !isBomb) {
            allowCell.push(surroundingCells[i])
        }
    }

    if (allowCell.length === 0) {
        return { ...enemy };
    }

    const randomIndex = Math.floor(Math.random() * allowCell.length);
    return { ...allowCell[randomIndex], live: enemy.live };
}

function pickNextEnemy2(map, boxes, enemy, target, bombs = []) {
    // queue 內除了目前座標，也記錄從 enemy 出發時走的第一步
    const queue = [{ x: enemy.x, y: enemy.y, firstStep: null }];
    const visited = new Set([`${enemy.x},${enemy.y}`]);

    while (queue.length > 0) {
        const current = queue.shift();

        // BFS 第一次抵達目標時，走過的路徑一定是最短路徑
        if (current.x === target.x && current.y === target.y) {
            return current.firstStep
                ? { ...current.firstStep, live: enemy.live }
                : { ...enemy };
        }

        const surroundingCells = [
            { x: current.x - 1, y: current.y },
            { x: current.x + 1, y: current.y },
            { x: current.x, y: current.y - 1 },
            { x: current.x, y: current.y + 1 },
        ];

        for (const cell of surroundingCells) {
            const key = `${cell.x},${cell.y}`;
            const isOutsideMap =
                cell.y < 0 || cell.y >= map.length ||
                cell.x < 0 || cell.x >= map[cell.y].length;

            if (isOutsideMap || visited.has(key)) {
                continue;
            }

            const isWall = map[cell.y][cell.x] === '#';
            const isBox = boxes.some(box => box.x === cell.x && box.y === cell.y);
            const isBomb = bombs.some(bomb => bomb.x === cell.x && bomb.y === cell.y);

            if (isWall || isBox || isBomb) {
                continue;
            }

            visited.add(key);
            queue.push({
                ...cell,
                firstStep: current.firstStep || cell,
            });
        }
    }

    // 找不到通往玩家的路徑時，enemy2 留在原地
    return { ...enemy };
}

function pickNextEnemy3(map, boxes, enemy, target, bombs = [], explodeCells = []) {
    const startKey = `${enemy.x},${enemy.y}`;
    const targetKey = `${target.x},${target.y}`;
    const distances = new Map([[startKey, 0]]);
    const firstSteps = new Map([[startKey, null]]);
    const visited = new Set();
    const queue = [{ x: enemy.x, y: enemy.y, distance: 0 }];

    // 炸彈所在格及上下左右是即將爆炸的危險區域。
    const dangerCells = new Set(
        explodeCells.map(cell => `${cell.x},${cell.y}`)
    );

    for (const bomb of bombs) {
        const blastCells = [
            { x: bomb.x, y: bomb.y },
            { x: bomb.x - 1, y: bomb.y },
            { x: bomb.x + 1, y: bomb.y },
            { x: bomb.x, y: bomb.y - 1 },
            { x: bomb.x, y: bomb.y + 1 },
        ];

        for (const cell of blastCells) {
            const isInsideMap =
                cell.y >= 0 && cell.y < map.length &&
                cell.x >= 0 && cell.x < map[cell.y].length;

            if (isInsideMap && map[cell.y][cell.x] !== '#') {
                dangerCells.add(`${cell.x},${cell.y}`);
            }
        }
    }

    while (queue.length > 0) {
        // 取出目前距離最短的節點，這是 Dijkstra 的核心步驟。
        let nearestIndex = 0;
        for (let i = 1; i < queue.length; i++) {
            if (queue[i].distance < queue[nearestIndex].distance) {
                nearestIndex = i;
            }
        }

        const current = queue.splice(nearestIndex, 1)[0];
        const currentKey = `${current.x},${current.y}`;

        if (visited.has(currentKey)) {
            continue;
        }
        visited.add(currentKey);

        if (currentKey === targetKey) {
            const firstStep = firstSteps.get(currentKey);
            return firstStep
                ? { ...firstStep, live: enemy.live }
                : { ...enemy };
        }

        const surroundingCells = [
            { x: current.x - 1, y: current.y },
            { x: current.x + 1, y: current.y },
            { x: current.x, y: current.y - 1 },
            { x: current.x, y: current.y + 1 },
        ];

        for (const cell of surroundingCells) {
            const cellKey = `${cell.x},${cell.y}`;
            const isOutsideMap =
                cell.y < 0 || cell.y >= map.length ||
                cell.x < 0 || cell.x >= map[cell.y].length;

            if (isOutsideMap || visited.has(cellKey)) {
                continue;
            }

            const isWall = map[cell.y][cell.x] === '#';
            const isBox = boxes.some(box => box.x === cell.x && box.y === cell.y);
            const isBomb = bombs.some(bomb => bomb.x === cell.x && bomb.y === cell.y);

            if (isWall || isBox || isBomb) {
                continue;
            }

            // 一般格成本為 1；危險格提高成本，讓 enemy 優先繞路。
            const moveCost = dangerCells.has(cellKey) ? 50 : 1;
            const newDistance = current.distance + moveCost;

            if (newDistance < (distances.get(cellKey) ?? Infinity)) {
                distances.set(cellKey, newDistance);
                firstSteps.set(
                    cellKey,
                    firstSteps.get(currentKey) || { x: cell.x, y: cell.y }
                );
                queue.push({ ...cell, distance: newDistance });
            }
        }
    }

    // 找不到通往玩家的路徑時，enemy 留在原地。
    return { ...enemy };
}

// -----------工具區結束
// -----------邏輯區開始

// 執行地圖初始化並計算出 map 
const map = createMap(15, 9);

// 遊戲物件區
let player = pickRandomEmptyCell(map);
let enemy1 = { ...pickRandomEmptyCell(map, [player]), live: true };
let enemy2 = { ...pickRandomEmptyCell(map, [player, enemy1]), live: true };
let enemy3 = { ...pickRandomEmptyCell(map, [player, enemy1, enemy2]), live: true };
const enemies = [enemy1, enemy2, enemy3];
let enemyNum = enemies.filter(enemy => enemy.live === true).length;
let boxes = createBoxes(map, 10, [player, enemy1, enemy2, enemy3]);
let HP = 3;
let bombs = []; // 尚未爆炸的炸彈
let explodeCells = []; // 爆炸中的格子

//初次渲染先推出固定的行數
process.stdout.write("\n".repeat(map.length + 1));
render();

// 監聽器前置設定
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.setRawMode(true);
// 接收到這些狀況的時候被觸發，'data' 指有新資料進來的時候
process.stdin.on('data', (key) => {

    // 如果按下字母 q 或是 Q，退出遊戲
    if (key === 'q' || key === 'Q') {
        console.log("\n遊戲結束，謝謝遊玩！");
        process.exit();
    }

    // 如果按下 Ctrl + C 強制退出遊戲
    if (key === '\x03') {
        process.exit();
    }

    // 按下空白鍵放炸彈
    if (key === ' ') {
        putBomb(map)
    }

    // 四個方向
    if (key === '\x1b[A') {
        movePlayer(0, -1)
    }
    if (key === '\x1b[B') {
        movePlayer(0, 1)
    }
    if (key === '\x1b[C') {

        movePlayer(1, 0)
    }
    if (key === '\x1b[D') {
        movePlayer(-1, 0)
    }

    // 重新渲染
    render();


});

// 敵人移動
setInterval(() => {
    // 當炸彈已到爆炸時間時，先讓爆炸的 callback 完成傷害判定，
    // 避免同時到期的敵人移動 callback 先改變敵人位置。
    const hasDueBomb = bombs.some(bomb => bomb.explodeAt <= Date.now());
    if (hasDueBomb) {
        return;
    }

    moveEnemy(map, boxes, enemy1, player, bombs, explodeCells);
    moveEnemy(map, boxes, enemy2, player, bombs, explodeCells);
    moveEnemy(map, boxes, enemy3, player, bombs, explodeCells);

    // 渲染
    render();
}, 1000);
