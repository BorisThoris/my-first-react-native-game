import { useEffect, useRef } from 'react';
import styles from './MainMenu.module.css';

interface MenuAtmosphereProps {
    height: number;
    reduceMotion: boolean;
    width: number;
}

type ParticleKind = 'orb' | 'streak';

interface Particle {
    alpha: number;
    angle: number;
    color: string;
    drift: number;
    kind: ParticleKind;
    phase: number;
    radius: number;
    rotationSpeed: number;
    stretch: number;
    vx: number;
    vy: number;
    x: number;
    y: number;
}

const GOLD = 'rgba(246, 216, 139, 1)';
const BLUE = 'rgba(120, 162, 255, 1)';
const PEARL = 'rgba(255, 248, 232, 1)';

const getParticleCount = (width: number, height: number): number => {
    if (width <= 430 || height <= 620) {
        return 8;
    }

    if (width <= 760 || height <= 760) {
        return 14;
    }

    if (width <= 1220) {
        return 20;
    }

    return 28;
};

const randomBetween = (min: number, max: number): number => min + Math.random() * (max - min);

const pickColor = (index: number): string => {
    const bucket = index % 6;

    if (bucket === 0 || bucket === 3) {
        return GOLD;
    }

    if (bucket === 1 || bucket === 4) {
        return BLUE;
    }

    return PEARL;
};

const buildParticles = (width: number, height: number): Particle[] => {
    const particleCount = getParticleCount(width, height);
    const streakCount = Math.max(2, Math.round(particleCount * 0.2));

    return Array.from({ length: particleCount }, (_unused, index) => {
        const streak = index < streakCount && index % 2 === 0;
        const radius = streak ? randomBetween(1.8, 3.8) : randomBetween(10, 28);

        return {
            alpha: streak ? randomBetween(0.05, 0.1) : randomBetween(0.06, 0.14),
            angle: randomBetween(0, Math.PI * 2),
            color: pickColor(index),
            drift: streak ? randomBetween(0.35, 0.8) : randomBetween(0.8, 1.6),
            kind: streak ? 'streak' : 'orb',
            phase: randomBetween(0, Math.PI * 2),
            radius,
            rotationSpeed: randomBetween(-0.08, 0.08),
            stretch: streak ? randomBetween(2.6, 5.6) : randomBetween(1.05, 1.7),
            vx: streak ? randomBetween(-14, 14) : randomBetween(-8, 8),
            vy: streak ? randomBetween(-7, 7) : randomBetween(-5, 5),
            x: randomBetween(0, width),
            y: randomBetween(0, height)
        };
    });
};

const wrapParticle = (particle: Particle, width: number, height: number): void => {
    const padding = 120;

    if (particle.x < -padding) {
        particle.x = width + padding;
    } else if (particle.x > width + padding) {
        particle.x = -padding;
    }

    if (particle.y < -padding) {
        particle.y = height + padding;
    } else if (particle.y > height + padding) {
        particle.y = -padding;
    }
};

const drawParticle = (
    context: CanvasRenderingContext2D,
    particle: Particle,
    time: number,
    reducedMotion: boolean
): void => {
    const oscillation = reducedMotion ? 0 : Math.sin(time * 0.00035 + particle.phase) * particle.drift;
    const shimmer = reducedMotion ? 0 : Math.cos(time * 0.00028 + particle.phase * 1.7) * particle.drift * 0.75;
    const rotation = particle.angle + (reducedMotion ? 0 : particle.rotationSpeed * Math.sin(time * 0.0002 + particle.phase));
    const widthScale = particle.kind === 'streak' ? particle.stretch : particle.stretch * 1.05;
    const heightScale = particle.kind === 'streak' ? 0.42 : 1;

    context.save();
    context.translate(particle.x + oscillation, particle.y + shimmer);
    context.rotate(rotation);
    context.globalAlpha = particle.alpha;
    context.globalCompositeOperation = 'lighter';
    context.shadowColor = particle.color;
    context.shadowBlur = particle.radius * (particle.kind === 'streak' ? 5 : 3.8);
    context.fillStyle = particle.color;

    if (particle.kind === 'streak') {
        context.beginPath();
        context.roundRect(
            -particle.radius * widthScale * 1.2,
            -particle.radius * heightScale,
            particle.radius * widthScale * 2.4,
            particle.radius * heightScale * 2,
            particle.radius
        );
        context.fill();

        context.globalAlpha = particle.alpha * 0.45;
        context.fillRect(
            -particle.radius * widthScale * 1.45,
            -particle.radius * 0.12,
            particle.radius * widthScale * 2.9,
            particle.radius * 0.24
        );
    } else {
        context.beginPath();
        context.ellipse(0, 0, particle.radius * widthScale, particle.radius * heightScale, 0, 0, Math.PI * 2);
        context.fill();
    }

    context.restore();
};

const MenuAtmosphere = ({ width, height, reduceMotion }: MenuAtmosphereProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        let context: CanvasRenderingContext2D | null = null;

        try {
            context = canvas.getContext('2d');
        } catch {
            context = null;
        }

        if (!context) {
            return;
        }

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const particles = buildParticles(width, height);
        let frameId = 0;
        let lastTime = performance.now();
        let surfaceWidth = width;
        let surfaceHeight = height;

        const syncCanvas = (): void => {
            const rect = canvas.getBoundingClientRect();
            surfaceWidth = Math.max(1, Math.round(rect.width || width));
            surfaceHeight = Math.max(1, Math.round(rect.height || height));
            canvas.width = Math.max(1, Math.round(surfaceWidth * dpr));
            canvas.height = Math.max(1, Math.round(surfaceHeight * dpr));
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const draw = (time: number): void => {
            context.clearRect(0, 0, surfaceWidth, surfaceHeight);

            for (const particle of particles) {
                if (!reduceMotion) {
                    const deltaSeconds = Math.min(0.032, (time - lastTime) / 1000);
                    particle.x += particle.vx * deltaSeconds;
                    particle.y += particle.vy * deltaSeconds;
                    wrapParticle(particle, surfaceWidth, surfaceHeight);
                }

                drawParticle(context, particle, time, reduceMotion);
            }
        };

        syncCanvas();
        draw(lastTime);

        if (reduceMotion) {
            return;
        }

        const loop = (time: number): void => {
            draw(time);
            lastTime = time;
            frameId = window.requestAnimationFrame(loop);
        };

        frameId = window.requestAnimationFrame(loop);

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, [height, reduceMotion, width]);

    return <canvas aria-hidden="true" className={styles.atmosphereCanvas} ref={canvasRef} />;
};

export default MenuAtmosphere;
