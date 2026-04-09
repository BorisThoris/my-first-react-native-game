/**
 * Loads each card SVG (`back.svg` / `front.svg`) as a **single merged** `BufferGeometry` per URL.
 * Traced SVGs are not decomposed into separate meshes per motif; DOM-only FX overlays live in
 * `components/cards/cardArt/` instead.
 */
import {
    BufferAttribute,
    BufferGeometry,
    Color,
    ShapeGeometry
} from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CARD_PLANE_HEIGHT, CARD_PLANE_WIDTH } from './tileShatter';

/** Skip degenerate paths; merged card must stay under this for mobile GPUs. */
const MAX_VERTEX_COUNT = 520_000;

/**
 * SVGLoader + merge on multi‑MB card art freezes the main thread for seconds; those assets already
 * render via raster textures (`tileTextures` + `?url` images). Skip mesh build without downloading
 * the body when `Content-Length` is available.
 */
const MAX_SVG_SOURCE_BYTES_FOR_MESH = 512 * 1024;

const resolvedByUrl = new Map<string, BufferGeometry | null>();
const inflightByUrl = new Map<string, Promise<BufferGeometry | null>>();

function parseFillColor(style: Record<string, unknown> | undefined): Color | null {
    if (!style) {
        return null;
    }
    const fill = style.fill;
    if (typeof fill !== 'string' || fill === 'none' || fill === 'transparent' || fill.startsWith('url(')) {
        return null;
    }
    const c = new Color();
    try {
        c.setStyle(fill);
    } catch {
        return null;
    }
    const opacityRaw = style.fillOpacity;
    const opacity =
        typeof opacityRaw === 'string' ? Number.parseFloat(opacityRaw) : typeof opacityRaw === 'number' ? opacityRaw : 1;
    if (!Number.isFinite(opacity) || opacity <= 0) {
        return null;
    }
    if (opacity < 1) {
        c.multiplyScalar(Math.max(0, opacity));
    }
    return c;
}

/**
 * Shared BufferGeometry per SVG URL: SVGLoader fills → merged, centered, Y-flipped,
 * non-uniformly scaled to {@link CARD_PLANE_WIDTH} × {@link CARD_PLANE_HEIGHT}.
 */
export function loadSharedCardSvgPlaneGeometry(assetUrl: string): Promise<BufferGeometry | null> {
    const hit = resolvedByUrl.get(assetUrl);
    if (hit !== undefined) {
        return Promise.resolve(hit);
    }

    let inflight = inflightByUrl.get(assetUrl);
    if (inflight) {
        return inflight;
    }

    inflight = (async (): Promise<BufferGeometry | null> => {
        try {
            try {
                const probe = await fetch(assetUrl, { method: 'HEAD' });
                if (probe.ok) {
                    const cl = probe.headers.get('content-length');
                    if (cl != null) {
                        const bytes = Number(cl);
                        if (Number.isFinite(bytes) && bytes > MAX_SVG_SOURCE_BYTES_FOR_MESH) {
                            resolvedByUrl.set(assetUrl, null);
                            return null;
                        }
                    }
                }
            } catch {
                /* HEAD unsupported or blocked — fall through to GET + length check */
            }

            const text = await fetch(assetUrl).then((response) => {
                if (!response.ok) {
                    throw new Error(`SVG fetch ${response.status}`);
                }
                return response.text();
            });

            if (text.length > MAX_SVG_SOURCE_BYTES_FOR_MESH) {
                resolvedByUrl.set(assetUrl, null);
                return null;
            }

            const data = new SVGLoader().parse(text);
            const parts: BufferGeometry[] = [];

            for (const path of data.paths) {
                const style = path.userData?.style as Record<string, unknown> | undefined;
                const c = parseFillColor(style);
                if (!c) {
                    continue;
                }

                const shapes = SVGLoader.createShapes(path);
                for (const shape of shapes) {
                    const geom = new ShapeGeometry(shape);
                    const n = geom.attributes.position.count;
                    const colors = new Float32Array(n * 3);
                    for (let i = 0; i < n; i += 1) {
                        colors[i * 3] = c.r;
                        colors[i * 3 + 1] = c.g;
                        colors[i * 3 + 2] = c.b;
                    }
                    geom.setAttribute('color', new BufferAttribute(colors, 3));
                    parts.push(geom);
                }
            }

            if (parts.length === 0) {
                console.warn('cardSvgPlaneGeometry: no filled shapes in', assetUrl.slice(-40));
                resolvedByUrl.set(assetUrl, null);
                return null;
            }

            const merged = mergeGeometries(parts, false);
            for (const p of parts) {
                p.dispose();
            }

            if (merged.attributes.position.count > MAX_VERTEX_COUNT) {
                console.warn(
                    `cardSvgPlaneGeometry: vertex count ${merged.attributes.position.count} exceeds cap; use raster fallback (${assetUrl.slice(-48)})`
                );
                merged.dispose();
                resolvedByUrl.set(assetUrl, null);
                return null;
            }

            merged.computeBoundingBox();
            const box = merged.boundingBox;
            if (!box) {
                merged.dispose();
                resolvedByUrl.set(assetUrl, null);
                return null;
            }

            const cx = (box.min.x + box.max.x) * 0.5;
            const cy = (box.min.y + box.max.y) * 0.5;
            merged.translate(-cx, -cy, 0);
            merged.scale(1, -1, 1);

            merged.computeBoundingBox();
            const b2 = merged.boundingBox;
            if (!b2) {
                merged.dispose();
                resolvedByUrl.set(assetUrl, null);
                return null;
            }

            const bw = Math.max(b2.max.x - b2.min.x, 1e-6);
            const bh = Math.max(b2.max.y - b2.min.y, 1e-6);
            merged.scale(CARD_PLANE_WIDTH / bw, CARD_PLANE_HEIGHT / bh, 1);
            merged.computeVertexNormals();
            if (merged.index) {
                try {
                    merged.computeTangents();
                } catch {
                    /* non-fatal: normal mapping may be skipped for this mesh */
                }
            }

            resolvedByUrl.set(assetUrl, merged);
            return merged;
        } catch (e) {
            console.warn('cardSvgPlaneGeometry: failed to build mesh', e);
            resolvedByUrl.set(assetUrl, null);
            return null;
        } finally {
            inflightByUrl.delete(assetUrl);
        }
    })();

    inflightByUrl.set(assetUrl, inflight);
    return inflight;
}
