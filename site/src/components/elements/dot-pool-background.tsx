
import { mistRgb } from '@/lib/mist-palette'
import { useEffect, useRef, type RefObject } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Plane,
  Points,
  Raycaster,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'

/**
 * Dot Pool hero background.
 *
 * A perspective field of soft mist-coloured discs that behaves like a pool:
 * concentric waves radiate from under the primary CTA, two slow swells cross
 * the field, and the pointer stirs ripples. On load the pool rises from under
 * the fold; on scroll it sinks away and fades so the product screenshot takes
 * over. All motion is computed in the vertex shader from a static grid; the
 * CPU only updates uniforms once per frame.
 *
 * Verdict provenance: grilling-frontend-prototyping rounds 1-3 (Dot Pool,
 * bold; soft discs, centred, ripples only, sink, calm energy, rise entrance,
 * highlight crests).
 */

/** Tunables. Every value here is a single named dial; halve or double to retune. */
export const DOT_POOL_CONFIG = {
  /** Grid density (150 x 95 = 14,250 discs) */
  cols: 150,
  rows: 95,
  /** Pool extents in world units */
  width: 34,
  depth: 30,
  /** Disc size in CSS px at reference depth (dark canvas; the site is dark-only) */
  dotSizeDark: 4.5,
  /** Calm energy: concentric wave from the CTA, plus two slow swells */
  waveAmp: 0.2,
  waveSpeed: 1.33,
  swellAmp: 0.096,
  /** Pointer ripple */
  rippleAmp: 0.28,
  rippleRadius: 2.4,
  /** Rise entrance: start this far below the surface and surface at this rate (1/s) */
  riseDistance: 2.4,
  riseRate: 1.6,
  introRate: 2.2,
  /** Scroll response (progress = hero section scrolled-through fraction, 0..1):
   *  the water calms to `calmFloor` amplitude over [calmStart, calmStart + calmSpan] so it lingers as
   *  still water under the pinned screenshot, drops gently (`sinkDistance` at `sinkSpeed`), and fades
   *  out over [fadeStart, fadeStart + fadeSpan] as the supported-lenders field arrives. */
  calmStart: 0.1,
  calmSpan: 0.3,
  calmFloor: 0.3,
  sinkDistance: 1.0,
  sinkSpeed: 0.5,
  fadeStart: 0.66,
  fadeSpan: 0.28,
  /** Camera */
  cameraPosition: [0, 3.4, 8] as const,
  cameraLookAt: [0, -0.4, -8] as const,
  cameraSway: 0.25,
  /** Pointer damping (1/s) and devicePixelRatio caps */
  pointerRate: 6,
  dprCap: 1.5,
  dprCapSmall: 1.25,
  /** Depth fades so the far horizon and the near edge dissolve into the page */
  farFade: 27,
}

// Frame-rate independent exponential damping.
function damp(current: number, target: number, rate: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-rate * dt))
}

// Smoothstep ease used for the scroll fade.
function ease(t: number): number {
  const x = Math.min(1, Math.max(0, t))
  return x * x * (3 - 2 * x)
}

const VERTEX_SHADER = /* glsl */ `
uniform float uTime;
uniform vec2 uOrigin;
uniform vec2 uPointer;
uniform float uPointerOn;
uniform float uWaveAmp;
uniform float uWaveSpeed;
uniform float uSwellAmp;
uniform float uRippleAmp;
uniform float uRippleRadius;
uniform float uAmpScale;
uniform float uSink;
uniform float uSize;
uniform float uDpr;
varying float vHeight;
varying float vDepth;

// Return the pool surface height at a grid position.
float poolHeight(vec2 xz) {
  float d = length(xz - uOrigin);
  // Concentric wave radiating from under the CTA, decaying with distance.
  float h = sin(d * 1.5 - uTime * uWaveSpeed) * uWaveAmp * exp(-d * 0.045);
  // Two slow swells crossing the field.
  h += sin(xz.x * 0.6 + uTime * 0.7) * uSwellAmp + sin(xz.y * 0.45 - uTime * 0.55) * uSwellAmp;
  // Pointer ripple, fading in with pointer presence.
  float dp = length(xz - uPointer);
  h += sin(dp * 3.2 - uTime * 4.5) * uRippleAmp * exp(-dp / uRippleRadius) * uPointerOn;
  return h * uAmpScale;
}

void main() {
  vec3 p = position;
  float h = poolHeight(p.xz);
  p.y = h - uSink;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vDepth = -mv.z;
  vHeight = h;
  gl_PointSize = uSize * uDpr * (1.0 + max(h, 0.0) * 1.4) * (9.0 / vDepth);
  gl_Position = projectionMatrix * mv;
}
`

const FRAGMENT_SHADER = /* glsl */ `
precision highp float;
uniform vec3 uBase;
uniform vec3 uPeak;
uniform float uIntro;
uniform float uFade;
uniform float uFarFade;
varying float vHeight;
varying float vDepth;

void main() {
  // Soft-edged disc.
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float disc = smoothstep(1.0, 0.45, d);
  // Dissolve into the page at the horizon and just in front of the camera.
  float depth = smoothstep(uFarFade, 11.0, vDepth) * smoothstep(3.0, 6.0, vDepth);
  // Crests shift toward the highlight colour.
  float crest = smoothstep(-0.1, 0.35, vHeight);
  vec3 col = mix(uBase, uPeak, crest);
  float a = disc * depth * (0.55 + crest * 0.45) * uIntro * uFade;
  gl_FragColor = vec4(col * a, a);
}
`

interface DotPoolBackgroundProps {
  /** The hero section: drives scroll progress and hosts the CTA the waves radiate from */
  sectionRef: RefObject<HTMLElement | null>
  className?: string
}

/**
 * Render the Dot Pool canvas. Mount inside a sticky, full-viewport, aria-hidden
 * layer; the component sizes itself to its parent.
 */
export function DotPoolBackground({ sectionRef, className }: DotPoolBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    if (!canvas || !host) return

    const C = DOT_POOL_CONFIG
    let disposed = false
    let rafId: number | null = null
    let last = performance.now()
    let time = 0
    let visible = true
    let pageVisible = document.visibilityState !== 'hidden'
    let width = 1
    let height = 1
    let progress = 0
    let scrollDirty = true

    // Keep the decorative canvas optional when WebGL is unavailable or blocked.
    // Request the context before Three.js so a missing context fails silently
    // without producing a renderer error in the browser console.
    const contextAttributes = { alpha: true, antialias: false, powerPreference: 'high-performance' as const }
    let context: WebGL2RenderingContext | WebGLRenderingContext | null
    try {
      const webgl2 = canvas.getContext('webgl2', contextAttributes) as WebGL2RenderingContext | null
      context = webgl2 ?? (canvas.getContext('webgl', contextAttributes) as WebGLRenderingContext | null)
    } catch {
      return
    }
    if (!context) return

    // Contain any remaining renderer construction failure and preserve the
    // server-rendered hero, navigation, and calls to action.
    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({ canvas, context, ...contextAttributes })
    } catch {
      return
    }
    renderer.setClearColor(0x000000, 0)

    const scene = new Scene()
    const camera = new PerspectiveCamera(58, 1, 0.1, 80)
    camera.position.set(...C.cameraPosition)
    const lookAt = new Vector3(...C.cameraLookAt)
    camera.lookAt(lookAt)

    // Static grid on the XZ plane; every motion is shader-driven.
    const count = C.cols * C.rows
    const positions = new Float32Array(count * 3)
    let k = 0
    for (let r = 0; r < C.rows; r++) {
      for (let c = 0; c < C.cols; c++) {
        positions[k++] = (c / (C.cols - 1) - 0.5) * C.width
        positions[k++] = 0
        positions[k++] = -(r / (C.rows - 1)) * C.depth + 4
      }
    }
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(positions, 3))

    const uniforms = {
      uTime: { value: 0 },
      uOrigin: { value: new Vector2(0, -2) },
      uPointer: { value: new Vector2(0, 0) },
      uPointerOn: { value: 0 },
      uWaveAmp: { value: C.waveAmp },
      uWaveSpeed: { value: C.waveSpeed },
      uSwellAmp: { value: C.swellAmp },
      uRippleAmp: { value: C.rippleAmp },
      uRippleRadius: { value: C.rippleRadius },
      uAmpScale: { value: 0 },
      uSink: { value: C.riseDistance },
      uSize: { value: C.dotSizeDark },
      uDpr: { value: 1 },
      uIntro: { value: 0 },
      uFade: { value: 1 },
      uFarFade: { value: C.farFade },
      uBase: { value: new Color() },
      uPeak: { value: new Color() },
    }
    const material = new ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      premultipliedAlpha: true,
    })
    const points = new Points(geometry, material)
    points.frustumCulled = false
    scene.add(points)

    // Colour scheme: the site is dark-only for every visitor, so the pool always
    // uses the dark palette (mist-700 trough, mist-200 crest) and the smaller
    // dark-mode disc. No system-theme listener is needed.
    uniforms.uBase.value.setRGB(...mistRgb(700))
    uniforms.uPeak.value.setRGB(...mistRgb(200))
    uniforms.uSize.value = C.dotSizeDark

    // Size the renderer to the host and keep the camera aspect in step.
    const measure = () => {
      const rect = host.getBoundingClientRect()
      width = Math.max(1, Math.round(rect.width))
      height = Math.max(1, Math.round(rect.height))
      const cap = width < 640 ? C.dprCapSmall : C.dprCap
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap))
      renderer.setSize(width, height, false)
      uniforms.uDpr.value = renderer.getPixelRatio()
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      scrollDirty = true
    }

    // Scroll progress of the hero section: 0 at the top, 1 when its bottom reaches the viewport bottom.
    const updateProgress = () => {
      scrollDirty = false
      const section = sectionRef.current
      if (!section) return
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      progress = rect.height > vh + 1 ? Math.min(1, Math.max(0, -rect.top / (rect.height - vh))) : 0
    }
    const onScroll = () => {
      scrollDirty = true
    }

    // Pointer in canvas NDC, damped per frame; ripples fade in and out with pointer presence.
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, on: 0, onTarget: 0 }
    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.tx = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.ty = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      pointer.onTarget = 1
    }
    const onPointerLeave = () => {
      pointer.onTarget = 0
    }

    // Project screen points onto the pool plane (y = 0) for the pointer and the CTA origin.
    const raycaster = new Raycaster()
    const plane = new Plane(new Vector3(0, 1, 0), 0)
    const hit = new Vector3()
    const ndc = new Vector2()
    const projectToPool = (nx: number, ny: number): boolean => {
      ndc.set(nx, ny)
      raycaster.setFromCamera(ndc, camera)
      return raycaster.ray.intersectPlane(plane, hit) !== null
    }
    const locateOrigin = () => {
      const cta = sectionRef.current?.querySelector('[data-glass-press-button]')
      if (!cta) return
      const c = canvas.getBoundingClientRect()
      const r = cta.getBoundingClientRect()
      const nx = ((r.left + r.width / 2 - c.left) / c.width) * 2 - 1
      const ny = -(((r.top + r.height / 2 - c.top) / c.height) * 2 - 1)
      if (projectToPool(nx, ny)) uniforms.uOrigin.value.set(hit.x, hit.z)
    }

    let intro = 0
    let riseSink = C.riseDistance

    const frame = (now: number) => {
      rafId = null
      if (disposed) return
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000))
      last = now
      time += dt
      if (scrollDirty) updateProgress()

      // Entrance: surface from below while the wave amplitude grows in.
      intro = damp(intro, 1, C.introRate, dt)
      riseSink = damp(riseSink, 0, C.riseRate, dt)

      // Scroll: calm the water to still, drop it gently, and fade it out under the lenders field.
      const sink = Math.min(1, progress * C.sinkSpeed) * C.sinkDistance
      const fade = 1 - ease((progress - C.fadeStart) / C.fadeSpan)
      const calm = 1 - (1 - C.calmFloor) * ease((progress - C.calmStart) / C.calmSpan)

      pointer.x = damp(pointer.x, pointer.tx, C.pointerRate, dt)
      pointer.y = damp(pointer.y, pointer.ty, C.pointerRate, dt)
      pointer.on = damp(pointer.on, pointer.onTarget, 3, dt)
      if (projectToPool(pointer.x, pointer.y)) uniforms.uPointer.value.set(hit.x, hit.z)
      locateOrigin()

      uniforms.uTime.value = time
      uniforms.uIntro.value = intro
      uniforms.uAmpScale.value = intro * calm
      uniforms.uSink.value = sink + riseSink
      uniforms.uFade.value = fade
      uniforms.uPointerOn.value = pointer.on

      camera.position.x = damp(camera.position.x, pointer.x * C.cameraSway, 2, dt)
      camera.lookAt(lookAt)
      renderer.render(scene, camera)

      // Keep looping only while on screen, the tab is visible, and the pool has not fully faded.
      if (visible && pageVisible && fade > 0) rafId = requestAnimationFrame(frame)
    }

    const syncLoop = () => {
      if (disposed) return
      if (visible && pageVisible) {
        if (rafId === null) {
          last = performance.now()
          rafId = requestAnimationFrame(frame)
        }
      } else if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
    }
    const onVisibility = () => {
      pageVisible = document.visibilityState !== 'hidden'
      syncLoop()
    }
    const onScrollResume = () => {
      // The loop sleeps once fully faded; wake it when scrolling back up.
      scrollDirty = true
      syncLoop()
    }

    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(host)
    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        syncLoop()
      },
      { threshold: 0 },
    )
    intersection.observe(canvas)

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    host.addEventListener('pointerleave', onPointerLeave, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scroll', onScrollResume, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    measure()
    canvas.dataset.dotPoolReady = 'true'
    syncLoop()

    return () => {
      disposed = true
      if (rafId !== null) cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      intersection.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      host.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', onScrollResume)
      document.removeEventListener('visibilitychange', onVisibility)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      delete canvas.dataset.dotPoolReady
    }
  }, [sectionRef])

  return <canvas ref={canvasRef} className={className ?? 'block h-full w-full'} />
}
