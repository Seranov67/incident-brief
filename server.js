import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const assets = new Map([
 ['/', ['index.html','text/html']], ['/index.html',['index.html','text/html']],
 ['/styles.css',['styles.css','text/css']], ['/app.js',['app.js','text/javascript']],
 ['/analyzer.js',['analyzer.js','text/javascript']], ['/icon.svg',['icon.svg','image/svg+xml']]
]);
export function createServer() {
 return http.createServer(async(req,res)=>{
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'none'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end('Method not allowed');return;}
  let path;try{path=new URL(req.url,'http://localhost').pathname;}catch{res.writeHead(400);res.end('Bad request');return;}
  const asset=assets.get(path);if(!asset){res.writeHead(404);res.end('Not found');return;}
  try{const bytes=await readFile(new URL('./public/'+asset[0],import.meta.url));res.writeHead(200,{'Content-Type':asset[1]+'; charset=utf-8'});res.end(req.method==='HEAD'?undefined:bytes);}
  catch{res.writeHead(500);res.end('Could not load asset');}
 });
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const port=Number(process.env.PORT||4317);
 createServer().listen(port,'127.0.0.1',()=>console.log('Incident Brief: http://127.0.0.1:'+port));
}
