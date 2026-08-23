(() => {
    "use strict";

    const CONFIG = {
        debug: false,
        backgroundVar: "--color-bg"
    };

    function getCSSVar(varName, fallback = "#ffffff") {
        const value = getComputedStyle(document.documentElement)
            .getPropertyValue(varName)
            .trim();

        return value || fallback;
    }

    const canvas = document.getElementById("background-canvas");

    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
        alpha: true
    });

    if (!ctx) return;

    let width = 0;
    let height = 0;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        canvas.style.width = width + "px";
        canvas.style.height = height + "px";

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const waves = [
        {
            color: "",
            speed: 0.20,
            amplitude: 140,
            frequency: 0.002,
            offset: 0,
            alpha: 0.02
        },
        {
            color: "",
            speed: 0.16,
            amplitude: 100,
            frequency: 0.0015,
            offset: 1.8,
            alpha: 0.04
        },
        {
            color: "",
            speed: 0.12,
            amplitude: 200,
            frequency: 0.001,
            offset: 4.1,
            alpha: 0.08
        },
        {
            color: "",
            speed: 0.10,
            amplitude: 50,
            frequency: 0.003,
            offset: 4.1,
            alpha: 0.10
        }
    ];

    let lastAccentColor = null;

    function updateWaveColors(accentColor) {
        if (accentColor === lastAccentColor) return;

        waves.forEach(wave => {
            wave.color = accentColor.replace(")", `, ${wave.alpha})`);
        });

        lastAccentColor = accentColor;
    }

    function render(time = 0) {
        time *= 0.001;

        ctx.clearRect(0, 0, width, height);

        const bgColor = getCSSVar(
            CONFIG.backgroundVar,
            "hsl(210, 15%, 97%)"
        );

        const accentColor = getCSSVar(
            "--color-accent",
            "hsl(215, 30%, 22%)"
        );

        updateWaveColors(accentColor);

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

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

            ctx.fillStyle = wave.color;
            ctx.fill();
        });

        requestAnimationFrame(render);
    }

    window.addEventListener("resize", resize);

    resize();
    render();
})();
