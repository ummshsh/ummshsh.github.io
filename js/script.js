document.querySelectorAll('.clickableimg').forEach(img => {
    img.addEventListener('click', function() {
      window.location.href = this.src;
    });
  });
  