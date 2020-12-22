//----------------trangchu.js-----------------------------------------
const back_to_top = document.getElementById('back-to-top');
scrollFunction();
back_to_top.addEventListener('click', function() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  document.documentElement.scrollLeft = 0;
});
window.onscroll = function() {scrollFunction()};
function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    back_to_top.style.display = "block";
  } else {
    back_to_top.style.display = "none";
  }
}