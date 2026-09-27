const fs = require('fs');
const path = require('path');
const lines = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8').split('\n');
const env = {};
lines.forEach(l => { const p = l.split('='); if (p[0] && p[1]) env[p[0].trim()] = p[1].trim(); });

const key = env.MICROSOFT_AZURE_API_KEY || env.AZURE_SPEECH_KEY;
const regions = [
  'eastus', 'eastus2', 'westus', 'westus2', 'westus3',
  'centralus', 'northcentralus', 'southcentralus', 'westcentralus',
  'canadacentral', 'canadaeast',
  'westeurope', 'northeurope', 'uksouth', 'ukwest', 'francecentral', 'germanywestcentral',
  'centralindia', 'southindia', 'westindia',
  'southeastasia', 'eastasia', 'japaneast', 'japanwest', 'koreacentral',
  'australiaeast', 'brazilsouth'
];

async function testAzure() {
  console.log('Testing Azure key against regions...');
  for (const region of regions) {
    try {
      const url = 'https://' + region + '.tts.speech.microsoft.com/cognitiveservices/voices/list';
      const res = await fetch(url, {
        headers: { 'Ocp-Apim-Subscription-Key': key }
      });
      if (res.status === 200) {
        const voices = await res.json();
        console.log('SUCCESS! Azure Region is: ' + region + ' (Found ' + voices.length + ' voices)');
        return region;
      }
    } catch (e) {}
  }
  console.log('No matching region found among tested regions. Key might be invalid or from another service.');
}

testAzure();
