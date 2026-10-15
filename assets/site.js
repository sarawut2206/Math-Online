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

/* database status dot in the sidebar */
(function(){
  var b=document.getElementById("dbbtn");if(!b)return;
  var dot=b.querySelector(".dot"),txt=b.querySelector("span");
  var L={nopin:["ยังไม่เชื่อม","ยังไม่ได้ใส่ PIN"],connecting:["กำลังเชื่อม…","กำลังเชื่อมต่อ"],online:["เชื่อมแล้ว","เชื่อมต่อฐานข้อมูลแล้ว"],error:["ผิดพลาด","เชื่อมต่อไม่สำเร็จ"]};
  function paint(s,msg){var l=L[s]||L.nopin;b.dataset.s=s;txt.textContent="ฐานข้อมูล · "+l[0];b.title=msg||l[1]}
  window.addEventListener("modb",function(e){paint(e.detail.state,e.detail.msg)});
  paint(window.MoDB?window.MoDB.state():"nopin");
})();
