// script.js - 动物爆爆乐完整版
document.addEventListener('DOMContentLoaded', () => {
    const reelsContainer = document.getElementById('reels');
    const spinButton = document.getElementById('spin-button');
    const winMessage = document.getElementById('win-message');
    const coinsDisplay = document.getElementById('coins');
    const spinSound = document.getElementById('spin-sound');
    const winSound = document.getElementById('win-sound');

    let coins = 10000;
    const rows = 3;
    const cols = 5;
    let reels = [];
    let isSpinning = false;

    // 卡通动物图（全部已换成真实可访问直链）
    const symbols = [
        { name: 'buffalo',  img: 'https://cdn.pixabay.com/photo/2023/07/16/18/06/buffalo-8131628_1280.png' },
        { name: 'lion',     img: 'https://s1.328888.xyz/2024/12/04/iQJqV.png' },
        { name: 'elephant', img: 'https://cdn.pixabay.com/photo/2024/03/07/10/31/ai-generated-8617880_1280.png' },
        { name: 'rhino',    img: 'https://cdn.pixabay.com/photo/2024/04/26/10/28/ai-generated-8724531_1280.png' },
        { name: 'bear,     img: 'https://cdn.pixabay.com/photo/2024/05/14/16/25/ai-generated-8761590_1280.png' },
        { name: 'wild',     img: 'https://cdn.pixabay.com/photo/2021/12/12/18/29/star-6860666_1280.png' }, // 闪耀星星
        { name: 'scatter',  img: 'https://cdn.pixabay.com/photo/2022/04/27/14/52/coin-7160317_1280.png' } // 金币
    ];

    // 10条经典中奖线（索引从0开始）
    const paylines = [
        [1,1,1,1,1], // 中间横线
        [0,0,0,0,0], // 上横线
        [2,2,2,2,2], // 下横线
        [0,1,2,1,0], // V型
        [2,1,0,1,2], // 倒V型
        [0,1,0,1,0], // 波浪1
        [2,1,2,1,2], // 波浪2
        [0,0,1,2,2], // 斜上
        [2,2,1,0,0], // 斜下
        [1,0,1,2,1]  // M型
    ];

    function createReel() {
        const reel = document.createElement('div');
        reel.classList.add('reel');
        for (let i = 0; i < rows + 3; i++) { // 多留几个做滚动缓冲
            const sym = symbols[Math.floor(Math.random() * symbols.length)];
            const div = document.createElement('div');
            div.classList.add('symbol');
            div.style.backgroundImage = `url(${sym.img})`;
            div.dataset.name = sym.name;
            reel.appendChild(div);
        }
        reelsContainer.appendChild(reel);
        return reel;
    }

    // 初始化5个转轴
    for (let i = 0; i < cols; i++) {
        reels.push(createReel());
    }

    function playSound(audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }

    function spinButton.addEventListener('click', async () => {
        if (isSpinning) return;
        if (coins < 20) {
            alert("金币不足啦！");
            return;
        }
        coins -= 20;
        coinsDisplay.textContent = coins;
        isSpinning = true;
        winMessage.textContent = '转动中...';
        playSound(spinSound);
        spinButton.disabled = true;

        // 逐个停止，制造悬念
        for (let i = 0; i < cols; i++) {
            await spinReel(reels[i], 1000 + i * 300);
        }

        const grid = getCurrentGrid();
        const result = checkAllPaylines(grid);

        if (result.totalWin > 0) {
            coins += result.totalWin;
            coinsDisplay.textContent = coins;
            winMessage.innerHTML = `恭喜中奖！获得 <span style="color:gold">${result.totalWin}</span> 金币！`;
            playSound(winSound);
            highlightWinningLines(result.lines);
        } else {
            winMessage.textContent = '很遗憾，这次没中，再来一次！';
        }

        isSpinning = false;
        spinButton.disabled = false;
    });

    function spinReel(reel, duration) {
        return new Promise(resolve => {
            let pos = 0;
            const speed = 30;
            const interval = setInterval(() => {
                pos -= speed;
                reel.style.transform = `translateY(${pos}px)`;
                if (pos <= -90 * 3) {
                    reel.removeChild(reel.firstChild);
                    const sym = symbols[Math.floor(Math.random() * symbols.length)];
                    const div = document.createElement('div');
                    div.classList.add('symbol');
                    div.style.backgroundImage = `url(${sym.img})`;
                    div.dataset.name = sym.name;
                    reel.appendChild(div);
                    pos += 90;
                }
            }, 50);

            setTimeout(() => {
                clearInterval(interval);
                const finalPos = Math.floor(pos / 90) * 90 - 90 * 2; // 停在正中间3个
                reel.style.transition = 'transform 0.5s ease-out';
                reel.style.transform = `translateY(${finalPos}px)`;
                setTimeout(() => {
                    reel.style.transition = '';
                    resolve();
                }, 500);
            }, duration);
        });
    }

    function getCurrentGrid() {
        const grid = [];
        for (let r = 0; r < rows; r++) {
            grid[r] = [];
            reels.forEach(reel => {
                const symbols = reel.querySelectorAll('.symbol');
                grid[r].push(symbols[symbols.length - rows + r].dataset.name);
            });
        }
        return grid;
    }

    function checkAllPaylines(grid) {
        let totalWin = 0;
        const winningLines = [];

        paylines.forEach((line, index) => {
            const first = grid[line[0]][0];
            if (first === 'wild' || first === 'scatter') return;
            let count = 1;
            for (let c = 1; c < cols; c++) {
                const current = grid[line[c]][c];
                if (current === first || current === 'wild') {
                    count++;
                } else {
                    break;
                }
            }
            if (count >= 3) {
                const payout = {3:100, 4:500, 5:2000}[count] || 0;
                totalWin += payout;
                winningLines.push({lineIndex: index, symbol: first, count});
            }
        });

        // Scatter 额外奖励（出现3个以上）
        let scatterCount = 0;
        grid.forEach(row => row.forEach(s => { if (s === 'scatter') scatterCount++; }));
        if (scatterCount >= 3) {
            const scatterPay = {3:200, 4:1000, 5:5000}[scatterCount];
            totalWin += scatterPay;
            winMessage.innerHTML += `<br>Scatter奖励 +${scatterPay}！`;
        }

        return { totalWin, lines: winningLines };
    }

    function highlightWinningLines(lines) {
        lines.forEach(item => {
            const line = paylines[item.lineIndex];
            line.forEach((row, col) => {
                const reel = reels[col];
                const symbols = reel.querySelectorAll('.symbol');
                symbols[symbols.length - rows + row].classList.add('win');
            });
        });
        setTimeout(() => {
            document.querySelectorAll('.win').forEach(el => el.classList.remove('win'));
        }, 4000);
    }
});
