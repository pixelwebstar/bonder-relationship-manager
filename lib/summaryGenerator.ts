import { Contact } from "./store";

export function generateHeuristicSummary(contact: Contact): string {
    const now = new Date();
    const created = new Date(contact.createdAt);
    const lastContact = new Date(contact.lastContacted);

    // Tenure
    const tenureDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    const tenureYears = (tenureDays / 365).toFixed(1);

    // Gap
    const gapDays = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));

    // Engagement
    const noteCount = contact.notes.length;

    let intro = "";
    if (tenureDays < 30) {
        intro = `${contact.name} is a new connection.`;
    } else if (tenureDays > 365) {
        intro = `You've known ${contact.name} for over ${tenureYears} years.`;
    } else {
        intro = `${contact.name} has been in your network for ${Math.floor(tenureDays / 30)} months.`;
    }

    let status = "";
    if (contact.orbit === 'inner') {
        status = "They are in your Inner Circle, indicating a close relationship.";
    } else if (contact.orbit === 'middle') {
        status = "They are in your Middle Orbit, a steady connection.";
    } else {
        status = "They are currently in your Outer Orbit.";
    }

    let health = "";
    if (contact.healthScore > 80) {
        health = "Relationship health is strong.";
    } else if (contact.healthScore > 40) {
        health = "Connection is stable but could use a check-in.";
    } else {
        health = "Visual drift is occurring; connection is fading.";
    }

    let activity = "";
    if (gapDays < 7) {
        activity = "You spoke recently.";
    } else if (gapDays > 60) {
        activity = `It's been quite a while (${gapDays} days) since you last connected.`;
    } else {
        activity = `Last interaction was ${gapDays} days ago.`;
    }

    let tags = "";
    if (contact.tags && contact.tags.length > 0) {
        tags = ` tagged as ${contact.tags.join(", ")}.`;
    }

    // Context check
    let contextNote = "";
    if (contact.context) {
        contextNote = " context is set.";
    } else {
        contextNote = " No origin story recorded yet.";
    }

    return `${intro} ${status} ${health} ${activity} Recorded ${noteCount} memories${tags}.${contextNote}`;
}
