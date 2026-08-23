(() => {
    "use strict";

    const CONFIG = {
        debug: false,
        backgroundVar: "--color-bg",
        noiseOpacity: 0.07
    };

    function getCSSVar(varName, fallback = "#ffffff") {
        const value = getComputedStyle(document.documentElement)
            .getPropertyValue(varName)
            .trim();

        return value || fallback;
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function smooth(t) {
        return t * t * (3 - 2 * t);
    }

    function random(x, y) {
        const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
        return n - Math.floor(n);
    }

    function valueNoise(x, y) {
        const x0 = Math.floor(x);
        const y0 = Math.floor(y);
        const xf = x - x0;
        const yf = y - y0;

        const tl = random(x0, y0);
        const tr = random(x0 + 1, y0);
        const bl = random(x0, y0 + 1);
        const br = random(x0 + 1, y0 + 1);

        const u = smooth(xf);
        const v = smooth(yf);

        return lerp(
            lerp(tl, tr, u),
            lerp(bl, br, u),
            v
        );
    }

    const canvas = document.getElementById("background-canvas");

    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
        alpha: true
    });

    if (!ctx) return;

    let width = 0;
    let height = 0;
    let noiseCanvas;
    let noiseCtx;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        canvas.style.width = width + "px";
        canvas.style.height = height + "px";

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        createNoise();
    }

    function createNoise() {
        noiseCanvas = document.createElement("canvas");
        noiseCanvas.width = width;
        noiseCanvas.height = height;

        noiseCtx = noiseCanvas.getContext("2d");

        if (!noiseCtx) return;

        const image = noiseCtx.createImageData(width, height);
        const data = image.data;

        for (let i = 0; i < data.length; i += 4) {
            const value = Math.random() * 255;

            data[i] = value;
            data[i + 1] = value;
            data[i + 2] = value;
            data[i + 3] = 255;
        }

        noiseCtx.putImageData(image, 0, 0);
    }

    function render(time = 0) {
        time *= 0.001;

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";

        ctx.clearRect(0, 0, width, height);

        const bgColor = getCSSVar(
            CONFIG.backgroundVar,
            "hsl(210, 15%, 97%)"
        );

        const accentColor = getCSSVar(
            "--color-accent",
            "hsl(215, 30%, 22%)"
        );

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        const waves = [
            {
                color: accentColor.replace(")", ", 0.18)"),
                speed: 0.20,
                amplitude: 140,
                frequency: 0.002,
                offset: 0
            },
            {
                color: accentColor.replace(")", ", 0.20)"),
                speed: 0.16,
                amplitude: 100,
                frequency: 0.0015,
                offset: 1.8
            },
            {
                color: accentColor.replace(")", ", 0.24)"),
                speed: 0.12,
                amplitude: 200,
                frequency: 0.001,
                offset: 4.1
            },
            {
                color: accentColor.replace(")", ", 0.26)"),
                speed: 0.10,
                amplitude: 50,
                frequency: 0.003,
                offset: 4.1
            }
        ];

        waves.forEach(wave => {
            ctx.beginPath();
            ctx.moveTo(0, height);

            for (let x = -50; x <= width + 50; x += 10) {
                const y =
                    height * 0.75 +
                    Math.sin(
                        x * wave.frequency +
                        time * wave.speed +
                        wave.offset
                    ) * wave.amplitude;

                ctx.lineTo(x, y);
            }

            ctx.lineTo(width, height);
            ctx.closePath();

            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = "source-over";
            ctx.fillStyle = wave.color;
            ctx.fill();
        });

        if (noiseCanvas) {
            ctx.globalAlpha = CONFIG.noiseOpacity;
            ctx.globalCompositeOperation = "overlay";
            ctx.drawImage(noiseCanvas, 0, 0);
        }

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";

        requestAnimationFrame(render);
    }

    window.addEventListener("resize", resize);

    resize();
    render();
})();
