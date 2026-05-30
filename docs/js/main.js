document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('pageLoader');
  const content = document.getElementById('pageContent');

  setTimeout(() => {
    loader.style.display = 'none';
    content.classList.add('show');
  }, 400);
});