// Time-based greeting utility

export function getTimeBasedGreeting(): string {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return "Good Morning";
    } else if (hour >= 12 && hour < 17) {
        return "Good Afternoon";
    } else if (hour >= 17 && hour < 21) {
        return "Good Evening";
    } else {
        return "Good Night";
    }
}

export function getGreetingEmoji(): string {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return "☀️";
    } else if (hour >= 12 && hour < 17) {
        return "🌤️";
    } else if (hour >= 17 && hour < 21) {
        return "🌅";
    } else {
        return "🌙";
    }
}

// Format user display name (truncate if too long)
export function formatDisplayName(name: string, maxLength: number = 15): string {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 1) + "…";
}
