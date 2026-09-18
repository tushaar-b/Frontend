'use client';
import {useState,useEffect,useRef,useCallback, type CSSProperties} from 'react';
import {usePathname,useRouter} from 'next/navigation';
import {ArrowLeft,ArrowRight,ArrowUp,ArrowDown,Plus,Search,Network,Images,MessageCircle,Film,Mic,Play,Pause,Volume2,Maximize,Minus,Scan,List,Check,Copy,AudioLines,FileText,RotateCcw,Upload,X,Info,ChevronRight,Sparkles,Layers} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Sheet,SheetContent,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import {Sidebar,SidebarProvider,SidebarContent,SidebarMenu,SidebarMenuItem,SidebarMenuButton} from '@/components/ui/sidebar';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {Slider} from '@/components/ui/slider';
import {Checkbox} from '@/components/ui/checkbox';
import {Brand,Wave} from './archive-app';
import {seed,people,events,questions,readState,writeState,saveBlob,getBlob,clearMedia,type State,type Fragment,type Question,type Chapter} from './data';

function useMedia(id?:string){const[url,setUrl]=useState<string>();useEffect(()=>{let alive=true,u:string|undefined;setUrl(undefined);if(id)getBlob(id).then(b=>{if(b&&alive){u=URL.createObjectURL(b);setUrl(u)}}).catch(()=>{});return()=>{alive=false;if(u)URL.revokeObjectURL(u)}},[id]);return url}
function Face({id='meera',size=38}:{id?:string;size?:number}){const p=people.find(x=>x.id===id);return id==='meera'?<img className="avatar" src="/images/meera.png" alt="Meera" style={{width:size,height:size}}/>:<span className={'avatar initials '+id} style={{width:size,height:size}}>{p?.name.slice(0,1)}</span>}
function Visual({f}:{f:Fragment}){const url=useMedia(f.media);if(f.image||url&&f.mime?.startsWith('image'))return <img src={f.image||url} alt={f.title} loading="lazy"/>;if(url&&f.mime?.startsWith('video'))return <video src={url} controls/>;if(f.kind==='Voices')return <div className="voice-visual"><AudioLines size={25}/><Wave/><span>{f.text?'Words from '+(people.find(p=>p.id===f.people[0])?.name||'family'):'A new voice in the archive'}</span></div>;return <div className={'paper-visual '+(f.id==='ticket'?'train-ticket':'')}><small>{f.id==='ticket'?'INDIAN RAILWAYS':f.kind==='Messages'?'A LITTLE NOTE':f.place.toUpperCase()+' · '+f.year}</small><p>{f.text}</p><span>{f.kind==='Letters'?'From the family papers':'Passed between family'}</span></div>}
const nav=[{href:'/archive',title:'Story board',short:'Story',icon:Network},{href:'/archive/fragments',title:'Fragments',short:'Memories',icon:Images},{href:'/archive/questions',title:'Questions',short:'Questions',icon:MessageCircle},{href:'/film',title:'Our film',short:'Film',icon:Film}];
export default function Workspace(){const path=usePathname();const router=useRouter();const[state,setState]=useState<State>(seed);const[ready,setReady]=useState(false);const[notice,setNotice]=useState('');const[detail,setDetail]=useState<string|null>(null);const[question,setQuestion]=useState<Question|null>(null);const[share,setShare]=useState<Question|null>(null);const[add,setAdd]=useState(false);const[reset,setReset]=useState(false);const[search,setSearch]=useState('');const[searchOpen,setSearchOpen]=useState(false);
useEffect(()=>{setState(readState());setReady(true)},[]);const update=useCallback((next:State)=>{try{writeState(next);setState(next)}catch{setNotice('Your device storage is full. Please free some space and try again.');throw new Error('Storage unavailable')}},[]);useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),5500);return()=>clearTimeout(t)},[notice]);
const fragment=state.fragments.find(f=>f.id===detail);const isContribute=path.startsWith('/contribute');const onSave=async(f:Fragment,qid:string)=>{update({...state,fragments:[...state.fragments,f],statuses:{...state.statuses,[qid]:'Answered'}});setNotice('Meera added her memory.')};
useEffect(()=>{const mc=(navigator as any).modelContext;if(!mc?.registerTool)return;mc.registerTool({name:'search_family_archive',description:'Search the device-local fictional Mehra family archive.',inputSchema:{type:'object',properties:{query:{type:'string'}},required:['query']},execute:({query}:{query:string})=>({content:[{type:'text',text:JSON.stringify(state.fragments.filter(f=>(f.title+' '+f.text).toLowerCase().includes(query.toLowerCase())))}]})});return()=>mc.unregisterTool?.('search_family_archive')},[state]);
if(isContribute)return <><Contribution state={state} onSave={onSave}/><div className="toast" role="status">{notice}</div></>;
return <div className="archive-app"><header className="archive-header"><Brand/><div className="header-center"><span className="small-dot"/> THE MEHRA FAMILY <span className="header-slash">/</span> <span>Sample archive</span></div><button className="icon-button" aria-label="Search the archive" onClick={()=>setSearchOpen(true)}><Search size={19}/></button></header><SidebarProvider style={{'--sidebar-width':'208px'} as CSSProperties} className="archive-layout"><Sidebar className="archive-sidebar"><SidebarContent><span className="rail-label">YOUR FAMILY ARCHIVE</span><SidebarMenu>{nav.map(n=><SidebarMenuItem key={n.href}><SidebarMenuButton asChild isActive={path===n.href}><a href={n.href}><n.icon size={18}/><span>{n.title}</span>{n.title==='Questions'&&<small>{questions.filter(q=>state.statuses[q.id]!=='Answered').length}</small>}</a></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu><div className="rail-family"><span className="rail-label">THE PEOPLE IN OUR STORY</span>{people.map(p=><a href={'/archive/people/'+p.id} key={p.id}><Face id={p.id} size={28}/><span>{p.name}</span></a>)}</div><div className="rail-bottom"><span className="thread-emblem">⌁</span><p>A little remembering.<br/>A little closer.</p><button onClick={()=>setReset(true)}>Reset sample archive</button><small>Demo · saved on this device</small></div></SidebarContent></Sidebar><main className="workspace"><header className="workspace-title"><div><span className="eyebrow">OUR SHARED COLLECTION</span><h1>{path==='/archive'?'The Mehra family':path.includes('/fragments')?'Every fragment, a beginning.':path.includes('/questions')?'Stories worth asking about.':path==='/film'?'The family, in their own words.':'A life, in little moments.'}</h1><p>{path==='/archive'?'A story, still becoming.':path.includes('/fragments')?`${state.fragments.length} fragments, held together by the people who remember.`:path.includes('/questions')?'Small questions. Memories only your family can share.':path==='/film'?'Collected moments. Connected voices.':'Follow the threads they have given us.'}</p></div><div className="workspace-actions"><div className="avatar-stack">{people.slice(0,3).map(p=><a key={p.id} href={'/archive/people/'+p.id} aria-label={p.name}><Face id={p.id} size={26}/></a>)}<span>+{people.length-3}</span></div><button className="brass-button" onClick={()=>setAdd(true)}><Plus size={15}/> Add a memory</button></div></header>
{path==='/archive'?<Board state={state} onDetail={setDetail} onQuestion={setQuestion}/>:path==='/archive/fragments'?<Collection state={state} onDetail={setDetail}/>:path==='/archive/questions'?<Questions state={state} update={update} onShare={setShare} onQuestion={setQuestion}/>:path==='/film'?<FilmView state={state} update={update} onDetail={setDetail}/>:path.startsWith('/archive/people/')?<Profile id={path.split('/').pop()!} state={state} onDetail={setDetail} onQuestion={setQuestion}/>:<div className="empty"><h2>This page isn’t in the album.</h2><a href="/archive">Return to the archive</a></div>}
<div className="workspace-footnote">FICTIONAL SAMPLE ARCHIVE <span>Generated photographs · Authored sample recollections · Device-local only</span></div></main></SidebarProvider><nav className="mobile-nav">{nav.map(n=><a href={n.href} key={n.href} className={path===n.href?'active':''}><n.icon size={19}/>{n.short}</a>)}</nav>
<Sheet open={!!question} onOpenChange={o=>!o&&setQuestion(null)}><SheetContent className="detail-sheet">{question&&<QuestionDetails q={question} state={state} onShare={()=>{setShare(question);setQuestion(null)}}/>}</SheetContent></Sheet>
<Sheet open={!!fragment} onOpenChange={o=>!o&&setDetail(null)}><SheetContent className="detail-sheet">{fragment&&<FragmentDetail f={fragment} onQuestion={q=>{setDetail(null);setQuestion(q)}}/>}</SheetContent></Sheet>
<ShareModal q={share} close={()=>setShare(null)} onAsked={q=>{update({...state,statuses:{...state.statuses,[q.id]:'Asked'}});setNotice('Marked as shared by you.');setShare(null)}} notice={setNotice}/>
<AddMemory open={add} close={()=>setAdd(false)} onSave={async f=>{update({...state,fragments:[...state.fragments,f]});setAdd(false);setNotice('Your memory has joined the archive.')}}/>
<Dialog open={reset} onOpenChange={setReset}><DialogContent className="paper-dialog"><DialogTitle>Begin the sample again?</DialogTitle><DialogDescription>This removes your added memories, recordings, question states and chapter edits from this browser. The original sample remains.</DialogDescription><button className="primary" onClick={async()=>{await clearMedia();update(seed);setReset(false);setNotice('The sample archive has been reset.')}}>Reset this device’s archive</button><button className="plain-button" onClick={()=>setReset(false)}>Keep my memories</button></DialogContent></Dialog>
<Dialog open={searchOpen} onOpenChange={setSearchOpen}><DialogContent className="paper-dialog search-dialog"><DialogTitle>Find a little piece of the story</DialogTitle><DialogDescription>Search titles, places, and remembered words.</DialogDescription><input autoFocus value={search} onChange={e=>setSearch(e.target.value)} placeholder="Try ‘mango’, ‘Meera’, or ‘Delhi’" aria-label="Search memories"/><div className="search-results">{state.fragments.filter(f=>(f.title+' '+f.text+' '+f.place+' '+f.people.join(' ')).toLowerCase().includes(search.toLowerCase())).map(f=><button key={f.id} onClick={()=>{setSearchOpen(false);setDetail(f.id)}}><span>{f.title}</span><small>{f.kind} · {f.date}</small><ChevronRight size={16}/></button>)}</div>{!state.fragments.some(f=>(f.title+' '+f.text+' '+f.place+' '+f.people.join(' ')).toLowerCase().includes(search.toLowerCase()))&&<p>No memories match this search. Try another word.</p>}</DialogContent></Dialog><div className={'toast '+(notice?'visible':'')} role="status">{notice&&<Check size={17}/>} {notice}</div></div>}

function Board({state,onDetail,onQuestion}:{state:State;onDetail:(id:string)=>void;onQuestion:(q:Question)=>void}){
  const[mode,setMode]=useState('map');
  const[range,setRange]=useState('all');
  const[zoom,setZoom]=useState(.9);
  const[pan,setPan]=useState({x:0,y:0});
  const[person,setPerson]=useState<string|null>(null);
  const[isSpread,setIsSpread]=useState(false);
  const drag=useRef<{x:number;y:number;px:number;py:number}|null>(null);
  const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(innerWidth<700)setMode('list')},[]);

  const positions=[
    [385,145,275],
    [720,40,190],
    [220,380,120],
    [62,70,183],
    [790,320,183],
    [30,365,178],
    [570,440,220],
    [358,15,205],
    [810,545,180],
    [340,615,180],
    [590,660,210]
  ];

  // Natural stacked offsets [offsetX, offsetY, rotDeg, zIndex] for initial organic pile
  const stackOffsets = [
    [0, 0, -3.5, 12],      // 0: wedding-photo (top hero)
    [32, -22, 6.2, 10],    // 1: house-photo
    [-42, 28, -9.4, 11],   // 2: meera-portrait
    [24, 30, 4.8, 8],      // 3: letter
    [-28, -26, -5.8, 7],   // 4: recipe
    [38, 16, 10.5, 9],     // 5: ticket
    [-16, 12, -4.2, 6],    // 6: wedding-voice
    [14, -38, 7.8, 5],     // 7: moving-message
    [-34, -14, -11.2, 4],  // 8: train-note
    [26, 36, 8.6, 3],      // 9: afternoon-note
    [-10, 20, -6.8, 2]     // 10: mango-memory
  ];
  const STACK_CENTER = [425, 235];

  const ids=['wedding-photo','house-photo','meera-portrait','letter','recipe','ticket','wedding-voice','moving-message','train-note','afternoon-note','mango-memory'];
  const fs=ids.map(id=>state.fragments.find(f=>f.id===id)!).filter(f=>range==='all'||range==='early'&&f.year<1990||range==='later'&&f.year>=1990);
  const response=state.fragments.find(f=>f.id.startsWith('response-')&&f.event==='wedding');
  const fit=()=>{setZoom(Math.min(1,(host.current?.clientWidth||1000)/1080));setPan({x:0,y:0})};
  useEffect(fit,[]);

  return <>
    <div className="board-toolbar">
      <div className="date-filters">
        {[['all','All chapters'],['early','1976–1987'],['later','1994–2011']].map(([v,t])=><button key={v} className={range===v?'selected':''} onClick={()=>setRange(v)}>{t}</button>)}
      </div>
      <div className="board-toolbar-actions">
        {mode==='map'&&<button className={isSpread?"muted-button":"brass-button"} onClick={()=>setIsSpread(!isSpread)}>
          {isSpread?<Layers size={15}/>:<Sparkles size={15}/>}
          {isSpread?'Gather into pile':'Spread graph'}
        </button>}
        <button className="muted-button" onClick={()=>setMode(mode==='map'?'list':'map')}>
          {mode==='map'?<List size={16}/>:<Network size={16}/>} {mode==='map'?'List view':'Explore map'}
        </button>
      </div>
    </div>
    {mode==='list'?<div className="board-list">
      {fs.map(f=><div key={f.id}>
        <button onClick={()=>onDetail(f.id)}>
          <Visual f={f}/>
          <div><small>{f.date} · {f.place}</small><h3>{f.title}</h3><p>{f.text.slice(0,130)}</p></div>
          <ArrowRight size={20}/>
        </button>
        {questions.find(q=>q.fragment===f.id)&&<button className="question-link" onClick={()=>onQuestion(questions.find(q=>q.fragment===f.id)!)}>
          <MessageCircle size={16}/> {state.statuses[questions.find(q=>q.fragment===f.id)!.id]==='Answered'?'A memory connected':'Follow the unanswered question'}
        </button>}
      </div>)}
    </div>:<div className={'board-map '+(isSpread?'is-spread':'is-stacked')} ref={host} onPointerDown={e=>{if((e.target as HTMLElement).closest('button,a'))return;drag.current={x:e.clientX,y:e.clientY,px:pan.x,py:pan.y};e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={e=>{if(drag.current)setPan({x:drag.current.px+e.clientX-drag.current.x,y:drag.current.py+e.clientY-drag.current.y})}} onPointerUp={()=>drag.current=null} onPointerCancel={()=>drag.current=null}>
      <div className="map-plane" style={{transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`}}>
        <svg className="map-lines" viewBox="0 0 1050 800" fill="none" aria-hidden="true" style={{opacity:isSpread?1:0,transition:'opacity 0.75s ease 0.2s',pointerEvents:isSpread?'auto':'none'}}>
          <path d="M520 280C310 330 100 0 150 150M520 280C700 270 770 70 815 130M520 280C640 380 790 490 860 415M520 280C500 390 350 490 280 440M280 440C200 420 120 460 120 430M280 440C350 590 550 500 660 490M520 280C450 200 450 90 440 55M815 130C820 550 650 580 700 690M120 430C110 580 400 580 440 670" stroke="#C1673A" strokeWidth="1.8" strokeDasharray="4 6"/>
          <path className={response?'complete-thread':''} d="M520 300C690 250 775 360 650 490" stroke="#C9B93A" strokeWidth="1.2" strokeOpacity={response?'.75':'.35'} strokeDasharray={response?'0':'4 6'}/>
        </svg>

        {fs.map(f=>{
          const i=ids.indexOf(f.id);
          const [gx,gy,w]=positions[i];
          const [sox,soy,srot,sz]=stackOffsets[i]||[0,0,0,1];
          const heroRotate=f.id==='wedding-photo'?'-1.4deg':f.id==='house-photo'?'1.6deg':f.id==='recipe'?'0.8deg':'0deg';
          
          const curX = isSpread ? gx : STACK_CENTER[0] + sox;
          const curY = isSpread ? gy : STACK_CENTER[1] + soy;
          const curRotate = isSpread ? heroRotate : `${srot}deg`;
          const curZ = isSpread ? (f.id==='meera-portrait'?4:2) : sz;
          const staggerDelay = isSpread ? `${i * 38}ms` : `${(10 - i) * 20}ms`;

          return <button 
            key={f.id} 
            className={'map-node '+(f.kind==='Photographs'?'node-photo':'node-document')+' '+(person&&!f.people.includes(person)?'receded':'')+' '+(f.id==='meera-portrait'?'person-node':'')+' '+(isSpread?'node-spread':'node-stacked')} 
            style={{
              left:curX,
              top:curY,
              width:w,
              rotate:curRotate,
              zIndex:curZ,
              transitionDelay:staggerDelay
            }} 
            onClick={()=>{
              if(!isSpread){
                setIsSpread(true);
              } else {
                onDetail(f.id);
              }
            }} 
            onMouseEnter={()=>f.id==='meera-portrait'&&setPerson('meera')} 
            onMouseLeave={()=>setPerson(null)} 
            onFocus={()=>f.id==='meera-portrait'&&setPerson('meera')} 
            onBlur={()=>setPerson(null)}
          >
            <Visual f={f}/>
            <span className="node-caption">{f.title}</span>
            <small>{f.date}</small>
          </button>
        })}

        <button 
          className={'map-question '+(response?'answered':'')} 
          style={{
            left:620,
            top:337,
            opacity:isSpread?1:0,
            transform:isSpread?'scale(1)':'scale(0.7) translate(-60px,-30px)',
            transition:'all 0.75s cubic-bezier(0.16,1,0.3,1) 0.3s',
            pointerEvents:isSpread?'auto':'none'
          }} 
          onClick={()=>onQuestion(questions[0])}
        >
          {response?<Check size={16}/>:<span className="question-dot"/>}
          <span>{response?'A memory connected':'A story missing'}<small>{response?'Meera added her memory':'Meera may remember'}</small></span>
        </button>

        <a 
          href="/archive/people/anil" 
          className="map-person" 
          style={{
            left:950,
            top:218,
            opacity:isSpread?1:0,
            transform:isSpread?'scale(1)':'scale(0.7) translate(-120px,0)',
            transition:'all 0.75s cubic-bezier(0.16,1,0.3,1) 0.35s',
            pointerEvents:isSpread?'auto':'none'
          }} 
          onMouseEnter={()=>setPerson('anil')} 
          onMouseLeave={()=>setPerson(null)} 
          onFocus={()=>setPerson('anil')} 
          onBlur={()=>setPerson(null)}
        >
          <Face id="anil" size={48}/>
          <span>Anil</span>
        </a>

        <span 
          className="map-event" 
          style={{
            left:105,
            top:300,
            opacity:isSpread?1:0,
            transform:isSpread?'scale(1)':'scale(0.7) translate(80px,0)',
            transition:'all 0.75s cubic-bezier(0.16,1,0.3,1) 0.25s',
            pointerEvents:isSpread?'auto':'none'
          }}
        >
          A NEW HOME <small>PUNE, 1994</small>
        </span>

        {response&&<button 
          className="response-node" 
          style={{
            left:585,
            top:550,
            opacity:isSpread?1:0,
            transform:isSpread?'scale(1)':'scale(0.7)',
            transition:'all 0.75s cubic-bezier(0.16,1,0.3,1) 0.4s',
            pointerEvents:isSpread?'auto':'none'
          }} 
          onClick={()=>onDetail(response.id)}
        >
          <Mic size={18}/>
          <span>Meera’s new memory</span>
          <Check size={14}/>
        </button>}
      </div>

      <div className="map-hint">{isSpread?'Drag to explore · Follow a thread':'Tap the stack to burst and view connected threads'}</div>
      
      <div className="zoom-controls">
        <button aria-label="Zoom out" onClick={()=>setZoom(v=>Math.max(.45,v-.1))}><Minus size={17}/></button>
        <span>{Math.round(zoom*100)}%</span>
        <button aria-label="Zoom in" onClick={()=>setZoom(v=>Math.min(1.6,v+.1))}><Plus size={17}/></button>
        <button aria-label="Fit to view" onClick={fit}><Scan size={17}/></button>
        <button aria-label="Reset view" onClick={()=>{setZoom(.9);setPan({x:0,y:0})}}><RotateCcw size={16}/></button>
      </div>
    </div>}
    <div className="archive-timeline"><span>THE YEARS BETWEEN US</span>{events.sort((a,b)=>a.year-b.year).map(e=><button key={e.id} onClick={()=>{setRange(e.year<1990?'early':'later')}}><i/><strong>{e.year}</strong><small>{e.title.replace('The ','')}</small></button>)}</div>
  </>
}
function Collection({state,onDetail}:{state:State;onDetail:(id:string)=>void}){const[filter,setFilter]=useState('All');const[search,setSearch]=useState('');const[sort,setSort]=useState('asc');const rows=state.fragments.filter(f=>(filter==='All'||f.kind===filter)&&(f.title+' '+f.text+' '+f.place).toLowerCase().includes(search.toLowerCase())).sort((a,b)=>sort==='asc'?a.year-b.year:b.year-a.year);return <section className="collection"><div className="collection-controls"><Tabs value={filter} onValueChange={setFilter}><TabsList className="filter-tabs">{['All','Photographs','Voices','Letters','Messages'].map(t=><TabsTrigger value={t} key={t}>{t}</TabsTrigger>)}</TabsList></Tabs><div className="collection-search"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search fragments" aria-label="Search fragments"/><button className="muted-button" onClick={()=>setSort(sort==='asc'?'desc':'asc')}>{sort==='asc'?'Oldest first':'Newest first'} <ArrowDown size={14}/></button></div></div><div className="contact-sheet">{rows.map(f=><button key={f.id} onClick={()=>onDetail(f.id)} className="fragment-card"><div className="fragment-visual"><Visual f={f}/></div><small>{f.kind} <span>{f.date}</span></small><h3>{f.title}</h3><p>{f.place}</p></button>)}</div>{!rows.length&&<div className="empty"><h2>No memories match this search.</h2><button onClick={()=>{setFilter('All');setSearch('')}}>Show all memories</button></div>}</section>}
function Questions({state,update,onShare,onQuestion}:{state:State;update:(s:State)=>void;onShare:(q:Question)=>void;onQuestion:(q:Question)=>void}){const[filter,setFilter]=useState('Open');const qs=questions.filter(q=>(state.statuses[q.id]||'Open')===filter);return <section className="questions-view"><Tabs value={filter} onValueChange={setFilter}><TabsList className="filter-tabs">{['Open','Asked','Answered','Later'].map(t=><TabsTrigger key={t} value={t}>{t} <small>{questions.filter(q=>(state.statuses[q.id]||'Open')===t).length}</small></TabsTrigger>)}</TabsList></Tabs>{qs.map(q=>{const p=people.find(p=>p.id===q.person)!;return <article className="question-row" key={q.id}><a className="question-person" href={'/archive/people/'+p.id}><Face id={p.id} size={54}/><div><h3>{p.name}</h3><span>{p.relationship}</span></div></a><button className="question-source" onClick={()=>onQuestion(q)}><Visual f={state.fragments.find(f=>f.id===q.fragment)!}/></button><div className="question-words"><span className="eyebrow">{filter==='Answered'?'A MEMORY RECONNECTED':'A LITTLE PIECE OF THE STORY'}</span><button onClick={()=>onQuestion(q)}><h3>{q.text}</h3></button><p>{q.why}</p><div>{filter!=='Answered'&&<button className="brass-button" onClick={()=>onShare(q)}>Ask {p.name} <ArrowUpRightIcon/></button>}<button className="muted-button" onClick={()=>{if(filter==='Answered')onQuestion(q);else update({...state,statuses:{...state.statuses,[q.id]:filter==='Later'?'Open':'Later'}})}}>{filter==='Answered'?'Read the memory':filter==='Later'?'Restore question':'Ask later'}</button></div></div></article>})}{!qs.length&&<div className="empty"><MessageCircle size={30}/><h2>{filter==='Answered'?'The next voice could be theirs.':'No questions here, for now.'}</h2><p>{filter==='Asked'?'Questions appear here after you confirm you shared them.':'Explore another view to follow the story.'}</p><button className="brass-button" onClick={()=>setFilter('Open')}>See open questions</button></div>}</section>}
function ArrowUpRightIcon(){return <ArrowRight size={16} style={{rotate:'-35deg'}}/>}
function QuestionDetails({q,state,onShare}:{q:Question;state:State;onShare:()=>void}){const f=state.fragments.find(f=>f.id===q.fragment)!;const p=people.find(p=>p.id===q.person)!;return <><div className="drawer-image"><Visual f={f}/></div><div className="drawer-body"><span className="eyebrow">{f.place.toUpperCase()} · {f.date.toUpperCase()}</span><SheetTitle className="serif-title">Someone in this photograph has a story.</SheetTitle><SheetDescription className="question-description">{q.text}</SheetDescription><div className="remember-person"><Face id={p.id} size={48}/><p>{p.name} may remember<br/>this afternoon.</p></div><p className="body-muted">{q.why}</p>{state.statuses[q.id]==='Answered'?<div className="saved-recollection"><Check size={19}/><h3>A memory is now part of the story.</h3>{state.fragments.filter(f=>f.id.startsWith('response-')&&f.event===state.fragments.find(x=>x.id===q.fragment)?.event).map(f=><div key={f.id}><strong>{p.name} · {f.date}</strong><p>{f.text||'An original voice recording, saved on this device.'}</p><LocalAudio f={f}/></div>)}</div>:<><button className="brass-button full" onClick={onShare}>Ask {p.name} <ArrowRight size={17}/></button><a className="underlined" href={'/contribute/'+q.id}>I remember this</a></>}<details className="evidence"><summary>Why this question?</summary><p>Connected evidence from the sample archive:</p><ul><li>Source: {f.title}</li><li>Event: {events.find(e=>e.id===f.event)?.title}</li><li>Existing testimony: {state.fragments.find(x=>x.kind==='Voices'&&x.people.includes(p.id))?.title||'The window seat — Raj’s recollection'}</li></ul><small>Fictional relationships, curated for this demonstration.</small></details></div></>}
function LocalAudio({f}:{f:Fragment}){const url=useMedia(f.media);return url&&f.mime?.startsWith('audio')?<audio src={url} controls/>:null}
function FragmentDetail({f,onQuestion}:{f:Fragment;onQuestion:(q:Question)=>void}){return <><div className="drawer-image"><Visual f={f}/></div><div className="drawer-body"><span className="eyebrow">{f.kind.toUpperCase()} · {f.id.toUpperCase()}</span><SheetTitle className="serif-title">{f.title}</SheetTitle><SheetDescription>{f.date} · {f.place}</SheetDescription><p className="fragment-text">{f.text||'Original recording. No transcript has been generated.'}</p><LocalAudio f={f}/>{f.kind==='Voices'&&!f.media&&<p className="small-note">Sample transcript only; no source audio is supplied.</p>}<div className="fragment-people">{f.people.map(id=><a href={'/archive/people/'+id} key={id}><Face id={id} size={33}/>{people.find(p=>p.id===id)?.name}</a>)}</div><dl><dt>Connected event</dt><dd>{events.find(e=>e.id===f.event)?.title||'A new family memory'}</dd><dt>Source</dt><dd>{f.source}</dd></dl>{questions.filter(q=>q.fragment===f.id).map(q=><button className="question-link" key={q.id} onClick={()=>onQuestion(q)}><MessageCircle size={18}/>{q.text}</button>)}</div></>}
function ShareModal({q,close,onAsked,notice}:{q:Question|null;close:()=>void;onAsked:(q:Question)=>void;notice:(s:string)=>void}){const[message,setMessage]=useState('');const[copied,setCopied]=useState(false);useEffect(()=>{if(q){setMessage(`Hi ${people.find(p=>p.id===q.person)?.name}, I found a little piece of our family story and thought of you. Do you remember this? I would love to hear it in your own words.`);setCopied(false)}},[q]);return <Dialog open={!!q} onOpenChange={o=>!o&&close()}><DialogContent className="paper-dialog"><DialogTitle>A small invitation to remember</DialogTitle><DialogDescription>{q?.text}</DialogDescription><label>Your message<textarea rows={4} value={message} onChange={e=>setMessage(e.target.value)}/></label><p className="small-note">Demo link only. Nothing is sent, and answers do not sync across devices. Preview in this browser to connect a memory.</p><button className="primary" onClick={async()=>{try{await navigator.clipboard.writeText(message+'\n'+location.origin+'/contribute/'+q?.id);setCopied(true);notice('Demo message and link copied. Nothing was sent.')}catch{notice('Copy was unavailable. Select and copy the link below.')}}}><Copy size={16}/>{copied?'Copied — ready for you to share':'Copy message & demo link'}</button><input readOnly aria-label="Demo contribution link" value={typeof location!=='undefined'?location.origin+'/contribute/'+q?.id:''} onFocus={e=>e.currentTarget.select()}/><a className="underlined" href={'/contribute/'+q?.id}>Preview what {people.find(p=>p.id===q?.person)?.name} sees <ArrowRight size={16}/></a><button className="plain-button" onClick={()=>q&&onAsked(q)}>I have shared this question</button></DialogContent></Dialog>}
function Profile({id,state,onDetail,onQuestion}:{id:string;state:State;onDetail:(id:string)=>void;onQuestion:(q:Question)=>void}){const p=people.find(p=>p.id===id);if(!p)return <div className="empty"><h2>This person isn’t in the archive.</h2><a href="/archive">Return to the archive</a></div>;const fs=state.fragments.filter(f=>f.people.includes(id));return <section className="profile"><div className="profile-intro"><Face id={id} size={155}/><div><span className="eyebrow">THE PEOPLE IN OUR STORY</span><h2>{p.name} Mehra</h2><p>{p.relationship}</p><blockquote>“{p.quote}”</blockquote><small>Authored demo recollection · {id==='meera'?'A place at our table':'Family stories'}</small></div></div><h3>A few threads from {p.name}’s life</h3><div className="profile-timeline">{fs.sort((a,b)=>a.year-b.year).map(f=><button key={f.id} onClick={()=>onDetail(f.id)}><span className="mono">{f.year||'—'}</span><div><h3>{f.title}</h3><p>{f.kind} · {f.place}</p></div><ArrowRight size={18}/></button>)}</div><h3>What {p.name} might remember</h3>{questions.filter(q=>q.person===id&&state.statuses[q.id]!=='Answered').map(q=><button key={q.id} className="profile-question" onClick={()=>onQuestion(q)}>{q.text}<ArrowRight size={18}/></button>)}{!questions.some(q=>q.person===id&&state.statuses[q.id]!=='Answered')&&<p className="body-muted">No open questions for {p.name} right now.</p>}</section>}
function Contribution({state,onSave}:{state:State;onSave:(f:Fragment,qid:string)=>Promise<void>}){const path=usePathname();const q=questions.find(q=>q.id===path.split('/').pop())||questions[0];const f=state.fragments.find(f=>f.id===q.fragment)!;const person=people.find(p=>p.id===q.person)!;const[mode,setMode]=useState<'idle'|'recording'|'review'|'success'>('idle');const[typing,setTyping]=useState(false);const[text,setText]=useState('');const[error,setError]=useState('');const[blob,setBlob]=useState<Blob>();const[url,setUrl]=useState('');const[seconds,setSeconds]=useState(0);const[level,setLevel]=useState(0);const[saving,setSaving]=useState(false);const[sample,setSample]=useState(false);const[requesting,setRequesting]=useState(false);const recorder=useRef<MediaRecorder|null>(null);const stream=useRef<MediaStream|null>(null);const ctx=useRef<AudioContext|null>(null);const frame=useRef<number>(0);const typingButton=useRef<HTMLButtonElement>(null);const active=useRef(true);
const cleanup=()=>{stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;cancelAnimationFrame(frame.current);ctx.current?.close().catch(()=>{});ctx.current=null};useEffect(()=>()=>{active.current=false;if(recorder.current?.state==='recording')recorder.current.stop();cleanup()},[]);useEffect(()=>{if(!blob){setUrl('');return}const u=URL.createObjectURL(blob);setUrl(u);return()=>URL.revokeObjectURL(u)},[blob]);useEffect(()=>{if(mode!=='recording')return;const t=setInterval(()=>setSeconds(s=>s+1),1000);return()=>clearInterval(t)},[mode]);
async function start(){setError('');setRequesting(true);if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){setError('Recording isn’t supported in this browser. You can type your memory instead.');setTyping(true);setRequesting(false);typingButton.current?.focus();return}try{const s=await navigator.mediaDevices.getUserMedia({audio:true});if(!active.current){s.getTracks().forEach(t=>t.stop());return}stream.current=s;const type=['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus'].find(t=>MediaRecorder.isTypeSupported(t));const r=new MediaRecorder(s,type?{mimeType:type}:undefined);recorder.current=r;const chunks:Blob[]=[];r.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};r.onstop=()=>{if(active.current){setBlob(new Blob(chunks,{type:r.mimeType}));setMode('review')}cleanup()};r.onerror=()=>{setError('We couldn’t finish this recording. Please try again or type your memory.');cleanup();setMode('idle')};r.start();setSeconds(0);setSample(false);setMode('recording');try{const ac=new AudioContext();ctx.current=ac;const analyser=ac.createAnalyser();analyser.fftSize=256;ac.createMediaStreamSource(s).connect(analyser);const data=new Uint8Array(analyser.frequencyBinCount);const tick=()=>{analyser.getByteTimeDomainData(data);setLevel(Math.min(1,Math.sqrt(data.reduce((sum,v)=>sum+(v-128)**2,0)/data.length)/35));frame.current=requestAnimationFrame(tick)};tick()}catch{/* Recording remains available without input metering. */}}catch{setError('The microphone wasn’t available. Allow microphone access in your browser, or type your memory below.');setTyping(true);typingButton.current?.focus()}finally{setRequesting(false)}}
async function save(){setSaving(true);setError('');const id='response-'+Date.now();try{if(blob&&!typing)await saveBlob(id,blob);const response:Fragment={id,title:person.name+'’s memory of '+f.title.toLowerCase(),kind:blob&&!typing?'Voices':'Messages',year:new Date().getFullYear(),date:new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}),place:f.place,people:[person.id],event:f.event,text:typing?text:'',media:blob&&!typing?id:undefined,mime:blob&&!typing?blob.type:undefined,source:sample?'Explicit sample response · Authored fictional recollection':'Original contribution · Saved on this device'};await onSave(response,q.id);setMode('success')}catch{setError('We couldn’t save this memory. Your device storage may be unavailable. Please try again.')}finally{setSaving(false)}}
return <div className="contribution-page"><header><Brand/><span>Demo · saved on this device</span></header><main className="contribution-column">{mode==='success'?<div className="contribution-success"><span className="success-mark"><Check size={30}/></span><h1>Thank you.<br/><em>Your memory is now<br/>part of the story.</em></h1><p>One little detail. A little closer together.</p><img src={f.image||'/images/wedding.png'} alt={f.title}/><div className="success-connection"><span/><Mic size={22}/><p>{person.name} added a memory.</p></div><p className="small-note">Saved in this browser on this device. This demo does not synchronize with other devices.</p><a className="primary" href="/archive">Return to the archive <ArrowRight size={17}/></a></div>:<><span className="eyebrow">A QUESTION FROM YOUR FAMILY</span><figure className="contribution-photo"><Visual f={f}/><figcaption>{f.place} · {f.date}</figcaption></figure><h1>{q.id==='demo-question'?'Do you remember who was standing beside the blue doorway?':q.text}</h1><p className="contribution-reassurance">A little detail is enough.<br/>Tell it in your own words.</p>{mode==='idle'&&!typing&&<div className="recorder-idle"><button className="record-control" onClick={start} disabled={requesting} aria-label="Tap to record"><Mic size={32}/></button><strong>{requesting?'Opening your microphone…':'Tap to record'}</strong></div>}{mode==='recording'&&<div className="recording-state"><div className="live-level" style={{boxShadow:`0 0 0 ${4+level*30}px #c8a66a35`}}><Mic size={30}/></div><span className="mono">{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}</span><span className="small-note">Microphone input {Math.round(level*100)}%</span><button className="primary" onClick={()=>recorder.current?.stop()}>Finish recording</button></div>}{mode==='review'&&!typing&&<div className="recording-review"><h3>Your words, just as you told them.</h3><audio controls src={url}/><button className="primary" onClick={save} disabled={saving}>{saving?'Saving…':'Save my memory'} <Check size={17}/></button><button className="plain-button" onClick={()=>{setBlob(undefined);setMode('idle')}}>Record again</button></div>}{typing&&<div className="typed-memory"><label htmlFor="memory">Your memory</label><textarea id="memory" rows={5} value={text} onChange={e=>setText(e.target.value)} placeholder="I remember…"/><button className="primary" disabled={!text.trim()||saving} onClick={save}>{saving?'Saving…':'Save my memory'} <Check size={17}/></button>{sample&&<p className="small-note">Sample response — an authored fictional recollection, ready for your review.</p>}</div>}{error&&<p className="inline-error" role="alert">{error}</p>}{mode!=='recording'&&<button ref={typingButton} className="underlined type-alternative" onClick={()=>{setTyping(!typing);setSample(false)}}>{typing?'I’d rather record':"I’d rather type"}</button>}<div className="contribution-privacy"><span>Just your words. No account needed.</span><small>Fictional sample · Illustrative photograph</small></div><details className="demo-controls"><summary>Demo controls</summary><p>Try the complete journey with a clearly labeled text response.</p><button className="plain-button" onClick={()=>{setTyping(true);setMode('idle');setSample(true);setText(q.id==='demo-question'?'That was Uncle Dev, Anil’s older cousin. He had just arrived from Jaipur, and he was carrying sweets for everyone. I remember we made him stand still for the photo before he could come inside.':q.id==='mango-question'?'The previous owner, Mrs. Rao, planted it when her daughter was born. She asked us to take good care of it.':'It was Kota. The train stopped longer than expected, and Anil came back with oranges for the whole compartment.')}}>Use sample response</button></details><a className="back-to-archive" href="/archive"><ArrowLeft size={15}/> Back to the archive</a></>}</main></div>}

function AddMemory({open,close,onSave}:{open:boolean;close:()=>void;onSave:(f:Fragment)=>Promise<void>}){const[title,setTitle]=useState('');const[date,setDate]=useState('');const[person,setPerson]=useState('meera');const[text,setText]=useState('');const[file,setFile]=useState<File>();const[preview,setPreview]=useState('');const[error,setError]=useState('');const[saving,setSaving]=useState(false);useEffect(()=>{if(!open){setTitle('');setDate('');setFile(undefined);setText('');setError('')}},[open]);useEffect(()=>{if(!file){setPreview('');return}const u=URL.createObjectURL(file);setPreview(u);return()=>URL.revokeObjectURL(u)},[file]);return <Dialog open={open} onOpenChange={o=>!o&&close()}><DialogContent className="paper-dialog add-dialog"><DialogTitle>Every little thing belongs.</DialogTitle><DialogDescription>Add a photograph, a voice, a video, or a few remembered words. Saved on this device.</DialogDescription><form onSubmit={async e=>{e.preventDefault();setSaving(true);try{const id='local-'+Date.now();if(file)await saveBlob(id,file);await onSave({id,title:title.trim(),kind:file?.type.startsWith('image')?'Photographs':file?.type.startsWith('audio')?'Voices':file?.type.startsWith('video')?'Videos':'Messages',year:date?Number(date.slice(0,4)):0,date:date||'Date unknown',place:'Family collection',people:[person],event:'personal',text,media:file?id:undefined,mime:file?.type,source:'Original local contribution · No automatic enrichment'});}catch{setError('We couldn’t save this file. Try a smaller file or a written memory.')}finally{setSaving(false)}}}><label className="upload-zone"><Upload size={25}/><span>Choose a photo, audio, or video</span><small>Up to 40 MB · or simply write below</small><input type="file" accept="image/*,audio/*,video/*" onChange={e=>{const f=e.target.files?.[0];if(!f)return;if(!/^(image|audio|video)\//.test(f.type)||f.size>40*1024*1024){setError('Please choose an image, audio, or video smaller than 40 MB.');return}setError('');setFile(f);if(!title)setTitle(f.name.replace(/\.[^.]+$/,''))}}/></label>{preview&&<div className="upload-preview">{file?.type.startsWith('image')?<img src={preview} alt="Your selected memory" onError={()=>setError('We couldn’t open this image. Please choose another.')}/>:file?.type.startsWith('audio')?<audio controls src={preview}/>:<video controls src={preview}/>}<button type="button" className="plain-button" onClick={()=>setFile(undefined)}><X size={14}/> Remove {file?.name}</button></div>}<label>Memory title<input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="A little story to hold on to"/></label><div className="form-columns"><label>Date, if known<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Connected to<select value={person} onChange={e=>setPerson(e.target.value)}>{people.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label></div><label>A few words<textarea required={!file} rows={3} value={text} onChange={e=>setText(e.target.value)} placeholder="What would you like to remember?"/></label>{error&&<p className="inline-error" role="alert">{error}</p>}<div className="form-actions"><button type="button" className="plain-button" onClick={close}>Cancel</button><button className="primary" disabled={saving||!title.trim()||(!file&&!text.trim())}>{saving?'Saving…':'Save memory'} <ArrowRight size={16}/></button></div></form></DialogContent></Dialog>}

function FilmView({state,update,onDetail}:{state:State;update:(s:State)=>void;onDetail:(id:string)=>void}){const[playing,setPlaying]=useState(false);const[time,setTime]=useState(0);const[captions,setCaptions]=useState(true);const[volume,setVolume]=useState(.8);const[arrange,setArrange]=useState(false);const[error,setError]=useState('');const stage=useRef<HTMLDivElement>(null);const dragged=useRef<string|null>(null);const enabled=state.chapters.filter(c=>c.included);const duration=enabled.length*12;const index=Math.min(enabled.length-1,Math.floor(time/12));const current=enabled[index];const f=state.fragments.find(f=>f.id===current?.fragment);const ended=time>=duration&&duration>0;const narration=state.fragments.find(x=>x.event==='house'&&x.media&&x.mime?.startsWith('audio'));const audioUrl=useMedia(narration?.media);const audio=useRef<HTMLAudioElement>(null);useEffect(()=>{if(!playing)return;const t=setInterval(()=>setTime(v=>{if(v+.25>=duration){setPlaying(false);return duration}return v+.25}),250);return()=>clearInterval(t)},[playing,duration]);useEffect(()=>{if(audio.current){audio.current.volume=volume;if(playing)audio.current.play().catch(()=>{});else audio.current.pause()}},[playing,volume,audioUrl]);const changeTime=(v:number)=>{setTime(v);if(audio.current)audio.current.currentTime=Math.min(v,Number.isFinite(audio.current.duration)?audio.current.duration:0)};const swap=(from:number,to:number)=>{if(to<0||to>=state.chapters.length)return;const chapters=[...state.chapters];[chapters[from],chapters[to]]=[chapters[to],chapters[from]];update({...state,chapters});setTime(0);setPlaying(false)};return <section className="film-view"><div className="film-toolbar"><span className="eyebrow">DOCUMENTARY PREVIEW <span className="subtle-tag">PHOTO SEQUENCE</span></span><button className="muted-button" onClick={()=>{setArrange(!arrange);setPlaying(false)}}><Film size={16}/>{arrange?'Close arrangement':'Arrange the story'}</button></div><div ref={stage} className={'cinema '+(playing?'playing':'')}>
{f&&!ended?<><div className="cinema-visual" key={f.id}>{f.image?<img src={f.image} alt={f.title}/>:<Visual f={f}/>}</div><div className="cinema-shade"/><div className="cinema-top"><span>THE MEHRA FAMILY ARCHIVE</span><span>{f.image?'ILLUSTRATIVE IMAGE':'ORIGINAL DEMO TEXT'}</span></div><div className="cinema-title"><span>THE HOUSE WITH THE MANGO TREE</span><h2>{current?.title}</h2><p>A story told by the Mehra family.</p></div>{captions&&<div className="cinema-caption">{index===0?'“The house is smaller than we imagined. But there is a mango tree…”':index===1?'“Come soon. There is so much to tell.”':index===2?'“Everyone always found a place at our table.”':'Every little memory makes the story more our own.'}<small>Authored sample recollection · {audioUrl?'Local source audio available':'Silent preview'}</small></div>}<button className="behind-moment" onClick={()=>{setPlaying(false);onDetail(f.id)}}><Info size={15}/> Behind this moment</button></>:<div className="film-end"><span className="eyebrow">THE STORY CONTINUES</span><h2>Every voice adds something<br/><em>only it can.</em></h2><p>{state.fragments.filter(f=>f.kind==='Voices'||f.id.startsWith('response-')).length} captured memories · {questions.filter(q=>state.statuses[q.id]!=='Answered').length} open questions</p><a className="brass-button" href="/archive">Return to the archive <ArrowRight size={17}/></a></div>}
{!playing&&!ended&&<button className="cinema-play" aria-label="Play documentary preview" onClick={()=>setPlaying(true)}><Play size={29}/></button>}<div className="film-controls"><button aria-label={playing?'Pause':'Play'} disabled={!enabled.length} onClick={()=>{if(ended)changeTime(0);setPlaying(!playing)}}>{playing?<Pause size={19}/>:<Play size={19}/>}</button><span className="mono">0:{String(Math.floor(time)).padStart(2,'0')}</span><Slider aria-label="Film position" value={[time]} min={0} max={duration||1} step={.25} onValueChange={v=>changeTime(v[0])} className="film-slider"/><span className="mono">0:{duration}</span><button aria-label={captions?'Hide captions':'Show captions'} aria-pressed={captions} className={captions?'control-active':''} onClick={()=>setCaptions(!captions)}>CC</button><Volume2 size={18}/><input aria-label="Volume" type="range" min="0" max="1" step=".05" value={volume} onChange={e=>setVolume(Number(e.target.value))} className="volume-slider"/><button aria-label="Fullscreen" onClick={()=>{if(!document.fullscreenElement)stage.current?.requestFullscreen?.().catch(()=>setError('Fullscreen isn’t available in this browser.'));else document.exitFullscreen()}}><Maximize size={18}/></button></div>{audioUrl&&<audio ref={audio} src={audioUrl}/>}</div>{error&&<p role="status">{error}</p>}<div className="film-below"><div><h3>The house with the mango tree.</h3><p>{audioUrl?'Accompanied by your local source recording.':'A silent photographic preview, with sample recollections as captions.'}</p></div><div className="contributors">{['anil','meera'].map(id=><a href={'/archive/people/'+id} key={id}><Face id={id} size={35}/><span>{people.find(p=>p.id===id)?.name}<small>Recollection</small></span></a>)}</div></div><div className="chapters">{state.chapters.map((c,i)=><div key={c.id} className={'chapter '+(!c.included?'excluded':'')+(current?.id===c.id?' current':'')} draggable={arrange} onDragStart={()=>dragged.current=c.id} onDragOver={e=>arrange&&e.preventDefault()} onDrop={()=>{if(dragged.current)swap(state.chapters.findIndex(x=>x.id===dragged.current),i);dragged.current=null}}><button className="chapter-thumb" onClick={()=>{const idx=enabled.findIndex(x=>x.id===c.id);if(idx>=0){changeTime(idx*12);setPlaying(false)}}}><Visual f={state.fragments.find(f=>f.id===c.fragment)!}/><span>0{i+1}</span></button>{arrange?<><input aria-label={'Chapter '+(i+1)+' title'} value={c.title} onChange={e=>update({...state,chapters:state.chapters.map(x=>x.id===c.id?{...x,title:e.target.value}:x)})}/><div className="chapter-edit"><label><Checkbox checked={c.included} disabled={c.included&&enabled.length===1} onCheckedChange={v=>{update({...state,chapters:state.chapters.map(x=>x.id===c.id?{...x,included:!!v}:x)});setTime(0);setPlaying(false)}}/> Include</label><button aria-label={'Move '+c.title+' up'} disabled={i===0} onClick={()=>swap(i,i-1)}><ArrowUp size={15}/></button><button aria-label={'Move '+c.title+' down'} disabled={i===state.chapters.length-1} onClick={()=>swap(i,i+1)}><ArrowDown size={15}/></button></div></>:<h4>{c.title}</h4>}</div>)}</div><div className="film-export"><button className="muted-button" onClick={()=>{const b=new Blob([JSON.stringify({title:'The house with the mango tree',note:'Fictional documentary outline; no generated video.',chapters:state.chapters.map(c=>({...c,source:state.fragments.find(f=>f.id===c.fragment)}))},null,2)],{type:'application/json'});const url=URL.createObjectURL(b);const a=document.createElement('a');a.href=url;a.download='mehra-family-story.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}}>Download story outline <ArrowDown size={15}/></button><span><button disabled>Export MP4</button> No rendered video asset exists.</span></div></section>}
