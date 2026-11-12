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
  /** Keep the static image visible and skip WebGL until the caller is ready. */
  active?: boolean;
  /** Load the fallback image eagerly (used on the reveal card). */
  eager?: boolean;
}

export function cardImage(slug: string): string {
  return `/cards/${slug}.webp`;
}

/** 480×720 poster used before WebGL takes over; much cheaper to decode than the 768×1152 art. */
export function cardPoster(slug: string): string {
  return `/cards/reveal/${slug}.webp`;
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

export default function HoloCard({ slug, name, orientation = 'upright', reveal = false, revealDelayMs = 0, width = 220, interactive = true, foil = 0.75, className, active = true, eager = false }: HoloCardProps) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const height = Math.round(width * 1.5);

  useEffect(() => {
    // The static art is the critical path. Starting Three.js here is what made
    // the draw-to-flip transition stutter, so wait until the caller says the
    // reveal animation has finished.
    if (!active) {
      setReady(false);
      return;
    }
    const el = host.current;
    if (!el) return;
    let cancelled = false;
    let disposed = false;
    const cleanups: Array<() => void> = [];
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      // Release partial setups too, even if an individual cleanup fails.
      for (const cleanup of cleanups.splice(0).reverse()) {
        try { cleanup(); } catch { /* Continue releasing the remaining resources. */ }
      }
    };
    const fail = () => {
      dispose();
      if (!cancelled) {
        setReady(false);
        setFailed(true);
      }
    };
    setReady(false);
    setFailed(false);

    void (async () => {
      try {
        const THREE = await import('three');
        if (cancelled) return;
        const reduced = matchMedia('(prefers-reduced-motion: reduce)');
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        // Register ownership before any setup or await can fail or be cancelled.
        cleanups.push(
          () => renderer.domElement.remove(),
          () => renderer.forceContextLoss(),
          () => renderer.dispose(),
        );
        // Non-interactive reveal cards are a small mobile surface: reduce GPU fill cost.
        renderer.setPixelRatio(Math.min(devicePixelRatio, interactive ? 2 : 1.5));
        renderer.setSize(el.clientWidth || 1, el.clientHeight || 1);
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.inset = '0';
        renderer.domElement.setAttribute('aria-hidden', 'true');
        el.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(28, (el.clientWidth || 1) / (el.clientHeight || 1), 0.1, 100);
        camera.position.set(0, 0, 7.2);

        const art = await new THREE.TextureLoader().loadAsync(cardImage(slug));
        if (cancelled || disposed) {
          art.dispose();
          return;
        }
        cleanups.push(() => art.dispose());
        art.colorSpace = THREE.SRGBColorSpace;
        art.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
        const back = new THREE.CanvasTexture(drawBack());
        cleanups.push(() => back.dispose());
        back.colorSpace = THREE.SRGBColorSpace;

        const uniforms = { uTime: { value: 0 }, uFoil: { value: foil }, uView: { value: new THREE.Vector3(0, 0, 1) }, tArt: { value: art }, tBack: { value: back } };
        const front = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRONT });
        cleanups.push(() => front.dispose());
        const backMat = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: BACK });
        cleanups.push(() => backMat.dispose());
        const edge = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: EDGE });
        cleanups.push(() => edge.dispose());
        const geo = new THREE.BoxGeometry(2, 3, 0.035);
        cleanups.push(() => geo.dispose());
        const mesh = new THREE.Mesh(geo, [edge, edge, edge, edge, front, backMat]);
        const root = new THREE.Group();
        root.add(mesh);
        scene.add(root);

        const base = { x: 0, y: 0, z: orientation === 'reversed' ? Math.PI : 0 };
        let targetX = 0;
        let revealed = !reveal || reduced.matches;
        let targetY = revealed ? 0 : Math.PI;
        let rotX = 0;
        let rotY = targetY;
        let hover = false;
        const revealAt = performance.now() + revealDelayMs;
        let last = performance.now();
        let elapsed = 0;
        let frame: number | null = null;
        let inView = typeof IntersectionObserver === 'undefined';
        let hasRendered = false;
        const inv = new THREE.Matrix4();
        const canRender = () => !cancelled && !disposed && inView && !document.hidden && el.clientWidth > 0 && el.clientHeight > 0;
        const stop = () => {
          if (frame !== null) cancelAnimationFrame(frame);
          frame = null;
        };
        cleanups.push(stop);

        const render = (now: number) => {
          if (!canRender()) return;
          try {
            const dt = Math.min((now - last) / 1000, 0.1);
            last = now;
            if (!reduced.matches) elapsed += dt;
            if (!revealed && (reduced.matches || now >= revealAt)) {
              revealed = true;
              targetY = 0;
            }
            if (revealed && !hover && interactive && !reduced.matches) {
              targetY = Math.sin(elapsed * 0.6) * 0.18;
              targetX = Math.sin(elapsed * 0.8) * 0.08;
            }
            const ease = reduced.matches ? 1 : 1 - Math.exp(-dt * (revealed ? 6 : 3.2));
            rotX += (targetX - rotX) * ease;
            rotY += (targetY - rotY) * ease;
            root.rotation.set(base.x + rotX, base.y + rotY, base.z);
            root.updateMatrixWorld(true);
            uniforms.uView.value.copy(camera.position).applyMatrix4(inv.copy(root.matrixWorld).invert()).normalize();
            uniforms.uTime.value = reduced.matches ? 0 : elapsed;
            renderer.render(scene, camera);
            if (!hasRendered) {
              hasRendered = true;
              setReady(true);
            }
          } catch {
            fail();
          }
        };
        let lastPresented = 0;
        const tick = (now: number) => {
          frame = null;
          // 30 fps is plenty for the ambient foil of a non-interactive revealed
          // card; interactive 3D card pages still render at display refresh rate.
          if (interactive || now - lastPresented >= 1000 / 30) {
            render(now);
            lastPresented = now;
          }
          if (canRender() && !reduced.matches) frame = requestAnimationFrame(tick);
        };
        const resume = () => {
          stop();
          if (!canRender()) return;
          last = performance.now();
          render(last);
          if (canRender() && !reduced.matches) frame = requestAnimationFrame(tick);
        };
        const renderStatic = () => {
          if (reduced.matches) render(performance.now());
        };

        const onMove = (e: PointerEvent) => {
          if (!interactive || reduced.matches || !canRender()) return;
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) return;
          const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
          const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
          targetY = nx * 0.55;
          targetX = ny * 0.45;
          hover = true;
          renderStatic();
        };
        const onLeave = () => {
          hover = false;
          if (reduced.matches) {
            targetX = targetY = 0;
            renderStatic();
          }
        };
        const onOrient = (e: DeviceOrientationEvent) => {
          if (!interactive || reduced.matches || !canRender() || hover || e.gamma == null || e.beta == null) return;
          targetY = THREE.MathUtils.clamp(e.gamma / 45, -1, 1) * 0.5;
          targetX = THREE.MathUtils.clamp((e.beta - 40) / 45, -1, 1) * 0.4;
        };
        el.addEventListener('pointermove', onMove);
        cleanups.push(() => el.removeEventListener('pointermove', onMove));
        el.addEventListener('pointerleave', onLeave);
        cleanups.push(() => el.removeEventListener('pointerleave', onLeave));
        window.addEventListener('deviceorientation', onOrient);
        cleanups.push(() => window.removeEventListener('deviceorientation', onOrient));
        document.addEventListener('visibilitychange', resume);
        cleanups.push(() => document.removeEventListener('visibilitychange', resume));
        reduced.addEventListener('change', resume);
        cleanups.push(() => reduced.removeEventListener('change', resume));

        const ro = new ResizeObserver(() => {
          if (cancelled || disposed) return;
          const w = el.clientWidth;
          const h = el.clientHeight;
          if (!w || !h) {
            stop();
            return;
          }
          try {
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            resume();
          } catch {
            fail();
          }
        });
        cleanups.push(() => ro.disconnect());
        ro.observe(el);
        if (typeof IntersectionObserver !== 'undefined') {
          const io = new IntersectionObserver(([entry]) => {
            if (cancelled || disposed || !entry) return;
            inView = entry.isIntersecting;
            resume();
          });
          cleanups.push(() => io.disconnect());
          io.observe(el);
        }
        resume();
      } catch {
        fail();
      }
    })();

    return () => {
      cancelled = true;
      dispose();
    };
  }, [slug, orientation, reveal, revealDelayMs, interactive, foil, active]);

  return (
    <div ref={host} className={`holo-card ${className ?? ''}`} style={{ width, maxWidth: '100%', aspectRatio: `${width} / ${height}` }}>
      <img
        src={eager ? cardPoster(slug) : cardImage(slug)}
        alt={`${name} tarot card illustration${orientation === 'reversed' ? ' (reversed)' : ''}`}
        width={768}
        height={1152}
        className={orientation === 'reversed' ? 'reversed' : ''}
        // Opacity preserves the accessible SSR image after the canvas takes over.
        style={{ opacity: ready && !failed ? 0 : 1 }}
        loading={eager || reveal ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
}
