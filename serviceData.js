export const ALL_TASKS = [
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

export const INTERVAL_DEFINITIONS = {
  vecko: {
    name: 'Veckoservice',
    occasions: 40,
    taskIds: ['manometer', 'ventiler_lage', 'vattenniva', 'bransle_olja_kylvatten'],
  },
  manad: {
    name: 'Månadsservice',
    occasions: 8,
    taskIds: ['manometer', 'ventiler_lage', 'vattenniva', 'bransle_olja_kylvatten', 'automatik_pumpstart', 'manuell_pumpstart', 'uppvarmning'],
  },
  kvartal: {
    name: 'Kvartalsservice',
    occasions: 2,
    taskIds: ['manometer', 'ventiler_lage', 'vattenniva', 'turbinklocka', 'bransle_olja_kylvatten', 'automatik_pumpstart', 'manuell_pumpstart', 'uppvarmning', 'vattenkalla_larmventil', 'flodesvakt_pressostat', 'torrorsventil_flodesprov'],
  },
  halvar: {
    name: 'Halvårsservice',
    occasions: 1,
    taskIds: ['manometer', 'ventiler_lage', 'vattenniva', 'turbinklocka', 'bransle_olja_kylvatten', 'automatik_pumpstart', 'manuell_pumpstart', 'uppvarmning', 'batterier', 'vattenkalla_larmventil', 'kraftforsorjning', 'avstangningsventiler', 'flodesvakt_pressostat', 'larmoverforing', 'misslyckat_start', 'pafyllningsventiler', 'torrorsventil_flodesprov'],
  },
  helar: {
    name: 'Helårsservice',
    occasions: 1,
    taskIds: ALL_TASKS.map(t => t.id),
  },
};

export const MULTIPLIER_RULES = {
  larmventilerVat: ['vattenkalla_larmventil', 'flodesvakt_pressostat'],
  larmventilerTorr: ['torrorsventil_flodesprov', 'flodesvakt_pressostat'],
  dieselpumpar: ['bransle_olja_kylvatten', 'automatik_pumpstart', 'manuell_pumpstart', 'misslyckat_start'],
  flodesvakter: ['flodesvakt_pressostat'],
  sprinklercentraler: ['manometer', 'ventiler_lage', 'avstangningsventiler', 'larmoverforing', 'kapacitetsprov'],
};