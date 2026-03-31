import { describe, expect, it } from 'vitest';
import { FrontSide, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Raycaster, Vector2 } from 'three';
import type { Intersection } from 'three';
import type { Tile } from '../../shared/contracts';
import { isTilePickable, pickableMeshRaycast } from './tileBoardPick';

const hiddenTile = (id: string): Tile => ({
    id,
    pairKey: 'A',
    symbol: 'A',
    label: 'A',
    state: 'hidden'
});

const flippedTile = (id: string): Tile => ({
    id,
    pairKey: 'A',
    symbol: 'A',
    label: 'A',
    state: 'flipped'
});

const matchedTile = (id: string): Tile => ({
    id,
    pairKey: 'A',
    symbol: 'A',
    label: 'A',
    state: 'matched'
});

describe('pickableMeshRaycast', () => {
    it('intersects flipped single-sided geometry that default Mesh.raycast would miss', () => {
        const camera = new PerspectiveCamera(50, 1, 0.1, 100);
        camera.position.set(0, 0, 4);
        camera.lookAt(0, 0, 0);
        camera.updateMatrixWorld(true);

        const mesh = new Mesh(new PlaneGeometry(2, 2), new MeshBasicMaterial({ side: FrontSide }));
        mesh.rotation.x = Math.PI;
        mesh.updateMatrixWorld(true);

        const raycaster = new Raycaster();
        raycaster.setFromCamera(new Vector2(0, 0), camera);

        const defaultHits: Intersection[] = [];
        Mesh.prototype.raycast.call(mesh, raycaster, defaultHits);

        const pickHits: Intersection[] = [];
        pickableMeshRaycast.call(mesh, raycaster, pickHits);

        expect(defaultHits.length).toBe(0);
        expect(pickHits.length).toBeGreaterThan(0);
    });
});

describe('isTilePickable', () => {
    it('returns false when not interactive', () => {
        expect(isTilePickable(hiddenTile('t1'), false, false)).toBe(false);
    });

    it('returns false for matched tiles', () => {
        expect(isTilePickable(matchedTile('t1'), true, false)).toBe(false);
    });

    it('returns false for hidden tiles while two are flipped', () => {
        expect(isTilePickable(hiddenTile('t1'), true, true)).toBe(false);
    });

    it('returns true for hidden tiles when not locked', () => {
        expect(isTilePickable(hiddenTile('t1'), true, false)).toBe(true);
    });

    it('returns true for flipped tiles while locked', () => {
        expect(isTilePickable(flippedTile('t1'), true, true)).toBe(true);
    });
});
