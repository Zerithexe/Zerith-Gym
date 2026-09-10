const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];

const exercises = [
  {id:"pushup", name:"Şınav", cat:"push", tags:["göğüs","triceps"], pose:"push", level:["beginner","intermediate","advanced"], desc:"Göğüs, ön omuz ve triceps odaklı temel itiş hareketi.", tips:["Eller omuzlardan biraz geniş olabilir.","Gövdeyi tek parça tut.","Dirsekleri tamamen dışarı açmak yerine kontrollü açı kullan."]},
  {id:"inclinepushup", name:"Eğimli şınav", cat:"push", tags:["göğüs","başlangıç"], pose:"push", level:["beginner"], desc:"Şınavın daha kolay varyasyonu. Sağlam bir yükseltiyle yapılır.", tips:["Yükselti ne kadar yüksekse hareket o kadar kolay olur.","Göğsü yüzeye doğru kontrollü indir.","Belini aşırı çökertme."]},
  {id:"pike", name:"Pike şınav", cat:"push", tags:["omuz","triceps"], pose:"push", level:["intermediate","advanced"], desc:"Omuz ve triceps için kalça yukarı pozisyonunda itiş.", tips:["Kalçayı yukarıda tut.","Başını ellerin arasına doğru indir.","Omuzlarını kontrollü kullan."]},
  {id:"squat", name:"Vücut ağırlığı squat", cat:"legs", tags:["quadriceps","glute"], pose:"squat", level:["beginner","intermediate","advanced"], desc:"Bacak ve kalça için ana kuvvet hareketlerinden biri.", tips:["Ayaklar rahat ve dengeli olsun.","Dizleri ayak yönüyle uyumlu takip ettir.","Topukları yerde tutmaya çalış."]},
  {id:"reverseLunge", name:"Geri lunge", cat:"legs", tags:["bacak","denge"], pose:"lunge", level:["beginner","intermediate","advanced"], desc:"Tek taraflı bacak kuvveti ve denge için kontrollü varyasyon.", tips:["Bir ayağı geriye al.","Öndeki ayağın tabanını sabit tut.","Dizini ağrısız ve kontrol edilebilir aralıkta hareket ettir."]},
  {id:"split", name:"Bulgarian split squat", cat:"legs", tags:["glute","quadriceps"], pose:"lunge", level:["advanced"], desc:"Tek bacak odaklı daha zorlu bir varyasyon; destek için sandalye kullanılabilir.", tips:["Arkadaki ayağı sağlam ve güvenli bir yüzeye koy.","Öndeki bacakla yükü kontrol et.","Dengeyi kaybediyorsan hareketi kolaylaştır."]},
  {id:"glutebridge", name:"Glute bridge", cat:"legs", tags:["kalça","arka zincir"], pose:"squat", level:["beginner","intermediate"], desc:"Kalça ve arka zinciri hedefleyen yer egzersizi.", tips:["Kaburgaları aşağıda tut.","Kalçayı kontrollü kaldır.","Bel yerine kalçanın çalışmasını hisset."]},
  {id:"plank", name:"Plank", cat:"core", tags:["core","stabilite"], pose:"plank", level:["beginner","intermediate","advanced"], desc:"Gövde stabilitesi için temel izometrik hareket.", tips:["Baş-boyun doğal hizada.","Kalçayı ne çok yükselt ne de düşür.","Nefesi tutma."]},
  {id:"deadbug", name:"Dead bug", cat:"core", tags:["core","kontrol"], pose:"plank", level:["beginner","intermediate"], desc:"Core kontrolü ve hareket sırasında gövde stabilitesi.", tips:["Belin doğal pozisyonunu koru.","Kol ve bacakları yavaşça uzat.","Hareket kalitesini tekrar sayısından öne koy."]},
  {id:"mountain", name:"Mountain climber", cat:"cardio", tags:["kondisyon","core"], pose:"plank", level:["beginner","intermediate","advanced"], desc:"Kondisyon ve core için ritimli vücut ağırlığı hareketi.", tips:["Omuzları ellerin üstünde tut.","Kısa ve kontrollü adımlarla başla.","Form bozulursa tempoyu düşür."]},
  {id:"burpee", name:"Burpee", cat:"cardio", tags:["kondisyon","full body"], pose:"push", level:["intermediate","advanced"], desc:"Tüm vücudu ve kondisyonu yüksek tempoda çalıştıran hareket.", tips:["Önce düşük tempoda öğren.","Zıplama yerine geri adım varyasyonu kullanılabilir.","Form bozulduğunda tekrar hızından vazgeç."]},
  {id:"superman", name:"Superman", cat:"pull", tags:["sırt","arka zincir"], pose:"plank", level:["beginner","intermediate"], desc:"Ekipmansız sırt ve arka zincir aktivasyonu için yer hareketi.", tips:["Boynu nötr tut.","Kolları ve bacakları abartılı yükseğe kaldırma.","Yavaş tekrarlar kullan."]}
];

const storageKey = "zerithGymStateV1";
let state = JSON.parse(localStorage.getItem(storageKey) || "null") || {
  profile:null, plan:null, completedDates:[], completedExercises:{}
};

function save(){ localStorage.setItem(storageKey, JSON.stringify(state)); }

function scrollToCoach(){ $("#coach").scrollIntoView({behavior:"smooth", block:"start"}); }

$("#startCoachBtn").onclick = scrollToCoach;
$("#emptyStartBtn").onclick = scrollToCoach;
$("#finalStartBtn").onclick = scrollToCoach;
$("#openProfileBtn").onclick = () => { scrollToCoach(); if(state.profile) toast("Profilin zaten kayıtlı. Cevapları değiştirip yeni plan oluşturabilirsin."); };
$("#resetPlanBtn").onclick = () => {
  state.profile=null; state.plan=null; state.completedExercises={}; save(); renderPlan(); $("#coachForm").reset(); goStep(1); toast("Profil sıfırlandı.");
};

const pages = $$(".wizard-page"), steps = $$(".step-indicator");
let currentStep=1;
function goStep(n){
  currentStep=n;
  pages.forEach(p=>p.classList.toggle("active", Number(p.dataset.step)===n));
  steps.forEach((s,i)=>s.classList.toggle("active", i<n));
}
$$(".next-btn").forEach(btn=>btn.onclick=()=>{ if(currentStep<4) goStep(currentStep+1); });
$$(".prev-btn").forEach(btn=>btn.onclick=()=>{ if(currentStep>1) goStep(currentStep-1); });

$("#duration").oninput = e => $("#durationValue").textContent = `${e.target.value} dk`;

$$('input[name="equipment"]').forEach(input=>{
  input.addEventListener("change", e=>{
    if(e.target.value==="none" && e.target.checked){
      $$('input[name="equipment"]').forEach(x=>{ if(x.value!=="none") x.checked=false; });
    } else if(e.target.value!=="none" && e.target.checked){
      const none=$('input[name="equipment"][value="none"]'); if(none) none.checked=false;
    }
  });
});

$("#coachForm").onsubmit = e => {
  e.preventDefault();
  const fd=new FormData(e.target);
  const profile={
    goal:fd.get("goal"),
    level:fd.get("level"),
    days:Number(fd.get("days")),
    duration:Number(fd.get("duration")),
    equipment:fd.getAll("equipment")
  };
  state.profile=profile; save();
  showGenerating(()=>{ state.plan=buildPlan(profile); save(); renderPlan(); $("#plan").scrollIntoView({behavior:"smooth"}); toast("Zerith planını oluşturdu."); });
};

function showGenerating(done){
  $("#coachForm").style.display="none";
  $("#coachResult").classList.add("show");
  const texts=[
    "Hedefin için en uygun hareket havuzu taranıyor.",
    "Seviyene göre tekrar ve set yoğunluğu ayarlanıyor.",
    "Süre ve gün sayına göre haftalık dağılım hazırlanıyor.",
    "Son dokunuşlar: toparlanma ve ilerleme adımları."
  ];
  let i=0;
  const interval=setInterval(()=>{ $("#loaderText").textContent=texts[i++%texts.length]; },700);
  setTimeout(()=>{
    clearInterval(interval);
    $("#coachResult").classList.remove("show"); $("#coachForm").style.display="";
    goStep(1); done();
  },2300);
}

function levelSet(level){
  return level==="beginner" ? 2 : level==="intermediate" ? 3 : 4;
}
function repsFor(level, goal){
  if(level==="beginner") return goal==="fatloss" ? "10–15 tekrar" : "8–12 tekrar";
  if(level==="intermediate") return goal==="fatloss" ? "12–18 tekrar" : "10–15 tekrar";
  return goal==="fatloss" ? "15–20 tekrar" : "8–15 tekrar";
}
function buildPlan(p){
  const sets=levelSet(p.level);
  const reps=repsFor(p.level,p.goal);
  const library={
    push:["pushup","inclinepushup","pike"],
    legs:["squat","reverseLunge","glutebridge","split"],
    core:["plank","deadbug"],
    cardio:["mountain","burpee"],
    pull:["superman"]
  };
  const choose=(ids)=>ids.map(id=>exercises.find(x=>x.id===id)).filter(Boolean).filter(x=>x.level.includes(p.level)||p.level==="advanced"||x.level.includes("intermediate"));
  const blocks = p.goal==="muscle" ? [
    {title:"Üst vücut", cats:["push","core","pull"]},
    {title:"Alt vücut", cats:["legs","core"]},
    {title:"Full body", cats:["push","legs","core"]}
  ] : p.goal==="fatloss" ? [
    {title:"Metabolik full body", cats:["legs","push","cardio","core"]},
    {title:"Kondisyon + core", cats:["cardio","core","legs"]},
    {title:"Full body tempo", cats:["push","legs","cardio"]}
  ] : [
    {title:"Full body", cats:["push","legs","core"]},
    {title:"Güç + kondisyon", cats:["legs","push","cardio"]},
    {title:"Core + full body", cats:["core","push","legs"]}
  ];
  const days=[];
  for(let i=0;i<p.days;i++){
    const block=blocks[i%blocks.length];
    const picked=[];
    block.cats.forEach(cat=>{
      const candidate=choose(library[cat]).find(e=>!picked.some(x=>x.id===e.id));
      if(candidate) picked.push(candidate);
    });
    if(p.duration>=40){
      const extra=choose(["squat","pushup","glutebridge","plank","mountain","superman"]).find(e=>!picked.some(x=>x.id===e.id));
      if(extra) picked.push(extra);
    }
    days.push({day:i+1,title:block.title,exercises:picked.slice(0,p.duration<=20?3:5),sets,reps});
  }
  const goalText={muscle:"güç ve kas gelişimini",fitness:"genel kuvvet ve kondisyonu",fatloss:"hareket hacmi ve kondisyonu",beginner:"düzenli bir antrenman alışkanlığını"}[p.goal];
  return {sets,reps,days,note:`Bugün önceliğimiz ${goalText}. Planı sürdürülebilir tutuyoruz; tekrarlar kolaylaştığında önce formu koru, sonra zorluğu kademeli artır.`};
}

function renderPlan(){
  if(!state.plan){ $("#planEmpty").classList.remove("hidden"); $("#planContent").classList.add("hidden"); $("#heroScore").textContent="--"; return; }
  $("#planEmpty").classList.add("hidden"); $("#planContent").classList.remove("hidden");
  const p=state.profile;
  $("#planTitle").textContent=`${p.days} günlük Zerith Blueprint`;
  $("#coachNote").textContent=state.plan.note;
  $("#metricDays").textContent=p.days;
  $("#metricDuration").textContent=`${p.duration} dk`;
  $("#metricLevel").textContent={beginner:"Başlangıç",intermediate:"Orta",advanced:"İleri"}[p.level];
  $("#heroScore").textContent=String(Math.min(99,70+p.days*3+(p.duration>=40?8:0)+(p.level==="advanced"?8:0)));
  $("#daysGrid").innerHTML=state.plan.days.map((day,idx)=>`
    <article class="day-card">
      <div class="day-head"><div><span>DAY ${String(idx+1).padStart(2,"0")}</span><h3>${day.title}</h3></div><span>${day.sets} set</span></div>
      ${day.exercises.map(e=>`
        <div class="exercise-item">
          <div><b>${e.name}</b><small>${day.reps} • kontrollü tempo</small></div>
          <div style="display:flex;gap:6px;align-items:center"><span class="tag">${e.tags[0]}</span><button class="check-btn ${state.completedExercises[e.id]?'done':''}" onclick="toggleExercise('${e.id}',this)">${state.completedExercises[e.id]?'✓':'+'}</button></div>
        </div>`).join("")}
    </article>`).join("");
}

window.toggleExercise=(id,btn)=>{
  state.completedExercises[id]=!state.completedExercises[id];
  save(); btn.classList.toggle("done",state.completedExercises[id]); btn.textContent=state.completedExercises[id]?"✓":"+";
};

function renderExercises(filter="all"){
  const list=filter==="all"?exercises:exercises.filter(e=>e.cat===filter);
  $("#exerciseGrid").innerHTML=list.map(e=>`
    <article class="exercise-card" data-id="${e.id}">
      <div class="exercise-visual"><div class="figure pose-${e.pose}"><i class="fh"></i><i class="ft"></i><i class="fa a"></i><i class="fa b"></i><i class="fl a"></i><i class="fl b"></i></div></div>
      <div class="exercise-info"><b>${e.name}</b><p>${e.desc}</p><div class="exercise-meta"><span>${e.tags.join(" • ")}</span><span>↗ aç</span></div></div>
    </article>`).join("");
  $$(".exercise-card").forEach(card=>card.onclick=()=>openExercise(card.dataset.id));
}
$$(".filter-btn").forEach(btn=>btn.onclick=()=>{
  $$(".filter-btn").forEach(b=>b.classList.remove("active")); btn.classList.add("active"); renderExercises(btn.dataset.filter);
});
function openExercise(id){
  const e=exercises.find(x=>x.id===id); if(!e) return;
  $("#dialogContent").innerHTML=`<span class="dialog-tag">${e.cat.toUpperCase()} / ${e.level.join(" • ")}</span><h3 class="dialog-title">${e.name}</h3><p class="dialog-content">${e.desc}</p><div class="tips">${e.tips.map((t,i)=>`<div><b>${i+1}.</b> ${t}</div>`).join("")}</div>`;
  $("#exerciseDialog").showModal(); document.body.classList.add("modal-open");
}
$("#dialogClose").onclick=()=>{$("#exerciseDialog").close();document.body.classList.remove("modal-open")};
$("#exerciseDialog").addEventListener("click",e=>{if(e.target===e.currentTarget){e.currentTarget.close();document.body.classList.remove("modal-open")}});

function todayKey(){const d=new Date(); return d.toISOString().slice(0,10);}
function renderProgress(){
  const d=new Date(); const y=d.getFullYear(),m=d.getMonth();
  const first=new Date(y,m,1); const days=new Date(y,m+1,0).getDate(); const offset=(first.getDay()+6)%7;
  let html=["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"].map(x=>`<div class="cal-label">${x}</div>`).join("");
  for(let i=0;i<offset;i++) html+=`<div></div>`;
  for(let day=1;day<=days;day++){
    const key=`${y}-${String(m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    html+=`<div class="cal-day ${state.completedDates.includes(key)?"done ":""} ${day===d.getDate()?"today":""}">${day}</div>`;
  }
  $("#calendar").innerHTML=html; $("#completionCount").textContent=`${state.completedDates.length} antrenman`;
  let streak=0; let cur=new Date();
  while(state.completedDates.includes(cur.toISOString().slice(0,10))){streak++;cur.setDate(cur.getDate()-1);}
  $("#streakCount").textContent=streak;
}
$("#completeTodayBtn").onclick=()=>{
  const key=todayKey();
  if(!state.completedDates.includes(key)){state.completedDates.push(key);save();renderProgress();toast("Antrenman tamamlandı. Streak başladı!");}
  else toast("Bugünkü antrenmanın zaten tamamlandı.");
};
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove("show"),2600)}

renderExercises(); renderPlan(); renderProgress();
