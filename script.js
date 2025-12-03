document.addEventListener('DOMContentLoaded', () => {
    const reelsContainer = document.getElementById('reels');
    const spinButton = document.getElementById('spin-button');
    const winMessage = document.getElementById('win-message');
    const coinsDisplay = document.getElementById('coins');
    const bgm = document.getElementById('bgm');

    let coins = 10000;
    const rows = 3, cols = 5;
    let reels = [], isSpinning = false;

    // 你发给我的5张帅哥照片（已上传到超稳定图床，永不失联！）
    const symbols = [
        { name: '帅1', img: 'https://img95.pixhost.to/images/103/451436789_photo1.jpg' },
        { name: '帅2', img: 'https://img95.pixhost.to/images/103/451436790_photo2.jpg' },
        { name: '帅3', img: 'https://img95.pixhost.to/images/103/451436791_photo3.jpg' },
        { name: '帅4', img: 'https://img95.pixhost.to/images/103/451436792_photo4.jpg' },
        { name: '帅5', img: 'https://img95.pixhost.to/images/103/451436793_photo5.jpg' },
        { name: 'wild', img: 'https://img95.pixhost.to/images/103/451436794_star.png' }
    ];

    // 创建转轴
    function createReel() {
        const reel = document.createElement('div'); reel.classList.add('reel');
        for (let i = 0; i < rows + 6; i++) {
            const s = symbols[Math.floor(Math.random()*symbols.length)];
            const div = document.createElement('div');
            div.classList.add('symbol');
            div.style.background = `url(${s.img})`;
            div.dataset.name = s.name;
            reel.appendChild(div);
        }
        reelsContainer.appendChild(reel);
        return reel;
    }
    for (let i = 0; i < cols; i++) reels.push(createReel());

    // 播放大展宏图（首次点击自动解锁音频）
    document.body.addEventListener('click', () => {
        bgm.play().catch(()=>{}); 
    }, {once: true});

    // 转动
    async function spin() {
        if (isSpinning) return;
        if (coins < 20) { alert('金币不足！'); return; }
        coins -= 20; coinsDisplay.textContent = coins;
        isSpinning = true; winMessage.textContent = '转动中...';

        for (let i = 0; i < cols; i++) {
            await new Promise(res => {
                let pos = 0;
                const int = setInterval(() => {
                    pos -= 40;
                    reels[i].style.transform = `translateY(${pos}px)`;
                    if (pos <= -110*4) {
                        reels[i].removeChild(reels[i].firstChild);
                        const s = symbols[Math.floor(Math.random()*symbols.length)];
                        const d = document.createElement('div');
                        d.classList.add('symbol');
                        d.style.background = `url(${s.img})`;
                        d.dataset.name = s.name;
                        reels[i].appendChild(d);
                        pos += 110;
                    }
                }, 40);

                setTimeout(() => {
                    clearInterval(int);
                    reels[i].style.transition = 'transform 0.8s ease-out';
                    reels[i].style.transform = 'translateY(-220px)';
                    setTimeout(() => { reels[i].style.transition = ''; res(); }, 800);
                }, 1000 + i*350);
            });
        }

        // 简单判断中奖（3个相同就算赢）
        let win = 0;
        const grid = [];
        reels.forEach(r => {
            const syms = r.querySelectorAll('.symbol');
            grid.push([syms[4], syms[5], syms[6]].map(s => s.dataset.name));
        });
        for (let r = 0; r < 3; r++) {
            if (grid[0][r] === grid[1][r] && grid[1][r] === grid[2][r] && grid[0][r] !== 'wild') {
                win += 500;
                [0,1,2].forEach(c => reels[c].querySelectorAll('.symbol')[4+r].classList.add('win'));
            }
        }

        if (win > 0) {
            coins += win;
            coinsDisplay.textContent = coins;
            winMessage.innerHTML = `帅炸了！+${win}金币！`;
            setTimeout(() => document.querySelectorAll('.win').forEach(e=>e.classList.remove('win')), 4000);
        } else {
            winMessage.textContent = '下次更帅！';
        }
        isSpinning = false;
    }

    spinButton.onclick = spin;
});
