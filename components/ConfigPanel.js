import React from 'react';
import { INTERVAL_DEFINITIONS } from '../data/serviceData.js';

const intervalKeys = Object.keys(INTERVAL_DEFINITIONS);

const ConfigPanel = ({ state, onStateChange, onCustomerInfoChange, onMultiplierChange, onIntervalToggle }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-8">
      <CustomerInfoSection customerInfo={state.customerInfo} onChange={onCustomerInfoChange} />
      <IntervalSelector selectedIntervals={state.selectedIntervals} onToggle={onIntervalToggle} />
      <MultiplierInputs multipliers={state.multipliers} onChange={onMultiplierChange} />
      <RateInputs
        hourlyRate={state.hourlyRate}
        travelCost={state.travelCost}
        margin={state.margin}
        onStateChange={onStateChange}
      />
    </div>
  );
};

const CustomerInfoSection = ({ customerInfo, onChange }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Kundinformation</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField label="Kundnamn" value={customerInfo.name} onChange={e => onChange('name', e.target.value)} />
      <InputField label="Anläggning" value={customerInfo.facility} onChange={e => onChange('facility', e.target.value)} />
      <InputField label="Adress" value={customerInfo.address} onChange={e => onChange('address', e.target.value)} />
      <InputField label="Kontaktperson" value={customerInfo.contact} onChange={e => onChange('contact', e.target.value)} />
    </div>
  </div>
);

const IntervalSelector = ({ selectedIntervals, onToggle }) => (
  <div className="space-y-3">
    <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Serviceintervaller</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {intervalKeys.map(key => (
        <div key={key} className="flex items-center">
          <input
            type="checkbox"
            id={key}
            checked={selectedIntervals.includes(key)}
            onChange={() => onToggle(key)}
            className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
          />
          <label htmlFor={key} className="ml-2 block text-sm font-medium text-gray-700">
            {INTERVAL_DEFINITIONS[key].name}
          </label>
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
    };
    return (
        <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Antal / Multiplikatorer</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.keys(multipliers).map(key => {
                    return (
                        <NumberInputField
                            key={key}
                            label={labels[key]}
                            value={multipliers[key]}
                            onChange={e => onChange(key, parseInt(e.target.value, 10) || 0)}
                        />
                    )
                })}
            </div>
        </div>
    );
};

const RateInputs = ({ hourlyRate, travelCost, margin, onStateChange }) => (
    <div className="space-y-3">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Prissättning</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NumberInputField
                label="Timkostnad (kr)"
                value={hourlyRate}
                onChange={e => onStateChange('hourlyRate', parseInt(e.target.value, 10) || 0)}
            />
            <NumberInputField
                label="Bilkostnad/Resa (kr)"
                value={travelCost}
                onChange={e => onStateChange('travelCost', parseInt(e.target.value, 10) || 0)}
            />
            <NumberInputField
                label="Marginal (%)"
                value={margin}
                onChange={e => onStateChange('margin', parseInt(e.target.value, 10) || 0)}
            />
        </div>
    </div>
);


const InputField = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
    />
  </div>
);

const NumberInputField = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type="number"
      value={value}
      onChange={onChange}
      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
    />
  </div>
);

export default ConfigPanel;
