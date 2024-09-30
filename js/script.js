document.addEventListener('DOMContentLoaded', () => {
    const zoomableImages = document.querySelectorAll('.zoomable');
    const zoomPopup = document.getElementById('zoom-popup');
    const zoomedImage = document.getElementById('zoomed-image');
    const closePopup = document.getElementById('close-popup');

    let scale = 1;
    let isPanning = false;
    let startX = 0;
    let startY = 0;
    let translateX = 0;
    let translateY = 0;

    // Open zoomed image on click
    zoomableImages.forEach(img => {
        img.addEventListener('click', (e) => {
            zoomedImage.src = e.target.src;
            zoomPopup.style.display = 'flex';
            scale = 1;  // Reset zoom scale
            translateX = 0; // Reset pan position
            translateY = 0;
            zoomedImage.style.transform = `scale(${scale}) translate(0px, 0px)`;
        });
    });

    // Close zoom popup on close button click
    closePopup.addEventListener('click', () => {
        zoomPopup.style.display = 'none';
    });

    // Close zoom popup when clicking outside the zoomed image
    zoomPopup.addEventListener('click', (e) => {
        if (e.target === zoomPopup) {
            zoomPopup.style.display = 'none';
        }
    });

    // Close zoom popup when pressing the Esc key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            zoomPopup.style.display = 'none';
        }
    });

    // Mouse wheel zoom for desktop (without smooth scrolling)
    zoomPopup.addEventListener('wheel', (e) => {
        e.preventDefault(); // Prevent page scroll
        if (e.deltaY < 0) {
            scale = Math.min(scale + 0.1, 3); // Limit max zoom to 3x
        } else {
            scale = Math.max(scale - 0.1, 1); // Limit min zoom to 1x
        }
        zoomedImage.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
    });

    // Mouse events for dragging
    zoomedImage.addEventListener('mousedown', (e) => {
        if (scale > 1) { // Only allow panning when zoomed in
            isPanning = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            zoomedImage.style.cursor = 'grabbing'; // Change cursor to grabbing
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isPanning) {
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            zoomedImage.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
        }
    });

    document.addEventListener('mouseup', () => {
        isPanning = false;
        zoomedImage.style.cursor = 'grab'; // Reset to grab cursor
    });

    // Prevent dragging outside the image (avoid default drag events)
    zoomedImage.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });

    // Touch events for mobile
    zoomPopup.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1 && scale > 1) {
            isPanning = true;
            startX = e.touches[0].clientX - translateX;
            startY = e.touches[0].clientY - translateY;
            zoomedImage.style.cursor = 'grabbing';
        }
    });

    zoomPopup.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && isPanning) {
            translateX = e.touches[0].clientX - startX;
            translateY = e.touches[0].clientY - startY;
            zoomedImage.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
        }
    });

    zoomPopup.addEventListener('touchend', () => {
        isPanning = false;
        zoomedImage.style.cursor = 'grab';
    });
});
