//地圖初始化
function createMap(width, height) {
    // 一樣先有一個陣列來儲存整個地圖
    const map = [];

    // 熟悉的雙層迴圈，這次是直接用寬高的數值來計算
    for (let y = 0; y < height; y++) {

        // 用來記錄這一行的每一個座標
        const row = [];

        for (let x = 0; x < width; x++) {

            // 判斷是不是邊邊
            const isBorder = y === 0 || y === height - 1 || x === 0 || x === width - 1;
            if (isBorder) {
                row.push('#')
            } else {
                row.push(' ')
            }

        }

        map.push(row)
    }

    return map
}

const map = createMap(7, 7);

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

function boxPicker(map,occupied = []) {
    // 傳給 pickRandomEmptyCell 的變數改用傳進來的值
    let box = pickRandomEmptyCell(map, occupied);
    // 這段是確認這個箱子是否無解的邏輯，不動
    const { top, bottom, left, right, isDeadlock } = checkBox(map, box)
    if (isDeadlock || (top && box.y !== goal.y) || (bottom && box.y !== goal.y) || (left && box.x !== goal.x) || (right && box.x !== goal.x)) {
        return boxPicker(map,occupied);
    }

    // 一樣傳回這個箱子的座標
    return box;

}

function checkBox(map, box) {

    const top = map[box.y - 1][box.x] === '#';
    const bottom = map[box.y + 1][box.x] === '#';
    const left = map[box.y][box.x - 1] === '#';
    const right = map[box.y][box.x + 1] === '#';
    const isDeadlock = (top || bottom) && (left || right);

    const position = { top, bottom, left, right, isDeadlock }

    return position
}

function movePlayer(dx, dy) {
    // 藉由傳入的 dx 和 dy 來定位下一個座標，這樣我們就知道要往哪邊走
    const nextX = player.x + dx; // 下一個 x  
    const nextY = player.y + dy; // 下一個 y 

    // 兩個 box 寫成陣列
    const boxes = [box1, box2];

    // 找到是誰位於下一個位置，記錄下來(這邊用傳參考的方式，所以修改 firstBox 也會修改到原始值)
    const firstBox = boxes.find(box => box.x === nextX && box.y === nextY);

    // 前面沒有箱子
    if (!firstBox) {
        // 如果前方也是空的
        if (map[nextY][nextX] === ' ') {
            player.x = nextX; // player 的座標移動到下一個位置
            player.y = nextY;
        }
        return; // 截斷函式不往下跑
    }

    // 如果前面有箱子的話就會往下走
    // 紀錄箱子的再下一個位置
    const boxNextX = firstBox.x + dx;
    const boxNextY = firstBox.y + dy;

    // 判斷有沒有下一個箱子
    const secondBox = boxes.find(
        box =>
            box !== firstBox &&  // 如果這個箱子不是第一個箱子，而且位置剛好在第一個箱子的下一個位置
            box.x === boxNextX &&
            box.y === boxNextY
    );

    // 前面有兩個箱子，要確認第二個箱子後面是空的
    if (secondBox) {
        // 紀錄第二個箱子的再下一個位置
        const afterSecondBoxX = secondBox.x + dx;
        const afterSecondBoxY = secondBox.y + dy;

        // 確認這個位置是不是空的，是的話三個都往後一格
        if (map[afterSecondBoxY][afterSecondBoxX] === ' ') {
            player.x = nextX;
            player.y = nextY;

            firstBox.x += dx;
            firstBox.y += dy;

            secondBox.x += dx;
            secondBox.y += dy;
        }

        return;
    }

    // 前面只有一個箱子，要確認箱子後面是空的
    if (map[boxNextY][boxNextX] === ' ') {
        // 兩個箱子都往後一格
        player.x = nextX;
        player.y = nextY;

        firstBox.x = boxNextX;
        firstBox.y = boxNextY;
    }
}

// // 首先移動一下生成的順序
let player = pickRandomEmptyCell(map);
let goal = pickRandomEmptyCell(map, [player]); // 先生成目標點
let box1 = boxPicker(map, [player, goal]); // box 改為 box1，要避開項目的不變
let box2 = boxPicker(map, [player, goal, box1]); // 新增一個 box2 ，避開的項目加上 box1
let button = pickRandomEmptyCell(map, [player, box1, box2, goal]); //button 要避開的項目從 box 改為 box1 和 box2

//渲染畫面
function render() {

    //儲存整個畫面的字串
    let frame = ''

    for (let y = 0; y < map.length; y++) {
        let row = ''

        for (let x = 0; x < map[y].length; x++) {

            // 小優化，把常用的寫法儲存成變數
            const cell = map[y][x]

            if (player.x === x && player.y === y) {
                row += `\x1b[33m@\x1b[0m`
            } else if (box1.x === x && box1.y === y) {
                row += `\x1b[34m$\x1b[0m`
            } else if (box2.x === x && box2.y === y) {
                row += `\x1b[34m$\x1b[0m`
            } else if (goal.x === x && goal.y === y) {
                row += `\x1b[31m.\x1b[0m`
            } else if (button.x === x && button.y === y) {
                row += `\x1b[31mx\x1b[0m`
            } else if (cell === '@' || cell === '$' || cell === '.') {
                row += ' '
            } else {
                row += `\x1b[32m${cell}\x1b[0m`
            }

        }

        //把這行儲存進去 frame，並記得結尾換行
        frame += row + '\n'
    }

    // 一樣先印出來看看結果
    process.stdout.write(`\x1b[${map.length}A`);
    process.stdout.write(frame);

}

//初次渲染
process.stdout.write("\n".repeat(map.length));
render()

// stdin 為了節省資源，預設是暫停的，因此我們需要先喚醒才能使用
process.stdin.resume();
// 把監聽到的資料轉換成我們看得懂的語言
process.stdin.setEncoding('utf8');

// 加入這一段，讓他能正確地把資料傳給 node
process.stdin.setRawMode(true);

// 接收到這些狀況的時候被觸發，'data' 指有新資料進來的時候
process.stdin.on('data', (key) => {

    // 如果按下字母 'q' 或是 'Q'，就正式退出遊戲
    if (key === 'q' || key === 'Q') {
        console.log("\n遊戲結束，謝謝遊玩！");
        process.exit();
    }

    // 如果按下 Ctrl + C (在 Raw Mode 下對應的編碼是 '\x03')，這是強制退出遊戲
    if (key === '\x03') {
        process.exit();
    }

    // 監聽器內四個方向換上這個邏輯
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

    // //獲勝判定
    // if (box.y === goal.y && box.x === goal.x) {
    //     console.log("\n恭喜獲勝");
    //     process.exit();
    // }

    // const { top, bottom, left, right, isDeadlock } = checkBox(map, box);

    // // 這邊來寫推出箱子的邏輯，首先先判斷如果是死角就不進這個流程
    // if (player.y === button.y && player.x === button.x && !isDeadlock) {
    //     if (top) {
    //         box.y += 1;
    //     } else if (bottom) {
    //         box.y -= 1;
    //     } else if (left) {
    //         box.x += 1;
    //     } else if (right) {
    //         box.x -= 1;
    //     }
    //     render();
    // }

    // // 因為這段加在勝負判定後面，所以不用再次防勝負判定，不過也可以寫一下
    // if (isDeadlock) {
    //     process.stdout.write("\n箱子卡住了，遊戲結束\n");
    //     process.exit();
    // }
});