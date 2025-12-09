// Imports from importmap
import React, { useState, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

// --- DATA ---
const ALL_TASKS = [
  { id: 'manometer', name: 'Avläsning samtliga manometrar för vatten och luft', baseHours: 0.25 },
  { id: 'ventiler_lage', name: 'Kontroll av samtliga avstängningsventiler korrekta läge', baseHours: 0.25 },
  { id: 'vattenniva', name: 'Kontroll av vattennivå', baseHours: 0.25 },
  { id: 'turbinklocka', name: 'Vattenturbinklocka', baseHours: 0.5 },
  { id: 'bransle_olja_kylvatten', name: 'Kontroll av bränsle, olje-/kylvattennivå', baseHours: 0.25 },
  { id: 'automatik_pumpstart', name: 'Automatik pumpstart (start tryck)', baseHours: 0.25 },
  { id: 'manuell_pumpstart', name: 'Manuell pumpstart', baseHours: 0.25 },
  { id: 'uppvarmning', name: 'Uppvärmning', baseHours: 0.25 },
  { id: 'batterier', name: 'Kontroll av batterier (elektrolytnivå, densitet mm)', baseHours: 0.5 },
  { id: 'riskklass', name: 'Kontroll av riskklass', baseHours: 0.5 },
  { id: 'sprinkler_kontrollventiler', name: 'Kontroll av sprinkler, kontrollventiler', baseHours: 0.25 },
  { id: 'rornat_upphang', name: 'Kontroll av rörnät och upphängningar', baseHours: 1 },
  { id: 'vattenkalla_larmventil', name: 'Kontroll av vattenkälla via larmventil', baseHours: 0.25 },
  { id: 'kraftforsorjning', name: 'Kraftförsörjning', baseHours: 0.25 },
  { id: 'avstangningsventiler', name: 'Avstängningsventiler', baseHours: 0.25 },
  { id: 'flodesvakt_pressostat', name: 'Funktion Flödesvakt, larmpressostat', baseHours: 0.5 },
  { id: 'reservdelar', name: 'Reservdelar', baseHours: 0.25 },
  { id: 'larmoverforing', name: 'Larmöverföring', baseHours: 0.5 },
  { id: 'kapacitetsprov', name: 'Kapacitetsprov', baseHours: 4 },
  { id: 'misslyckat_start', name: 'Misslyckat startförsök', baseHours: 0.5 },
  { id: 'pafyllningsventiler', name: 'Påfyllningsventiler för bassänger', baseHours: 0.25 },
  { id: 'torrorsventil_flodesprov', name: 'Torrörsventil. Partiellt flödesprov', baseHours: 0.5 },
  { id: 'silar', name: 'Silar', baseHours: 0.5 },
  { id: 'kondenskar', name: 'Kontroll av kondenskärl', baseHours: 0.5 },
];

const DIESEL_TASKS = ['bransle_olja_kylvatten', 'automatik_pumpstart', 'manuell_pumpstart', 'misslyckat_start'];

// Helper to build interval arrays based on inheritance requirements
const VECKO_TASKS = ['manometer', 'ventiler_lage', 'vattenniva', 'bransle_olja_kylvatten', 'turbinklocka', 'automatik_pumpstart', 'manuell_pumpstart', 'uppvarmning'];
const MANAD_TASKS = [...VECKO_TASKS, 'batterier'];
const KVARTAL_TASKS = [...MANAD_TASKS, 'riskklass', 'sprinkler_kontrollventiler', 'rornat_upphang', 'kraftforsorjning', 'avstangningsventiler', 'reservdelar', 'vattenkalla_larmventil', 'flodesvakt_pressostat', 'torrorsventil_flodesprov'];
const HALVAR_TASKS = [...KVARTAL_TASKS, 'larmoverforing', 'misslyckat_start', 'pafyllningsventiler'];
const HELAR_TASKS = ALL_TASKS.map(t => t.id); // Contains everything including 'kondenskar'

const INTERVAL_DEFINITIONS = {
  vecko: { name: 'Veckoservice', occasions: 40, taskIds: [...new Set(VECKO_TASKS)] },
  manad: { name: 'Månadsservice', occasions: 8, taskIds: [...new Set(MANAD_TASKS)] },
  kvartal: { name: 'Kvartalsservice', occasions: 2, taskIds: [...new Set(KVARTAL_TASKS)] },
  halvar: { name: 'Halvårsservice', occasions: 1, taskIds: [...new Set(HALVAR_TASKS)] },
  helar: { name: 'Helårsservice', occasions: 1, taskIds: [...new Set(HELAR_TASKS)] },
};

const MULTIPLIER_RULES = {
  larmventilerVat: ['vattenkalla_larmventil', 'flodesvakt_pressostat'],
  larmventilerTorr: ['torrorsventil_flodesprov', 'flodesvakt_pressostat'],
  dieselpumpar: ['bransle_olja_kylvatten', 'automatik_pumpstart', 'manuell_pumpstart', 'misslyckat_start'],
  flodesvakter: ['flodesvakt_pressostat'],
  sprinklercentraler: ['manometer', 'ventiler_lage', 'avstangningsventiler', 'larmoverforing', 'kapacitetsprov'],
  kondenskar: ['kondenskar'],
};

// --- COMPONENTS ---

const InputField = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input type="text" value={value} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
  </div>
);

const NumberInputField = ({ label, value, onChange, step = "1" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input 
      type="number" 
      value={value} 
      onChange={onChange} 
      onFocus={(e) => e.target.select()} // Auto-select on focus
      onClick={(e) => e.target.select()} // Auto-select on click
      step={step} 
      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" 
    />
  </div>
);

const CustomerInfoSection = ({ customerInfo, onChange }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Kundinformation</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField label="Kundnamn" value={customerInfo.name} onChange={e => onChange('name', e.target.value)} />
      <InputField label="Anläggning" value={customerInfo.facility} onChange={e => onChange('facility', e.target.value)} />
      <InputField label="Adress" value={customerInfo.address} onChange={e => onChange('address', e.target.value)} />
      <InputField label="Kontaktperson" value={customerInfo.contact} onChange={e => onChange('contact', e.target.value)} />
      <InputField label="Offertnummer" value={customerInfo.offertnummer} onChange={e => onChange('offertnummer', e.target.value)} />
    </div>
  </div>
);

const intervalKeys = Object.keys(INTERVAL_DEFINITIONS);
const IntervalSelector = ({ selectedIntervals, onToggle }) => (
  <div className="space-y-3">
    <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Serviceintervaller</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {intervalKeys.map(key => (
        <div key={key} className="flex items-center">
          <input type="checkbox" id={key} checked={selectedIntervals.includes(key)} onChange={() => onToggle(key)} className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary" />
          <label htmlFor={key} className="ml-2 block text-sm font-medium text-gray-700">{INTERVAL_DEFINITIONS[key].name}</label>
        </div>
      ))}
    </div>
  </div>
);

const MultiplierInputs = ({ multipliers, onChange }) => {
    const labels = {
        larmventilerVat: "Larmventiler våt",
        larmventilerTorr: "Larmventiler torr",
        dieselpumpar: "Dieselpumpar",
        flodesvakter: "Flödesvakter",
        sprinklercentraler: "Sprinklercentraler",
        // Kondenskärl handled separately below
    };
    
    return (
        <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Antal / Multiplikatorer</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.keys(labels).map(key => (
                    <NumberInputField key={key} label={labels[key]} value={multipliers[key]} onChange={e => onChange(key, parseInt(e.target.value, 10) || 0)} />
                ))}
                {/* Condition for Kondenskärl */}
                {multipliers.larmventilerTorr > 0 && (
                   <div className="bg-yellow-50 p-1 rounded">
                     <NumberInputField 
                        label="Antal kondenskärl" 
                        value={multipliers.kondenskar} 
                        onChange={e => onChange('kondenskar', parseInt(e.target.value, 10) || 0)} 
                     />
                   </div>
                )}
            </div>
        </div>
    );
};

const PricingAndTravelInputs = ({ hourlyRate, travelTime, travelHourlyRate, onStateChange }) => (
    <div className="space-y-3">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Timpris & Resekostnad</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NumberInputField label="Timkostnad Service (kr)" value={hourlyRate} onChange={e => onStateChange('hourlyRate', parseInt(e.target.value, 10) || 0)} />
            <NumberInputField label="Restid per tillfälle (h)" value={travelTime} onChange={e => onStateChange('travelTime', parseFloat(e.target.value) || 0)} step="0.5" />
            <NumberInputField label="Timpris Resa (kr)" value={travelHourlyRate} onChange={e => onStateChange('travelHourlyRate', parseInt(e.target.value, 10) || 0)} />
        </div>
    </div>
);

const ConfigPanel = ({ state, onStateChange, onCustomerInfoChange, onMultiplierChange, onIntervalToggle }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg space-y-8 config-panel">
    <CustomerInfoSection customerInfo={state.customerInfo} onChange={onCustomerInfoChange} />
    <IntervalSelector selectedIntervals={state.selectedIntervals} onToggle={onIntervalToggle} />
    <MultiplierInputs multipliers={state.multipliers} onChange={onMultiplierChange} />
    <PricingAndTravelInputs hourlyRate={state.hourlyRate} travelTime={state.travelTime} travelHourlyRate={state.travelHourlyRate} onStateChange={onStateChange} />
  </div>
);

const IntervalTable = ({ interval, onTaskHoursChange, onTaskRemove, onTaskAdd }) => {
    const [showAddTask, setShowAddTask] = useState(false);
    const [selectedTask, setSelectedTask] = useState('');
    const [addTaskMode, setAddTaskMode] = useState('select'); // 'select' or 'custom'
    const [customTaskName, setCustomTaskName] = useState('');
    const [customTaskHours, setCustomTaskHours] = useState('');

    const currencyFormatter = new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' });
    
    const availableTasks = ALL_TASKS.filter(task => !interval.tasks.some(it => it.id === task.id));
    
    const resetAddForm = () => {
        setShowAddTask(false);
        setSelectedTask('');
        setCustomTaskName('');
        setCustomTaskHours('');
        setAddTaskMode('select');
    };
    
    const handleAddTaskFromList = () => {
        const taskToAdd = ALL_TASKS.find(t => t.id === selectedTask);
        if (taskToAdd) {
            onTaskAdd(interval.key, taskToAdd);
            resetAddForm();
        }
    };
    
    const handleAddCustomTask = () => {
        if (!customTaskName.trim() || !customTaskHours || parseFloat(customTaskHours) <= 0) {
            alert('Fyll i både ett giltigt namn och en tid (större än 0) för det nya momentet.');
            return;
        }
        const newHours = parseFloat(customTaskHours);
        const newTask = {
            id: `custom-${customTaskName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
            name: customTaskName.trim(),
            baseHours: newHours,
        };
        onTaskAdd(interval.key, newTask);
        resetAddForm();
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg printable-content">
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
                                    <input type="number" step="0.05" onFocus={e => e.target.select()} value={task.currentHours} onChange={e => onTaskHoursChange(interval.key, task.id, parseFloat(e.target.value) || 0)} className="w-20 p-1 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
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

            <div className="mt-4 add-task-controls">
                {!showAddTask ? (
                    <button onClick={() => setShowAddTask(true)} className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-blue-500">
                        + Lägg till moment
                    </button>
                ) : (
                    <div className="p-4 border border-gray-200 rounded-md bg-gray-50 space-y-4">
                        <div className="flex space-x-2 border-b pb-2">
                            <button onClick={() => setAddTaskMode('select')} className={`px-4 py-2 rounded-md text-sm ${addTaskMode === 'select' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}>
                                Välj från lista
                            </button>
                            <button onClick={() => setAddTaskMode('custom')} className={`px-4 py-2 rounded-md text-sm ${addTaskMode === 'custom' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}>
                                Skapa eget moment
                            </button>
                        </div>

                        {addTaskMode === 'select' ? (
                            <div className="flex items-center space-x-2">
                                <select value={selectedTask} onChange={e => setSelectedTask(e.target.value)} className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary">
                                    <option value="">Välj moment...</option>
                                    {availableTasks.map(task => <option key={task.id} value={task.id}>{task.name}</option>)}
                                </select>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <input type="text" placeholder="Namn på nytt moment" value={customTaskName} onChange={e => setCustomTaskName(e.target.value)} className="block w-full p-2 border border-gray-300 rounded-md" />
                                <input type="number" placeholder="Tid i timmar (t.ex. 0.5)" value={customTaskHours} onChange={e => setCustomTaskHours(e.target.value)} step="0.05" min="0.05" className="block w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                        )}
                        
                        <div className="flex space-x-2 pt-2">
                            <button onClick={addTaskMode === 'select' ? handleAddTaskFromList : handleAddCustomTask} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-800">
                                Lägg till
                            </button>
                            <button onClick={resetAddForm} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
                                Avbryt
                            </button>
                        </div>
                    </div>
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

const QuoteDetails = ({ calculationResult, onTaskHoursChange, onTaskRemove, onTaskAdd }) => {
    if (calculationResult.intervals.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-lg text-center config-panel">
                <h2 className="text-xl font-semibold text-gray-700">Välj ett serviceintervall för att starta kalkylen.</h2>
                <p className="text-gray-500 mt-2">Din offert kommer att visas här när du har gjort dina val.</p>
            </div>
        );
    }
    return (
        <div className="space-y-8">
            {calculationResult.intervals.map(interval => (
                <IntervalTable key={interval.key} interval={interval} onTaskHoursChange={onTaskHoursChange} onTaskRemove={onTaskRemove} onTaskAdd={onTaskAdd} />
            ))}
        </div>
    );
};

const Summary = ({ grandTotal, onSave, onLoad, onPrint }) => {
  const currencyFormatter = new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' });
  return (
    <div className="sticky bottom-0 bg-white shadow-lg border-t-4 border-primary p-4 z-10 summary-bar">
      <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <button onClick={onSave} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition">Spara</button>
          <button onClick={onLoad} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition">Ladda</button>
          <button onClick={onPrint} className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-blue-500 transition">Skriv ut / Spara PDF</button>
        </div>
        <div className="text-right">
          <span className="text-lg font-medium text-gray-700">Total årskostnad (exkl. moms):</span>
          <p className="text-3xl font-bold text-primary">{currencyFormatter.format(grandTotal)}</p>
        </div>
      </div>
    </div>
  );
};

const PrintableQuote = ({ customerInfo, calculationResult, multipliers, travelTime, travelHourlyRate }) => {
    const currencyFormatter = new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' });
    const today = new Date().toLocaleDateString('sv-SE');
    const { larmventilerVat, larmventilerTorr, dieselpumpar, flodesvakter, sprinklercentraler, kondenskar } = multipliers;
    const showCalculationBasis = larmventilerVat > 0 || larmventilerTorr > 0 || dieselpumpar > 0 || flodesvakter > 0 || sprinklercentraler > 0 || (larmventilerTorr > 0 && kondenskar > 0);


    return (
        <div className="hidden print:block p-8 font-sans">
            <header className="flex justify-between items-start mb-12 border-b-2 border-black pb-4">
                <div className="flex items-center">
                    <img src="./icon.svg" alt="Logotyp" className="h-9 w-auto mr-6" />
                    <div>
                        <h1 className="text-3xl font-bold text-black">Offert Serviceavtal</h1>
                        <p className="text-black">Sprinkleranläggning</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-semibold">Datum: {today}</p>
                    <p className="text-sm text-gray-500">Offertnummer: {customerInfo.offertnummer || 'Ej specificerat'}</p> 
                </div>
            </header>

            <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Kundinformation</h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-gray-700">
                    <p><span className="font-semibold">Kund:</span> {customerInfo.name || 'Ej specificerat'}</p>
                    <p><span className="font-semibold">Anläggning:</span> {customerInfo.facility || 'Ej specificerat'}</p>
                    <p><span className="font-semibold">Adress:</span> {customerInfo.address || 'Ej specificerat'}</p>
                    <p><span className="font-semibold">Kontaktperson:</span> {customerInfo.contact || 'Ej specificerat'}</p>
                </div>
            </section>
            
            {showCalculationBasis && (
                <section className="mb-12">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Beräkningsunderlag (Antal)</h2>
                    <div className="text-gray-700 space-y-1">
                        {larmventilerVat > 0 && <p><span className="font-semibold">Larmventiler (våt):</span> {larmventilerVat} st</p>}
                        {larmventilerTorr > 0 && <p><span className="font-semibold">Larmventiler (torr):</span> {larmventilerTorr} st</p>}
                        {dieselpumpar > 0 && <p><span className="font-semibold">Dieselpumpar:</span> {dieselpumpar} st</p>}
                        {flodesvakter > 0 && <p><span className="font-semibold">Flödesvakter:</span> {flodesvakter} st</p>}
                        {sprinklercentraler > 0 && <p><span className="font-semibold">Sprinklercentraler:</span> {sprinklercentraler} st</p>}
                        {larmventilerTorr > 0 && kondenskar > 0 && <p><span className="font-semibold">Kondenskärl:</span> {kondenskar} st</p>}
                    </div>
                </section>
            )}

            <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Summering av serviceintervaller</h2>
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Serviceintervall</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Tillfällen/år</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Kostnad/tillfälle</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total årskostnad</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {calculationResult.intervals.map(interval => (
                            <tr key={interval.key}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">{interval.name}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-600">{interval.occasions}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-600">{currencyFormatter.format(interval.costPerOccasion)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-600 font-semibold">{currencyFormatter.format(interval.totalCostPerYear)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            
            <section className="flex flex-col items-end mt-8">
                <div className="text-sm text-gray-600 mb-2">
                    Beräknat med restid: {travelTime}h à {currencyFormatter.format(travelHourlyRate)} per tillfälle.
                </div>
                 <div className="w-full max-w-sm p-6 bg-gray-100 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-gray-800">Total årskostnad (exkl. moms):</span>
                        <p className="text-2xl font-bold text-primary">{currencyFormatter.format(calculationResult.grandTotal)}</p>
                    </div>
                </div>
            </section>

            <footer className="mt-24 pt-4 border-t text-center text-xs text-gray-500">
                <p>Priser är angivna exklusive moms. Offerten är giltig i 30 dagar.</p>
                <p className="font-semibold mt-2">Sprinklerteamet Norr AB | Tegelbruksvägen 18b, 907 42 Umeå | Organisationsnummer: 559309-1704 | 090-71 72 60</p>
            </footer>
        </div>
    );
};


// --- APP ---
const createInitialTasks = () => {
    const tasks = {};
    for (const key in INTERVAL_DEFINITIONS) {
        const intervalKey = key;
        tasks[intervalKey] = INTERVAL_DEFINITIONS[intervalKey].taskIds.map(taskId => {
            const task = ALL_TASKS.find(t => t.id === taskId);
            if (!task) {
                console.warn(`Task with id ${taskId} not found for interval ${intervalKey}`);
                return null;
            }
            return { ...task, currentHours: task.baseHours };
        }).filter(Boolean);
    }
    return tasks;
};

const INITIAL_STATE = {
    customerInfo: { name: '', facility: '', address: '', contact: '', offertnummer: '' },
    selectedIntervals: [],
    multipliers: { larmventilerVat: 1, larmventilerTorr: 0, dieselpumpar: 0, flodesvakter: 0, sprinklercentraler: 0, kondenskar: 1 },
    hourlyRate: 700,
    travelTime: 0,
    travelHourlyRate: 700,
    tasksByInterval: createInitialTasks(),
};

const App = () => {
    const [state, setState] = useState(INITIAL_STATE);
    
    const handleStateChange = useCallback((key, value) => { setState(prevState => ({ ...prevState, [key]: value })); }, []);
    const handleCustomerInfoChange = useCallback((field, value) => { setState(prevState => ({ ...prevState, customerInfo: { ...prevState.customerInfo, [field]: value } })); }, []);
    const handleMultiplierChange = useCallback((field, value) => { setState(prevState => ({ ...prevState, multipliers: { ...prevState.multipliers, [field]: value } })); }, []);
    const handleIntervalToggle = useCallback((intervalKey) => {
        setState(prevState => {
            const selectedIntervals = prevState.selectedIntervals.includes(intervalKey)
                ? prevState.selectedIntervals.filter(i => i !== intervalKey)
                : [...prevState.selectedIntervals, intervalKey];
            return { ...prevState, selectedIntervals };
        });
    }, []);
    const handleTaskHoursChange = useCallback((intervalKey, taskId, newHours) => {
        setState(prevState => ({ ...prevState, tasksByInterval: { ...prevState.tasksByInterval, [intervalKey]: prevState.tasksByInterval[intervalKey].map(task => task.id === taskId ? { ...task, currentHours: newHours } : task) } }));
    }, []);
    const handleTaskRemove = useCallback((intervalKey, taskId) => {
        setState(prevState => ({ ...prevState, tasksByInterval: { ...prevState.tasksByInterval, [intervalKey]: prevState.tasksByInterval[intervalKey].filter(task => task.id !== taskId) } }));
    }, []);
    const handleTaskAdd = useCallback((intervalKey, task) => {
        const newTask = { ...task, currentHours: task.baseHours };
        setState(prevState => ({ ...prevState, tasksByInterval: { ...prevState.tasksByInterval, [intervalKey]: [...prevState.tasksByInterval[intervalKey], newTask] } }));
    }, []);

    const calculationResult = useMemo(() => {
        const intervalOrder = ['vecko', 'manad', 'kvartal', 'halvar', 'helar'];
        const calculatedIntervals = state.selectedIntervals
            .sort((a, b) => intervalOrder.indexOf(a) - intervalOrder.indexOf(b))
            .map(key => {
            const definition = INTERVAL_DEFINITIONS[key];
            let totalHours = 0;
            
            // Filter tasks based on global logic (e.g. diesel 0 -> remove diesel tasks)
            let filteredTasks = state.tasksByInterval[key].filter(task => {
                // Logic 1: Diesel check
                if (state.multipliers.dieselpumpar === 0 && DIESEL_TASKS.includes(task.id)) {
                    return false;
                }
                // Logic 2: Kondenskärl check (Only show in if Larmventiler Torr > 0)
                if (task.id === 'kondenskar' && state.multipliers.larmventilerTorr === 0) {
                    return false;
                }
                return true;
            });

            const calculatedTasks = filteredTasks.map(task => {
                let multiplier = 1;
                if (task.id === 'flodesvakt_pressostat') {
                    multiplier = state.multipliers.larmventilerVat + state.multipliers.larmventilerTorr + state.multipliers.flodesvakter;
                } else {
                    const multiplierKey = Object.keys(MULTIPLIER_RULES).find(mKey => MULTIPLIER_RULES[mKey].includes(task.id));
                    if (multiplierKey) {
                        multiplier = state.multipliers[multiplierKey];
                    }
                }
                if (multiplier < 1) multiplier = 1;
                
                const taskTotalHours = task.currentHours * multiplier;
                totalHours += taskTotalHours;
                const cost = taskTotalHours * state.hourlyRate;
                return { ...task, multiplier, totalHours: taskTotalHours, cost };
            });

            // Travel Cost Calculation: Time * Hourly Rate
            const travelCostPerOccasion = state.travelTime * state.travelHourlyRate;
            
            const costPerOccasion = (totalHours * state.hourlyRate) + travelCostPerOccasion;
            const totalCostPerYear = costPerOccasion * definition.occasions;

            return { key, name: definition.name, occasions: definition.occasions, tasks: calculatedTasks, totalHours, costPerOccasion, totalCostPerYear, };
        });
        const grandTotal = calculatedIntervals.reduce((sum, interval) => sum + interval.totalCostPerYear, 0);
        return { intervals: calculatedIntervals, grandTotal };
    }, [state]);

    const handleSave = async () => {
        const stateToSave = JSON.stringify(state, null, 2);
        const { offertnummer, facility } = state.customerInfo;
        const date = new Date().toISOString().slice(0, 10);
        const fileName = `${offertnummer || 'offert'}-${facility || 'anlaggning'}-${date}.json`;

        if (window.showSaveFilePicker) {
            const options = {
                suggestedName: fileName,
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] },
                }],
            };
            try {
                const fileHandle = await window.showSaveFilePicker(options);
                const writable = await fileHandle.createWritable();
                await writable.write(stateToSave);
                await writable.close();
                alert('Kalkylen har sparats!');
            } catch (err) {
                if (err.name === 'AbortError') {
                    console.log('Save operation cancelled by user.');
                } else {
                    console.error('Failed to save state with File System Access API:', err);
                    alert('Kunde inte spara kalkylen.');
                }
            }
        } else {
            // Fallback for older browsers
            try {
                const blob = new Blob([stateToSave], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                alert('Kalkylen har laddats ner som en fil!');
            } catch (error) {
                console.error('Failed to save state to file (fallback):', error);
                alert('Kunde inte spara kalkylen som en fil.');
            }
        }
    };

    const handleLoad = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = readerEvent => {
                try {
                    const content = readerEvent.target.result;
                    const loadedState = JSON.parse(content);
                    if (loadedState && loadedState.customerInfo && loadedState.tasksByInterval) {
                       // Handle migration of old travel fields if loading old file
                       if (loadedState.distance !== undefined && loadedState.travelTime === undefined) {
                           loadedState.travelTime = 0;
                           loadedState.travelHourlyRate = loadedState.hourlyRate || 700;
                       }
                       // Ensure new multiplier keys exist
                       if (!loadedState.multipliers.kondenskar) {
                           loadedState.multipliers.kondenskar = 0;
                       }
                       setState(loadedState);
                       alert('Kalkylen har laddats!');
                    } else {
                       alert('Ogiltig fil. Välj en giltig kalkylfil.');
                    }
                } catch (error) {
                    console.error('Failed to load or parse file:', error);
                    alert('Kunde inte ladda kalkylen. Filen kan vara korrupt.');
                }
            };
            reader.onerror = error => {
                console.error('Error reading file:', error);
                alert('Ett fel uppstod vid läsning av filen.');
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const handlePrint = () => { window.print(); };

    return (
        <>
            <PrintableQuote 
                customerInfo={state.customerInfo} 
                calculationResult={calculationResult} 
                multipliers={state.multipliers} 
                travelTime={state.travelTime}
                travelHourlyRate={state.travelHourlyRate}
            />
            <div className="screen-only">
                <div className="min-h-screen bg-gray-100 text-gray-800">
                    <header className="bg-primary text-white shadow-md">
                        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                            <h1 className="text-3xl font-bold leading-tight">Sprinkler Service Kalkylator</h1>
                        </div>
                    </header>
                    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                        <div className="px-4 py-6 sm:px-0 space-y-8">
                            <ConfigPanel state={state} onStateChange={handleStateChange} onCustomerInfoChange={handleCustomerInfoChange} onMultiplierChange={handleMultiplierChange} onIntervalToggle={handleIntervalToggle} />
                            <QuoteDetails calculationResult={calculationResult} onTaskHoursChange={handleTaskHoursChange} onTaskRemove={handleTaskRemove} onTaskAdd={handleTaskAdd} />
                        </div>
                    </main>
                </div>
                <Summary grandTotal={calculationResult.grandTotal} onSave={handleSave} onLoad={handleLoad} onPrint={handlePrint} />
            </div>
        </>
    );
};

// --- RENDER ---
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element to mount to");
const root = ReactDOM.createRoot(rootElement);
root.render(<React.StrictMode><App /></React.StrictMode>);

// --- SERVICE WORKER ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('ServiceWorker registration successful with scope: ', registration.scope))
      .catch(error => console.log('ServiceWorker registration failed: ', error));
  });
}
