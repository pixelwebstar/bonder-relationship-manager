export interface ParsedContact {
    name: string;
    phone?: string;
    email?: string;
}

export const parseVCF = async (file: File): Promise<ParsedContact[]> => {
    const text = await file.text();
    const contacts: ParsedContact[] = [];

    // Split by VCARD boundaries
    const cards = text.split(/BEGIN:VCARD/i).filter(c => c.trim().length > 0);

    for (const card of cards) {
        const nameMatch = card.match(/FN:(.*?)[\r\n]/i);
        const telMatch = card.match(/TEL;.*?:(.*?)[\r\n]/i); // Basic matching, might need refinement for varied formats
        const emailMatch = card.match(/EMAIL;.*?:(.*?)[\r\n]/i);

        if (nameMatch) {
            contacts.push({
                name: nameMatch[1].trim(),
                phone: telMatch ? telMatch[1].trim() : undefined,
                email: emailMatch ? emailMatch[1].trim() : undefined,
            });
        }
    }

    return contacts;
};
