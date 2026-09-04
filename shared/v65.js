/* MBI Signal Logger V6.5.1 shared interface runtime */
(()=>{'use strict';
  const STORAGE_KEY='mbi-signal-logger-theme';
  const BASE={primary:'#1464ed',accent:'#3b82f6',sidebar:'#032552',page:'#f3f7fb',surface:'#ffffff',ink:'#071537',muted:'#5b6980',success:'#07894c',warning:'#b96100',danger:'#c92f35',gradient:true,fontScale:1,radius:12,shadow:'subtle',tableDensity:'comfortable',tableColors:{odd:'#ffffff',even:'#eceff3',hover:'#dfeafa',darkOdd:'#0d2137',darkEven:'#172d45',darkHover:'#1d3a59'},glass:{enabled:true,blur:12,opacity:.9},darkModeDefault:false};
  const isObject=value=>value&&typeof value==='object'&&!Array.isArray(value);
  const merge=(a,b)=>isObject(a)?Object.fromEntries([...new Set([...Object.keys(a),...Object.keys(b||{})])].map(k=>[k,merge(a[k],b?.[k])])):(b===undefined?a:b);
  function design(config,app){
    const legacy=config?.theme||{},system=config?.designSystem||{},base=merge(BASE,system.base||{}),override=system.apps?.[app]||{};
    return merge(base,merge({primary:legacy.primary,accent:legacy.accent,sidebar:legacy.sidebar,success:legacy.success,warning:legacy.warning,danger:legacy.danger},override));
  }
  function preferredMode(config){
    const saved=localStorage.getItem(STORAGE_KEY);
    if(saved==='dark'||saved==='light')return saved;
    return config?.designSystem?.base?.darkModeDefault||config?.theme?.darkMode?'dark':'light';
  }
  function apply(config,app){
    const d=design(config,app),root=document.documentElement,glass=isObject(d.glass)?d.glass:BASE.glass;
    const tableColors=merge(BASE.tableColors,d.tableColors||{}),vars={primary:d.primary,accent:d.accent,sidebar:d.sidebar,page:d.page,surface:d.surface,ink:d.ink,muted:d.muted,success:d.success,warning:d.warning,danger:d.danger,'ui-radius':`${Number(d.radius)||12}px`,'font-scale':String(Number(d.fontScale)||1),'glass-blur':`${Math.max(0,Number(glass.blur)||0)}px`,'glass-opacity':String(Math.min(1,Math.max(.5,Number(glass.opacity)||.9))),'table-row-odd':tableColors.odd,'table-row-even':tableColors.even,'table-row-hover':tableColors.hover,'table-row-dark-odd':tableColors.darkOdd,'table-row-dark-even':tableColors.darkEven,'table-row-dark-hover':tableColors.darkHover};
    for(const [key,value] of Object.entries(vars))if(value!=null)root.style.setProperty(`--${key}`,value);
    document.body.dataset.app=app;document.body.dataset.shadow=d.shadow||'subtle';document.body.dataset.density=d.tableDensity||'comfortable';document.body.dataset.gradient=d.gradient===false?'off':'on';document.body.dataset.glass=glass.enabled===false?'off':'on';
    setMode(preferredMode(config),false);return d;
  }
  function setMode(mode,persist=true){
    const dark=mode==='dark';document.documentElement.style.colorScheme=dark?'dark':'light';document.body.classList.toggle('dark',dark);document.body.dataset.theme=dark?'dark':'light';
    if(persist)localStorage.setItem(STORAGE_KEY,dark?'dark':'light');
    document.querySelectorAll('[data-v65-theme-toggle]').forEach(button=>{button.setAttribute('aria-pressed',String(dark));button.setAttribute('aria-label',dark?'Use light mode':'Use dark mode');const label=button.querySelector('[data-theme-label]');if(label)label.textContent=dark?'Light mode':'Dark mode'});
    window.dispatchEvent(new CustomEvent('mbi:themechange',{detail:{mode:dark?'dark':'light'}}));
  }
  function toggleMode(){setMode(document.body.classList.contains('dark')?'light':'dark')}
  function bindThemeButtons(){document.querySelectorAll('[data-v65-theme-toggle]').forEach(button=>{if(button.dataset.themeBound)return;button.dataset.themeBound='1';button.addEventListener('click',toggleMode)});setMode(document.body.classList.contains('dark')?'dark':'light',false)}
  function toast(message,type='info',timeout=4200){
    let stack=document.getElementById('v65ToastStack');if(!stack){stack=document.createElement('div');stack.id='v65ToastStack';stack.className='v65-toast-stack';stack.setAttribute('aria-live','polite');stack.setAttribute('aria-atomic','false');document.body.appendChild(stack)}
    const item=document.createElement('div');item.className=`v65-toast ${type}`;item.setAttribute('role',type==='error'?'alert':'status');item.innerHTML=`<span class="v65-toast-icon" aria-hidden="true">${type==='success'?'✓':type==='error'?'!':'i'}</span><span></span><button type="button" aria-label="Dismiss notification">×</button>`;item.children[1].textContent=message;item.lastElementChild.onclick=()=>item.remove();stack.appendChild(item);requestAnimationFrame(()=>item.classList.add('show'));setTimeout(()=>{item.classList.remove('show');setTimeout(()=>item.remove(),180)},timeout);return item;
  }
  function dashboardWidgets(config,app,defaults){
    const configured=config?.dashboards?.[app];if(!Array.isArray(configured)||!configured.length)return defaults;
    const byId=new Map(configured.map(widget=>[widget.id,widget]));
    return defaults.map((widget,index)=>merge(widget,byId.get(widget.id)||{order:index+1})).filter(widget=>widget.visible!==false).sort((a,b)=>(Number(a.order)||99)-(Number(b.order)||99));
  }
  document.addEventListener('contextmenu',event=>event.preventDefault(),{capture:true});
  window.UnifiedUI={BASE,merge,design,apply,setMode,toggleMode,bindThemeButtons,toast,dashboardWidgets,storageKey:STORAGE_KEY};
})();
