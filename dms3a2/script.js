
  window.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.getElementById('menuToggle');
    const dropdown = document.getElementById('dropdownMenu');
  
    menuIcon.addEventListener('click', () => {
      menuIcon.classList.toggle('change');
      dropdown.classList.toggle('show');
    });
  });