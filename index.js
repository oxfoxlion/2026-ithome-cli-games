import { startBomb } from "./bomb.js";
import { startBox } from "./box.js";

// 遊戲註冊區
const games = [
    { id: 1, name: '推箱子',script: startBox },
    { id: 2, name: '爆爆王',script: startBomb }
]

// 畫面高度
const height = games.length +1;

// 當前關注項目
let focus = 1;
let guideline = `上下：選擇遊戲 Enter：進入遊戲`

// 改變 focus
function changeFocus(num) {

    if (focus + num < 1) {
        return
    }

    if (focus + num > games.length) {
        return
    }

    focus += num;

}

//渲染畫面
function render() {

    //儲存整個畫面的字串
    let frame = '';

    for (const game of games) {

        let row = '';

        if (focus === game.id) {
            row += `\x1b[33m${game.id} ${game.name}\x1b[0m`;
        } else {
            row += `${game.id} ${game.name}`;
        }
        frame += row + '\n'

    }


    frame += guideline+'\n';

    // 印出來看看結果
    process.stdout.write(`\x1b[${height}A`);
    process.stdout.write('\x1b[J')
    process.stdout.write(frame);

}

//初次渲染
process.stdout.write("\n".repeat(height));
render()

// stdin ，預設是暫停的，因此我們需要先喚醒才能使用
process.stdin.resume();
// 把監聽到的資料轉換成我們看得懂的語言
process.stdin.setEncoding('utf8');

// 加入這一段，讓他能把資料傳給 node ，不須經過 enter
process.stdin.setRawMode(true);

// 接收到這些狀況的時候被觸發，'data' 指有新資料進來的時候
process.stdin.on('data', (key) => {

    // 如果按下字母 'q' 或是 'Q'，就回到遊戲
    if (key === 'q' || key === 'Q') {
        guideline = `上下：選擇遊戲 Enter：進入遊戲`;
    }

    // 如果按下 Ctrl + C 就強制退出遊戲
    if (key === '\x03') {
        process.exit();
    }

    // Enter
    if (key === '\r' || key === '\n') {
        // 進入選擇的遊戲
        const game = games.find(game => game.id === focus);
        process.stdout.write(`\x1b[${height}A`);
        process.stdout.write('\x1b[J')
        game.script();
        return;
    }

    // 上方向鍵
    if (key === '\x1b[A') {
        changeFocus(-1);
    }

    // 下方向鍵
    if (key === '\x1b[B') {
        changeFocus(+1);
    }

    // 重新渲染
    render();
});