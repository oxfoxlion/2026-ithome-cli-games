let count = 3;
let step = 0; // 紀錄走到了第幾步

// 我們先往後推 7 行空地，確保把舊的「node index.js」指令推到上面去
process.stdout.write("\n".repeat(7));

// 空間推出來之後，立即回到左上，就不會被發現
process.stdout.write("\x1b[7A");

const timer = setInterval(() => {

  // 為了避免重複的回到左上，第一次渲染就不用執行這一行
  if (step > 0) {
    process.stdout.write("\x1b[7A");
  }

  process.stdout.write('########\n');
  process.stdout.write('#      #\n');
  process.stdout.write('#  $.  #\n');
  
  /// 第一行是 # 代表牆壁，起始時空兩格，第三格是 @ ，接著都是空格，最後是牆壁
  /// 接下來每一秒渲染時都動態往後推一格
  process.stdout.write('#' + " ".repeat(2 + step) + '@' + " ".repeat(3 - step) + '#\n');
  
  process.stdout.write('#      #\n');
  process.stdout.write('########\n');
  
  // 印一條分隔線，方便看清楚每一秒的變化
  process.stdout.write(`--- 第 ${step + 1} 秒的地圖狀態 --- \n`);

  count--;
  step++; // 步數加 1，下一秒的 @ 就會往右挪一格

  if (count < 0) {
    clearInterval(timer);
  }

}, 1000);