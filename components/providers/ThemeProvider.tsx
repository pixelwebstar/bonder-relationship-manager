"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Timeout to avoid "synchronous state update" warning in some linters for hydration
        setTimeout(() => setMounted(true), 0);
    }, []);

    if (!mounted) {
        // Return null or children without theming to avoid hydration mismatch
        // Returning children ensures content is visible but might flash, 
        // giving we want "premium" feel, we can prevent flash or just accept it.
        // Standard practice for next-themes is often just rendering, but suppressHydrationWarning is already on html.
        // Let's return children to be safe for SEO/content, themes apply fast.
        return <>{children}</>;
    }

    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
