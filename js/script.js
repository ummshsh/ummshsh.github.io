document.querySelectorAll('.clickableimg').forEach(img => {
    img.addEventListener('click', function() {
      window.location.href = this.src;
    });
  });


function createSnowflakes() {
  // Create a container for the snowflakes
  const snowContainer = document.createElement('div');
  snowContainer.style.position = 'fixed';
  snowContainer.style.top = '0';
  snowContainer.style.left = '0';
  snowContainer.style.width = '100vw';
  snowContainer.style.height = '100vh';
  snowContainer.style.pointerEvents = 'none'; // Allow clicks through the snow
  snowContainer.style.zIndex = '9999'; // Make sure it appears above other content
  snowContainer.classList.add('snow-container');
  
  document.body.appendChild(snowContainer);

  const totalSnowflakes = 200;
  
  for (let i = 0; i < totalSnowflakes; i++) {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snow');
    snowContainer.appendChild(snowflake);
  }
}

// Call the function to generate snowflakes
// createSnowflakes();
