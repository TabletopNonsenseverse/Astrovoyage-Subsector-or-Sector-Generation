import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL='https://dgllzmwjzirnvpekjpij.supabase.co';
const SUPABASE_KEY='sb_publishable_iZ00EqMGBu5R3K-e9DKF-A__ABVi7CH';
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY);
let user=null;
let saveTimer=null;
const $=id=>document.getElementById(id);

function escapeHtml(s){return String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\':'&#92;','"':'&quot;'}[c]))}
function toast(t){const x=$('toast');if(x){x.textContent=t;x.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>x.classList.remove('show'),2200)}}

async function init(){
  const {data}=await supabase.auth.getUser();
  user=data.user||null;
  renderAuth();
  if(user) await refreshLibrary();
  supabase.auth.onAuthStateChange(async(_event,session)=>{user=session?.user||null;renderAuth();if(user) await refreshLibrary();else renderLibrary([])});
}
function renderAuth(){
  let box=$('accountPanel');
  if(!box)return;
  if(user){
    box.innerHTML=`<div class="account-user">${escapeHtml(user.email||'Signed in')}</div><button id="signOutBtn" class="full">Sign out</button>`;
    $('signOutBtn').onclick=()=>supabase.auth.signOut();
    refreshLibrary();
  }else{
    box.innerHTML=`<label>Email<input id="authEmail" type="email" autocomplete="email" placeholder="you@example.com"></label><label>Password<input id="authPassword" type="password" autocomplete="current-password" placeholder="Password"></label><div class="button-row"><button id="signInBtn" class="primary">Sign in</button><button id="signUpBtn">Create account</button></div><p class="muted small">Your sectors are stored in your account, not just this browser.</p>`;
    $('signInBtn').onclick=()=>auth('signin');$('signUpBtn').onclick=()=>auth('signup');
  }
}
async function auth(mode){
  const email=$('authEmail').value.trim(),password=$('authPassword').value;
  if(!email||!password)return toast('Enter an email and password.');
  const result=mode==='signin'?await supabase.auth.signInWithPassword({email,password}):await supabase.auth.signUp({email,password});
  if(result.error)return toast(result.error.message);
  toast(mode==='signup'?'Account created. Check your email if confirmation is required.':'Signed in.');
}
async function refreshLibrary(){
  if(!user)return renderLibrary([]);
  const {data,error}=await supabase.from('sectors').select('id,name,kind,is_public,updated_at').order('updated_at',{ascending:false});
  if(error){console.warn(error);return toast('Library database is not available yet.');}
  renderLibrary(data||[]);
}
function renderLibrary(items){
  const list=$('libraryList');if(!list)return;
  if(!user){list.innerHTML='<div class="muted small">Sign in to see your saved sectors.</div>';return}
  if(!items.length){list.innerHTML='<div class="muted small">No saved sectors yet. Use Save to Library.</div>';return}
  list.innerHTML=items.map(x=>`<div class="library-row"><button class="library-open" data-id="${x.id}"><strong>${escapeHtml(x.name)}</strong><span>${x.kind==='sector'?'Sector':'Subsector'}${x.is_public?' · Shared':''}</span></button><button class="library-delete" data-id="${x.id}" title="Delete">×</button></div>`).join('');
  list.querySelectorAll('.library-open').forEach(b=>b.onclick=()=>loadLibraryMap(b.dataset.id));
  list.querySelectorAll('.library-delete').forEach(b=>b.onclick=()=>deleteLibraryMap(b.dataset.id));
}
async function saveToLibrary(map){
  if(!user)return;
  clearTimeout(saveTimer);saveTimer=setTimeout(async()=>{
    const id=map.libraryId||null;
    const payload={user_id:user.id,name:map.title||'Untitled Map',kind:map.mode||'subsector',data:map};
    let result;
    if(id)result=await supabase.from('sectors').update(payload).eq('id',id).eq('user_id',user.id).select('id').single();
    else result=await supabase.from('sectors').insert(payload).select('id').single();
    if(result.error){console.warn(result.error);toast('Could not save to library.');return}
    if(!id){map.libraryId=result.data.id;localStorage.setItem('astrovoyage-map',JSON.stringify(map));}
    await refreshLibrary();
  },400);
}
async function loadLibraryMap(id){
  const {data,error}=await supabase.from('sectors').select('*').eq('id',id).single();
  if(error)return toast('Could not open sector.');
  const map={...data.data,libraryId:data.id,title:data.name,mode:data.kind};
  localStorage.setItem('astrovoyage-map',JSON.stringify(map));
  location.hash='map='+encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(map)))));
  location.reload();
}
async function deleteLibraryMap(id){
  if(!confirm('Delete this map from your library?'))return;
  const {error}=await supabase.from('sectors').delete().eq('id',id).eq('user_id',user.id);
  if(error)return toast('Could not delete map.');
  await refreshLibrary();toast('Map deleted.');
}
window.AstroLibrary={supabase,getUser:()=>user,saveToLibrary,refreshLibrary,loadLibraryMap};
window.addEventListener('DOMContentLoaded',init);
