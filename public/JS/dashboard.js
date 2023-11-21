document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('sidebar');
    const exitBtn = document.getElementById('exit-btn');
    const logo = document.querySelector('.logo');
    const wordverse = document.querySelector('.wordverse');
  
    logo.addEventListener('click', function () {
      sidebar.classList.toggle('show');
    });
  
    wordverse.addEventListener('click', function () {
      sidebar.classList.toggle('show');
    });
  
    exitBtn.addEventListener('click', function () {
      sidebar.classList.remove('show');
    });
  });