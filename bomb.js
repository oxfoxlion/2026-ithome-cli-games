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

function createBoxes(map,boxesNum, occupied = []) {

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
    for (let i = emptyCell.length -1; i > 0; i --) { // 這裡是由大到小遞減的迴圈
        const j = Math.floor(Math.random() * (i+1)); // 隨機在小於等於 i 的範圍內選一個數字
        [emptyCell[i],emptyCell[j]] = [emptyCell[j],emptyCell[i]]; // 兩者交換
    }

    // 存進 boxes，這裡要記得帶入 boxesNum
    boxes = emptyCell.slice(0,boxesNum);

    return boxes;
}

//渲染畫面
function render() {

    let frame = ''

    for (let y = 0; y < map.length; y++) {
        let row = ''

        for (let x = 0; x < map[y].length; x++) {

            const cell = map[y][x]

            if (player.x === x && player.y === y) {
                row += `\x1b[33m@\x1b[0m`
            }else if (enemy1.x === x && enemy1.y === y) {
                row += `\x1b[35m&\x1b[0m`
            }else if (enemy2.x === x && enemy2.y === y) {
                row += `\x1b[35m&\x1b[0m`
            }else if (enemy3.x === x && enemy3.y === y) {
                row += `\x1b[35m&\x1b[0m`
            }else if (boxes.some(box => box.x === x && box.y === y)) {
                row += `\x1b[34mX\x1b[0m`  // 用藍色和 X 來呈現箱子
            } else {
                row += `\x1b[32m${cell}\x1b[0m`
            }

        }

        frame += row + '\n'
    }

    process.stdout.write(`\x1b[${map.length +1 }A`); // 加上儀表板這一行也要一起重新渲染
    process.stdout.write(`\x1b[31mHP:${HP}\x1b[35m 敵人:${enemyNum}\x1b[0m\n`); // 儀表版
    process.stdout.write(frame); // 印出畫面

}

function movePlayer(dx, dy) {
    // 藉由傳入的 dx 和 dy 來定位下一個座標，這樣我們就知道要往哪邊走
    const nextX = player.x + dx; // 下一個 x  
    const nextY = player.y + dy; // 下一個 y 

    // 找到是誰位於下一個位置，記錄下來(這邊用傳參考的方式，所以修改 firstBox 也會修改到原始值)
    const hasBox = boxes.find(box => box.x === nextX && box.y === nextY);

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

// -----------工具區結束
// -----------邏輯區開始

// 執行地圖初始化並計算出 map 
const map = createMap(15, 9);

// 遊戲物件區
let player = pickRandomEmptyCell(map);
let enemy1 = pickRandomEmptyCell(map,[player]);
let enemy2 = pickRandomEmptyCell(map,[player,enemy1]);
let enemy3 = pickRandomEmptyCell(map,[player,enemy1,enemy2]);
let boxes = createBoxes(map,10,[player,enemy1,enemy2,enemy3]);
let HP = 2;
let enemyNum = 1;

//初次渲染先推出固定的行數
process.stdout.write("\n".repeat(map.length +1));
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


