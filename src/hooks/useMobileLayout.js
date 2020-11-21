import { useLayoutEffect, useState } from "react";

export default function useMobileLayout() {
    const [isMobile, setMobile] = useState(Math.min(window.screen.width, window.screen.height) < 768 || navigator.userAgent.indexOf("Mobi") > -1);
    useLayoutEffect(() => {
        const handler = () => {
            const mobile = Math.min(window.screen.width, window.screen.height) < 768 || navigator.userAgent.indexOf("Mobi") > -1;
            setMobile(mobile);
        };

        window.addEventListener("resize", handler);
        window.addEventListener("orientationchange", handler);
        return () => {
            window.removeEventListener("resize", handler);
            window.removeEventListener("orientationchange", handler);
        };
    }, []);
    return isMobile;
}