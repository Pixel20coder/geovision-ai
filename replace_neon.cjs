const fs = require('fs');

function replaceNeon(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('Skipping ' + filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/text-accent-cyan/g, 'text-white');
  content = content.replace(/text-accent-cyan-dark/g, 'text-gray-300');
  content = content.replace(/bg-accent-cyan\/10/g, 'bg-white/10');
  content = content.replace(/bg-accent-cyan\/5/g, 'bg-white/5');
  content = content.replace(/bg-accent-cyan\/20/g, 'bg-white/20');
  content = content.replace(/border-accent-cyan\/30/g, 'border-white/30');
  content = content.replace(/border-accent-cyan\/20/g, 'border-white/20');
  content = content.replace(/border-accent-cyan\/40/g, 'border-white/40');
  content = content.replace(/text-accent-blue/g, 'text-white');
  content = content.replace(/text-accent-purple/g, 'text-white');
  content = content.replace(/bg-accent-blue\/5/g, 'bg-white/5');
  content = content.replace(/bg-accent-blue\/10/g, 'bg-white/10');
  content = content.replace(/bg-accent-blue\/20/g, 'bg-white/20');
  content = content.replace(/border-accent-blue\/30/g, 'border-white/30');
  content = content.replace(/bg-accent-purple\/5/g, 'bg-white/5');
  content = content.replace(/rgba\(0,212,255,0\.15\)/g, 'rgba(255,255,255,0.1)');
  content = content.replace(/rgba\(0,212,255,0\.2\)/g, 'rgba(255,255,255,0.1)');
  content = content.replace(/rgba\(59,130,246,0\.3\)/g, 'rgba(255,255,255,0.1)');
  content = content.replace(/from-accent-cyan\/5/g, 'from-white/5');
  content = content.replace(/from-accent-cyan to-accent-blue/g, 'from-gray-400 to-white');
  content = content.replace(/from-accent-cyan/g, 'from-gray-400');
  content = content.replace(/to-accent-blue/g, 'to-white');
  content = content.replace(/via-accent-cyan\/30/g, 'via-white/20');
  content = content.replace(/via-accent-blue\/30/g, 'via-white/20');
  content = content.replace(/border-accent-cyan/g, 'border-white/40');
  fs.writeFileSync(filePath, content, 'utf8');
}

['src/pages/Reports.tsx', 'src/pages/Detect.tsx', 'src/pages/ChangeDetection.tsx', 'src/pages/DroneOps.tsx', 'src/pages/Landing.tsx', 'src/components/ui/AICopilot.tsx'].forEach(replaceNeon);
console.log('Neon replaced');
