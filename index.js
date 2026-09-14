//地圖初始化
function createMap(width,height) {
    // 一樣先有一個陣列來儲存整個地圖
    const map = [];
 
    // 熟悉的雙層迴圈，這次是直接用寬高的數值來計算
    for (let y = 0 ; y < height ; y++){
   
        // 用來記錄這一行的每一個座標
        const row = [];
        
        for (let x = 0; x <width ; x++){

            // 判斷是不是邊邊
            const isBorder = y === 0 || y === height -1 || x === 0 || x === width -1;
            if(isBorder){
                row.push('#')
            }else{
                row.push(' ')
            }

        }

        map.push(row)
    }

    return map
}

const map = createMap(7,7);

// occupied 預設是一個空陣列，這樣也可以避免萬一沒傳入變數的情況，不會報錯
function pickRandomEmptyCell(map , occupied = []){
    // 用來儲存空白格
    const emptyCell = [];

    for (let y = 0 ; y < map.length ; y++){
        
        for (let x = 0; x <map[y].length ; x++){
            // 判斷是不是已被占用
            const isOccupied = occupied.some(cell => cell.x === x && cell.y === y);
            // 如果該位置是空的而且尚未被占用才將這個數值儲存到 emptyCell
            if(map[y][x]===" " && !isOccupied){
                emptyCell.push({x,y})
            }
        }
    }

    const randomIndex = Math.floor(Math.random() * emptyCell.length);
    return emptyCell[randomIndex]
}

function boxPicker() {
    // 這裡要避開 player 和 goal 兩個座標
    let box = pickRandomEmptyCell(map, [player,goal]);

    // 這邊是判斷箱子是否靠邊
   const { top,bottom,left,right,isDeadlock } =checkBox(map,box);

    // 這邊加上如果 goal 不在同一個邊邊上的話要重抽的邏輯
    if (isDeadlock || (top && box.y !== goal.y ) || (bottom && box.y !== goal.y ) ||  (left && box.x !== goal.x) ||  (right && box.x !== goal.x)) {
        return boxPicker();
    }

    return box;

}

function checkBox (map,box) {

    const top = map[box.y - 1][box.x] === '#';
    const bottom = map[box.y + 1][box.x] === '#';
    const left = map[box.y][box.x - 1] === '#';
    const right = map[box.y][box.x + 1] === '#';
    const isDeadlock = (top || bottom) && (left || right);

    const position = {top,bottom,left,right,isDeadlock}

    return position
}

// // 首先移動一下生成的順序
let player = pickRandomEmptyCell(map);
let goal = pickRandomEmptyCell(map, [player]); // 先生成目標點
let box = boxPicker(); // 再生成箱子，確保執行 boxPicker 時可以取得 goal
let button = pickRandomEmptyCell(map,[player,box,goal]) // 加上按鈕的位置

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
            }else if (box.x === x && box.y === y) {
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

    const { top,bottom,left,right,isDeadlock } = checkBox (map,box);

    // 這邊來寫推出箱子的邏輯，首先先判斷如果是死角就不進這個流程
    if(player.y === button.y && player.x === button.x && !isDeadlock){
        if (top){
            box.y += 1;
        }else if (bottom){
            box.y -= 1;
        }else if (left){
            box.x += 1;
        }else if (right){
            box.x -= 1;
        }
        render();
    }
    
    // 因為這段加在勝負判定後面，所以不用再次防勝負判定，不過也可以寫一下
    if (isDeadlock) {
        process.stdout.write("\n箱子卡住了，遊戲結束\n");
        process.exit();
    }
});