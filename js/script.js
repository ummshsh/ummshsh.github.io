document.querySelectorAll('.hover-footnote').forEach(element => {
  const tooltip = element.querySelector('::after');
  
  const positionTooltip = () => {
    tooltip.style.left = '';
    tooltip.style.top = '';
    tooltip.style.right = '';
    tooltip.style.bottom = '';
   
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
   
    const elementRect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
   
    let positionX = 'center';
    let positionY = 'top';
   
    const centerX = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
    if (centerX + tooltipRect.width > viewportWidth) {
      positionX = 'right';
    }
    if (centerX < 0) {
      positionX = 'left';
    }
   
    const topAbove = elementRect.top - tooltipRect.height - 5;
    const topBelow = elementRect.bottom + 5;
   
    if (topAbove < 0) {
      positionY = 'bottom';
    }
   
    switch(positionX) {
      case 'left':
        tooltip.style.left = '10px';
        break;
      case 'right':
        tooltip.style.right = '10px';
        break;
      default:
        tooltip.style.left = `${Math.max(10, Math.min(centerX, viewportWidth - tooltipRect.width - 10))}px`;
    }
   
    switch(positionY) {
      case 'top':
        tooltip.style.bottom = `${viewportHeight - elementRect.top + 5}px`;
        break;
      case 'bottom':
        tooltip.style.top = `${elementRect.bottom + 5}px`;
        break;
    }
  };

  element.addEventListener('mouseenter', positionTooltip);
  
  window.addEventListener('scroll', () => {
    if (tooltip.style.opacity === '1') {
      positionTooltip();
    }
  });
});

document.querySelectorAll('.clickableimg').forEach(img => {
    img.addEventListener('click', function() {
      window.location.href = this.src;
    });
  });


function createSnowflakes() {
  const snowContainer = document.createElement('div');
  snowContainer.style.position = 'fixed';
  snowContainer.style.top = '0';
  snowContainer.style.left = '0';
  snowContainer.style.width = '100vw';
  snowContainer.style.height = '100vh';
  snowContainer.style.pointerEvents = 'none';
  snowContainer.style.zIndex = '9999';
  snowContainer.classList.add('snow-container');
  
  document.body.appendChild(snowContainer);

  const totalSnowflakes = 200;
  
  for (let i = 0; i < totalSnowflakes; i++) {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snow');
    snowContainer.appendChild(snowflake);
  }
}
createSnowflakes();
