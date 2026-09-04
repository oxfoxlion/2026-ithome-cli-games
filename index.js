let count = 3; // 總共要執行幾次
let step = 0; // 紀錄走到了第幾步

const timer = setInterval(() => {

  console.log('########');
  console.log('#      #');
  console.log('#  $.  #');
  
  /// 第一行是 # 代表牆壁，起始時空兩格，第三格是 @ ，接著都是空格，最後是牆壁
  /// 接下來每一秒渲染時都動態往後推一格
  console.log('#' + " ".repeat(2 + step) + '@' + " ".repeat(3 - step) + '#');
  
  console.log('#      #');
  console.log('########');
  
  // 印一條分隔線，方便看清楚每一秒的變化
  console.log(`--- 第 ${step + 1} 秒的地圖狀態 --- `);

  count--; // 每執行一次就將 count 減一
  step++; // 步數加 1，下一秒的 @ 就會往右挪一格

  // 一但執行次數 < 0 就清除掉這個計時器，下一次就不再執行
  if (count < 0) {
    clearInterval(timer);
  }

}, 1000);