/* Math-Online DB client. Talks to the Google Apps Script web app (Code.gs) that stores JSON documents in Google Sheets.
   Every call carries a PIN that lives only in this browser. Without a PIN the site keeps working from localStorage. */
(function(){
  var DEFAULT_URL="https://script.google.com/macros/s/AKfycbx636txquQ4jLFe_GEjRPgUxYoriHAl5qc1i8hBF97m-qoB_PuSClectHGaqqhkl-CD/exec";
  var KP="mo-db-pin",KU="mo-db-url",state="nopin",timers={};
  function ls(k){try{return localStorage.getItem(k)}catch(e){return null}}
  function lset(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  function ldel(k){try{localStorage.removeItem(k)}catch(e){}}
  function url(){return ls(KU)||DEFAULT_URL}
  function pin(){return ls(KP)||""}
  function setState(s,msg){state=s;try{window.dispatchEvent(new CustomEvent("modb",{detail:{state:s,msg:msg||""}}))}catch(e){}}

  function call(body){
    var p=pin();
    if(!p)return Promise.reject(new Error("ยังไม่ได้ใส่ PIN"));
    body.pin=p;
    return fetch(url(),{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(body),redirect:"follow"})
      .then(function(r){return r.json()},function(){throw new Error("เชื่อมต่อไม่ได้ (ตรวจอินเทอร์เน็ตและ URL)")})
      .then(function(j){if(!j.ok&&!j.conflict){var e=new Error(j.error||"ผิดพลาด");e.server=true;throw e}return j});
  }
  function get(c,id){return call({action:"get",collection:c,id:id})}
  function set(c,id,data,ifVersion){var b={action:"set",collection:c,id:id,data:data};if(ifVersion!=null)b.ifVersion=ifVersion;return call(b)}
  function list(c){return call({action:"list",collection:c})}
  function del(c,id){return call({action:"delete",collection:c,id:id})}

  function ping(){
    if(!pin()){setState("nopin");return Promise.resolve(false)}
    setState("connecting");
    return call({action:"ping"}).then(function(){setState("online");return true},function(e){setState("error",e.message);return false});
  }
  function connect(p){lset(KP,String(p||"").trim());return ping().then(function(ok){if(!ok&&state==="error")ldel(KP);return ok})}
  function disconnect(){ldel(KP);setState("nopin")}

  /* sync one localStorage-backed state object as doc "state/<name>" with last-write-wins on a timestamp */
  function push(name,data){
    var ts=Date.now();lset("mo-ts:"+name,String(ts));
    if(!pin())return;
    clearTimeout(timers[name]);
    timers[name]=setTimeout(function(){
      set("state",name,{ts:ts,data:data}).then(function(){setState("online","บันทึกแล้ว")},function(e){setState("error",e.message)});
    },700);
  }
  function pull(name,localKey,apply){
    if(!pin())return;
    get("state",name).then(function(j){
      var remote=j.doc&&j.doc.data,lts=Number(ls("mo-ts:"+name))||0;
      if(remote&&remote.ts>lts){
        lset(localKey,JSON.stringify(remote.data));lset("mo-ts:"+name,String(remote.ts));
        apply(remote.data);setState("online","ดึงข้อมูลล่าสุดแล้ว");
      }else if(lts&&(!remote||remote.ts<lts)){
        var raw=ls(localKey);if(raw){try{push(name,JSON.parse(raw))}catch(e){}}
      }else setState("online");
    },function(e){setState("error",e.message)});
  }

  window.MoDB={get:get,set:set,list:list,del:del,ping:ping,connect:connect,disconnect:disconnect,push:push,pull:pull,
    hasPin:function(){return !!pin()},state:function(){return state},url:url,defaultUrl:DEFAULT_URL,
    setUrl:function(u){if(u&&u!==DEFAULT_URL)lset(KU,u);else ldel(KU)}};
  setState(pin()?"connecting":"nopin");
  if(pin())window.addEventListener("load",function(){ping()});
})();
