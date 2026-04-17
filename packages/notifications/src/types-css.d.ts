/** Side-effect CSS in this package only — avoid a global `*.css` default string (conflicts with Vite `*.module.css` typing in the app). */
declare module './notification-host.css' {
    const src: string;
    export default src;
}
