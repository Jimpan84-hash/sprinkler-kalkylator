import React, { useState } from 'react';
import { ALL_TASKS } from '../data/serviceData.js';

const QuoteDetails = ({ calculationResult, onTaskHoursChange, onTaskRemove, onTaskAdd }) => {
    if (calculationResult.intervals.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-lg text-center no-print">
                <h2 className="text-xl font-semibold text-gray-700">Välj ett serviceintervall för att starta kalkylen.</h2>
                <p className="text-gray-500 mt-2">Din offert kommer att visas här när du har gjort dina val.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {calculationResult.intervals.map(interval => (
                <IntervalTable
                    key={interval.key}
                    interval={interval}
                    onTaskHoursChange={onTaskHoursChange}
                    onTaskRemove={onTaskRemove}
                    onTaskAdd={onTaskAdd}
                />
            ))}
        </div>
    );
};

const IntervalTable = ({ interval, onTaskHoursChange, onTaskRemove, onTaskAdd }) => {
    const [showAddTask, setShowAddTask] = useState(false);
    const [selectedTask, setSelectedTask] = useState('');

    const availableTasks = ALL_TASKS.filter(
        (task) => !interval.tasks.some((it) => it.id === task.id)
    );
    
    const handleAddTask = () => {
        const taskToAdd = ALL_TASKS.find(t => t.id === selectedTask);
        if (taskToAdd) {
            onTaskAdd(interval.key, taskToAdd);
            setSelectedTask('');
            setShowAddTask(false);
        }
    };
    
    const currencyFormatter = new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' });

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg interval-container">
            <h2 className="text-2xl font-bold text-primary mb-4">{interval.name}</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Moment</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tid (h)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Multiplikator</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summa (h)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kostnad</th>
                            <th className="px-1 py-3 no-print"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {interval.tasks.map(task => (
                            <tr key={task.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{task.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="number"
                                        step="0.05"
                                        value={task.currentHours}
                                        onChange={(e) => onTaskHoursChange(interval.key, task.id, parseFloat(e.target.value) || 0)}
                                        className="w-20 p-1 border border-gray-300 rounded-md focus:ring-primary focus:border-primary no-print"
                                    />
                                    <span className="hidden print:block">{task.currentHours.toFixed(2)}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.multiplier}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.totalHours.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{currencyFormatter.format(task.cost)}</td>
                                <td className="px-1 py-4 no-print">
                                  <button onClick={() => onTaskRemove(interval.key, task.id)} className="text-danger hover:text-red-700">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                      </svg>
                                  </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 no-print">
                {showAddTask ? (
                    <div className="flex items-center space-x-2">
                        <select
                            value={selectedTask}
                            onChange={(e) => setSelectedTask(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        >
                            <option value="">Välj moment...</option>
                            {availableTasks.map(task => <option key={task.id} value={task.id}>{task.name}</option>)}
                        </select>
                        <button onClick={handleAddTask} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-800">Lägg till</button>
                        <button onClick={() => setShowAddTask(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Avbryt</button>
                    </div>
                ) : (
                    <button onClick={() => setShowAddTask(true)} className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-blue-500">
                        + Lägg till moment
                    </button>
                )}
            </div>
            
            <div className="mt-6 bg-gray-50 p-4 rounded-md flex justify-between items-center flex-wrap gap-4">
                <div>
                    <p className="text-sm text-gray-600">{interval.occasions} tillfällen/år</p>
                    <p className="text-sm text-gray-600">Total tid per tillfälle: {interval.totalHours.toFixed(2)}h</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-semibold text-gray-800">Kostnad per tillfälle: {currencyFormatter.format(interval.costPerOccasion)}</p>
                    <p className="text-xl font-bold text-primary">Total årskostnad: {currencyFormatter.format(interval.totalCostPerYear)}</p>
                </div>
            </div>
        </div>
    );
};

export default QuoteDetails;
