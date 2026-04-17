/** Shared XML escaping for programmatic card SVG strings. */
export const escapeXml = (s: string): string =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const svgLinearGradientDef = (
    id: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    userSpace: boolean,
    stops: readonly { offset: string; color: string }[]
): string => {
    const gu = userSpace ? 'userSpaceOnUse' : 'objectBoundingBox';
    const body = stops.map((s) => `      <stop offset="${s.offset}" stop-color="${s.color}"/>`).join('\n');
    return `<linearGradient id="${id}" gradientUnits="${gu}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
${body}
    </linearGradient>`;
};
