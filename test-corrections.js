// Test script to verify Portuguese text correction
import { smartFixPortugueseText } from './frontend/src/utils/textUtils.js';

// Test cases based on the issues you reported
const testCases = [
  "Teste de Detecão Automçtica",
  "instituião, educaão, organizaão, legislaão", 
  "apresentaão, implementaão, configuraão",
  "perçodo de manutenão, prçxima versão",
  "Configuraão Completa",
  "A configuraão do sistema foi concluçda com êxito!",
  "acentuaão, informaão, criaão, verificaão, manutenão"
];

console.log("Testing Portuguese text corrections:\n");

testCases.forEach((testCase, index) => {
  const corrected = smartFixPortugueseText(testCase);
  console.log(`Test ${index + 1}:`);
  console.log(`Original: ${testCase}`);
  console.log(`Fixed:    ${corrected}`);
  console.log('---');
});