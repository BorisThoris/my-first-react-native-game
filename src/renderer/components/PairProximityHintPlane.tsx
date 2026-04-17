import { useLayoutEffect, useMemo, type ReactElement } from 'react';
import { CanvasTexture, DoubleSide, NearestFilter, SRGBColorSpace } from 'three';
import { noopMeshRaycast } from './tileBoardPick';
import { CARD_PLANE_HEIGHT, CARD_PLANE_WIDTH } from './tileShatter';

const paintHint = (canvas: HTMLCanvasElement, distance: number): void => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const pad = 10;
    ctx.fillStyle = 'rgba(8,12,22,0.88)';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, 14);
    } else {
        ctx.rect(pad, pad, w - pad * 2, h - pad * 2);
    }
    ctx.fill();
    ctx.fillStyle = '#7de8b8';
    ctx.font = 'bold 68px system-ui, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(distance), w / 2, h / 2 + 3);
};

/**
 * Minesweeper-style grid-distance badge: Manhattan steps to the nearest legal pair partner.
 * Rendered on the front face while a tile is flipped (committed), not during memorize/peek-only faces.
 */
export const PairProximityHintPlane = ({ distance, faceZ }: { distance: number; faceZ: number }): ReactElement => {
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const tex = new CanvasTexture(canvas);
        tex.colorSpace = SRGBColorSpace;
        tex.minFilter = NearestFilter;
        tex.magFilter = NearestFilter;
        return tex;
    }, []);

    useLayoutEffect(() => {
        paintHint(texture.image as HTMLCanvasElement, distance);
        /* Three.js: flag GPU upload after 2D canvas paint (mutation required). */
        // eslint-disable-next-line react-hooks/immutability -- CanvasTexture GPU sync
        texture.needsUpdate = true;
    }, [distance, texture]);

    useLayoutEffect(() => {
        return () => {
            texture.dispose();
        };
    }, [texture]);

    const z = faceZ + 0.028;
    const x = CARD_PLANE_WIDTH * 0.5 - 0.095;
    const y = CARD_PLANE_HEIGHT * 0.5 - 0.095;

    return (
        <mesh position={[x, y, z]} raycast={noopMeshRaycast} renderOrder={12}>
            <planeGeometry args={[0.15, 0.15]} />
            <meshBasicMaterial
                depthTest
                depthWrite={false}
                map={texture}
                polygonOffset
                polygonOffsetFactor={-1}
                polygonOffsetUnits={-1}
                side={DoubleSide}
                toneMapped={false}
                transparent
            />
        </mesh>
    );
};
