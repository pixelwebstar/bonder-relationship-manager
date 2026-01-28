"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { BottomNav } from "@/components/layout/BottomNav";
import { motion } from "framer-motion";
import { ArrowLeft, User, Phone, Tag, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AddContactPage() {
    const router = useRouter();
    const { addContact } = useStore();
    const [formData, setFormData] = useState({
        name: "",
        phoneNumber: "",
        tag: "friend",
        frequency: 30
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        addContact({
            name: formData.name,
            phoneNumber: formData.phoneNumber,
            tags: [formData.tag],
            targetFrequencyDays: Number(formData.frequency),
            email: ""
        });

        toast.success("Contact added successfully!");
        router.push("/contacts");
    };

    return (
        <MobileFrame>
            <div className="p-6 pb-28">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100">
                        <ArrowLeft className="w-6 h-6 text-slate-700" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800">New Connection</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <User className="w-4 h-4" /> Name
                        </label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full glass-card p-4 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
                            placeholder="e.g. Sarah Connor"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <Phone className="w-4 h-4" /> Phone Number
                        </label>
                        <input
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="w-full glass-card p-4 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                <Tag className="w-4 h-4" /> Tag
                            </label>
                            <select
                                value={formData.tag}
                                onChange={e => setFormData({ ...formData, tag: e.target.value })}
                                className="w-full glass-card p-4 rounded-xl outline-none bg-white"
                            >
                                <option value="friend">Friend</option>
                                <option value="family">Family</option>
                                <option value="work">Work</option>
                                <option value="acquaintance">Acquaintance</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Reach out every
                            </label>
                            <select
                                value={formData.frequency}
                                onChange={e => setFormData({ ...formData, frequency: Number(e.target.value) })}
                                className="w-full glass-card p-4 rounded-xl outline-none bg-white"
                            >
                                <option value={7}>Week</option>
                                <option value={14}>2 Weeks</option>
                                <option value={30}>Month</option>
                                <option value={90}>3 Months</option>
                            </select>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-violet-500/30 mt-8"
                    >
                        Create Connection
                    </motion.button>
                </form>
            </div>
            <BottomNav />
        </MobileFrame>
    );
}
