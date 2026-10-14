/* Theme toggle shared by every page. The saved choice is applied by a tiny inline script in <head> to avoid a flash. */
(function(){
  var root=document.documentElement,btn=document.getElementById("theme");
  if(!btn)return;
  function isDark(){
    var t=root.getAttribute("data-theme");
    return t==="dark"||(!t&&matchMedia("(prefers-color-scheme:dark)").matches);
  }
  function label(){var s=btn.querySelector("span");if(s)s.textContent=isDark()?"โหมดสว่าง":"โหมดมืด"}
  label();
  btn.addEventListener("click",function(){
    var next=isDark()?"light":"dark";
    root.setAttribute("data-theme",next);
    try{localStorage.setItem("mo-theme",next)}catch(e){}
    label();
  });
})();
