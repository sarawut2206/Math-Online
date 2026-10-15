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

/* Thai numerals (๐-๙) for all displayed text, per หนังสือราชการ style.
   Skipped: code, pre, form fields, course codes (F5, M2), anything marked data-latin. */
(function(){
  var D="๐๑๒๓๔๕๖๗๘๙";
  var SKIP={SCRIPT:1,STYLE:1,CODE:1,PRE:1,TEXTAREA:1,INPUT:1,SELECT:1,OPTION:1,NOSCRIPT:1,TITLE:1};
  function conv(s){return s.replace(/[0-9]/g,function(c){return D.charAt(+c)})}
  function skip(n){
    for(var e=n.parentNode;e&&e.nodeType===1;e=e.parentNode){
      if(SKIP[e.tagName])return true;
      if(e.hasAttribute("data-latin")||(e.classList&&(e.classList.contains("code")||e.classList.contains("big")||e.classList.contains("tpl"))))return true;
    }
    return false;
  }
  function fix(n){if(n.nodeValue&&/[0-9]/.test(n.nodeValue)&&!skip(n))n.nodeValue=conv(n.nodeValue)}
  function walk(root){
    if(root.nodeType===3){fix(root);return}
    if(root.nodeType!==1)return;
    var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),n;
    while((n=w.nextNode()))fix(n);
  }
  window.moThai=conv;
  function start(){
    walk(document.body);
    new MutationObserver(function(ms){
      ms.forEach(function(m){
        if(m.type==="characterData")fix(m.target);
        else m.addedNodes.forEach(walk);
      });
    }).observe(document.body,{childList:true,subtree:true,characterData:true});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
