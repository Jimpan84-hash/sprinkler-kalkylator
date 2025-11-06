import React from 'react';

const Summary = ({ grandTotal, onSave, onLoad, onPrint }) => {
  const currencyFormatter = new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' });

  return (
    <div className="sticky bottom-0 bg-white shadow-lg border-t-4 border-primary p-4 z-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <button onClick={onSave} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition">
            Spara
          </button>
          <button onClick={onLoad} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition">
            Ladda
          </button>
          <button onClick={onPrint} className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-blue-500 transition">
            Skriv ut / Spara PDF
          </button>
        </div>
        <div className="text-right">
          <span className="text-lg font-medium text-gray-700">Total årskostnad (exkl. moms):</span>
          <p className="text-3xl font-bold text-primary">{currencyFormatter.format(grandTotal)}</p>
        </div>
      </div>
    </div>
  );
};

export default Summary;