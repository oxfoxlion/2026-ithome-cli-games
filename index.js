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
            
            // 下面這邊把 map[y][x] 都替換成 cell
            if(player.x === x && player.y === y){
                row += '@'
            }else if(box.x === x && box.y === y){
                row += '$'
            }else if(goal.x === x && goal.y === y){
                row += '.'
            }else if (cell === '@' || cell ==='$' || cell ==='.') {
                row += ' '
            } else {
                row += cell
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

let count = 2;

const timer = setInterval(() => {
  
  player.x += 1;
  render()
  count --;

  if (count < 1) {
    clearInterval(timer);
  }
}, 1000);