import { useEffect, useRef, useState } from 'react';
import type { Orientation } from '../lib/schema';

export interface HoloCardProps {
  slug: string;
  name: string;
  orientation?: Orientation;
  reveal?: boolean;
  revealDelayMs?: number;
  width?: number;
  interactive?: boolean;
  foil?: number;
  className?: string;
}

export function cardImage(slug: string): string {
  return `/cards/${slug}.webp`;
}

const VERT = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;

const SHARED = `precision highp float;varying vec2 vUv;uniform float uTime,uFoil;uniform vec3 uView;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
vec3 spectrum(float t){t=fract(t);vec3 a=vec3(1.,.36,.62),b=vec3(1.,.86,.36),c=vec3(.3,.66,1.);if(t<.35)return mix(a,b,t/.35);if(t<.7)return mix(b,c,(t-.35)/.35);return mix(c,vec3(1.),(t-.7)/.3);}
vec3 overlay(vec3 b,vec3 f){return mix(2.*b*f,1.-2.*(1.-b)*(1.-f),step(vec3(.5),b));}
float wave(vec2 p){vec2 a=p+uView.xy*2.4;return .5+.5*sin((a.x*.85-a.y*.53)*6.283*.55+7.*noise(a*1.5));}
float star(vec2 p){vec2 q=p*90.,id=floor(q),f=fract(q);float d1=9.,d2=9.;for(int y=-1;y<=1;y++){for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 o=vec2(hash(id+g),hash(id+g+43.3));float d=length(g+o-f);if(d<d1){d2=d1;d1=d;}else d2=min(d2,d);}}float edge=1.-smoothstep(.01,.04,d2-d1);float sparse=step(.9,hash(id+8.8));float tw=pow(.5+.5*sin(uTime*1.8+hash(id)*30.+uView.x*27.+uView.y*21.),6.);return edge*sparse*tw;}`;

const FRONT = `${SHARED}uniform sampler2D tArt;
void main(){vec2 uv=vUv;vec2 pu=(uv-.5)*1.02+.5+uView.xy*.012;vec3 art=texture2D(tArt,clamp(pu,0.,1.)).rgb;
float w=wave(uv);vec3 foil=spectrum(w*.8+noise(uv*5.)*.12);
vec3 col=mix(art,overlay(art,foil),uFoil*.3);
float sweep=pow(max(0.,sin((uv.x*.83+uv.y*.35+uView.x*1.8+uView.y*.9)*6.283)),12.);
col+=foil*sweep*uFoil*.3;
col+=vec3(.7,.88,1.)*star(uv)*uFoil*.7;
vec2 p=abs(uv-.5);float border=smoothstep(.455,.47,max(p.x,p.y*.667));
col=mix(col,mix(vec3(.75,.6,.3),spectrum(w),.5)*(.8+sweep*.6),border);
gl_FragColor=vec4(col,1.);}`;

const BACK = `${SHARED}uniform sampler2D tBack;
void main(){vec3 art=texture2D(tBack,vec2(1.-vUv.x,vUv.y)).rgb;float w=wave(vUv);vec3 col=mix(art,overlay(art,spectrum(w)),uFoil*.22);
float sweep=pow(max(0.,sin((vUv.x*.7+vUv.y*.4+uView.x*1.6)*6.283)),14.);col+=spectrum(w)*sweep*uFoil*.25;col+=vec3(.7,.88,1.)*star(vUv)*uFoil*.5;gl_FragColor=vec4(col,1.);}`;

const EDGE = `${SHARED}void main(){vec3 col=mix(vec3(.6,.42,.16),spectrum(wave(vUv)),.5);gl_FragColor=vec4(col*.85+.1,1.);}`;

function drawBack(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 768;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 512, 768);
  g.addColorStop(0, '#1b1533');
  g.addColorStop(1, '#0f0c1d');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 768);
  ctx.strokeStyle = '#c9a85c';
  ctx.lineWidth = 6;
  ctx.strokeRect(22, 22, 468, 724);
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, 432, 688);
  ctx.save();
  ctx.translate(256, 384);
  for (let i = 0; i < 12; i++) {
    ctx.rotate(Math.PI / 6);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -150);
    ctx.strokeStyle = 'rgba(201,168,92,.55)';
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(0, 0, 110, 0, Math.PI * 2);
  ctx.strokeStyle = '#c9a85c';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const r = i % 2 ? 36 : 92;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fillStyle = '#c9a85c';
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#e8dcc0';
  ctx.font = '600 22px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('TAROT TOOLS', 256, 700);
  return c;
}

export default function HoloCard({ slug, name, orientation = 'upright', reveal = false, revealDelayMs = 0, width = 220, interactive = true, foil = 0.75, className }: HoloCardProps) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const height = Math.round(width * 1.5);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dispose = () => {};
    let cancelled = false;

    (async () => {
      let THREE: typeof import('three');
      try {
        THREE = await import('three');
      } catch {
        setFailed(true);
        return;
      }
      if (cancelled) return;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(el.clientWidth, el.clientHeight);
      renderer.setClearColor(0x000000, 0);
      el.append(renderer.domElement);
      renderer.domElement.setAttribute('aria-hidden', 'true');

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(28, el.clientWidth / el.clientHeight, 0.1, 100);
      camera.position.set(0, 0, 7.2);

      const loader = new THREE.TextureLoader();
      let art: import('three').Texture;
      try {
        art = await loader.loadAsync(cardImage(slug));
      } catch {
        setFailed(true);
        renderer.dispose();
        renderer.domElement.remove();
        return;
      }
      art.colorSpace = THREE.SRGBColorSpace;
      art.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
      const back = new THREE.CanvasTexture(drawBack());
      back.colorSpace = THREE.SRGBColorSpace;

      const uniforms = { uTime: { value: 0 }, uFoil: { value: foil }, uView: { value: new THREE.Vector3(0, 0, 1) }, tArt: { value: art }, tBack: { value: back } };
      const front = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRONT });
      const backMat = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: BACK });
      const edge = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: EDGE });
      const geo = new THREE.BoxGeometry(2, 3, 0.035);
      const mesh = new THREE.Mesh(geo, [edge, edge, edge, edge, front, backMat]);
      const root = new THREE.Group();
      root.add(mesh);
      scene.add(root);

      const base = { x: 0, y: 0, z: orientation === 'reversed' ? Math.PI : 0 };
      let targetX = 0;
      let targetY = reveal ? Math.PI : 0;
      let rotX = 0;
      let rotY = targetY;
      let hover = false;
      const start = performance.now();
      const revealAt = start + revealDelayMs;
      let revealed = !reveal;

      const onMove = (e: PointerEvent) => {
        if (!interactive) return;
        const r = el.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
        targetY = nx * 0.55;
        targetX = ny * 0.45;
        hover = true;
      };
      const onLeave = () => {
        hover = false;
      };
      const onOrient = (e: DeviceOrientationEvent) => {
        if (!interactive || hover || e.gamma == null || e.beta == null) return;
        targetY = THREE.MathUtils.clamp(e.gamma / 45, -1, 1) * 0.5;
        targetX = THREE.MathUtils.clamp((e.beta - 40) / 45, -1, 1) * 0.4;
      };
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
      window.addEventListener('deviceorientation', onOrient);

      const ro = new ResizeObserver(() => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      });
      ro.observe(el);

      setReady(true);
      let last = performance.now();
      let elapsed = 0;
      const inv = new THREE.Matrix4();
      renderer.setAnimationLoop((now) => {
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        elapsed += dt;
        if (!revealed && now >= revealAt) {
          revealed = true;
          targetY = 0;
        }
        if (revealed && !hover && interactive && !reduced) {
          targetY = Math.sin(elapsed * 0.6) * 0.18;
          targetX = Math.sin(elapsed * 0.8) * 0.08;
        }
        const ease = reduced ? 1 : 1 - Math.exp(-dt * (revealed ? 6 : 3.2));
        rotX += (targetX - rotX) * ease;
        rotY += (targetY - rotY) * ease;
        root.rotation.set(base.x + rotX, base.y + rotY, base.z);
        root.updateMatrixWorld(true);
        uniforms.uView.value.copy(camera.position).applyMatrix4(inv.copy(root.matrixWorld).invert()).normalize();
        uniforms.uTime.value = reduced ? 0 : elapsed;
        renderer.render(scene, camera);
      });

      dispose = () => {
        renderer.setAnimationLoop(null);
        ro.disconnect();
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
        window.removeEventListener('deviceorientation', onOrient);
        geo.dispose();
        front.dispose();
        backMat.dispose();
        edge.dispose();
        art.dispose();
        back.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      cancelled = true;
      dispose();
    };
  }, [slug, orientation, reveal, revealDelayMs, interactive, foil]);

  return (
    <div ref={host} className={`holo-card ${className ?? ''}`} style={{ width, height }}>
      <img
        src={cardImage(slug)}
        alt={`${name} tarot card illustration${orientation === 'reversed' ? ' (reversed)' : ''}`}
        width={768}
        height={1152}
        className={`${orientation === 'reversed' ? 'reversed' : ''} ${ready && !failed ? 'holo-hidden' : ''}`}
        loading={reveal ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
}
