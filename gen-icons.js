const zlib = require('zlib'), fs = require('fs'), path = require('path');
const outDir = __dirname;
function crc32(buf){const t=new Int32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c;}let c=-1;for(let i=0;i<buf.length;i++)c=t[(c^buf[i])&0xff]^(c>>>8);return (c^-1)>>>0;}
function chunk(type,data){const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const td=Buffer.concat([Buffer.from(type,'ascii'),data]);const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(td));return Buffer.concat([len,td,crc]);}
function writePng(size,pixels){const sig=Buffer.from([137,80,78,71,13,10,26,10]);const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(size,0);ihdr.writeUInt32BE(size,4);ihdr[8]=8;ihdr[9]=6;
  const raw=Buffer.alloc(size*(size*4+1));
  for(let y=0;y<size;y++){raw[y*(size*4+1)]=0;for(let x=0;x<size;x++){const p=(y*size+x)*4;raw[y*(size*4+1)+1+x*4]=pixels[p];raw[y*(size*4+1)+1+x*4+1]=pixels[p+1];raw[y*(size*4+1)+1+x*4+2]=pixels[p+2];raw[y*(size*4+1)+1+x*4+3]=pixels[p+3];}}
  const idat=zlib.deflateSync(raw);return Buffer.concat([sig,chunk('IHDR',ihdr),chunk('IDAT',idat),chunk('IEND',Buffer.alloc(0))]);}
function sdRoundRect(x,y,cx,cy,hw,hh,r){const qx=Math.abs(x-cx)-(hw-r),qy=Math.abs(y-cy)-(hh-r);return Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-r;}
function lerp(a,b,t){return a+(b-a)*t;}
function draw(size){
  const px=new Uint8Array(size*size*4);
  const cx=size/2, cy=size*0.58, cw=size*0.62, ch=size*0.46, cr=size*0.10;
  const sunx=size*0.76, suny=size*0.22, sunr=size*0.10;
  const bars=[{dy:-0.30,color:[37,99,235]},{dy:0,color:[22,163,74]},{dy:0.30,color:[234,88,12]}];
  const barw=size*0.56, barh=size*0.115;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const i=(y*size+x)*4;
    const t=(x+y)/(2*size);
    let r=lerp(224,143,t), g=lerp(82,45,t), b=lerp(42,45,t), a=255;
    // white card
    if(sdRoundRect(x,y,cx,cy,cw/2,ch/2,cr)<0){r=255;g=255;b=255;}
    // bars
    for(const br of bars){
      const by=cy+br.dy*ch;
      if(sdRoundRect(x,y,cx,by,barw/2,barh/2,barh/2)<0){r=br.color[0];g=br.color[1];b=br.color[2];break;}
    }
    // sun
    const dx=x-sunx, dy=y-suny;
    if(Math.hypot(dx,dy)<sunr){r=255;g=209;b=102;}
    px[i]=r;px[i+1]=g;px[i+2]=b;px[i+3]=a;
  }
  return writePng(size,px);
}
fs.writeFileSync(path.join(outDir,'icon-512.png'),draw(512));
fs.writeFileSync(path.join(outDir,'icon-192.png'),draw(192));
console.log('icons generated');