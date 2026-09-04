//地圖初始化
const map = [
    "########",
    "#      #",
    "#  .   #",
    "#  $   #",
    "#  @   #",
    "#      #",
    "########",
];

let player = null; // 用來儲存玩家位置
let box = null; // 用來儲存箱子位置
let goal = null; // 用來儲存目標點位置

//用於計算三個物件的位置
for (let y = 0; y < map.length; y++) {

    for (let x = 0; x < map[y].length; x++) {

        if (map[y][x] === '@') {
            player = { x, y }
        }
        if (map[y][x] === '$') {
            box = { x, y }
        }
        if (map[y][x] === '.') {
            goal = { x, y }
        }
    }

}

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
            } else if (box.x === x && box.y === y) {
                row += `\x1b[34m$\x1b[0m`
            } else if (goal.x === x && goal.y === y) {
                row += `\x1b[31m.\x1b[0m`
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
    process.stdout.write("\x1b[7A");
    process.stdout.write(frame)

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

    // 按下上下左右方向鍵後要發生的事情
    if (key === '\x1b[A') {
        // 判定是否為
        if (player.y - 1 === box.y && player.x === box.x) {

            if (map[player.y - 2][player.x] !== '#') {
                player.y -= 1
                box.y -= 1
            }

        } else if (map[player.y - 1][player.x] !== '#') {
            player.y -= 1
        }
    }
    if (key === '\x1b[B') {

        if (player.y + 1 === box.y && player.x === box.x) {

            if (map[player.y + 2][player.x] !== '#') {
                player.y += 1
                box.y += 1
            }

        } else if (map[player.y + 1][player.x] !== '#') player.y += 1;
    }
    if (key === '\x1b[C') {

        if (player.y === box.y && player.x + 1 === box.x) {

            if (map[player.y][player.x + 2] !== '#') {
                player.x += 1
                box.x += 1
            }

        } else if (map[player.y][player.x + 1] !== '#') player.x += 1;
    }
    if (key === '\x1b[D') {
        if (player.y === box.y && player.x - 1 === box.x) {

            if (map[player.y][player.x - 2] !== '#') {
                player.x -= 1
                box.x -= 1
            }

        } else if (map[player.y][player.x - 1] !== '#') player.x -= 1;
    }

    // 重新渲染
    render();

    //獲勝判定
    if (box.y === goal.y && box.x === goal.x) {
        console.log("\n恭喜獲勝");
        process.exit();
    }

    //判斷box的上方是否是牆壁
    const top    = map[box.y - 1][box.x] === '#';
    //判斷box的下方是否是牆壁
    const bottom = map[box.y + 1][box.x] === '#';
    //判斷box的左方是否是牆壁
    const left   = map[box.y][box.x - 1] === '#';
    //判斷box的右方是否是牆壁
    const right  = map[box.y][box.x + 1] === '#';
    //如果上方或下方有其一，且左方或右方有其一，就在
    const isDeadlock = (top || bottom) && (left || right);
    
    // 因為這段加在勝負判定後面，所以不用再次防勝負判定，不過也可以寫一下
    if (isDeadlock) {
        process.stdout.write("\n箱子卡住了，遊戲結束\n");
        process.exit();
    }
});