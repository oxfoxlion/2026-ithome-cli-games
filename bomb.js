//地圖初始化工具
function createMap(width, height) {
    
    const map = [];

    for (let y = 0; y < height; y++) {

        const row = [];

        for (let x = 0; x < width; x++) {

            const isBoder = y === 0 || y === height - 1 || x === 0 || x === width - 1;
            if (isBoder) {
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


//渲染畫面
function render() {

    let frame = ''

    for (let y = 0; y < map.length; y++) {
        let row = ''

        for (let x = 0; x < map[y].length; x++) {

            const cell = map[y][x]
            
            row += `\x1b[32m${cell}\x1b[0m`

        }

        frame += row + '\n'
    }

    process.stdout.write(`\x1b[${map.length}A`); // 回到開頭
    process.stdout.write(frame); // 印出畫面

}

//初次渲染先推出固定的行數
process.stdout.write("\n".repeat(map.length));
render()