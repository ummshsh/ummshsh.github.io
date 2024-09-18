document.addEventListener('DOMContentLoaded', () => {
    const zoomableImages = document.querySelectorAll('.zoomable');
    const zoomPopup = document.getElementById('zoom-popup');
    const zoomedImage = document.getElementById('zoomed-image');
    const closePopup = document.getElementById('close-popup');

    zoomableImages.forEach(img => {
        img.addEventListener('click', (e) => {
            zoomedImage.src = e.target.src;
            zoomPopup.style.display = 'flex';
        });
    });

    closePopup.addEventListener('click', () => {
        zoomPopup.style.display = 'none';
    });

    zoomPopup.addEventListener('click', (e) => {
        if (e.target === zoomPopup) {
            zoomPopup.style.display = 'none';
        }
    });
});
