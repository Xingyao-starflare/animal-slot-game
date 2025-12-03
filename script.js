document.addEventListener('DOMContentLoaded', () => {
    const reelsContainer = document.getElementById('reels');
    const spinButton = document.getElementById('spin-button');
    const winMessage = document.getElementById('win-message');
    const coinsDisplay = document.getElementById('coins');

    let coins = 10000;
    const rows = 3;
    const cols = 5;
    let reels = [];
    let isSpinning = false;

    // 所有图片都换成国内直链，秒开！
    const symbols = [
        { name: 'buffalo',  img: 'https://img95.pixhost.to/images/102/451337504_buffalo.png' },
        { name: 'lion',     img: 'https://img95.pixhost.to/images/102/451337505_lion.png' },
        { name: 'elephant', img: 'https://img95.pixhost.to/images/102/451337506_elephant.png' },
        { name: 'rhino',    img: 'https://img95.pixhost.to/images/102/451337507_rhino.png' },
        { name: 'bear',     img: 'https://img95.pixhost.to/images/102/451337508_bear.png' },
        { name: 'wild',     img: 'https://img95.pixhost.to/images/102/451337509_star.png' },
        { name: 'scatter',  img: 'https://img95.pixhost.to/images/102/451337510_coin.png' }
    ];

    const paylines = [[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],[0,1,0,1,0],[2,1,2,1,2],[0,0,1,2,2],[2,2,1,0,0],[1,0,1,2,1]];

    function createReel() {
        const reel = document.createElement('div');
        reel.classList.add('reel');
        for (let i = 0; i < rows + 3; i++) {
            const s = symbols[Math.floor(Math.random()*symbols.length)];
            const div = document.createElement('div');
            div.classList.add('symbol');
            div.style.backgroundImage = `url(${s.img})`;
            div.dataset.name = s.name;
            reel.appendChild(div);
        }
        reelsContainer.appendChild(reel);
        return reel;
    }

    for (let i = 0; i < cols; i++) reels.push(createReel());

    async function spin() {
        if (isSpinning || coins < 20) return;
        coins -= 20; coinsDisplay.textContent = coins;
        isSpinning = true; winMessage.textContent = '转动中...'; spinButton.disabled = true;

        for (let i = 0; i < cols; i++) {
            await new Promise(res => {
                let pos = 0;
                const timer = setInterval(() => {
                    pos -= 30;
                    reels[i].style.transform = `translateY(${pos}px)`;
                    if (pos <= -270) {
                        reels[i].removeChild(reels[i].firstChild);
                        const s = symbols[Math.floor(Math.random()*symbols.length)];
                        const div = document.createElement('div');
                        div.classList.add('symbol');
                        div.style.backgroundImage = `url(${s.img})`;
                        div.dataset.name = s.name;
                        reels[i].appendChild(div);
                        pos += 90;
                    }
                }, 40);
                setTimeout(() => {
                    clearInterval(timer);
                    reels[i].style.transition = 'transform 0.6s ease-out';
                    reels[i].style.transform = 'translateY(-180px)';
                    setTimeout(() => { reels[i].style.transition = ''; res(); }, 600);
                }, 1000 + i*300);
            });
        }

        const grid = getGrid();
        const result = checkWin(grid);
        if (result.win > 0) {
            coins += result.win;
            coinsDisplay.textContent = coins;
            winMessage.innerHTML = `大奖！+${result.win} 金币！`;
            highlight(result.lines);
        } else winMessage.textContent = '再接再厉！';
        isSpinning = false;
        spinButton.disabled = false;
    }

    function getGrid() {
        const g = [];
        for (let r=0;r<3;r++) { g[r]=[]; for (let c=0;c<5;c++) {
            g[r][c] = reels[c].querySelectorAll('.symbol')[3+r].dataset.name;
        }}
        return g;
    }

    function checkWin(grid) {
        let win = 0; const lines = [];
        paylines.forEach((line,idx) => {
            let sym = grid[line[0]][0];
            if (sym==='wild'||sym==='scatter') return;
            let count = 1;
            for (let i=1;i<5;i++) {
                let s = grid[line[i]][i];
                if (s===sym || s==='wild') count++; else break;
            }
            if (count>=3) { win += count===3?120 : count===4?600 : 2500; lines.push(idx); }
        });
        return {win, lines};
    }

    function highlight(lines) {
        lines.forEach(idx => {
            paylines[idx].forEach((r,c) => {
                reels[c].querySelectorAll('.symbol')[3+r].classList.add('win');
            });
        });
        setTimeout(()=>document.querySelectorAll('.win').forEach(e=>e.classList.remove('win')),4000);
    }

    spinButton.onclick = spin;
});
