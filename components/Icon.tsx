import React from 'react';

interface IconProps {
    name: string;
    className?: string;
    style?: React.CSSProperties;
}

const ICONS: { [key: string]: React.ReactElement } = {
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></>,
    sparkles: <><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></>,
    spinner: <path d="M21 12a9 9 0 1 1-6.219-8.56"/>,
    image: <><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></>,
    pencil: <><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></>,
    close: <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
    check: <path d="M20 6 9 17l-5-5"/>,
    copy: <><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></>,
    restart: <><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></>,
    info: <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>,
    dice: <><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M16 8h.01"/><path d="M8 8h.01"/><path d="M12 12h.01"/><path d="M8 16h.01"/><path d="M16 16h.01"/></>,
    error: <><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>,
    compare: <><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="M16 21l4-4-4-4"/><path d="M20 17H4"/></>,
    wand: <><path d="M15 4V2"/><path d="M15 10V8"/><path d="M10.24 6.5A4.5 4.5 0 0 0 5.5 12a4.5 4.5 0 0 0 8.76 2"/><path d="M19.76 10a4.5 4.5 0 0 0-8.76-2"/><path d="M5 20v-2"/><path d="M5 12H3"/><path d="M21 12h-2"/><path d="M12 17v-2"/><path d="M12 22v-2"/><path d="M18.76 14A4.5 4.5 0 0 0 14 19.5a4.5 4.5 0 0 0-2-8.76"/></>,
    brand: <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>,
    'text-size': <><path d="m3 15 4-8 4 8"/><path d="M4 13h6"/><path d="M15 4v10h5"/><path d="M15 8h4"/></>,
    trash: <><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></>,
    cog: <><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0 2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></>,
    'settings-2': <><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></>,
    history: <><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></>,
    'star-filled': <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    search: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>,
    brush: <><path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.21 0 4-1.79 4-4.02 0-1.22-1.52-1.52-2-2.02z"/></>,
    crop: <><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></>,
    text: <><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></>,
    moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>,
    palette: <><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125s.148-.836.438-1.125c.29-.289.438-.652.438-1.125s-.148-.836-.438-1.125c-.29-.289-.438-.652-.438-1.125s.148-.836.438-1.125c.29-.289.438-.652.438-1.125s-.148-.836-.438-1.125C13.648 2.746 12.926 2 12 2z"/></>,
    video: <><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></>,
    camera: <><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></>,
    cube: <><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></>,
    'paint-brush': <path d="M20.7 3.3a1 1 0 0 0-1.4 0L15 7.6l-4.2-4.2a1 1 0 0 0-1.4 0L3.3 9.5a1 1 0 0 0 0 1.4l4.2 4.2-4.3 4.3a1 1 0 0 0 0 1.4l2.8 2.8a1 1 0 0 0 1.4 0l4.3-4.3 4.2 4.2a1 1 0 0 0 1.4 0l6.1-6.1a1 1 0 0 0 0-1.4L20.7 3.3z"/>,
    leaf: <><path d="M11 20A7 7 0 0 1 7 6l5-4 5 4a7 7 0 0 1-4 14z"/><path d="M9 12a3 3 0 0 0 3 3z"/></>,
    'moon-stars': <><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 3v4"/><path d="M21 5h-4"/></>,
    eraser: <><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 22H7"/><path d="m15 11-1 1"/></>,
    expand: <><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></>,
    'arrow-up': <><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></>,
    'arrow-down': <><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></>,
    'arrow-left': <><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></>,
    'arrow-right': <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>,
    'rotate-cw': <><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 1 1.6-5.2"/></>,
    'chevron-down': <path d="m6 9 6 6 6-6"/>,
    'chevron-up': <path d="m18 15-6-6-6 6"/>,
    'menu': <><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></>,
    'aspect-ratio': <><rect width="20" height="14" x="2" y="5" rx="2" ry="2"/><path d="M12 9v6"/><path d="M9 12h6"/></>,
    'undo': <><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></>,
    'redo': <><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"/></>,
    mic: <><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></>,
    qrcode: <><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12h.01"/><path d="M12 21h.01"/></>,
    shirt: <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99 .84H6v10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>,
    send: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
    plus: <><path d="M5 12h14"/><path d="M12 5v14"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    package: <><path d="M16.5 9.4a2 2 0 1 1 0 5.2"/><rect width="20" height="12" x="2" y="6" rx="2"/><line x1="2" x2="22" y1="12" y2="12"/></>,
    sliders: <><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></>,
    'audio-waveform': <path d="M2 12h3l4-9 4 18 4-9h3"/>,
    edit: <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>,
    'layout-grid': <><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></>,
    'move': <><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/></>,
    save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>,
    'aspect-ratio-16-9': <rect x="3" y="6" width="18" height="12" rx="2" />,
    'aspect-ratio-1-1': <rect x="5" y="5" width="14" height="14" rx="2" />,
    'aspect-ratio-9-16': <rect x="8" y="3" width="8" height="18" rx="2" />,
    'aspect-ratio-4-3': <rect x="4" y="6" width="16" height="12" rx="2" />,
    'aspect-ratio-3-4': <rect x="7" y="4" width="10" height="16" rx="2" />,
    'circle-slash': <><circle cx="12" cy="12" r="10" /><path d="m4.93 4.93 14.14 14.14" /></>,
    'cinematic-lighting': <><path d="M9 5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M16 5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" opacity=".4"/><path d="M2 5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="m12.5 15.5 2 2L17 15l2 3.5-2.5 2-1-3-1.5 1.5-1-2.5-1 1-2.5-2L10 15l2.5 2.5Z"/></>,
    sunrise: <><path d="M12 2v8" /><path d="m4.93 10.93 1.41 1.41" /><path d="M2 18h2" /><path d="M20 18h2" /><path d="m17.66 12.34 1.41-1.41" /><path d="M22 22H2" /><path d="m16 6-4-4-4 4" /></>,
    sunset: <><path d="M12 10V2" /><path d="m4.93 10.93 1.41 1.41" /><path d="M2 18h2" /><path d="M20 18h2" /><path d="m17.66 12.34 1.41-1.41" /><path d="M22 22H2" /><path d="m16 18-4-4-4 4" /></>,
    'sun-high': <><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></>,
    'high-key':<><circle cx="12" cy="12" r="2.5" /><path d="M12 5.5V3" /><path d="M12 21v-2.5" /><path d="M18.5 12H21" /><path d="M3 12h2.5" /><path d="M16.25 7.75l1.77-1.77" /><path d="M5.98 18.02l1.77-1.77" /><path d="M16.25 16.25l1.77 1.77" /><path d="M5.98 5.98l1.77 1.77" /></>,
    'low-key': <><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 19a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2h14v-2Z"/><circle cx="12" cy="12" r="2"/></>,
    'horror-dim': <><path d="M5.5 12.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5v6h-9v-6z" /><circle cx="9" cy="12" r=".5" /><circle cx="15" cy="12" r=".5" /><path d="M5.5 18.5 7 17l1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5L18.5 18.5"/></>,
    'neon-cyberpunk': <><path d="M8 3v18" /><path d="M16 3v18" /></>,
    flame: <><path d="M12 22V13" /><path d="M12 13a4 4 0 0 0 4-4V3H8v6a4 4 0 0 0 4 4z"/></>,
    flashlight: <><path d="M18 5H6v2l4 6v6h4v-6l4-6V5zM8 3h8v2H8V3z"/></>,
    'mug': <><path d="M10 21h4a2 2 0 0 0 2-2V7H8v12a2 2 0 0 0 2 2z"/><path d="M16 7h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/></>,
    'billboard': <><path d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><path d="M4 14h16"/><path d="M12 14v-4"/><rect x="2" y="3" width="20" height="7" rx="2"/></>,
    'smartphone': <><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><path d="M12 18h.01"/></>,
    'shopping-bag': <><path d="M6.333 6.333A2.5 2.5 0 0 1 8.833 4h6.334a2.5 2.5 0 0 1 2.5 2.5v12.5a2.5 2.5 0 0 1-2.5 2.5H8.833a2.5 2.5 0 0 1-2.5-2.5z"/><path d="M8 4a4 4 0 1 0 8 0"/></>,
    'book': <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v2H6.5A2.5 2.5 0 0 1 4 19.5z"/><path d="M17.5 2A2.5 2.5 0 0 0 15 4.5v11A2.5 2.5 0 0 0 17.5 18H20V4.5A2.5 2.5 0 0 0 17.5 2z"/></>,
    'user-circle': <><circle cx="12" cy="8" r="4" /><path d="M12 14c-2.76 0-8 1.79-8 4v2h16v-2c0-2.21-5.24-4-8-4z" /></>,
    'zoom-in': <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /><path d="M11 8v6M8 11h6" /></>,
    'focus': <><circle cx="12" cy="12" r="3" /><path d="M3 12h2M19 12h2M12 3v2M12 19v2" /></>,
    'user-square': <><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="12" cy="10" r="3" /><path d="M7 21v-2a5 5 0 0 1 10 0v2" /></>,
    'scan-user': <><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><circle cx="12" cy="10" r="3" /><path d="M7 18v-1a5 5 0 0 1 10 0v1" /></>,
    'mountain': <path d="m8 3 4 8 5-5 5 15H2L8 3z" />,
    'eye': <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
    'droplet': <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5s-3 3.5-3 5.5a7 7 0 0 0 7 7z" />,
    'snowflake': <path d="M12 2v20m5-17L7 19m-5-5l10 10M7 5l10 14m-5 3l-5-5m10 0l-5 5m0-10l5 5m-10 0l5-5" />,
    'contrast': <><circle cx="12" cy="12" r="10" /><path d="M12 18V6a6 6 0 0 1 0 12z" /></>,
};

export const Icon: React.FC<IconProps> = ({ name, className, style }) => {
    const iconPath = ICONS[name];

    if (!iconPath) {
        console.warn(`Icon "${name}" not found.`);
        return null;
    }
    
    const isFilled = name.endsWith('-filled');

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={isFilled ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            strokeWidth={isFilled ? 0 : 1.5}
            stroke="currentColor"
            className={`w-6 h-6 ${className || ''}`}
            style={style}
            aria-hidden="true"
        >
            {iconPath}
        </svg>
    );
};