const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const root = __dirname;
const MIME = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8','.ico':'image/x-icon','.css':'text/css; charset=utf-8'};
function lanIP(){const ifs=os.networkInterfaces();for(const name in ifs){for(const ni of ifs[name]||[]){if(ni.family==='IPv4'&&!ni.internal)return ni.address;}}return '127.0.0.1';}
const server=http.createServer((req,res)=>{
  let p=decodeURIComponent((req.url||'/').split('?')[0]);
  if(p==='/')p='/index.html';
  const fp=path.normalize(path.join(root,p));
  if(fp!==root&&!fp.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  fs.readFile(fp,(err,data)=>{
    if(err){res.writeHead(404);res.end('Not Found');return;}
    res.writeHead(200,{'Content-Type':MIME[path.extname(fp).toLowerCase()]||'application/octet-stream','Cache-Control':'no-cache'});
    res.end(data);
  });
});
function listen(port,attempt){
  server.once('error',(e)=>{
    if(e.code==='EADDRINUSE'&&attempt<6){listen(port+1,attempt+1);}
    else{console.error('启动失败: '+e.message);process.exit(1);}
  });
  server.listen(port,()=>{
    const ip=lanIP();
    console.log('==================================================');
    console.log('  长沙自驾攻略 App 已启动');
    console.log('  本机打开 : http://localhost:'+port);
    console.log('  手机打开(需同一WiFi): http://'+ip+':'+port);
    console.log('  手机浏览器打开后 → 菜单“添加到主屏幕”即可当 App 用');
    console.log('  关闭本窗口即停止服务');
    console.log('==================================================');
  });
}
listen(8080,1);