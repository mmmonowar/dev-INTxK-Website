(function () {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var raw = hero.dataset.cursorLines;
    if (!raw) return;
    var lines;
    try { lines = JSON.parse(raw); } catch (e) { return; }
    if (!Array.isArray(lines) || lines.length === 0) return;

    var speed = parseFloat(hero.dataset.cursorSpeed);
    var between = parseFloat(hero.dataset.cursorBetween);
    var cyclePause = parseFloat(hero.dataset.cursorCyclePause);
    if (!(speed > 0)) speed = 0.05;
    if (!(between > 0)) between = 1.0;
    if (!(cyclePause > 0)) cyclePause = between;

    var lineEl = document.querySelector('.hero-typed-line');
    if (!lineEl) return;

    function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

    async function typeLine(line) {
        lineEl.textContent = '';
        for (var c = 0; c < line.length; c++) {
            lineEl.textContent += line.charAt(c);
            await sleep(speed * 1000);
        }
        await sleep(between * 1000);
    }

    async function eraseLine(line) {
        for (var c = line.length - 1; c >= 0; c--) {
            lineEl.textContent = line.slice(0, c);
            await sleep(speed * 1000);
        }
        lineEl.textContent = '';
        await sleep(between * 1000);
    }

    async function run() {
        var i = 0;
        while (true) {
            var line = lines[i % lines.length];
            await typeLine(line);
            await eraseLine(line);
            i++;
            if (i % lines.length === 0) {
                await sleep(cyclePause * 1000);
            }
        }
    }

    run();
})();
