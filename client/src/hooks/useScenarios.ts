import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Scenario {
    id: string;
    name: string;
    createdAt: number;
    data: any;
}

const STORAGE_KEY = 'fair_risk_scenarios';

export const useScenarios = () => {
    const [scenarios, setScenarios] = useState<Scenario[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setScenarios(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse scenarios', e);
            }
        }
    }, []);

    const saveScenario = useCallback((name: string, data: any) => {
        const newScenario: Scenario = {
            id: crypto.randomUUID(),
            name,
            createdAt: Date.now(),
            data,
        };

        setScenarios((prev) => {
            const updated = [...prev, newScenario];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });

        toast.success(`Scenario "${name}" saved successfully`);
    }, []);

    const loadScenario = useCallback((id: string) => {
        const scenario = scenarios.find((s) => s.id === id);
        if (scenario) {
            toast.success(`Loaded scenario: ${scenario.name}`);
            return scenario.data;
        }
        return null;
    }, [scenarios]);

    const deleteScenario = useCallback((id: string) => {
        setScenarios((prev) => {
            const updated = prev.filter((s) => s.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
        toast.success('Scenario deleted');
    }, []);

    return {
        scenarios,
        saveScenario,
        loadScenario,
        deleteScenario,
    };
};
