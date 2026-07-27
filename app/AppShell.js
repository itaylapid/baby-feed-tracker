"use client";

import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const MARKUP = `
<div class="wrap">
  <header class="baby-header">
    <div class="baby-avatar" id="avatarBtn"></div>
    <div class="baby-info">
      <div class="baby-name" id="babyNameDisplay">התינוק/ת שלכם</div>
      <div class="baby-meta" id="babyMeta">—</div>
    </div>
    <button class="icon-btn" id="settingsBtn"></button>
  </header>

  <div class="tabs">
    <button class="active" data-tab="active" id="tabActive">מעקב</button>
    <button data-tab="insights" id="tabInsights">תובנות</button>
  </div>

  <div id="viewActive">
    <div class="action-row" id="actionRow"></div>
    <div id="nurseActiveWrap"></div>
    <div id="pumpActiveWrap"></div>
    <div id="list"></div>
    <div class="section-label" id="histLabel" style="display:none;">היסטוריה אחרונה</div>
    <div class="card" id="historyCard" style="display:none; padding:6px 16px;"></div>
  </div>

  <div id="viewInsights" style="display:none;">
    <div class="stat-grid" id="statGrid"></div>
    <div id="insightCards"></div>
  </div>
</div>

<!-- onboarding step 1: baby identity -->
<div class="overlay open center" id="identityOverlay">
  <div class="sheet">
    <h2>קודם כל, מי הכוכב/ת? </h2>
    <div class="sub2">כדי שהאפליקציה תרגיש שייכת אליכם</div>
    <div style="display:flex; justify-content:center; margin-bottom:18px;">
      <div class="baby-avatar" id="identityAvatarBtn" style="width:84px; height:84px; flex-basis:84px;"></div>
    </div>
    <div class="field"><label>שם התינוק/ת</label><input type="text" id="babyNameInput" placeholder="לדוגמה: נועה"></div>
    <input type="file" id="photoInput" accept="image/*" style="display:none;">
    <button class="primary-btn" id="identityContinueBtn" disabled>המשך</button>
  </div>
</div>

<!-- onboarding step 2: feeding mode -->
<div class="overlay center" id="onboardOverlay">
  <div class="sheet">
    <h2 class="ob-title">איך מאכילים כרגע?</h2>
    <div class="sub2">אפשר לשנות בהגדרות בכל זמן</div>
    <div id="obOptions">
      <button class="mode-option" data-mode="formula_pump_bottle"><span class="mo-check"></span><span class="mo-title">פורמולה, שאיבות ובקבוקים</span></button>
      <button class="mode-option" data-mode="nurse_bottle"><span class="mo-check"></span><span class="mo-title">הנקה משולבת בקבוקים</span></button>
      <button class="mode-option" data-mode="nurse_formula"><span class="mo-check"></span><span class="mo-title">הנקה משולבת פורמולה</span></button>
      <button class="mode-option" data-mode="full_nurse"><span class="mo-check"></span><span class="mo-title">הנקה מלאה, ללא בקבוקים</span></button>
    </div>
    <div class="who-msg" id="whoMsg"><b>כל הכבוד</b>הנקה מלאה נחשבת לפי המלצות ארגון הבריאות העולמי לבחירה המומלצת ביותר לתינוק. האפליקציה עדיין לא בנויה למעקב הנקה בלבד בלי בקבוקים - נשמח שתחזרו אם זה ישתנה.</div>
    <button class="primary-btn" id="obContinueBtn" disabled>המשך</button>
  </div>
</div>

<!-- settings -->
<div class="overlay" id="settingsOverlay">
  <div class="sheet">
    <h2>הגדרות</h2>
    <div class="settings-row" id="nameRow" style="cursor:pointer;"><span class="sr-label">שם התינוק/ת</span><span class="sr-val" id="nameVal">→</span></div>
    <div class="settings-row"><span class="sr-label">מצב לילה</span><button class="toggle-sw" id="nightToggle"></button></div>
    <div class="settings-row" id="ageRow" style="cursor:pointer;"><span class="sr-label">גיל התינוק/ת</span><span class="sr-val" id="ageVal">הגדירו →</span></div>
    <div class="settings-row" id="weightRow" style="cursor:pointer;"><span class="sr-label">משקל</span><span class="sr-val" id="weightVal">הגדירו →</span></div>
    <div class="settings-row" id="modeRow" style="cursor:pointer;"><span class="sr-label">מצב האכלה</span><span class="sr-val" id="modeVal">שנו →</span></div>
    <button class="text-btn" id="signOutBtn" style="margin-top:16px; color:var(--danger-ink);">התנתקות</button>
    <button class="text-btn" id="closeSettingsBtn">סגור</button>
  </div>
</div>

<div class="overlay" id="nameOverlay">
  <div class="sheet">
    <h2>שם התינוק/ת</h2>
    <div style="display:flex; justify-content:center; margin-bottom:16px;">
      <div class="baby-avatar" id="nameAvatarBtn" style="width:76px; height:76px; flex-basis:76px;"></div>
    </div>
    <div class="field"><label>שם</label><input type="text" id="babyNameInput2"></div>
    <button class="primary-btn" id="saveNameBtn">שמור</button>
    <button class="text-btn" id="cancelNameBtn">ביטול</button>
  </div>
</div>

<div class="overlay" id="ageOverlay">
  <div class="sheet">
    <h2>גיל התינוק/ת</h2>
    <div class="sub2">מזינים תאריך לידה, והגיל מתעדכן לבד עם הזמן</div>
    <div class="field"><label>תאריך לידה</label><input type="date" id="birthDateInput"></div>
    <button class="primary-btn" id="saveAgeBtn">שמור</button>
    <button class="text-btn" id="cancelAgeBtn">ביטול</button>
  </div>
</div>

<div class="overlay" id="weightOverlay">
  <div class="sheet">
    <h2>משקל</h2>
    <div class="sub2">אפשר לעדכן בכל ביקור בטיפת חלב</div>
    <div class="field"><label>תאריך שקילה</label><input type="date" id="weightDateInput"></div>
    <div class="field"><label>משקל (ק"ג)</label><input type="number" step="0.01" min="0" id="weightInput" placeholder="לדוגמה: 4.20"></div>
    <button class="primary-btn" id="saveWeightBtn">שמור עדכון</button>
    <div id="weightHistoryList" style="margin-top:16px;"></div>
    <button class="text-btn" id="cancelWeightBtn">סגור</button>
  </div>
</div>

<div class="overlay" id="overlay">
  <div class="sheet">
    <h2 id="modalTitle">בקבוק חדש</h2>
    <div class="sub2" id="modalSub">כמה הכנתם?</div>
    <div class="seg" id="typeToggle">
      <button type="button" data-type="breast" class="active">חלב אם</button>
      <button type="button" data-type="formula">פורמולה</button>
    </div>
    <div class="gauge-wrap">
      <svg id="bottleSvg" width="112" height="240" viewBox="0 0 140 280" style="touch-action:none; cursor:ns-resize;">
        <defs>
          <clipPath id="bottleClip"><path d="M46,30 h48 v20 c17,10 27,25 27,46 v148 a18,18 0 0 1 -18,18 h-66 a18,18 0 0 1 -18,-18 v-148 c0,-21 10,-36 27,-46 z"/></clipPath>
          <linearGradient id="milkGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FBF1E5"/><stop offset="100%" stop-color="#F3DBB9"/></linearGradient>
        </defs>
        <rect x="46" y="7" width="48" height="14" rx="7" fill="#F0E3D2"/>
        <path d="M46,30 h48 v20 c17,10 27,25 27,46 v148 a18,18 0 0 1 -18,18 h-66 a18,18 0 0 1 -18,-18 v-148 c0,-21 10,-36 27,-46 z" fill="#FFFEFC" stroke="#EBDFCE" stroke-width="2.5"/>
        <g clip-path="url(#bottleClip)"><g id="milkGroup">
          <rect id="milkFill" x="-10" y="130" width="160" height="300" fill="url(#milkGrad)"/>
          <path id="milkWave" d="M -10,130 Q 25,124 60,130 T 150,130 V 300 H -10 Z" fill="url(#milkGrad)"/>
        </g></g>
        <path d="M46,30 h48 v20 c17,10 27,25 27,46 v148 a18,18 0 0 1 -18,18 h-66 a18,18 0 0 1 -18,-18 v-148 c0,-21 10,-36 27,-46 z" fill="none" stroke="#EBDFCE" stroke-width="2.5"/>
        <g stroke="#E3D6C2" stroke-width="1" font-size="8" fill="#B7A98E"><g id="tickGroup"></g></g>
        <rect x="0" y="0" width="140" height="280" fill="transparent" id="dragCatcher"/>
      </svg>
      <div class="gauge-num"><span id="gaugeNum">130</span><small> מ״ל</small></div>
      <div class="gauge-hint" id="gaugeHint">גררו לכמות</div>
    </div>
    <button class="primary-btn" id="saveBtn">שמור בקבוק</button>
    <button class="text-btn" id="cancelBtn">ביטול</button>
  </div>
</div>

<div class="overlay" id="pumpOverlay">
  <div class="sheet">
    <h2>שאיבה הסתיימה</h2>
    <div class="sub2">כמה חלב נשאב?</div>
    <div class="gauge-wrap">
      <div class="gauge-num"><span id="pumpGaugeNum">100</span><small> מ״ל</small></div>
      <input type="range" id="pumpRange" min="0" max="300" step="10" value="100" style="width:100%; margin-top:16px; accent-color:#C17A52;">
    </div>
    <button class="primary-btn" id="savePumpBtn">שמור שאיבה</button>
    <button class="text-btn" id="cancelPumpBtn">ביטול</button>
  </div>
</div>

<div class="confirm-pulse" id="confirmPulse">
  <div class="cp-circle"><svg viewBox="0 0 52 52" width="40" height="40"><circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" stroke-width="3" opacity="0.25"/><path d="M15 27 L23 35 L38 18" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" id="cpCheck"/></svg></div>
  <div class="cp-label" id="cpLabel"></div>
</div>
`;

// TEMPORARY debug helper: shows errors as an on-screen alert so they're
// visible even without opening DevTools (works on phones too). Remove once
// the persistence bug is diagnosed.
function debugAlert(msg) {
  if (typeof window !== "undefined") window.alert("DEBUG: " + msg);
}
function describeError(e) {
  if (!e) return "unknown error";
  return [e.message, e.code && `code=${e.code}`, e.details, e.hint].filter(Boolean).join(" | ");
}

// Supabase-backed replacement for the original localStorage adapter. Same
// get/set(key, value) shape (get returns { value: string|null }, set takes a
// JSON string), scoped to the signed-in user via the app_state table's RLS
// policies — so the ported script below needed almost no other changes.
const storage = {
  async get(key) {
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr) debugAlert(`getUser failed for get(${key}): ${describeError(userErr)}`);
    if (!user) { debugAlert(`no user for get(${key})`); return { value: null }; }
    const { data, error } = await supabase
      .from("app_state")
      .select("value")
      .eq("user_id", user.id)
      .eq("key", key)
      .maybeSingle();
    if (error) debugAlert(`load failed for ${key}: ${describeError(error)}`);
    if (error || !data) return { value: null };
    return { value: data.value };
  },
  async set(key, value) {
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr) debugAlert(`getUser failed for set(${key}): ${describeError(userErr)}`);
    if (!user) { debugAlert(`no user for set(${key})`); return; }
    const { error } = await supabase.from("app_state").upsert(
      {
        user_id: user.id,
        key,
        value: value === "" ? null : value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,key" }
    );
    if (error) debugAlert(`save failed for ${key}: ${describeError(error)}`);
  },
};

function initApp() {
  const ICONS = {
    bottle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2h6M10 2v3.5c0 .8-.3 1.5-.9 2.1C8 8.7 7.5 9.8 7.5 11v9a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-9c0-1.2-.5-2.3-1.6-3.4-.6-.6-.9-1.3-.9-2.1V2M8 13h8"/></svg>',
    drop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c3 4 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 3-7 6-11z"/></svg>',
    cycle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 0 1 14-5.3M20 4v5h-5M20 12a8 8 0 0 1-14 5.3M4 20v-5h5"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 13a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.6V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.6 1H20a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1z"/></svg>',
    baby: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.8 3.4c.9-1 2.3-1.2 3.1-.4"/><circle cx="12" cy="12.5" r="7.5"/><circle cx="9.3" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="14.7" cy="12" r="1" fill="currentColor" stroke="none"/><path d="M9.4 15.2c1.4 1.4 3.8 1.4 5.2 0"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-2h6l2 2h3v11H4z"/><circle cx="12" cy="13" r="3.3"/></svg>'
  };
  document.getElementById('avatarBtn').innerHTML = ICONS.baby;
  document.getElementById('identityAvatarBtn').innerHTML = ICONS.camera;
  document.getElementById('nameAvatarBtn').innerHTML = ICONS.baby;
  document.getElementById('settingsBtn').innerHTML = ICONS.gear;

  const STORAGE_KEY='baby-bottles', HISTORY_KEY='baby-bottles-history', PROFILE_KEY='baby-profile';
  const LAST_FORMULA_KEY='last-formula-amount', NURSE_KEY='nursing-active', NIGHT_KEY='night-override';
  const WEIGHT_KEY='baby-weight-history', PUMP_ACTIVE_KEY='pumping-active', PHOTO_KEY='baby-photo';
  const MAX_ML=250, TICK_STEP=10;
  const SAFE_HOURS={breast:2, formula:1};
  const TYPE_LABEL={breast:'חלב אם', formula:'פורמולה'};
  const AGE_RANGES=[
    {maxMonths:1,min:60,max:90,label:'עד חודש'},{maxMonths:2,min:90,max:120,label:'חודש–חודשיים'},
    {maxMonths:4,min:90,max:150,label:'2–4 חודשים'},{maxMonths:6,min:120,max:180,label:'4–6 חודשים'},
    {maxMonths:999,min:180,max:240,label:'6+ חודשים'}
  ];

  let bottles=[], history=[], profile={}, weightHistory=[];
  let selectedType='breast', currentAmount=130;
  let mode='add', closingBottle=null, closeReason='finished';
  let lastFormulaAmount=130, nursingActive=null, nursingTickInterval=null, nightOverride=null;
  let pumpingActive=null, pumpTickInterval=null, pendingPumpSession=null;
  let babyPhoto=null;

  const $=id=>document.getElementById(id);
  function confirmPulse(label){
    try{ if(navigator.vibrate) navigator.vibrate(35); }catch(e){}
    const el=$('confirmPulse'); $('cpLabel').textContent=label||'';
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    setTimeout(()=>el.classList.remove('show'),1400);
  }
  function applyNightMode(){
    let isNight;
    if(nightOverride!==null){ isNight=nightOverride; }
    else{ const h=new Date().getHours(); isNight=(h>=21||h<7); }
    document.body.classList.toggle('night', isNight);
    $('nightToggle').classList.toggle('on', isNight);
  }
  function setAvatarImages(){
    const html = babyPhoto ? `<img src="${babyPhoto}">` : ICONS.baby;
    $('avatarBtn').innerHTML = html;
    $('identityAvatarBtn').innerHTML = babyPhoto ? `<img src="${babyPhoto}">` : ICONS.camera;
    $('nameAvatarBtn').innerHTML = html;
  }

  async function loadData(){
    try{ const r=await storage.get(STORAGE_KEY); bottles=r&&r.value?JSON.parse(r.value):[]; }catch(e){ bottles=[]; }
    try{ const r=await storage.get(HISTORY_KEY); history=r&&r.value?JSON.parse(r.value):[]; }catch(e){ history=[]; }
    try{ const r=await storage.get(PROFILE_KEY); profile=r&&r.value?JSON.parse(r.value):{}; }catch(e){ profile={}; }
    try{
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      debugAlert(`profile load: user=${currentUser ? currentUser.email : 'NONE'} (${currentUser ? currentUser.id : '-'}) | profile=${JSON.stringify(profile)}`);
    }catch(e){ debugAlert('profile debug check itself failed: ' + describeError(e)); }
    try{ const r=await storage.get(LAST_FORMULA_KEY); lastFormulaAmount=r&&r.value?JSON.parse(r.value):130; }catch(e){ lastFormulaAmount=130; }
    try{ const r=await storage.get(NURSE_KEY); nursingActive=r&&r.value?JSON.parse(r.value):null; }catch(e){ nursingActive=null; }
    try{ const r=await storage.get(NIGHT_KEY); nightOverride=r&&r.value!==undefined?JSON.parse(r.value):null; }catch(e){ nightOverride=null; }
    try{ const r=await storage.get(WEIGHT_KEY); weightHistory=r&&r.value?JSON.parse(r.value):[]; }catch(e){ weightHistory=[]; }
    try{ const r=await storage.get(PUMP_ACTIVE_KEY); pumpingActive=r&&r.value?JSON.parse(r.value):null; }catch(e){ pumpingActive=null; }
    try{ const r=await storage.get(PHOTO_KEY); babyPhoto=r&&r.value?r.value:null; }catch(e){ babyPhoto=null; }
    applyNightMode(); setAvatarImages();

    if(profile.babyName){ $('identityOverlay').classList.remove('open'); }
    if(profile.feedingMode){ $('onboardOverlay').classList.remove('open'); }
    else if(profile.babyName){ $('onboardOverlay').classList.add('open'); }

    renderBabyHeader(); renderSettingsVals(); renderActionRow(); renderNurseActive(); renderPumpActive(); render(); renderInsights();
    if(nursingActive){ nursingTickInterval=setInterval(renderNurseActive,1000); }
    if(pumpingActive){ pumpTickInterval=setInterval(renderPumpActive,1000); }
  }
  async function saveBottles(){ try{ await storage.set(STORAGE_KEY,JSON.stringify(bottles)); }catch(e){} }
  async function saveHistory(){ try{ await storage.set(HISTORY_KEY,JSON.stringify(history)); }catch(e){} }
  async function saveProfile(){ try{ await storage.set(PROFILE_KEY,JSON.stringify(profile)); }catch(e){} }
  async function saveLastFormula(){ try{ await storage.set(LAST_FORMULA_KEY,JSON.stringify(lastFormulaAmount)); }catch(e){} }
  async function saveNursing(){ try{ await storage.set(NURSE_KEY, nursingActive?JSON.stringify(nursingActive):''); }catch(e){} }
  async function saveWeightHistory(){ try{ await storage.set(WEIGHT_KEY, JSON.stringify(weightHistory)); }catch(e){} }
  async function savePumpActive(){ try{ await storage.set(PUMP_ACTIVE_KEY, pumpingActive?JSON.stringify(pumpingActive):''); }catch(e){} }
  async function savePhoto(){ try{ await storage.set(PHOTO_KEY, babyPhoto||''); }catch(e){} }
  function latestWeight(){ if(!weightHistory.length) return null; return [...weightHistory].sort((a,b)=> b.date.localeCompare(a.date))[0]; }

  function fmtTime(ts){ return new Date(ts).toLocaleTimeString('he-IL',{hour:'2-digit',minute:'2-digit'}); }
  function ageInMonths(){
    if(!profile.birthDate) return null;
    const b=new Date(profile.birthDate+'T00:00:00'), now=new Date();
    let m=(now.getFullYear()-b.getFullYear())*12+(now.getMonth()-b.getMonth());
    if(now.getDate()<b.getDate()) m-=1;
    return Math.max(0,m);
  }
  function ageRangeFor(m){ return AGE_RANGES.find(r=>m<=r.maxMonths)||AGE_RANGES[AGE_RANGES.length-1]; }

  function lastFeedEndTime(){
    const all = history.filter(h=>h.type==='breast'||h.type==='formula'||h.type==='nursing');
    if(!all.length) return null;
    return Math.max(...all.map(h=>h.endTime));
  }
  function renderBabyHeader(){
    const name = profile.babyName || 'התינוק/ת שלכם';
    $('babyNameDisplay').textContent = name;
    const m = ageInMonths();
    const ageTxt = m===null ? '' : `${m} חודשים`;
    const lastFeed = lastFeedEndTime();
    let moodTxt = 'עוד לא תיעדתם האכלה';
    if(lastFeed){
      const minsAgo = Math.round((Date.now()-lastFeed)/60000);
      if(minsAgo < 45) moodTxt = 'אכל/ה לאחרונה';
      else if(minsAgo < 150) moodTxt = 'כנראה שבע/ה';
      else moodTxt = 'כנראה מתקרב זמן ארוחה';
    }
    $('babyMeta').textContent = [ageTxt, moodTxt].filter(Boolean).join(' · ');
  }

  function renderSettingsVals(){
    $('nameVal').textContent = profile.babyName ? profile.babyName+' →' : '→';
    const m=ageInMonths();
    $('ageVal').textContent = m===null ? 'הגדירו →' : `${m} חודשים →`;
    const w=latestWeight();
    $('weightVal').textContent = w ? `${w.weightKg} ק"ג →` : 'הגדירו →';
    const MODE_LABEL={formula_pump_bottle:'פורמולה+שאיבות',nurse_bottle:'הנקה+בקבוק',nurse_formula:'הנקה+פורמולה'};
    $('modeVal').textContent = profile.feedingMode ? MODE_LABEL[profile.feedingMode]+' →' : 'שנו →';
  }

  // ---- identity (name + photo) onboarding ----
  let identityPhotoTemp = null;
  $('identityAvatarBtn').addEventListener('click', ()=> $('photoInput').click());
  let pendingPhotoTarget = 'identity';
  $('nameAvatarBtn').addEventListener('click', ()=> { pendingPhotoTarget='name'; $('photoInput').click(); });
  $('photoInput').addEventListener('change', e=>{
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      identityPhotoTemp = reader.result;
      if(pendingPhotoTarget==='identity'){ $('identityAvatarBtn').innerHTML = `<img src="${identityPhotoTemp}">`; }
      else { $('nameAvatarBtn').innerHTML = `<img src="${identityPhotoTemp}">`; }
    };
    reader.readAsDataURL(file);
  });
  $('babyNameInput').addEventListener('input', e=>{
    $('identityContinueBtn').disabled = e.target.value.trim().length===0;
  });
  $('identityContinueBtn').addEventListener('click', async ()=>{
    const name = $('babyNameInput').value.trim(); if(!name) return;
    profile.babyName = name; await saveProfile();
    if(identityPhotoTemp){ babyPhoto = identityPhotoTemp; await savePhoto(); }
    setAvatarImages(); renderBabyHeader(); renderSettingsVals();
    $('identityOverlay').classList.remove('open');
    $('onboardOverlay').classList.add('open');
  });

  // ---- feeding mode onboarding ----
  let obSelected = null;
  document.querySelectorAll('.mode-option').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      obSelected = btn.dataset.mode;
      document.querySelectorAll('.mode-option').forEach(b=> b.classList.toggle('selected', b===btn));
      $('whoMsg').style.display = (obSelected==='full_nurse') ? 'block' : 'none';
      $('obContinueBtn').disabled = false;
      $('obContinueBtn').textContent = obSelected==='full_nurse' ? 'הבנתי' : 'המשך';
    });
  });
  $('obContinueBtn').addEventListener('click', async ()=>{
    if(!obSelected) return;
    if(obSelected==='full_nurse'){ $('onboardOverlay').classList.remove('open'); return; }
    await setFeedingMode(obSelected);
  });
  async function setFeedingMode(m){
    profile.feedingMode=m; await saveProfile();
    $('onboardOverlay').classList.remove('open');
    renderSettingsVals(); renderActionRow(); renderNurseActive(); renderPumpActive(); render(); renderInsights();
    confirmPulse('מצב ההאכלה נשמר');
  }

  // ---- settings ----
  $('settingsBtn').addEventListener('click', ()=> $('settingsOverlay').classList.add('open'));
  $('closeSettingsBtn').addEventListener('click', ()=> $('settingsOverlay').classList.remove('open'));
  $('signOutBtn').addEventListener('click', async ()=>{ await supabase.auth.signOut(); });
  $('nightToggle').addEventListener('click', async ()=>{
    nightOverride = !document.body.classList.contains('night');
    applyNightMode();
    try{ await storage.set(NIGHT_KEY, JSON.stringify(nightOverride)); }catch(e){}
  });
  $('nameRow').addEventListener('click', ()=>{
    $('babyNameInput2').value = profile.babyName||'';
    $('settingsOverlay').classList.remove('open');
    $('nameOverlay').classList.add('open');
  });
  $('cancelNameBtn').addEventListener('click', ()=>$('nameOverlay').classList.remove('open'));
  $('saveNameBtn').addEventListener('click', async ()=>{
    const v = $('babyNameInput2').value.trim(); if(!v) return;
    profile.babyName = v; await saveProfile();
    if(identityPhotoTemp){ babyPhoto = identityPhotoTemp; await savePhoto(); }
    setAvatarImages(); renderBabyHeader(); renderSettingsVals();
    $('nameOverlay').classList.remove('open');
    confirmPulse('השם נשמר');
  });
  $('ageRow').addEventListener('click', ()=>{ $('birthDateInput').value=profile.birthDate||''; $('settingsOverlay').classList.remove('open'); $('ageOverlay').classList.add('open'); });
  $('weightRow').addEventListener('click', ()=>{
    $('weightDateInput').value = new Date().toISOString().slice(0,10);
    $('weightInput').value = '';
    renderWeightHistoryList();
    $('settingsOverlay').classList.remove('open');
    $('weightOverlay').classList.add('open');
  });
  $('modeRow').addEventListener('click', ()=>{
    $('settingsOverlay').classList.remove('open');
    obSelected = null;
    document.querySelectorAll('.mode-option').forEach(b=>b.classList.remove('selected'));
    $('whoMsg').style.display='none';
    $('obContinueBtn').disabled = true;
    $('obContinueBtn').textContent = 'המשך';
    $('onboardOverlay').classList.add('open');
  });

  $('cancelAgeBtn').addEventListener('click', ()=>$('ageOverlay').classList.remove('open'));
  $('saveAgeBtn').addEventListener('click', async ()=>{
    const v=$('birthDateInput').value; if(!v){ return; }
    profile.birthDate=v; await saveProfile();
    renderSettingsVals(); renderBabyHeader(); renderInsights(); $('ageOverlay').classList.remove('open');
    confirmPulse('הגיל נשמר');
  });

  $('cancelWeightBtn').addEventListener('click', ()=>$('weightOverlay').classList.remove('open'));
  $('saveWeightBtn').addEventListener('click', async ()=>{
    const d=$('weightDateInput').value, w=Number($('weightInput').value);
    if(!d || !w || w<=0) return;
    weightHistory = weightHistory.filter(x=>x.date!==d);
    weightHistory.push({date:d, weightKg:w});
    await saveWeightHistory();
    renderSettingsVals(); renderInsights(); renderWeightHistoryList();
    $('weightInput').value='';
    confirmPulse('המשקל נשמר');
  });
  function renderWeightHistoryList(){
    const el=$('weightHistoryList');
    if(!weightHistory.length){ el.innerHTML=''; return; }
    const sorted=[...weightHistory].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
    el.innerHTML = '<div class="sub2" style="text-align:right; margin-bottom:6px;">עדכונים אחרונים</div>' +
      sorted.map(w=>`<div class="hist-item"><div>${w.weightKg} ק"ג</div><div class="h-time">${w.date}</div></div>`).join('');
  }

  // ---- action row ----
  function renderActionRow(){
    const m=profile.feedingMode;
    let html=`<button class="action-btn bottle" id="addBtn"><span class="icon">${ICONS.bottle}</span>הוסף בקבוק</button>`;
    if(m==='nurse_bottle'||m==='nurse_formula'){
      const running=!!nursingActive;
      html+=`<button class="action-btn nurse ${running?'running':''}" id="nurseBtn"><span class="icon">${ICONS.drop}</span>${running?'סיים הנקה':'התחל הנקה'}</button>`;
    }
    if(m==='formula_pump_bottle' || m==='nurse_bottle'){
      const pRunning=!!pumpingActive;
      html+=`<button class="action-btn pump ${pRunning?'running':''}" id="pumpBtn"><span class="icon">${ICONS.cycle}</span>${pRunning?'סיים שאיבה':'התחל שאיבה'}</button>`;
    }
    $('actionRow').innerHTML=html;
    $('addBtn').addEventListener('click', openAddModal);
    const nb=$('nurseBtn'); if(nb) nb.addEventListener('click', toggleNursing);
    const pb=$('pumpBtn'); if(pb) pb.addEventListener('click', togglePump);
  }
  function renderNurseActive(){
    const wrap=$('nurseActiveWrap');
    if(!nursingActive){ wrap.innerHTML=''; return; }
    const ms=Date.now()-nursingActive.startTime;
    const mins=Math.floor(ms/60000), secs=Math.floor((ms%60000)/1000);
    wrap.innerHTML=`<div class="live-card"><div class="nt">${mins}:${String(secs).padStart(2,'0')}</div><div class="nl">הנקה פעילה מ-${fmtTime(nursingActive.startTime)}</div></div>`;
  }
  function renderPumpActive(){
    const wrap=$('pumpActiveWrap');
    if(!pumpingActive){ wrap.innerHTML=''; return; }
    const ms=Date.now()-pumpingActive.startTime;
    const mins=Math.floor(ms/60000), secs=Math.floor((ms%60000)/1000);
    wrap.innerHTML=`<div class="live-card"><div class="nt">${mins}:${String(secs).padStart(2,'0')}</div><div class="nl">שאיבה פעילה מ-${fmtTime(pumpingActive.startTime)}</div></div>`;
  }
  async function toggleNursing(){
    if(nursingActive){
      const durationMs=Date.now()-nursingActive.startTime;
      const est=estimateNursingMl(durationMs);
      history.push({id:'h-'+Date.now(),type:'nursing',durationMs,estLow:est?est.low:null,estHigh:est?est.high:null,estMid:est?est.mid:null,startTime:nursingActive.startTime,endTime:Date.now(),outcome:'nursing'});
      await saveHistory(); nursingActive=null; await saveNursing(); clearInterval(nursingTickInterval);
      renderActionRow(); renderNurseActive(); render(); renderInsights(); renderBabyHeader();
      confirmPulse(est?`הנקה הסתיימה · כ-${est.low}-${est.high} מ״ל`:'הנקה הסתיימה');
    } else {
      nursingActive={startTime:Date.now()}; await saveNursing();
      renderActionRow(); renderNurseActive();
      nursingTickInterval=setInterval(renderNurseActive,1000);
    }
  }
  function isCleanPump(session){
    const priorFeeds = history.filter(h=> (h.type==='breast'||h.type==='formula'||h.type==='nursing') && h.endTime<=session.startTime);
    if(!priorFeeds.length) return true;
    const lastFeedEnd = Math.max(...priorFeeds.map(h=>h.endTime));
    return ((session.startTime - lastFeedEnd)/60000) >= 90;
  }
  function pumpRatePerMin(){
    const pumps = history.filter(h=>h.type==='pumped' && h.startTime && h.endTime && h.endTime>h.startTime);
    const clean = pumps.filter(isCleanPump);
    const recent = [...clean].sort((a,b)=>b.endTime-a.endTime).slice(0,10);
    if(!recent.length) return {rate:null, count:0};
    const totalMl = recent.reduce((s,h)=>s+h.amount,0);
    const totalMin = recent.reduce((s,h)=>s+((h.endTime-h.startTime)/60000),0);
    if(totalMin<=0) return {rate:null, count:0};
    return {rate: totalMl/totalMin, count: recent.length};
  }
  function bottleRatePerMin(){
    const feeds = history.filter(h=>h.type==='breast'||h.type==='formula');
    if(feeds.length<3) return null;
    const totalMl = feeds.reduce((s,h)=>s+h.consumed,0);
    const totalMs = feeds.reduce((s,h)=>s+(h.endTime-h.startTime),0);
    if(totalMs<=0) return null;
    return totalMl/(totalMs/60000);
  }
  function estimateNursingMl(durationMs){
    const durationMin = durationMs/60000;
    const pump = pumpRatePerMin();
    const bottleRate = bottleRatePerMin();
    let rate=null;
    if(pump.rate!==null && bottleRate!==null){ const w=Math.min(1,pump.count/5); rate = w*pump.rate + (1-w)*bottleRate; }
    else if(pump.rate!==null){ rate=pump.rate; }
    else if(bottleRate!==null){ rate=bottleRate; }
    if(rate===null) return null;
    const est = rate*durationMin;
    return { low: Math.max(0,Math.round(est*0.8/5)*5), high: Math.round(est*1.2/5)*5, mid: Math.round(est/5)*5 };
  }
  async function togglePump(){
    if(pumpingActive){
      pendingPumpSession = { startTime: pumpingActive.startTime, endTime: Date.now() };
      pumpingActive=null; await savePumpActive(); clearInterval(pumpTickInterval);
      renderActionRow(); renderPumpActive();
      openPumpModal();
    } else {
      pumpingActive={startTime:Date.now()}; await savePumpActive();
      renderActionRow(); renderPumpActive();
      pumpTickInterval=setInterval(renderPumpActive,1000);
    }
  }
  function openPumpModal(){ $('pumpRange').value=100; $('pumpGaugeNum').textContent=100; $('pumpOverlay').classList.add('open'); }
  $('cancelPumpBtn').addEventListener('click', ()=>{ pendingPumpSession=null; $('pumpOverlay').classList.remove('open'); });
  $('pumpRange').addEventListener('input', e=>$('pumpGaugeNum').textContent=e.target.value);
  $('savePumpBtn').addEventListener('click', async ()=>{
    const amt=Number($('pumpRange').value);
    const startTime = pendingPumpSession ? pendingPumpSession.startTime : Date.now();
    const endTime = pendingPumpSession ? pendingPumpSession.endTime : Date.now();
    history.push({id:'h-'+Date.now(),type:'pumped',amount:amt,startTime,endTime,outcome:'pumped'});
    pendingPumpSession = null;
    await saveHistory(); $('pumpOverlay').classList.remove('open'); render(); renderInsights(); renderBabyHeader();
    confirmPulse(`נשאבו ${amt} מ״ל`);
  });

  // ---- bottles ----
  function statusOf(b){ const safeMs=SAFE_HOURS[b.type]*3600*1000; const remaining=safeMs-(Date.now()-b.startTime); return {remaining, expired:remaining<=0, soon:remaining>0&&remaining<=15*60*1000}; }
  function fmtRemaining(ms){
    const abs=Math.abs(ms); const tm=Math.floor(abs/60000); const h=Math.floor(tm/60), m=tm%60;
    const label=h>0?`${h} שעות ${m} דק'`:`${m} דק'`;
    return ms<=0?`פג לפני ${label}`:`נותרו ${label}`;
  }
  function render(){
    const list=$('list');
    if(bottles.length===0){ list.innerHTML=`<div class="empty"><span class="icon">${ICONS.bottle}</span><div>אין בקבוקים פעילים</div></div>`; }
    else{
      const sorted=[...bottles].sort((a,b)=>b.startTime-a.startTime);
      list.innerHTML=sorted.map(b=>{
        const st=statusOf(b); let cls='';
        if(st.expired) cls='expired'; else if(st.soon) cls='soon';
        return `<div class="card ${cls}">
          <div class="c-top"><div class="c-type">${TYPE_LABEL[b.type]}</div><div class="c-time">הוכן ${fmtTime(b.startTime)}</div></div>
          <div class="c-amount">${b.amount}<small> מ״ל</small></div>
          <div class="c-status">${fmtRemaining(st.remaining)}</div>
          <div class="c-actions">
            <button onclick="openClose('${b.id}','finished')"><span class="icon" style="width:15px;height:15px;">${ICONS.check}</span>נגמר</button>
            <button onclick="openClose('${b.id}','discarded')"><span class="icon" style="width:15px;height:15px;">${ICONS.trash}</span>נזרק</button>
          </div>
        </div>`;
      }).join('');
    }
    if(history.length){
      $('histLabel').style.display='block'; $('historyCard').style.display='block';
      const recent=[...history].sort((a,b)=>b.endTime-a.endTime).slice(0,6);
      $('historyCard').innerHTML=recent.map(h=>{
        if(h.type==='nursing'){ const mins=Math.round(h.durationMs/60000);
          return `<div class="hist-item"><div>הנקה · ${mins} דק'${h.estLow!=null?` · ~${h.estLow}-${h.estHigh} מ״ל`:''}<div class="h-time">${fmtTime(h.startTime)}</div></div><span class="tag">הנקה</span></div>`; }
        if(h.type==='pumped'){ return `<div class="hist-item"><div>שאיבה · ${h.amount} מ״ל<div class="h-time">${fmtTime(h.startTime)}</div></div><span class="tag">שאיבה</span></div>`; }
        return `<div class="hist-item"><div>${TYPE_LABEL[h.type]} · ${h.consumed}/${h.initial} מ״ל<div class="h-time">${fmtTime(h.startTime)}</div></div><span class="tag ${h.outcome==='discarded'?'discarded':''}">${h.outcome==='finished'?'הסתיים':'נזרק'}</span></div>`;
      }).join('');
    } else { $('histLabel').style.display='none'; $('historyCard').style.display='none'; }
  }
  function renderInsights(){
    const todayStart=new Date(); todayStart.setHours(0,0,0,0);
    const todayHist=history.filter(h=>h.endTime>=todayStart.getTime());
    const feeds=todayHist.filter(h=>h.type==='breast'||h.type==='formula');
    const totalToday=feeds.reduce((s,h)=>s+h.consumed,0)+todayHist.filter(h=>h.type==='nursing'&&h.estMid).reduce((s,h)=>s+h.estMid,0);
    const totalPrepared=feeds.reduce((s,h)=>s+h.initial,0);
    const wasted=feeds.filter(h=>h.outcome==='discarded').reduce((s,h)=>s+(h.initial-h.consumed),0);
    const allFeeds=history.filter(h=>h.type==='breast'||h.type==='formula');
    const avgPerBottle=allFeeds.length?Math.round(allFeeds.reduce((s,h)=>s+h.consumed,0)/allFeeds.length):0;
    const wastePct=totalPrepared?Math.round((wasted/totalPrepared)*100):0;
    const name = profile.babyName || 'התינוק/ת';
    $('statGrid').innerHTML=`
      <div class="stat-box"><div class="num">${totalToday}</div><div class="lbl">מ״ל היום</div></div>
      <div class="stat-box"><div class="num">${feeds.length}</div><div class="lbl">בקבוקים היום</div></div>
      <div class="stat-box"><div class="num">${avgPerBottle}</div><div class="lbl">ממוצע למנה</div></div>
      <div class="stat-box"><div class="num">${wastePct}%</div><div class="lbl">פחת</div></div>`;
    let cards='';
    const months=ageInMonths();
    const w=latestWeight();
    if(w){
      const dailyMin=Math.round(w.weightKg*150), dailyMax=Math.round(w.weightKg*200);
      let tone='', msg=`לפי משקל של ${w.weightKg} ק"ג, טווח יומי מקובל ל${name} הוא כ-${dailyMin}–${dailyMax} מ״ל. היום נצרכו כ-${totalToday} מ״ל.`;
      if(totalToday < dailyMin && feeds.length){ tone='warn'; msg=`לפי משקל של ${w.weightKg} ק"ג, טווח יומי מקובל ל${name} הוא כ-${dailyMin}–${dailyMax} מ״ל, והיום נצרכו רק כ-${totalToday} מ״ל.`; }
      else if(totalToday > dailyMax){ tone='warn'; msg=`לפי משקל של ${w.weightKg} ק"ג, טווח יומי מקובל ל${name} הוא כ-${dailyMin}–${dailyMax} מ״ל, והיום נצרכו כ-${totalToday} מ״ל - מעל הטווח.`; }
      cards+=`<div class="tip ${tone}"><b>כמות מול משקל</b>${msg} מידע כללי, לא ייעוץ רפואי.</div>`;
    } else if(months===null){ cards+=`<div class="tip"><b>הוסיפו גיל ומשקל</b>כדי לקבל השוואה אם הכמויות מתאימות ל${name}, בהגדרות.</div>`; }
    else if(allFeeds.length){
      const range=ageRangeFor(months);
      let tone='', msg=`הכמות הממוצעת (${avgPerBottle} מ״ל) בטווח המקובל לגיל (${range.min}–${range.max} מ״ל).`;
      if(avgPerBottle<range.min){ tone='warn'; msg=`הכמות הממוצעת (${avgPerBottle} מ״ל) נמוכה מהטווח המקובל (${range.min}–${range.max} מ״ל).`; }
      else if(avgPerBottle>range.max){ tone='warn'; msg=`הכמות הממוצעת (${avgPerBottle} מ״ל) גבוהה מהטווח המקובל (${range.min}–${range.max} מ״ל).`; }
      cards+=`<div class="tip ${tone}"><b>כמות מול גיל</b>${msg} מידע כללי, לא ייעוץ רפואי.</div>`;
    }
    if(wastePct>=20 && feeds.length){ cards+=`<div class="tip warn"><b>פחת גבוה</b>כ-${wastePct}% מהחלב שהוכן היום נזרק.</div>`; }
    const nurseCountToday = todayHist.filter(h=>h.type==='nursing').length;
    if(nurseCountToday){
      const pump = pumpRatePerMin();
      const src = pump.count>=5 ? 'בעיקר על סמך נתוני שאיבה' : pump.count>0 ? 'משלב נתוני שאיבה ובקבוק' : 'על סמך קצב שתייה מבקבוקים';
      cards+=`<div class="tip"><b>הנקות היום</b>בוצעו ${nurseCountToday} הנקות. ההערכה מבוססת ${src}.</div>`;
    }
    if(!history.length){ cards+=`<div class="tip"><b>עוד אין נתונים</b>ככל שתתעדו יותר, כאן יופיעו תובנות על ${name}.</div>`; }
    $('insightCards').innerHTML=cards;
  }

  window.openClose=async function(id,reason){
    const b=bottles.find(x=>x.id===id); if(!b) return;
    if(reason==='finished'){ await closeBottle(b,0,'finished'); return; }
    closingBottle=b; closeReason=reason; mode='close'; currentAmount=b.amount;
    $('modalTitle').textContent='נזרק — כמה נשאר?';
    $('modalSub').textContent='גררו לכמות שנשארה';
    $('typeToggle').style.display='none';
    $('saveBtn').textContent='סמן כנזרק';
    buildTicks(); updateGauge();
    $('overlay').classList.add('open');
  };
  async function closeBottle(b,remaining,outcome){
    const consumed=Math.max(0,b.amount-remaining);
    history.push({id:'h-'+Date.now(),type:b.type,initial:b.amount,remaining,consumed,startTime:b.startTime,endTime:Date.now(),outcome});
    bottles=bottles.filter(x=>x.id!==b.id);
    await saveBottles(); await saveHistory(); render(); renderInsights(); renderBabyHeader();
    confirmPulse(outcome==='finished'?`נאכלו ${consumed} מ״ל`:`נזרקו ${remaining} · נאכלו ${consumed}`);
  }

  $('tabActive').addEventListener('click', ()=>{ $('tabActive').classList.add('active'); $('tabInsights').classList.remove('active'); $('viewActive').style.display='block'; $('viewInsights').style.display='none'; });
  $('tabInsights').addEventListener('click', ()=>{ $('tabInsights').classList.add('active'); $('tabActive').classList.remove('active'); $('viewActive').style.display='none'; $('viewInsights').style.display='block'; renderInsights(); });

  $('cancelBtn').addEventListener('click', ()=>{ $('overlay').classList.remove('open'); mode='add'; closingBottle=null; });
  function openAddModal(){
    mode='add';
    const m=profile.feedingMode;
    selectedType=(m==='nurse_formula')?'formula':'breast';
    currentAmount=selectedType==='formula'?lastFormulaAmount:130;
    $('modalTitle').textContent='בקבוק חדש'; $('modalSub').textContent='כמה הכנתם?';
    $('typeToggle').style.display = (m==='formula_pump_bottle') ? 'flex' : 'none';
    $('saveBtn').textContent='שמור בקבוק';
    document.querySelectorAll('#typeToggle button').forEach(b=>b.classList.toggle('active', b.dataset.type===selectedType));
    buildTicks(); updateGauge();
    $('overlay').classList.add('open');
  }
  $('typeToggle').addEventListener('click', e=>{
    const btn=e.target.closest('button'); if(!btn) return;
    document.querySelectorAll('#typeToggle button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); selectedType=btn.dataset.type;
    if(selectedType==='formula'){ currentAmount=lastFormulaAmount; updateGauge(); }
  });

  function yForAmount(amt){ const pct=Math.max(0,Math.min(1,amt/MAX_ML)); return 32+(222*(1-pct)); }
  function buildTicks(){
    const g=$('tickGroup'); let s='';
    for(let v=0; v<=MAX_ML; v+=25){
      const y=yForAmount(v); const major=v%50===0;
      s+=`<line x1="${major?26:30}" y1="${y}" x2="38" y2="${y}" stroke-width="${major?1.3:0.7}"/>`;
      if(major) s+=`<text x="20" y="${y+3}" text-anchor="end">${v}</text>`;
    }
    g.innerHTML=s;
  }
  function updateGauge(){
    const topY=yForAmount(currentAmount);
    $('milkGroup').style.transform=`translateY(${topY-130}px)`;
    $('milkGroup').style.transition='transform .3s cubic-bezier(.34,1.3,.64,1)';
    $('gaugeNum').textContent=currentAmount;
  }
  let waveT=0;
  let waveRafId=null;
  function animateWave(){
    waveT+=0.045;
    const wave=$('milkWave');
    if(wave && $('overlay').classList.contains('open')){
      const amp=3, off=Math.sin(waveT)*amp;
      wave.setAttribute('d', `M -10,${130+off} Q 25,${130-off*1.6} 60,${130+off*0.6} T 150,${130+off} V 300 H -10 Z`);
    }
    waveRafId=requestAnimationFrame(animateWave);
  }
  waveRafId=requestAnimationFrame(animateWave);

  let dragging=false;
  const svg=$('bottleSvg');
  function amountFromY(clientY){
    const rect=svg.getBoundingClientRect(); const relY=clientY-rect.top;
    const scaledY=(relY/rect.height)*280; const clampedY=Math.max(32,Math.min(254,scaledY));
    const pct=1-((clampedY-32)/222);
    return Math.round((pct*MAX_ML)/TICK_STEP)*TICK_STEP;
  }
  function handleMove(clientY){ currentAmount=Math.max(0,Math.min(MAX_ML,amountFromY(clientY))); updateGauge(); }
  const onMouseDown = e=>{ dragging=true; handleMove(e.clientY); };
  const onMouseMove = e=>{ if(dragging) handleMove(e.clientY); };
  const onMouseUp = ()=>dragging=false;
  const onTouchStart = e=>{ dragging=true; handleMove(e.touches[0].clientY); e.preventDefault(); };
  const onTouchMove = e=>{ if(dragging){ handleMove(e.touches[0].clientY); e.preventDefault(); } };
  const onTouchEnd = ()=>dragging=false;
  svg.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  svg.addEventListener('touchstart', onTouchStart, {passive:false});
  svg.addEventListener('touchmove', onTouchMove, {passive:false});
  svg.addEventListener('touchend', onTouchEnd);

  $('saveBtn').addEventListener('click', async ()=>{
    if(mode==='add'){
      const bottle={id:'b-'+Date.now(), type:selectedType, amount:currentAmount, startTime:Date.now()};
      bottles.push(bottle);
      if(selectedType==='formula'){ lastFormulaAmount=currentAmount; await saveLastFormula(); }
      await saveBottles(); $('overlay').classList.remove('open'); render(); renderInsights();
      confirmPulse('הבקבוק נשמר');
    } else {
      await closeBottle(closingBottle, currentAmount, closeReason);
      $('overlay').classList.remove('open'); mode='add'; closingBottle=null;
    }
  });

  const mainInterval = setInterval(()=>{ if(bottles.length) render(); renderBabyHeader(); }, 15000);
  loadData();

  return function cleanup(){
    clearInterval(mainInterval);
    if(nursingTickInterval) clearInterval(nursingTickInterval);
    if(pumpTickInterval) clearInterval(pumpTickInterval);
    if(waveRafId) cancelAnimationFrame(waveRafId);
    svg.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    svg.removeEventListener('touchstart', onTouchStart);
    svg.removeEventListener('touchmove', onTouchMove);
    svg.removeEventListener('touchend', onTouchEnd);
    delete window.openClose;
  };
}

export default function AppShell() {
  useEffect(() => {
    const cleanup = initApp();
    return () => { if (cleanup) cleanup(); };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: MARKUP }} />;
}
