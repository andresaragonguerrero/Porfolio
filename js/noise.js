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

    function createNoise() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        const pixelWidth = Math.round(width * dpr);
        const pixelHeight = Math.round(height * dpr);

        canvas.width = pixelWidth;
        canvas.height = pixelHeight;

        ctx.setTransform(1, 0, 0, 1, 0, 0);

        const image = ctx.createImageData(pixelWidth, pixelHeight);
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
