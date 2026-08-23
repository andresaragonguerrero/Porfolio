(() => {
    "use strict";

    const CONFIG = {
        opacity: 0.06
    };

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.id = "noise-overlay";

    Object.assign(canvas.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: "2147483647",
        opacity: CONFIG.opacity,
        display: "block"
    });

    document.documentElement.appendChild(canvas);

    let width = 0;
    let height = 0;

    function createNoise() {
        width = window.innerWidth;
        height = window.innerHeight;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const image = ctx.createImageData(width, height);
        const data = image.data;

        for (let i = 0; i < data.length; i += 4) {
            const value = Math.random() * 255;

            data[i] = value;
            data[i + 1] = value;
            data[i + 2] = value;
            data[i + 3] = 255;
        }

        ctx.putImageData(image, 0, 0);
    }

    window.addEventListener("resize", createNoise);

    createNoise();
})();