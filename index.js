import { createBombGame } from "./bomb.js";
import { createBoxGame } from "./box.js";

// 遊戲註冊區
const games = [
    { id: 1, name: '推箱子', create: createBoxGame },
    { id: 2, name: '爆爆王', create: createBombGame }
]

// 畫面高度
const height = games.length + 1;

// 當前關注項目
let focus = 1;
let guideline = `上下：選擇遊戲 Enter：進入遊戲`
let activeGame = null;
let activeInputHandler = handleMenuInput;

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
function render(moveCursor = true) {

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


    frame += guideline + '\n';

    // 選單內重畫時移回原來位置；從遊戲回來時由遊戲先定位好游標
    if (moveCursor) {
        process.stdout.write(`\x1b[${height}A`);
        process.stdout.write('\x1b[J');
    }
    process.stdout.write(frame);

}

function backToMenu() {
    activeGame?.stop();
    activeGame = null;
    activeInputHandler = handleMenuInput;
    render(false);
}

function enterGame(gameDefinition) {
    activeGame = gameDefinition.create();
    activeInputHandler = activeGame.handleInput;
    process.stdout.write(`\x1b[${height}A`);
    process.stdout.write('\x1b[J');
    activeGame.start(backToMenu);
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

function handleMenuInput(key) {
    // 選單中的 q 不切換狀態，只維持操作提示。
    if (key === 'q' || key === 'Q') {
        guideline = `上下：選擇遊戲 Enter：進入遊戲`;
    }

    // Enter
    if (key === '\r' || key === '\n') {
        // 進入選擇的遊戲
        const game = games.find(game => game.id === focus);
        enterGame(game);
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
}

// stdin 只有這一個實體監聽器，再將輸入交給目前啟用的介面。
process.stdin.on('data', (key) => {
    // Raw Mode 下 Ctrl + C 會以 \x03 傳入，因此在路由前統一處理。
    if (key === '\x03') {
        activeGame?.stop();
        process.exit();
    }

    activeInputHandler(key);
});
