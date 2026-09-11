//地圖初始化工具
function createMap(width, height) {

    const map = [];

    for (let y = 0; y < height; y++) {

        const row = [];

        for (let x = 0; x < width; x++) {

            const isBoder = y === 0 || y === height - 1 || x === 0 || x === width - 1;
            // 加上判斷 x 和 y 是不是都是偶數
            const isWall = y % 2 === 0 && x % 2 === 0;
            // 如果是邊緣或為牆壁都把 # 寫進 map
            if (isBoder || isWall) {
                row.push('#')
            } else {
                row.push(' ')
            }

        }

        map.push(row)
    }

    return map
}

// 執行地圖初始化並計算出 map 
const map = createMap(15, 9);

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

let player = pickRandomEmptyCell(map);
let enemy1 = pickRandomEmptyCell(map, [player]);
let enemy2 = pickRandomEmptyCell(map, [player, enemy1]);
let enemy3 = pickRandomEmptyCell(map, [player, enemy1, enemy2]);

//渲染畫面
function render() {

    let frame = ''

    for (let y = 0; y < map.length; y++) {
        let row = ''

        for (let x = 0; x < map[y].length; x++) {

            const cell = map[y][x]

            if (player.x === x && player.y === y) {
                row += `\x1b[33m@\x1b[0m`
            } else if (enemy1.x === x && enemy1.y === y) {
                row += `\x1b[31m&\x1b[0m`  // 顏色的部分我挑了 31 號紅色以及 & 來表示敵人位置
            } else if (enemy2.x === x && enemy2.y === y) {
                row += `\x1b[31m&\x1b[0m`
            } else if (enemy3.x === x && enemy3.y === y) {
                row += `\x1b[31m&\x1b[0m`
            } else {
                row += `\x1b[32m${cell}\x1b[0m`
            }

        }

        frame += row + '\n'
    }

    process.stdout.write(`\x1b[${map.length}A`); // 回到開頭
    process.stdout.write(frame); // 印出畫面

}

//初次渲染先推出固定的行數
process.stdout.write("\n".repeat(map.length));
render()