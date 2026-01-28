import { useState } from 'react';
import { Sparkles, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface IcebreakerGeneratorProps {
    contactName: string;
    context?: string; // e.g. "birthday", "drifted"
}

export function IcebreakerGenerator({ contactName, context = 'general' }: IcebreakerGeneratorProps) {
    const [topic, setTopic] = useState('');
    const [generated, setGenerated] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const templates = {
        drifted: [
            `Hey ${contactName}, thinking of you! How have you been?`,
            `Long time no see, ${contactName}! Saw something that reminded me of you today.`,
            `Hi ${contactName}, it's been a while. Hope everything is going well!`
        ],
        birthday: [
            `Happy Birthday ${contactName}!! 🎉 Hope you have an amazing day!`,
            `Sending you big birthday wishes, ${contactName}! 🎂`,
            `Happy level up day ${contactName}! Hope this year is your best yet.`
        ],
        general: [
            `Hey ${contactName}, how's your week going?`,
            `Hi ${contactName}, got any fun plans for the weekend?`,
            `Thinking of you, ${contactName}! hope you're doing good.`
        ]
    };

    const handleGenerate = () => {
        setIsGenerating(true);
        // Simulate API call
        setTimeout(() => {
            let selection = templates.general;
            if (context === 'drifting' || context === 'fading') selection = templates.drifted;
            // Add custom topic if present
            if (topic) {
                selection = [
                    `Hey ${contactName}, just saw this about ${topic} and thought of you!`,
                    `Hi ${contactName}, do you still do ${topic}? I was curious about it.`,
                    ...selection
                ];
            }

            setGenerated(selection.sort(() => 0.5 - Math.random()).slice(0, 3));
            setIsGenerating(false);
        }, 800);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    return (
        <div className="bg-white rounded-2xl p-4 border border-violet-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <h4 className="font-bold text-slate-700 text-sm">Icebreaker AI</h4>
            </div>

            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder="Topic (optional, e.g. Cats)"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
                />
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-violet-700 disabled:opacity-50 transition-colors"
                >
                    {isGenerating ? '...' : 'Generate'}
                </button>
            </div>

            <div className="space-y-2">
                {generated.map((msg, i) => (
                    <div key={i} className="group relative p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-violet-200 transition-colors cursor-pointer" onClick={() => handleCopy(msg)}>
                        <p className="text-sm text-slate-600 pr-6">{msg}</p>
                        <button className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-violet-500">
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                {generated.length === 0 && !isGenerating && (
                    <p className="text-xs text-slate-400 text-center py-2">Enter a topic or just click Generate for ideas.</p>
                )}
            </div>
        </div>
    );
}
