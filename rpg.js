//地圖初始化
function createMap(width, height,walls = []) {
    // 一樣先有一個陣列來儲存整個地圖
    const map = [];

    // 熟悉的雙層迴圈，這次是直接用寬高的數值來計算
    for (let y = 0; y < height; y++) {

        // 用來記錄這一行的每一個座標
        const row = [];

        for (let x = 0; x < width; x++) {

            // 判斷是不是牆壁
            const isWall = walls.find(wall=>x === wall.x && y === wall.y);
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
                walls.push({ x:x, y:y })

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

function movePlayer(dx, dy) {
    // 藉由傳入的 dx 和 dy 來定位下一個座標，這樣我們就知道要往哪邊走
    const nextX = player.x + dx; // 下一個 x  
    const nextY = player.y + dy; // 下一個 y 

    if (map[nextY][nextX] === ' ') {
        player.x = nextX; // player 的座標移動到下一個位置
        player.y = nextY;
    }
}

function resetCameraVertex(){
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


//渲染畫面
function render() {

    //儲存整個畫面的字串
    let frame = ''
    // 每次開始 render 前先重算一次
    resetCameraVertex();
    const canvaMinX = cameraVertex.x;
    const canvaMaxX = cameraVertex.x + viewWidth -1 ;
    const canvaMinY = cameraVertex.y;
    const canvaMaxY = cameraVertex.y + viewHeight -1;

    for (let y = 0; y < map.length; y++) {

        if(y < canvaMinY || y > canvaMaxY) {
            continue;
        }

        let row = ''

        for (let x = 0; x < map[y].length; x++) {

            if(x < canvaMinX || x > canvaMaxX) {
                continue;
            }

            // 小優化，把常用的寫法儲存成變數
            const cell = map[y][x]

            if (player.x === x && player.y === y) {
                row += `\x1b[33m@\x1b[0m`
            } else if (npc.x === x && npc.y === y) {
                row += `\x1b[34mP\x1b[0m`
            } else if (exit.x === x && exit.y === y) {
                row += `\x1b[37m%\x1b[0m`
            } else {
                row += `\x1b[32m${cell}\x1b[0m`
            }

        }

        //把這行儲存進去 frame，並記得結尾換行
        frame += row + '\n'
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

        // 如果按下字母 'q' 或是 'Q'，就回到選單
        if (key === 'q' || key === 'Q') {
            process.stdout.write(`\x1b[${map.length}A`);
            process.stdout.write('\x1b[J');
            backToMenu();
            return;
        }

        // 如果按下 Ctrl + C (在 Raw Mode 下對應的編碼是 '\x03')，這是強制退出遊戲
        if (key === '\x03') {
            process.stdin.setRawMode(false);
            process.exit(130);
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
    }

    process.stdin.on('data', handleRPGInput);
}


// 玩家
let player = { x: 1, y: 1 };

// 村莊物件
const village = createVillage();
const npc = village.npc;
const exit = village.exit;
const walls = village.walls;

//地圖
const map = createMap(30, 9,walls);

//視窗大小
let viewWidth = 10;
let viewHeight = 8;

// 相機頂點
let cameraVertex = {x:0, y:0};



startRPG(() => process.exit(0));
