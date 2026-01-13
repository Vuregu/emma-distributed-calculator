'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; // Assuming Shadcn utils

interface InputFormProps {
    onJobStarted: (jobGroupId: string, jobs: any[], a: number, b: number) => void;
}

export function InputForm({ onJobStarted }: InputFormProps) {
    const [a, setA] = useState('');
    const [b, setB] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const valA = parseFloat(a);
        const valB = parseFloat(b);
        try {
            const res = await fetch('/api/compute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ a: valA, b: valB })
            });
            const data = await res.json();
            if (data.jobGroupId) {
                onJobStarted(data.jobGroupId, data.jobs, valA, valB);
            }
        } catch (error) {
            console.error("Failed to start job", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 border rounded-xl shadow-md bg-card/80 backdrop-blur-md border-border transition-all hover:shadow-xl hover:border-primary/20">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">New Job</h2>
                {loading && <span className="text-xs text-muted-foreground animate-pulse">Processing...</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Value A
                    </label>
                    <input
                        type="number"
                        step="any"
                        value={a} onChange={e => setA(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                        placeholder="0.00"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Value B
                    </label>
                    <input
                        type="number"
                        step="any"
                        value={b} onChange={e => setB(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                        placeholder="0.00"
                        required
                    />
                </div>
            </div>
            <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-2 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
                {loading ? 'Dispatching...' : 'Start Computation'}
            </Button>
        </form>
    );
}
