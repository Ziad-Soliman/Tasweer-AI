
import React from 'react';

interface IconProps {
    name: string;
    className?: string;
    style?: React.CSSProperties;
}

const ICONS: { [key: string]: JSX.Element } = {
    upload: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />,
    sparkles: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Zm1.137-7.19-2.846-.813a4.5 4.5 0 0 0-3.09-3.09L9 2.25l-.813 2.846a4.5 4.5 0 0 0-3.09 3.09L2.25 9l2.846.813a4.5 4.5 0 0 0 3.09 3.09L9 15.75l.813-2.846a4.5 4.5 0 0 0 3.09-3.09L15.75 9l-2.846-.813a4.5 4.5 0 0 0-3.09-3.09Z" />,
    spinner: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />,
    image: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />,
    download: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />,
    pencil: <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />,
    close: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />,
    copy: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75c-.621 0-1.125-.504-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375V9.375m0-3.75c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125h1.5Z" />,
    restart: <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001a10.5 10.5 0 0 0-9.348-9.348c-5.828 0-10.5 4.672-10.5 10.5 0 5.828 4.672 10.5 10.5 10.5 5.828 0 10.5-4.672 10.5-10.5v-4.992" />,
    info: <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />,
    dice: <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />,
    error: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />,
    compare: <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h18M16.5 3 21 7.5m0 0L16.5 12M21 7.5H3" />,
    wand: <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-3.48-2.146l-2.28.286a2.25 2.25 0 0 0-1.84 2.255l.286 2.28a3 3 0 0 0 2.146 3.48l2.28.286a2.25 2.25 0 0 0 2.255-1.84l.286-2.28a3 3 0 0 0-3.48-2.146Zm0 0 2.28-2.28m-2.28 2.28-2.28 2.28" />,
    brand: <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.003 1.11-1.226.554-.225 1.192-.225 1.746 0 .55.223 1.02.684 1.11 1.226l.082.498a8.25 8.25 0 0 1 4.634 3.746l.498-.082c.542-.09.942-.45 1.226-1.11a1.747 1.747 0 0 0 0-1.746c-.284-.66-.754-1.13-1.226-1.11l-.498.082a8.25 8.25 0 0 0-3.746-4.634l.082-.498c.09-.542-.285-1.003-.818-1.226a1.747 1.747 0 0 0-1.746 0c-.533.223-.908.684-.818 1.226l.082.498a8.25 8.25 0 0 0-4.634 3.746l-.498-.082c-.542-.09-1.028.03-1.226.586a1.747 1.747 0 0 0 0 1.746c.198.556.684.946 1.226 1.036l.498.082a8.25 8.25 0 0 0 3.746 4.634l-.082.498c-.09.542.285 1.003.818 1.226a1.747 1.747 0 0 0 1.746 0c.533-.223.908.684.818-1.226l-.082-.498a8.25 8.25 0 0 0 4.634-3.746l.498.082c.542.09 1.028-.03 1.226-.586a1.747 1.747 0 0 0 0-1.746c-.198-.556-.684-.946-1.226-1.036l-.498-.082a8.25 8.25 0 0 0-3.746-4.634l.082-.498Z" />,
    'text-size': <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9M18.375 18H5.625m12.75 0-1.148-9M8.625 9 7.477 18" />,
    cog: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.092 1.21-.138 2.43-.138 3.662s.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.092-1.21.138-2.43.138-3.662zM15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z" />,
    history: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
    'star-filled': <path fillRule="evenodd" d="M10.788 3.212a.75.75 0 0 1 .424 0l2.429 1.223a.75.75 0 0 0 .358.09l2.67.19a.75.75 0 0 1 .417 1.285l-1.93 1.882a.75.75 0 0 0-.215.665l.455 2.659a.75.75 0 0 1-1.088.791l-2.388-1.256a.75.75 0 0 0-.702 0l-2.388 1.256a.75.75 0 0 1-1.088-.791l.455-2.659a.75.75 0 0 0-.215-.665l-1.93-1.882a.75.75 0 0 1 .417-1.285l2.67-.19a.75.75 0 0 0 .358.09l2.429-1.223Z" clipRule="evenodd" />,
    star: <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321 1.003l-4.123 3.55a.563.563 0 0 0-.162.593l1.234 5.395c.099.434-.364.79-.746.592L12 17.5l-4.937 2.92c-.382.2-.845-.158-.746-.592l1.234-5.395a.563.563 0 0 0-.162-.593l-4.123-3.55c-.38-.34-.178-.963.321-1.003l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />,
    search: <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />,
    brush: <path strokeLinecap="round" strokeLinejoin="round" d="m9.53 16.122.213.213a2.25 2.25 0 0 0 3.182 0l4.243-4.243-3.182-3.182-4.243 4.243a2.25 2.25 0 0 0 0 3.182Z" />,
    crop: <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H4.5A2.25 2.25 0 0 0 2.25 6v1.5M16.5 3.75h3A2.25 2.25 0 0 1 21.75 6v1.5M7.5 20.25H4.5A2.25 2.25 0 0 1 2.25 18v-1.5m13.5 1.5h3a2.25 2.25 0 0 0 2.25-2.25v-1.5" />,
    text: <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.75v16.5M5.25 3.75h13.5" />,
    sun: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.95-4.223-1.591 1.591M5.25 12H3m4.223-4.95-1.591-1.591M12 12a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z" />,
    moon: <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25c0 5.385 4.365 9.75 9.75 9.75 2.833 0 5.398-1.21 7.252-3.248Z" />,
    palette: <path strokeLinecap="round" strokeLinejoin="round" d="M12.983 5.433a4.5 4.5 0 1 1 6.364 6.364l-1.09 1.09a.75.75 0 0 1-1.06 0l-1.415-1.414a.75.75 0 0 1 0-1.06l1.09-1.09a2.998 2.998 0 0 0-4.242-4.242L12 7.757l-1.293-1.293a2.998 2.998 0 0 0-4.242 0 2.998 2.998 0 0 0 0 4.242l3.09 3.09a.75.75 0 0 1 0 1.06l-1.414 1.414a.75.75 0 0 1-1.06 0L4.636 12.8A4.5 4.5 0 0 1 11 6.436l1.983-1.983Z" />,
    video: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75z" />,
    camera: <><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.776 48.776 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" /></>,
    cube: <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />,
    'paint-brush': <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />,
    leaf: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />,
    'moon-stars': <><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25c0 5.385 4.365 9.75 9.75 9.75 2.833 0 5.398-1.21 7.252-3.248Z" /><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 1.5-1.5 3 1.5 3 1.5-3-1.5-3Zm4.5 6-1.5 3 1.5 3 1.5-3-1.5-3Z" /></>,
    eraser: <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />,
    expand: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />,
    'arrow-up': <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />,
    'arrow-down': <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75" />,
    'arrow-left': <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />,
    'arrow-right': <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75 6.75M19.5 12l-6.75-6.75" />,
    'rotate-cw': <><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/></>,
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