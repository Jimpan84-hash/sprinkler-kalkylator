import React, { useState, useMemo, useCallback } from 'react';
import { INTERVAL_DEFINITIONS, MULTIPLIER_RULES, ALL_TASKS } from './data/serviceData.js';
import ConfigPanel from './components/ConfigPanel.jsx';
import QuoteDetails from './components/QuoteDetails.jsx';
import Summary from './components/Summary.jsx';

const createInitialTasks = () => {
    const tasks = {};
    for (const key in INTERVAL_DEFINITIONS) {
        const intervalKey = key;
        tasks[intervalKey] = INTERVAL_DEFINITIONS[intervalKey].taskIds.map(taskId => {
            const task = ALL_TASKS.find(t => t.id === taskId);
            if (!task) throw new Error(`Task with id ${taskId} not found`);
            return { ...task, currentHours: task.baseHours };
        });
    }
    return tasks;
};

const INITIAL_STATE = {
    customerInfo: { name: '', facility: '', address: '', contact: '' },
    selectedIntervals: [],
    multipliers: {
        larmventilerVat: 1,
        larmventilerTorr: 0,
        dieselpumpar: 0,
        flodesvakter: 0,
        sprinklercentraler: 0,
    },
    hourlyRate: 650,
    travelCost: 500,
    margin: 10,
    tasksByInterval: createInitialTasks(),
};

const App = () => {
    const [state, setState] = useState(INITIAL_STATE);
    
    const handleStateChange = useCallback((key, value) => {
        setState(prevState => ({ ...prevState, [key]: value }));
    }, []);

    const handleCustomerInfoChange = useCallback((field, value) => {
        setState(prevState => ({
            ...prevState,
            customerInfo: { ...prevState.customerInfo, [field]: value }
        }));
    }, []);
    
    const handleMultiplierChange = useCallback((field, value) => {
        setState(prevState => ({
            ...prevState,
            multipliers: { ...prevState.multipliers, [field]: value }
        }));
    }, []);

    const handleIntervalToggle = useCallback((intervalKey) => {
        setState(prevState => {
            const selectedIntervals = prevState.selectedIntervals.includes(intervalKey)
                ? prevState.selectedIntervals.filter(i => i !== intervalKey)
                : [...prevState.selectedIntervals, intervalKey];
            return { ...prevState, selectedIntervals };
        });
    }, []);

    const handleTaskHoursChange = useCallback((intervalKey, taskId, newHours) => {
        setState(prevState => ({
            ...prevState,
            tasksByInterval: {
                ...prevState.tasksByInterval,
                [intervalKey]: prevState.tasksByInterval[intervalKey].map(task =>
                    task.id === taskId ? { ...task, currentHours: newHours } : task
                )
            }
        }));
    }, []);

    const handleTaskRemove = useCallback((intervalKey, taskId) => {
        setState(prevState => ({
            ...prevState,
            tasksByInterval: {
                ...prevState.tasksByInterval,
                [intervalKey]: prevState.tasksByInterval[intervalKey].filter(task => task.id !== taskId)
            }
        }));
    }, []);
    
    const handleTaskAdd = useCallback((intervalKey, task) => {
        const newTask = { ...task, currentHours: task.baseHours };
        setState(prevState => ({
            ...prevState,
            tasksByInterval: {
                ...prevState.tasksByInterval,
                [intervalKey]: [...prevState.tasksByInterval[intervalKey], newTask]
            }
        }));
    }, []);

    const calculationResult = useMemo(() => {
        const intervalOrder = ['vecko', 'manad', 'kvartal', 'halvar', 'helar'];
        const sortedIntervals = [...state.selectedIntervals].sort((a, b) => intervalOrder.indexOf(a) - intervalOrder.indexOf(b));

        const calculatedIntervals = sortedIntervals.map(key => {
            const definition = INTERVAL_DEFINITIONS[key];
            let totalHours = 0;

            const calculatedTasks = state.tasksByInterval[key].map(task => {
                let multiplier = 1;

                if (task.id === 'flodesvakt_pressostat') {
                    multiplier = state.multipliers.larmventilerVat + state.multipliers.larmventilerTorr + state.multipliers.flodesvakter;
                } else {
                    const multiplierKey = Object.keys(MULTIPLIER_RULES).find(mKey =>
                        MULTIPLIER_RULES[mKey].includes(task.id)
                    );

                    if (multiplierKey) {
                        multiplier = state.multipliers[multiplierKey] > 0 ? state.multipliers[multiplierKey] : 1;
                    }
                }
                
                const taskTotalHours = task.currentHours * multiplier;
                totalHours += taskTotalHours;
                const cost = taskTotalHours * state.hourlyRate;

                return { ...task, multiplier, totalHours: taskTotalHours, cost };
            });

            const costPerOccasionBeforeMargin = (totalHours * state.hourlyRate) + state.travelCost;
            const costPerOccasion = costPerOccasionBeforeMargin * (1 + state.margin / 100);
            const totalCostPerYear = costPerOccasion * definition.occasions;

            return {
                key,
                name: definition.name,
                occasions: definition.occasions,
                tasks: calculatedTasks,
                totalHours,
                costPerOccasion,
                totalCostPerYear,
            };
        });

        const grandTotal = calculatedIntervals.reduce((sum, interval) => sum + interval.totalCostPerYear, 0);
        
        return { intervals: calculatedIntervals, grandTotal };
    }, [state]);

    const handleSave = () => {
        try {
            localStorage.setItem('sprinkler-quote-app-data', JSON.stringify(state));
            alert('Kalkyl sparad!');
        } catch (error) {
            console.error('Failed to save state:', error);
            alert('Kunde inte spara kalkyl.');
        }
    };
    
    const handleLoad = () => {
        try {
            const savedState = localStorage.getItem('sprinkler-quote-app-data');
            if (savedState) {
                setState(JSON.parse(savedState));
                alert('Kalkyl laddad!');
            } else {
                alert('Ingen sparad kalkyl hittades.');
            }
        } catch (error) {
            console.error('Failed to load state:', error);
            alert('Kunde inte ladda kalkyl.');
        }
    };

    const handlePrint = () => {
        if(calculationResult.intervals.length > 0) {
            window.print();
        } else {
            alert("Välj minst ett intervall för att skriva ut en offert.")
        }
    };

    const currencyFormatter = new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' });

    return (
        <>
            <div className="min-h-screen bg-gray-100 text-gray-800">
                <header className="bg-primary text-white shadow-md no-print">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold leading-tight">Sprinkler Service Kalkylator</h1>
                    </div>
                </header>
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0 space-y-8">
                        {/* Print Header */}
                        <div className="hidden print:block mb-8">
                            <h1 className="text-3xl font-bold">Offert - Service av sprinkleranläggning</h1>
                             <div className="mt-4 border p-4 rounded-md grid grid-cols-2 gap-4">
                                <div><span className="font-semibold">Kund:</span> {state.customerInfo.name}</div>
                                <div><span className="font-semibold">Anläggning:</span> {state.customerInfo.facility}</div>
                                <div><span className="font-semibold">Adress:</span> {state.customerInfo.address}</div>
                                <div><span className="font-semibold">Kontakt:</span> {state.customerInfo.contact}</div>
                            </div>
                        </div>

                        {/* Config Panel (Web View Only) */}
                        <div className="no-print">
                            <ConfigPanel
                                state={state}
                                onStateChange={handleStateChange}
                                onCustomerInfoChange={handleCustomerInfoChange}
                                onMultiplierChange={handleMultiplierChange}
                                onIntervalToggle={handleIntervalToggle}
                            />
                        </div>

                        {/* Quote Details (Web and Print View) */}
                        <QuoteDetails
                            calculationResult={calculationResult}
                            onTaskHoursChange={handleTaskHoursChange}
                            onTaskRemove={handleTaskRemove}
                            onTaskAdd={handleTaskAdd}
                        />

                         {/* Print Summary */}
                         <div className="hidden print:block bg-white p-6 rounded-lg shadow-lg mt-8">
                            <h2 className="text-2xl font-bold text-primary mb-4">Sammanfattning årskostnad</h2>
                            <table className="min-w-full">
                                <thead className="border-b">
                                    <tr>
                                        <th className="text-left py-2 font-semibold">Serviceintervall</th>
                                        <th className="text-right py-2 font-semibold">Årskostnad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {calculationResult.intervals.map(interval => (
                                        <tr key={interval.key} className="border-t">
                                            <td className="py-2">{`${interval.name} (${interval.occasions} x ${currencyFormatter.format(interval.costPerOccasion)})`}</td>
                                            <td className="text-right py-2">{currencyFormatter.format(interval.totalCostPerYear)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-black">
                                        <td className="py-2 pt-4 font-bold text-lg">Total årskostnad (exkl. moms)</td>
                                        <td className="text-right py-2 pt-4 font-bold text-lg">{currencyFormatter.format(calculationResult.grandTotal)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                             <p className="text-xs mt-4 text-gray-600">Pris baserat på timkostnad {currencyFormatter.format(state.hourlyRate)}, resekostnad {currencyFormatter.format(state.travelCost)}/tillfälle och marginal på {state.margin}%.</p>
                        </div>
                    </div>
                </main>
            </div>
            {calculationResult.intervals.length > 0 && 
                <div className="no-print">
                    <Summary grandTotal={calculationResult.grandTotal} onSave={handleSave} onLoad={handleLoad} onPrint={handlePrint} />
                </div>
            }
        </>
    );
};

export default App;
