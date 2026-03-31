import { DoubleSide, Mesh, type Intersection, type Raycaster } from 'three';
import type { Tile } from '../../shared/contracts';

/** Raycast hook that never records an intersection (overlay / background meshes). */
export const noopMeshRaycast: Mesh['raycast'] = () => undefined;

/**
 * Hidden cards are rotated π around Y; the face the camera sees is often the geometric "back" of each triangle.
 * Rendering uses FrontSide, so Mesh.raycast would miss — temporarily use DoubleSide only for picking.
 */
export const pickableMeshRaycast: Mesh['raycast'] = function pickableMeshRaycast(
    this: Mesh,
    raycaster: Raycaster,
    intersects: Intersection[]
): void {
    const { material } = this;

    if (Array.isArray(material)) {
        const sides = material.map((m) => m.side);

        try {
            material.forEach((m) => {
                m.side = DoubleSide;
            });
            Mesh.prototype.raycast.call(this, raycaster, intersects);
        } finally {
            material.forEach((m, i) => {
                m.side = sides[i];
            });
        }

        return;
    }

    const prevSide = material.side;

    try {
        material.side = DoubleSide;
        Mesh.prototype.raycast.call(this, raycaster, intersects);
    } finally {
        material.side = prevSide;
    }
};

export const isTilePickable = (tile: Tile, interactive: boolean, flipLocked: boolean): boolean => {
    if (tile.state === 'matched') {
        return false;
    }

    if (!interactive) {
        return false;
    }

    if (flipLocked && tile.state === 'hidden') {
        return false;
    }

    return true;
};
