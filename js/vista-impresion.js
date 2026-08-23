(function () {
    const btn = document.getElementById('preview-toggle');
    const screenSheet = document.querySelector('link[href="screen.css"]');
    const printPreviewSheet = document.querySelector('link[href="print.css"][media="screen"]');

    let previewing = false;

    btn.addEventListener('click', function () {
        previewing = !previewing;

        screenSheet.disabled = previewing;
        printPreviewSheet.disabled = !previewing;

        btn.textContent = previewing
            ? 'Volver a vista de pantalla'
            : 'Ver vista de impresión';
    });
})();
