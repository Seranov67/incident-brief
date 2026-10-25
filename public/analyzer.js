export const MAX_BYTES=200*1024;
export const MAX_LINES=2000;
export function redact(text){
 return String(text)
 .replace(/-----BEGIN(?: [A-Z0-9]+)? PRIVATE KEY-----[\s\S]*?(?:-----END(?: [A-Z0-9]+)? PRIVATE KEY-----|$)/g,b=>b.split(/\r?\n/).map(()=>'<PRIVATE_KEY_REDACTED>').join('\n'))
 .replace(/(\bauthorization\s*[:=]\s*(?:bearer|basic)\s+)[^\s,;]+/gi,'$1<REDACTED>')
 .replace(/(["']?\b(?:authorization|password|passwd|token|secret|api[_-]?key|access[_-]?token|client[_-]?secret)\b["']?\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;}]+)/gi,'$1"<REDACTED>"')
 .replace(/\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-(?:proj-)?[A-Za-z0-9_-]{20,})\b/g,'<REDACTED>')
 .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,'<REDACTED>')
 .replace(/([a-z][a-z0-9+.-]*:\/\/)[^/@\s]+@/gi,'$1<USERINFO>@')
 .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'<EMAIL>')
 .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g,'<IP>')
 .replace(/(?<![\w:])(?:[a-f\d]{0,4}:){2,}[a-f\d]{0,4}(?![\w:])/gi,v=>(v.match(/:/g)?.length>=3||v.startsWith('::')||v.endsWith('::'))?'<IP>':v);
}
function severityOf(line){
 try{const o=JSON.parse(line);if(o&&typeof o==='object'&&!Array.isArray(o)){
  const v=String(o.level??o.severity??'').toUpperCase();
  if(['FATAL','CRITICAL','ERROR','ERR'].includes(v))return 'error';
  if(['WARN','WARNING'].includes(v))return 'warn';
  if(v==='INFO')return 'info';if(v==='DEBUG')return 'debug';
 }}catch{}
 const m=line.match(/(?:^|[\s[\]:])(CRITICAL|FATAL|ERROR|WARN(?:ING)?|INFO|DEBUG)(?=$|[\s\]:])/);
 return m?({CRITICAL:'error',FATAL:'error',ERROR:'error',WARN:'warn',WARNING:'warn',INFO:'info',DEBUG:'debug'})[m[1]]:'unknown';
}
function messageOf(line){
 try{const o=JSON.parse(line);if(o&&typeof o.message==='string')return o.message;if(o&&typeof o.msg==='string')return o.msg;}catch{}
 return line.replace(/^\s*\d{4}-\d{2}-\d{2}[T ][0-9:.+-]+Z?\s*/,'').replace(/^\[?(?:CRITICAL|FATAL|ERROR|WARNING|WARN|INFO|DEBUG)\]?\s*:?\s*/,'');
}
function normalize(message){
 return message.replace(/\b(?:request[_-]?id|trace[_-]?id|correlation[_-]?id)\s*[:=]\s*[\w.-]+/gi,'request_id=<ID>')
 .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,'<ID>')
 .replace(/\b\d+(?:\.\d+)?\s*(ms|milliseconds|s|seconds)\b/g,'<DURATION> $1').replace(/\s+/g,' ').trim();
}
export function analyzeLog(input){
 if(typeof input!=='string'||!input.trim())throw new Error('Paste a log excerpt or load the example first.');
 if(new TextEncoder().encode(input).length>MAX_BYTES)throw new Error('Keep the excerpt under 200 KiB.');
 const raw=input.split(/\r?\n/);
 if(raw.filter(v=>v.trim()).length>MAX_LINES)throw new Error('Keep the excerpt to 2,000 non-empty lines.');
 const sanitized=redact(input).split(/\r?\n/),counts={total:0,error:0,warn:0,info:0,debug:0,unknown:0},groups=new Map(),redactedLines=[];
 for(let i=0;i<raw.length;i++){
  if(!raw[i].trim())continue;
  const text=sanitized[i]??'<REDACTED>',severity=severityOf(text),message=normalize(messageOf(text)),key=severity+':'+message;
  counts.total++;counts[severity]++;
  if(!groups.has(key))groups.set(key,{severity,message:message||'(empty message)',count:0,lines:[],examples:[]});
  const g=groups.get(key);g.count++;g.lines.push(i+1);
  if(g.examples.length<3)g.examples.push({line:i+1,text:text.slice(0,600)});
  redactedLines.push({line:i+1,text});
 }
 const rank={error:4,warn:3,info:2,debug:1,unknown:0};
 return {counts,groups:[...groups.values()].sort((a,b)=>rank[b.severity]-rank[a.severity]||b.count-a.count||a.lines[0]-b.lines[0]),redactedLines,
 caveat:'Pattern-based observations, not a root-cause diagnosis. Redaction is best-effort: review the report before sharing.'};
}
export function nextCheck(g){
 if(g.severity==='unknown')return 'Confirm the log format and level markers before drawing conclusions.';
 if(/timeout|timed out/i.test(g.message))return 'Check upstream latency and timeout configuration; these lines alone do not prove the cause.';
 if(/refused|unreachable|connection/i.test(g.message))return 'Check dependency reachability and recent configuration changes.';
 if(/denied|unauthorized|forbidden/i.test(g.message))return 'Check the relevant access policy without sharing credentials.';
 return ['error','warn'].includes(g.severity)?'Compare these source lines with nearby events and recent changes.':'Context only. No failure inferred from this level.';
}
const safeMd=v=>String(v).replace(/[\\\u0060*_{}\[\]<>#|]/g,'\\$&');
export function toMarkdown(r){
 const c=r.counts,s=['# Incident brief','','Observed '+c.total+' lines: '+c.error+' errors, '+c.warn+' warnings, '+c.info+' info, '+c.debug+' debug, '+c.unknown+' unknown.','',r.caveat,'','## Observed groups'];
 for(const g of r.groups.slice(0,8)){
  s.push('','### '+g.severity.toUpperCase()+' · '+g.count+'×',safeMd(g.message),'Source lines: '+g.lines.join(', '),'Next check (not a diagnosis): '+safeMd(nextCheck(g)));
  for(const e of g.examples)s.push('> L'+e.line+': '+safeMd(e.text));
 }
 s.push('','## Sanitized source');for(const e of r.redactedLines)s.push('> L'+e.line+': '+safeMd(e.text));
 return s.join('\n')+'\n';
}
