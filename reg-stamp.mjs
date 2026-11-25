// Regulation stamp helper (Nov 24): adds {reg: "<id>"} to any out/ JSON object without altering existing fields.
import {activeReg} from './formats.mjs';
export const stampReg = (doc, id = activeReg().id) =>
  doc && typeof doc === 'object' && !Array.isArray(doc) ? {...doc, reg: id} : doc;
