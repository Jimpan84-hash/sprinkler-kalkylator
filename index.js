// SINGLE BUNDLED index.js - PLAIN JAVASCRIPT + JSX

// Imports that will be handled by importmap
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// --- BUNDLED FROM data/serviceData.js (TypeScript removed) ---
const ALL_TASKS = [
  { id: 'manometer', name: 'Avläsning samtliga manometrar för vatten och luft', baseHours: 0.25 },
  { id: 'ventiler_lage', name: 'Kontroll av samtliga avstängningsventiler korrekta läge', baseHours: 0.25 },
  { id: 'vattenniva', name: 'Kontroll av vattennivå', baseHours: 0.25 },
  { id: 'turbinklocka', name: 'Vattenturbinklocka', baseHours: 0.5 },
  { id: 'bransle_olja_kylvatten', name: 'Kontroll av bränsle, olje-/kylvattennivå', baseHours: 0.25 },
  { id: 'automatik_pumpstart', name: 'Automatik pumpstart (start tryck)', baseHours: 0.25 },
  { id: 'manuell_pumpstart', name: 'Manuell pumpstart', baseHours: 0.25 },
  { id: 'uppvarmning', name: 'Uppvärmning', baseHours: 0.25 },
  { id: 'batterier', name: 'Kontroll av batterier (elektrolytnivå, densitet mm)', baseHours: 0.75 },
  { id: 'riskklass', name: 'Kontroll av riskklass', baseHours: 0.5 },
  { id: 'sprinkler_kontrollventiler', name: 'Kontroll av sprinkler, kontrollventiler', baseHours: 2 },
  { id: 'rornat_upphang', name: 'Kontroll av rörnät och upphängningar', baseHours: 2 },
  { id: 'vattenkalla_larmventil', name: 'Kontroll av vattenkälla via larmventil', baseHours: 0.25 },
  { id: 'kraftforsorjning', name: 'Kraftförsörjning', baseHours: 0.25 },
  { id: 'avstangningsventiler', name: 'Avstängningsventiler', baseHours: 0.5 },
  { id: 'flodesvakt_pressostat', name: 'Funktion Flödesvakt, larmpressostat', baseHours: 0.5 },
  { id: 'reservdelar', name: 'Reservdelar', baseHours: 0.25 },
  { id: 'larmoverforing', name: 'Larmöverföring', baseHours: 0.5 },
  { id: 'kapacitetsprov', name: 'Kapacitetsprov', baseHours: 4 },
  { id: 'misslyckat_start', name: 'Misslyckat startförsök', baseHours: 0.5 },
  { id: 'pafyllningsventiler', name: 'Påfyllningsventiler för bassänger', baseHours: 0.25 },
  { id: 'torrorsventil_flodesprov', name: 'Torrörsventil. Partiellt flödesprov', baseHours: 0.5 },
  { id: 'silar', name: 'Silar', baseHours: 0.5 },
];

const INTERVAL_DEFINITIONS = {
  vecko: { name: 'Veckoservice', occasions: 40, taskIds: ['manometer', 'ventiler_lage', 'vattenniva', 'bransle_olja_kylvatten'], },
  manad: { name: 'Månadsservice', occasions: 8, taskIds: ['manometer', 'ventiler_lage', 'vattenniva', 'bransle_olja_kylvatten', 'automatik_pumpstart', 'manuell_pumpstart', 'uppvarmning'], },
  kvartal: { name: 'Kvartalsservice', occasions: 2, taskIds: ['manometer', 'ventiler_lage', 'vattenniva', 'turbinklocka', 'bransle_olja_kylvatten', 'automatik_pumpstart', 'manuell_pumpstart', 'uppvarmning', 'vattenkalla_larmventil', 'flodesvakt_pressostat', 'torrorsventil_flodesprov'], },
  halvar: { name: 'Halvårsservice', occasions: 1, taskIds: ['manometer', 'ventiler_lage', 'vattenniva', 'turbinklocka', 'bransle_olja_kylvatten', 'automatik_pumpstart', 'manuell_pumpstart', 'uppvarmning', 'batterier', 'vattenkalla_larmventil', 'kraftforsorjning', 'avstangningsventiler', 'flodesvakt_pressostat', 'larmoverforing', 'misslyckat_start', 'pafyllningsventiler', 'torrorsventil_flodesprov'], },
  helar: { name: 'Helårsservice', occasions: 1, taskIds: ALL_TASKS.map(t => t.id), },
};

const MULTIPLIER_RULES = {
  larmventilerVat: ['vattenkalla_larmventil', 'flodesvakt_pressostat'],
  larmventilerTorr: ['torrorsventil_flodesprov', 'flodesvakt_pressostat'],
  dieselpumpar: ['bransle_olja_kylvatten', 'automatik_pumpstart', 'manuell_pumpstart', 'misslyckat_start'],
  flodesvakter: ['flodesvakt_pressostat'],
  sprinklercentraler: ['manometer', 'ventiler_lage', 'avstangningsventiler', 'larmoverforing', 'kapacitetsprov'],
};


// --- BUNDLED FROM services/pdfService.js (TypeScript removed) ---
const generatePdf = (calculation, customerInfo, hourlyRate, travelCost, margin) => {
  const doc = new jsPDF();
  doc.setFontSize(22);
  doc.setTextColor(40);
  doc.text('Offert - Service av sprinkleranläggning', 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text('Kundinformation', 14, 40);
  doc.autoTable({ startY: 45, head: [['Kund', 'Anläggning', 'Adress', 'Kontakt']], body: [[customerInfo.name, customerInfo.facility, customerInfo.address, customerInfo.contact]], theme: 'grid', styles: { fontSize: 10 }, });
  let currentY = doc.lastAutoTable.finalY + 10;
  const currencyFormatter = new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' });
  calculation.intervals.forEach(interval => {
    doc.setFontSize(14);
    doc.text(interval.name, 14, currentY);
    currentY += 5;
    doc.autoTable({ startY: currentY, head: [['Moment', 'Tid (h)', 'Multiplikator', 'Summa (h)', 'Kostnad']], body: interval.tasks.map(task => [ task.name, task.currentHours.toFixed(2), task.multiplier, task.totalHours.toFixed(2), currencyFormatter.format(task.cost) ]), theme: 'striped', styles: { fontSize: 9 }, headStyles: { fillColor: [0, 82, 155] } });
    currentY = doc.lastAutoTable.finalY;
    doc.autoTable({ startY: currentY + 2, body: [ ['Antal tillfällen/år:', interval.occasions], ['Total tid per tillfälle:', `${interval.totalHours.toFixed(2)} h`], ['Kostnad per tillfälle:', currencyFormatter.format(interval.costPerOccasion)], ['Total årskostnad:', currencyFormatter.format(interval.totalCostPerYear)], ], theme: 'plain', styles: { fontSize: 10, cellPadding: 2, halign: 'right' }, });
    currentY = doc.lastAutoTable.finalY + 15;
  });
  doc.setFontSize(16);
  doc.text('Sammanfattning', 14, currentY);
  const summaryBody = calculation.intervals.map(interval => [ `${interval.name} (${interval.occasions} x ${currencyFormatter.format(interval.costPerOccasion)})`, currencyFormatter.format(interval.totalCostPerYear) ]);
  summaryBody.push(['Total årskostnad (exkl. moms)', currencyFormatter.format(calculation.grandTotal)]);
  doc.autoTable({ startY: currentY + 7, head: [['Serviceintervall', 'Årskostnad']], body: summaryBody, theme: 'grid', styles: { fontSize: 11 }, headStyles: { fillColor: [0, 82, 155] }, didDrawCell: (data) => { if (data.row.index === summaryBody.length - 1) { doc.setFont(undefined, 'bold'); } } });
  currentY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(`Pris baserat på timkostnad ${currencyFormatter.format(hourlyRate)}, resekostnad ${currencyFormatter.format(travelCost)}/tillfälle och marginal på ${margin}%.`, 14, currentY);
  doc.save(`offert-${customerInfo.name || 'kund'}-${new Date().toISOString().slice(0, 10)}.pdf`);
};

// --- BUNDLED FROM components/Summary.jsx ---
const Summary = ({ grandTotal, onSave, onLoad, onPrint }) => {
  const currencyFormatter = new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' });
  return (
    <div className="sticky bottom-0 bg-white shadow-lg border-t-4 border-primary p-4 z-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <button onClick={onSave} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition">Spara</button>
          <button onClick={onLoad} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition">Ladda</button>
          <button onClick={onPrint} className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-blue-500 transition">Exportera PDF</button>
        </div>
        <div className="text-right">
          <span className="text-lg font-medium text-gray-700">Total årskostnad (exkl. moms):</span>
          <p className="text-3xl font-bold text-primary">{currencyFormatter.format(grandTotal)}</p>
        </div>
      </div>
    </div>
  );
};

// --- BUNDLED FROM components/QuoteDetails.jsx ---
const QuoteDetails = ({ calculationResult, onTaskHoursChange, onTaskRemove, onTaskAdd }) => {
    if (calculationResult.intervals.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <h2 className="text-xl font-semibold text-gray-700">Välj ett serviceintervall för att starta kalkylen.</h2>
                <p className="text-gray-500 mt-2">Din offert kommer att visas här när du har gjort dina val.</p>
            </div>
        );
    }
    return ( <div className="space-y-8"> {calculationResult.intervals.map(interval => ( <IntervalTable key={interval.key} interval={interval} onTaskHoursChange={onTaskHoursChange} onTaskRemove={onTaskRemove} onTaskAdd={onTaskAdd} /> ))} </div> );
};

const IntervalTable = ({ interval, onTaskHoursChange, onTaskRemove, onTaskAdd }) => {
    const [showAddTask, setShowAddTask] = useState(false);
    const [selectedTask, setSelectedTask] = useState('');
    const availableTasks = ALL_TASKS.filter( (task) => !interval.tasks.some((it) => it.id === task.id) );
    const handleAddTask = () => { const taskToAdd = ALL_TASKS.find(t => t.id === selectedTask); if (taskToAdd) { onTaskAdd(interval.key, taskToAdd); setSelectedTask(''); setShowAddTask(false); } };
    const currencyFormatter = new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' });
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-primary mb-4">{interval.name}</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Moment</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tid (h)</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Multiplikator</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summa (h)</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kostnad</th><th className="px-1 py-3"></th></tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">{interval.tasks.map(task => (<tr key={task.id}><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{task.name}</td><td className="px-6 py-4 whitespace-nowrap"><input type="number" step="0.05" value={task.currentHours} onChange={(e) => onTaskHoursChange(interval.key, task.id, parseFloat(e.target.value) || 0)} className="w-20 p-1 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"/></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.multiplier}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.totalHours.toFixed(2)}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{currencyFormatter.format(task.cost)}</td><td className="px-1 py-4"><button onClick={() => onTaskRemove(interval.key, task.id)} className="text-danger hover:text-red-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button></td></tr>))}</tbody>
                </table>
            </div>
            <div className="mt-4">{showAddTask ? (<div className="flex items-center space-x-2"><select value={selectedTask} onChange={(e) => setSelectedTask(e.target.value)} className="p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"><option value="">Välj moment...</option>{availableTasks.map(task => <option key={task.id} value={task.id}>{task.name}</option>)}</select><button onClick={handleAddTask} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-800">Lägg till</button><button onClick={() => setShowAddTask(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Avbryt</button></div>) : (<button onClick={() => setShowAddTask(true)} className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-blue-500">+ Lägg till moment</button>)}</div>
            <div className="mt-6 bg-gray-50 p-4 rounded-md flex justify-between items-center flex-wrap gap-4"><div><p className="text-sm text-gray-600">{interval.occasions} tillfällen/år</p><p className="text-sm text-gray-600">Total tid per tillfälle: {interval.totalHours.toFixed(2)}h</p></div><div className="text-right"><p className="text-lg font-semibold text-gray-800">Kostnad per tillfälle: {currencyFormatter.format(interval.costPerOccasion)}</p><p className="text-xl font-bold text-primary">Total årskostnad: {currencyFormatter.format(interval.totalCostPerYear)}</p></div></div>
        </div>
    );
};

// --- BUNDLED FROM components/ConfigPanel.jsx ---
const intervalKeys = Object.keys(INTERVAL_DEFINITIONS);
const ConfigPanel = ({ state, onStateChange, onCustomerInfoChange, onMultiplierChange, onIntervalToggle }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-8">
      <CustomerInfoSection customerInfo={state.customerInfo} onChange={onCustomerInfoChange} />
      <IntervalSelector selectedIntervals={state.selectedIntervals} onToggle={onIntervalToggle} />
      <MultiplierInputs multipliers={state.multipliers} onChange={onMultiplierChange} />
      <RateInputs hourlyRate={state.hourlyRate} travelCost={state.travelCost} margin={state.margin} onStateChange={onStateChange} />
    </div>
  );
};
const CustomerInfoSection = ({ customerInfo, onChange }) => (
  <div className="space-y-4"><h2 className="text-xl font-bold text-gray-800 border-b pb-2">Kundinformation</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><InputField label="Kundnamn" value={customerInfo.name} onChange={e => onChange('name', e.target.value)} /><InputField label="Anläggning" value={customerInfo.facility} onChange={e => onChange('facility', e.target.value)} /><InputField label="Adress" value={customerInfo.address} onChange={e => onChange('address', e.target.value)} /><InputField label="Kontaktperson" value={customerInfo.contact} onChange={e => onChange('contact', e.target.value)} /></div></div>
);
const IntervalSelector = ({ selectedIntervals, onToggle }) => (
  <div className="space-y-3"><h2 className="text-xl font-bold text-gray-800 border-b pb-2">Serviceintervaller</h2><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">{intervalKeys.map(key => (<div key={key} className="flex items-center"><input type="checkbox" id={key} checked={selectedIntervals.includes(key)} onChange={() => onToggle(key)} className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary" /><label htmlFor={key} className="ml-2 block text-sm font-medium text-gray-700">{INTERVAL_DEFINITIONS[key].name}</label></div>))}</div></div>
);
const MultiplierInputs = ({ multipliers, onChange }) => {
    const labels = { larmventilerVat: "Larmventiler våt", larmventilerTorr: "Larmventiler torr", dieselpumpar: "Dieselpumpar", flodesvakter: "Flödesvakter", sprinklercentraler: "Sprinklercentraler", };
    return ( <div className="space-y-3"><h2 className="text-xl font-bold text-gray-800 border-b pb-2">Antal / Multiplikatorer</h2><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">{Object.keys(multipliers).map(key => { return ( <NumberInputField key={key} label={labels[key]} value={multipliers[key]} onChange={e => onChange(key, parseInt(e.target.value, 10) || 0)} /> ) })}</div></div> );
};
const RateInputs = ({ hourlyRate, travelCost, margin, onStateChange }) => (
    <div className="space-y-3"><h2 className="text-xl font-bold text-gray-800 border-b pb-2">Prissättning</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><NumberInputField label="Timkostnad (kr)" value={hourlyRate} onChange={e => onStateChange('hourlyRate', parseInt(e.target.value, 10) || 0)} /><NumberInputField label="Bilkostnad/Resa (kr)" value={travelCost} onChange={e => onStateChange('travelCost', parseInt(e.target.value, 10) || 0)} /><NumberInputField label="Marginal (%)" value={margin} onChange={e => onStateChange('margin', parseInt(e.target.value, 10) || 0)} /></div></div>
);
const InputField = ({ label, value, onChange }) => (
  <div><label className="block text-sm font-medium text-gray-700">{label}</label><input type="text" value={value} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/></div>
);
const NumberInputField = ({ label, value, onChange }) => (
  <div><label className="block text-sm font-medium text-gray-700">{label}</label><input type="number" value={value} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/></div>
);

// --- HELP MODAL COMPONENT ---
const HelpModal = ({ onClose }) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" 
            aria-modal="true" 
            role="dialog"
            onClick={onClose}
        >
            <div 
                className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl max-w-lg w-full space-y-6"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-primary border-b pb-2">Installera som en Desktop-App</h2>
                <p className="text-gray-700">
                    Du kan köra denna kalkylator som ett vanligt program på din dator för snabb åtkomst. Appen får en egen ikon och körs i ett separat fönster.
                    <br/><strong className="font-semibold">Detta fungerar bäst i Google Chrome eller Microsoft Edge.</strong>
                </p>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Manuell Installation (Säker Metod)</h3>
                    <p className="text-gray-600 mt-1">
                        Om den automatiska "Installera"-knappen inte syns i sidhuvudet, följ dessa steg:
                    </p>
                    <ol className="list-decimal list-inside text-gray-600 mt-2 pl-2 space-y-2">
                        <li>Klicka på **meny-ikonen (⋮)** längst upp till höger i webbläsarfönstret.</li>
                        <li>Leta i menyn efter ett alternativ som heter <strong className="font-semibold">"Installera Sprinkler Service Kalkylator"</strong>.
                           <br/><span className="text-sm italic">(I vissa versioner kan det ligga under "Appar" → "Installera den här webbplatsen som en app").</span></li>
                        <li>Ett nytt fönster dyker upp. Klicka på den blå knappen <strong className="font-semibold">"Installera"</strong>.</li>
                        <li>Klart! Appen finns nu i din Start-meny (Windows) eller Launchpad (Mac). Du kan dra ikonen till ditt skrivbord eller aktivitetsfält.</li>
                    </ol>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-gray-800">Fungerar det inte?</h3>
                    <ul className="list-disc list-inside text-gray-600 mt-2 pl-2 space-y-1">
                       <li>Se till att du använder en uppdaterad version av Chrome eller Edge.</li>
                       <li>Om du kör appen lokalt via <code>npx serve</code>, se till att du öppnar <code>http://localhost:PORT</code> och inte en IP-adress som <code>127.0.0.1</code>.</li>
                    </ul>
                </div>
                <div className="text-right pt-4">
                    <button 
                        onClick={onClose} 
                        className="bg-primary text-white px-6 py-2 rounded-md hover:bg-blue-800 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        Stäng
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- BUNDLED FROM App.jsx ---
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
    multipliers: { larmventilerVat: 1, larmventilerTorr: 0, dieselpumpar: 0, flodesvakter: 0, sprinklercentraler: 0, },
    hourlyRate: 650, travelCost: 500, margin: 10, tasksByInterval: createInitialTasks(),
};
const App = () => {
    const [state, setState] = useState(INITIAL_STATE);
    const [installPromptEvent, setInstallPromptEvent] = useState(null);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setInstallPromptEvent(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleStateChange = useCallback((key, value) => { setState(prevState => ({ ...prevState, [key]: value })); }, []);
    const handleCustomerInfoChange = useCallback((field, value) => { setState(prevState => ({ ...prevState, customerInfo: { ...prevState.customerInfo, [field]: value } })); }, []);
    const handleMultiplierChange = useCallback((field, value) => { setState(prevState => ({ ...prevState, multipliers: { ...prevState.multipliers, [field]: value } })); }, []);
    const handleIntervalToggle = useCallback((intervalKey) => { setState(prevState => { const selectedIntervals = prevState.selectedIntervals.includes(intervalKey) ? prevState.selectedIntervals.filter(i => i !== intervalKey) : [...prevState.selectedIntervals, intervalKey]; return { ...prevState, selectedIntervals }; }); }, []);
    const handleTaskHoursChange = useCallback((intervalKey, taskId, newHours) => { setState(prevState => ({ ...prevState, tasksByInterval: { ...prevState.tasksByInterval, [intervalKey]: prevState.tasksByInterval[intervalKey].map(task => task.id === taskId ? { ...task, currentHours: newHours } : task ) } })); }, []);
    const handleTaskRemove = useCallback((intervalKey, taskId) => { setState(prevState => ({ ...prevState, tasksByInterval: { ...prevState.tasksByInterval, [intervalKey]: prevState.tasksByInterval[intervalKey].filter(task => task.id !== taskId) } })); }, []);
    const handleTaskAdd = useCallback((intervalKey, task) => { const newTask = { ...task, currentHours: task.baseHours }; setState(prevState => ({ ...prevState, tasksByInterval: { ...prevState.tasksByInterval, [intervalKey]: [...prevState.tasksByInterval[intervalKey], newTask] } })); }, []);
    
    const calculationResult = useMemo(() => {
        const intervalOrder = ['vecko', 'manad', 'kvartal', 'halvar', 'helar'];
        const calculatedIntervals = state.selectedIntervals
            .sort((a, b) => intervalOrder.indexOf(a) - intervalOrder.indexOf(b))
            .map(key => {
            const definition = INTERVAL_DEFINITIONS[key];
            let totalHours = 0;
            const calculatedTasks = state.tasksByInterval[key].map(task => {
                let multiplier = 1;
                if (task.id === 'flodesvakt_pressostat') {
                    multiplier = state.multipliers.larmventilerVat + state.multipliers.larmventilerTorr + state.multipliers.flodesvakter;
                } else {
                    const multiplierKey = Object.keys(MULTIPLIER_RULES).find(mKey => MULTIPLIER_RULES[mKey].includes(task.id) );
                    if (multiplierKey) { multiplier = state.multipliers[multiplierKey]; }
                }
                
                if (multiplier < 1 && multiplier !== 0) {
                  multiplier = 1;
                }
                
                const taskTotalHours = task.currentHours * multiplier;
                totalHours += taskTotalHours;
                const cost = taskTotalHours * state.hourlyRate;
                return { ...task, multiplier, totalHours: taskTotalHours, cost };
            });
            const costPerOccasionBeforeMargin = (totalHours * state.hourlyRate) + state.travelCost;
            const costPerOccasion = costPerOccasionBeforeMargin * (1 + state.margin / 100);
            const totalCostPerYear = costPerOccasion * definition.occasions;
            return { key, name: definition.name, occasions: definition.occasions, tasks: calculatedTasks, totalHours, costPerOccasion, totalCostPerYear, };
        });
        const grandTotal = calculatedIntervals.reduce((sum, interval) => sum + interval.totalCostPerYear, 0);
        return { intervals: calculatedIntervals, grandTotal };
    }, [state]);

    const handleSave = () => { try { localStorage.setItem('sprinkler-quote-app-data', JSON.stringify(state)); alert('Kalkyl sparad!'); } catch (error) { console.error('Failed to save state:', error); alert('Kunde inte spara kalkyl.'); } };
    const handleLoad = () => { try { const savedState = localStorage.getItem('sprinkler-quote-app-data'); if (savedState) { setState(JSON.parse(savedState)); alert('Kalkyl laddad!'); } else { alert('Ingen sparad kalkyl hittades.'); } } catch (error) { console.error('Failed to load state:', error); alert('Kunde inte ladda kalkyl.'); } };
    const handlePrint = () => { if(calculationResult.intervals.length > 0) { generatePdf(calculationResult, state.customerInfo, state.hourlyRate, state.travelCost, state.margin); } else { alert("Välj minst ett intervall för att exportera en PDF.") } };
    const handleInstallClick = async () => {
        if (installPromptEvent) {
            const result = await installPromptEvent.prompt();
            console.log('Install prompt result:', result.outcome);
            setInstallPromptEvent(null);
        }
    };
    
    return (
        <React.Fragment>
            {isHelpModalOpen && <HelpModal onClose={() => setIsHelpModalOpen(false)} />}
            <div className="min-h-screen bg-gray-100 text-gray-800">
                <header className="bg-primary text-white shadow-md">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Sprinkler Service Kalkylator</h1>
                        <div className="flex items-center gap-2 sm:gap-4">
                            {installPromptEvent && (
                                <button 
                                    onClick={handleInstallClick} 
                                    className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-green-600 transition flex items-center gap-2"
                                    aria-label="Installera appen"
                                    title="Installera appen på din enhet"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
                                    </svg>
                                    <span className="hidden sm:inline">Installera App</span>
                                </button>
                            )}
                            <button
                                onClick={() => setIsHelpModalOpen(true)}
                                className="bg-secondary text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-500 transition"
                                aria-label="Hjälp med installation"
                                title="Hjälp med installation"
                            >
                                <span className="hidden sm:inline">Installationsguide</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </header>
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"><div className="px-4 py-6 sm:px-0 space-y-8">
                    <ConfigPanel state={state} onStateChange={handleStateChange} onCustomerInfoChange={handleCustomerInfoChange} onMultiplierChange={handleMultiplierChange} onIntervalToggle={handleIntervalToggle} />
                    <QuoteDetails calculationResult={calculationResult} onTaskHoursChange={handleTaskHoursChange} onTaskRemove={handleTaskRemove} onTaskAdd={handleTaskAdd} />
                </div></main>
            </div>
            {calculationResult.intervals.length > 0 && <Summary grandTotal={calculationResult.grandTotal} onSave={handleSave} onLoad={handleLoad} onPrint={handlePrint} />}
        </React.Fragment>
    );
};

// --- RENDER THE APP ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// --- SERVICE WORKER REGISTRATION ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}