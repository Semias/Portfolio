// 3D-Hintergrund der Startseite: Netz aus Punkten und Linien mit Sternenhimmel und Nebeln.
// Port von network() aus dem Prototyp (three-ideas.js). Beim Scrollen fliegt die Kamera von Knoten
// zu Knoten, eine Linie zeigt den zurückgelegten Weg, die Maus bewegt die Kamera leicht mit.
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  Euler,
  Fog,
  Group,
  Line,
  LineBasicMaterial,
  LineSegments,
  Material,
  Mesh,
  MeshBasicMaterial,
  NormalBlending,
  Object3D,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  SRGBColorSpace,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Texture,
  Vector3,
  WebGLRenderer,
} from 'three';
import { Theme } from '../../core/theme/color';
import { gaussian, seededRandom } from './random';
import { ScenePalette } from './scene-palette';

export interface NetworkSceneOptions {
  /** Ein Knoten pro Sektion, Seite des Knotens: 1 rechts, -1 links */
  sides: readonly number[];
  palette: ScenePalette;
  /** low: weniger Sterne, kleinere Texturen, Pixel-Ratio höchstens 1,5 (Mobilgeräte) */
  quality: 'high' | 'low';
  /** false bei „Bewegung reduzieren“: ein ruhiges Standbild ohne Kamerafahrt */
  animate: boolean;
  seed?: number;
}

export const SCENE_QUALITY = {
  high: { stars: [7000, 16000, 900, 90], dust: 500, cloud: 256, pixelRatio: 2 },
  low: { stars: [1800, 4000, 400, 60], dust: 250, cloud: 128, pixelRatio: 1.5 },
} as const;

/** Punkte der Kamera- und Wegkurven */
const ROUTE_POINTS = 600;
/** Dauer einer Hälfte der Überblendung beim Theme-Wechsel (aus, dann ein) */
const FADE_SECONDS = 0.3;
/** Wie schnell Farben und Deckkraft dem Ziel folgen (pro Sekunde) */
const COLOR_RATE = 6;

/** Glättung pro Frame wie im Prototyp (dort bei 60 fps), hier unabhängig von der Bildrate */
function smoothing(perFrame: number, dt: number): number {
  return 1 - Math.pow(1 - perFrame, dt * 60);
}

/** Werte, die zwischen zwei Paletten weich überblendet werden */
interface Live {
  accent: Color;
  background: Color;
  starTint: Color;
  dust: Color;
  pulse: Color;
  hues: Color[];
  line: number;
  point: number;
  route: number;
  travelled: number;
  star: number;
  dustOpacity: number;
  nebula: number;
}

/** Nebelfarben aus der Akzentfarbe: Akzent, zwei Nachbartöne und ein warmes Licht */
function nebulaHues(accent: Color): Color[] {
  const hsl = { h: 0, s: 0, l: 0 };
  accent.getHSL(hsl);
  return [
    accent.clone(),
    new Color().setHSL((hsl.h + 0.1) % 1, 0.75, 0.55),
    new Color().setHSL((hsl.h + 0.88) % 1, 0.7, 0.5),
    new Color(0xffe2c0),
  ];
}

function toLive(palette: ScenePalette): Live {
  const accent = new Color(palette.accent);
  return {
    accent,
    background: new Color(palette.background),
    starTint: new Color(palette.starTint),
    dust: new Color(palette.dustColor),
    pulse: new Color(palette.pulseColor),
    hues: nebulaHues(accent),
    line: palette.lineOpacity,
    point: palette.pointOpacity,
    route: palette.routeOpacity,
    travelled: palette.travelledOpacity,
    star: palette.starOpacity,
    dustOpacity: palette.dustOpacity,
    nebula: palette.nebulaOpacity,
  };
}

function radialTexture(size: number, stops: [number, number][]): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const half = size / 2;
    const gradient = context.createRadialGradient(half, half, 0, half, half, half);
    for (const [offset, alpha] of stops)
      gradient.addColorStop(offset, `rgba(255,255,255,${alpha})`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  return new CanvasTexture(canvas);
}

/** Wolkige Nebeltextur aus mehreren Rauschschichten, eigener Seed je Textur */
function cloudTexture(seed: number, size: number): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  if (!context) return texture;

  const image = context.createImageData(size, size);
  let state = seed * 9973;
  const random = () => (state = (state * 16807) % 2147483647) / 2147483647;
  const grid = 64;
  const layers = Array.from({ length: 6 }, () =>
    Float32Array.from({ length: (grid + 1) * (grid + 1) }, random),
  );
  const noise = (layer: Float32Array, u: number, v: number) => {
    const xi = Math.floor(u);
    const yi = Math.floor(v);
    const xf = u - xi;
    const yf = v - yi;
    const x = xi % grid;
    const y = yi % grid;
    const sx = xf * xf * (3 - 2 * xf);
    const sy = yf * yf * (3 - 2 * yf);
    const q = (i: number, k: number) => layer[(k % grid) * (grid + 1) + (i % grid)];
    return (
      (q(x, y) * (1 - sx) + q(x + 1, y) * sx) * (1 - sy) +
      (q(x, y + 1) * (1 - sx) + q(x + 1, y + 1) * sx) * sy
    );
  };
  // Die Frequenz hängt an der Texturgröße, damit kleine Texturen gleich aussehen
  const base = (3 / 256) * 4;
  const scale = 256 / size;
  for (let yy = 0; yy < size; yy++) {
    for (let xx = 0; xx < size; xx++) {
      let value = 0;
      let amplitude = 0.5;
      let frequency = base * scale;
      for (let o = 0; o < 6; o++) {
        value += amplitude * noise(layers[o], xx * frequency + o * 7.3, yy * frequency + o * 3.1);
        amplitude *= 0.5;
        frequency *= 2;
      }
      const dx = xx / size - 0.5;
      const dy = yy / size - 0.5;
      const falloff = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) * 2);
      const alpha = Math.max(0, value - 0.38) * 2.8 * falloff * falloff;
      const i = (yy * size + xx) * 4;
      image.data[i] = image.data[i + 1] = image.data[i + 2] = 255;
      image.data[i + 3] = Math.min(255, alpha * 255);
    }
  }
  context.putImageData(image, 0, 0);
  return texture;
}

export class NetworkScene {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(55, 1, 0.1, 200);
  private readonly fog: Fog;
  private readonly random: () => number;
  private readonly resizeObserver: ResizeObserver;
  private readonly mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  private readonly hubs: Vector3[];
  private readonly camPath: CatmullRomCurve3;
  private readonly lookPath: CatmullRomCurve3;
  private readonly route: CatmullRomCurve3;
  private readonly travelled: Line;
  private readonly pulse: Mesh;
  private readonly sky = new Group();
  private readonly cameraPoint = new Vector3();
  private readonly lookPoint = new Vector3();

  private readonly lineMaterial: LineBasicMaterial;
  private readonly pointMaterial: PointsMaterial;
  private readonly routeMaterial: LineBasicMaterial;
  private readonly travelledMaterial: LineBasicMaterial;
  private readonly pulseMaterial: MeshBasicMaterial;
  private readonly dustMaterial: PointsMaterial;
  private readonly stars: {
    material: PointsMaterial;
    points: Points;
    opacity: number;
    dense: boolean;
  }[] = [];
  private readonly nebulae: { material: SpriteMaterial; opacity: number; hue: number }[] = [];
  /** Materialien, die im Dunkeln additiv überblenden */
  private readonly glowing: Material[] = [];

  private target: ScenePalette;
  private targetLive: Live;
  private live: Live;
  private appliedMode: Theme;
  private intensity = 1;
  private progress = 0;
  private current = 0;
  private elapsed = 0;
  private lastFrame = 0;
  private frame = 0;
  private disposed = false;

  constructor(
    private readonly host: HTMLElement,
    private readonly options: NetworkSceneOptions,
  ) {
    const quality = SCENE_QUALITY[options.quality];
    this.random = seededRandom(options.seed ?? 20260);

    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.pixelRatio));
    this.renderer.domElement.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;display:block';
    host.appendChild(this.renderer.domElement);
    this.camera.position.z = 8;

    this.target = options.palette;
    this.targetLive = toLive(options.palette);
    this.live = toLive(options.palette);
    this.appliedMode = options.palette.mode;
    this.fog = new Fog(options.palette.background, 4, 26);
    this.scene.fog = this.fog;

    const accent = options.palette.accent;
    this.lineMaterial = new LineBasicMaterial({ color: accent, transparent: true, opacity: 0.22 });
    this.pointMaterial = new PointsMaterial({
      color: accent,
      size: 0.09,
      map: radialTexture(64, [
        [0, 1],
        [0.25, 0.6],
        [1, 0],
      ]),
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
    this.routeMaterial = new LineBasicMaterial({ color: accent, transparent: true, opacity: 0.22 });
    this.travelledMaterial = new LineBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.9,
    });
    this.pulseMaterial = new MeshBasicMaterial({ color: 0xffffff, transparent: true });
    this.dustMaterial = new PointsMaterial({
      color: 0xdfe6ff,
      size: 0.035,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
    });
    this.glowing.push(this.pointMaterial, this.dustMaterial);

    // Netz aus Punkten und den Knoten der Sektionen
    const count = options.sides.length;
    const span = 12 * (count - 1);
    const side = (i: number) => options.sides[i] || 1;
    const points = Array.from(
      { length: 260 },
      () =>
        new Vector3(
          (this.random() - 0.5) * 16,
          (this.random() - 0.5) * 9,
          6 - this.random() * (span + 14),
        ),
    );
    this.hubs = options.sides.map(
      (_, i) => new Vector3(2.8 * side(i), i % 2 ? -0.7 : 0.7, -12 * i),
    );
    const all = points.concat(this.hubs);
    const segments: Vector3[] = [];
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const limit = i >= points.length || j >= points.length ? 3.6 : 2.5;
        if (all[i].distanceTo(all[j]) < limit) segments.push(all[i], all[j]);
      }
    }
    this.scene.add(
      new LineSegments(new BufferGeometry().setFromPoints(segments), this.lineMaterial),
      new Points(new BufferGeometry().setFromPoints(points), this.pointMaterial),
    );

    // Kamerafahrt und Weg
    this.camPath = new CatmullRomCurve3(
      this.hubs.map((hub, i) => new Vector3(-side(i) * 1.1, i % 2 ? -0.25 : 0.25, hub.z + 7)),
      false,
      'centripetal',
    );
    this.lookPath = new CatmullRomCurve3(
      this.hubs.map((hub, i) => new Vector3(side(i) * 1.0, hub.y * 0.5, hub.z - 4)),
      false,
      'centripetal',
    );
    this.route = new CatmullRomCurve3(this.hubs, false, 'centripetal');
    const routeGeometry = new BufferGeometry().setFromPoints(this.route.getPoints(ROUTE_POINTS));
    this.travelled = new Line(routeGeometry.clone(), this.travelledMaterial);
    this.scene.add(new Line(routeGeometry, this.routeMaterial), this.travelled);

    this.buildSky(span, quality);

    this.pulse = new Mesh(new SphereGeometry(0.07, 12, 8), this.pulseMaterial);
    this.scene.add(this.pulse);

    this.applyBlending(options.palette);
    this.applyLive();

    window.addEventListener('pointermove', this.onPointerMove);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
    this.resize();

    if (options.animate) this.frame = requestAnimationFrame(this.loop);
    else this.renderStill();
  }

  /** Fortschritt der Kamerafahrt, 0 = erster Knoten, 1 = letzter */
  setProgress(progress: number): void {
    if (!this.options.animate) return;
    this.progress = Math.max(0, Math.min(1, progress));
  }

  /** Neue Farben, z. B. nach einem Theme- oder Akzentwechsel. Mit Animation weich überblendet. */
  setPalette(palette: ScenePalette): void {
    this.target = palette;
    this.targetLive = toLive(palette);
    if (this.options.animate) return;
    this.live = toLive(palette);
    this.appliedMode = palette.mode;
    this.applyBlending(palette);
    this.renderStill();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    window.removeEventListener('pointermove', this.onPointerMove);
    const textures = new Set<Texture>();
    this.scene.traverse((object: Object3D) => {
      const node = object as Partial<Mesh>;
      node.geometry?.dispose();
      const materials = ([] as Material[]).concat(node.material ?? []);
      for (const material of materials) {
        const map = (material as { map?: Texture | null }).map;
        if (map) textures.add(map);
        material.dispose();
      }
    });
    textures.forEach((texture) => texture.dispose());
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private buildSky(span: number, quality: (typeof SCENE_QUALITY)['high' | 'low']): void {
    const random = this.random;
    const soft = radialTexture(128, [
      [0, 1],
      [0.18, 0.75],
      [0.5, 0.15],
      [1, 0],
    ]);
    soft.colorSpace = SRGBColorSpace;
    this.dustMaterial.map = soft;
    this.scene.add(this.sky);

    // Sternfarben nach Spektralklassen, gewichtet
    const tints: [number, number][] = [
      [0x9bb0ff, 1],
      [0xaabfff, 2],
      [0xcad7ff, 3],
      [0xf8f7ff, 6],
      [0xfff4ea, 6],
      [0xffd2a1, 3],
      [0xffcc6f, 1.5],
    ];
    const total = tints.reduce((sum, [, weight]) => sum + weight, 0);
    const pickTint = (color: Color) => {
      let r = random() * total;
      for (const [hex, weight] of tints) {
        if ((r -= weight) <= 0) return color.set(hex);
      }
      return color.set(0xffffff);
    };
    const tilt = new Euler(0.9, 0.3, 0.5);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, quality.pixelRatio);

    const layer = (count: number, size: number, opacity: number, band: boolean, dense: boolean) => {
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const color = new Color();
      const v = new Vector3();
      for (let i = 0; i < count; i++) {
        if (band) {
          const theta = random() * Math.PI * 2;
          const phi = gaussian(random) * 0.11 * (0.6 + 0.4 * Math.abs(Math.sin(theta * 1.5)));
          v.set(Math.cos(theta) * Math.cos(phi), Math.sin(phi), Math.sin(theta) * Math.cos(phi));
          v.applyEuler(tilt);
        } else {
          v.set(gaussian(random), gaussian(random), gaussian(random)).normalize();
        }
        v.multiplyScalar(80 + random() * 15);
        positions.set([v.x, v.y, v.z], i * 3);
        pickTint(color);
        const k = band ? 0.5 + random() * 0.5 : 0.6 + random() * 0.4;
        colors.set([color.r * k, color.g * k, color.b * k], i * 3);
      }
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(positions, 3));
      geometry.setAttribute('color', new BufferAttribute(colors, 3));
      const material = new PointsMaterial({
        size: size * pixelRatio,
        sizeAttenuation: false,
        map: soft,
        vertexColors: true,
        transparent: true,
        opacity,
        depthWrite: false,
        fog: false,
      });
      const pointsObject = new Points(geometry, material);
      this.sky.add(pointsObject);
      this.glowing.push(material);
      this.stars.push({ material, points: pointsObject, opacity, dense });
    };
    const [sparse, milkyWay, bright, brightest] = quality.stars;
    layer(sparse, 1.6, 0.85, false, true);
    layer(milkyWay, 1.3, 0.63, true, true);
    layer(bright, 2.6, 1, false, false);
    layer(brightest, 4.2, 1, false, false);

    // Staub in Kameranähe
    const zMin = -span - 16;
    const zMax = 10;
    const dust = new Float32Array(quality.dust * 3);
    for (let i = 0; i < quality.dust; i++) {
      dust.set(
        [(random() - 0.5) * 30, (random() - 0.5) * 18, zMax - random() * (zMax - zMin)],
        i * 3,
      );
    }
    const dustGeometry = new BufferGeometry();
    dustGeometry.setAttribute('position', new BufferAttribute(dust, 3));
    this.scene.add(new Points(dustGeometry, this.dustMaterial));

    // Nebel: große Wolken am Himmel und kleinere entlang des Wegs
    const clouds = [1, 2, 3, 4].map((seed) => cloudTexture(seed, quality.cloud));
    const position = new Vector3();
    const sprite = (map: Texture, hue: number, opacity: number, fog: boolean) => {
      const material = new SpriteMaterial({
        map,
        color: this.live.hues[hue],
        transparent: true,
        opacity,
        depthWrite: false,
        fog,
      });
      material.rotation = random() * Math.PI * 2;
      this.nebulae.push({ material, opacity, hue });
      this.glowing.push(material);
      return new Sprite(material);
    };
    for (let i = 0; i < 16; i++) {
      const cloud = sprite(clouds[i % 4], i % 4, 0.4 + random() * 0.25, false);
      const theta = random() * Math.PI * 2;
      position
        .set(Math.cos(theta), gaussian(random) * 0.15, Math.sin(theta))
        .normalize()
        .applyEuler(tilt)
        .multiplyScalar(70);
      cloud.position.copy(position);
      cloud.scale.setScalar(50 + random() * 60);
      this.sky.add(cloud);
    }
    for (let i = 0; i < 12; i++) {
      const cloud = sprite(clouds[(i + 1) % 4], i % 3, 0.22 + random() * 0.12, true);
      const sign = i % 2 ? 1 : -1;
      cloud.position.set(
        sign * (5 + random() * 7),
        (random() - 0.5) * 7,
        2 - random() * (span + 10),
      );
      cloud.scale.setScalar(16 + random() * 18);
      this.scene.add(cloud);
    }
  }

  private readonly onPointerMove = (event: PointerEvent) => {
    const rect = this.host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    this.mouse.tx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.ty = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  };

  private resize(): void {
    const width = this.host.clientWidth || 1;
    const height = this.host.clientHeight || 1;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    if (!this.options.animate) this.renderStill();
  }

  private readonly loop = (now: number) => {
    this.frame = requestAnimationFrame(this.loop);
    const dt = this.lastFrame ? Math.min(0.05, (now - this.lastFrame) / 1000) : 0;
    this.lastFrame = now;
    this.elapsed += dt;
    this.update(dt, this.elapsed);
    this.renderer.render(this.scene, this.camera);
  };

  private renderStill(): void {
    if (this.disposed) return;
    this.update(0, 0);
    this.renderer.render(this.scene, this.camera);
  }

  private update(dt: number, t: number): void {
    const animate = this.options.animate;
    const mouse = this.mouse;
    if (animate) {
      const follow = smoothing(0.05, dt);
      mouse.x += (mouse.tx - mouse.x) * follow;
      mouse.y += (mouse.ty - mouse.y) * follow;
      this.current += (this.progress - this.current) * follow;
    }
    const current = this.current;

    this.camPath.getPoint(current, this.cameraPoint);
    this.lookPath.getPoint(Math.min(1, current), this.lookPoint);
    this.camera.position.set(
      this.cameraPoint.x + mouse.x * 0.45,
      this.cameraPoint.y + mouse.y * 0.3,
      this.cameraPoint.z,
    );
    this.camera.lookAt(this.lookPoint.x + mouse.x * 0.2, this.lookPoint.y, this.lookPoint.z);
    this.travelled.geometry.setDrawRange(0, Math.max(2, Math.round(current * ROUTE_POINTS) + 1));

    this.sky.position.copy(this.camera.position);
    this.sky.rotation.y = t * 0.002;
    this.nebulae.forEach(({ material }, i) => {
      material.rotation += dt * (i % 2 ? 0.006 : -0.006);
    });
    this.route.getPoint(
      Math.min(1, current + 0.002 + ((t * 0.05) % 1) * Math.max(0.02, 1 - current)),
      this.pulse.position,
    );

    if (animate) this.stepPalette(dt);
    this.applyLive(t);
  }

  /** Farben folgen dem Ziel; wechselt das Theme, blendet die Szene kurz aus und wieder ein */
  private stepPalette(dt: number): void {
    if (this.target.mode !== this.appliedMode) {
      this.intensity = Math.max(0, this.intensity - dt / FADE_SECONDS);
      if (this.intensity === 0) {
        this.appliedMode = this.target.mode;
        this.applyBlending(this.target);
      }
    } else {
      this.intensity = Math.min(1, this.intensity + dt / FADE_SECONDS);
    }

    const k = 1 - Math.exp(-dt * COLOR_RATE);
    const live = this.live;
    const target = this.targetLive;
    for (const key of ['accent', 'background', 'starTint', 'dust', 'pulse'] as const) {
      live[key].lerp(target[key], k);
    }
    live.hues.forEach((hue, i) => hue.lerp(target.hues[i], k));
    for (const key of [
      'line',
      'point',
      'route',
      'travelled',
      'star',
      'dustOpacity',
      'nebula',
    ] as const) {
      live[key] += (target[key] - live[key]) * k;
    }
  }

  private applyBlending(palette: ScenePalette): void {
    const blending = palette.blending === 'additive' ? AdditiveBlending : NormalBlending;
    for (const material of this.glowing) {
      material.blending = blending;
      material.needsUpdate = true;
    }
    for (const star of this.stars) star.points.visible = !star.dense || palette.denseStars;
  }

  private applyLive(t = 0): void {
    const live = this.live;
    const fade = this.intensity;
    const shimmer = this.appliedMode === 'dark' ? 0.02 : 0.01;

    this.fog.color.copy(live.background);
    this.lineMaterial.color.copy(live.accent);
    this.lineMaterial.opacity = (live.line + shimmer * Math.sin(t * 0.8)) * fade;
    this.pointMaterial.color.copy(live.accent);
    this.pointMaterial.opacity = live.point * fade;
    this.routeMaterial.color.copy(live.accent);
    this.routeMaterial.opacity = live.route * fade;
    this.travelledMaterial.color.copy(live.accent);
    this.travelledMaterial.opacity = live.travelled * fade;
    this.pulseMaterial.color.copy(live.pulse);
    this.pulseMaterial.opacity = fade;
    this.dustMaterial.color.copy(live.dust);
    this.dustMaterial.opacity = live.dustOpacity * fade;

    const brightest = this.stars[this.stars.length - 1];
    for (const star of this.stars) {
      const flicker = star === brightest ? 0.85 + 0.15 * Math.sin(t * 2.3) : 1;
      star.material.color.copy(live.starTint);
      star.material.opacity = star.opacity * flicker * live.star * fade;
    }
    for (const nebula of this.nebulae) {
      nebula.material.color.copy(live.hues[nebula.hue]);
      nebula.material.opacity = nebula.opacity * live.nebula * fade;
    }
  }
}
