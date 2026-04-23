const fs = require('fs');
const path = require('path');

const files = [
  './components/OxygenRoomPage.tsx',
  './components/PelvicCorrectionPage.tsx',
  './components/Services.tsx',
  './components/Recruit.tsx',
  './components/HomeVisitPage.tsx',
  './components/Header.tsx',
  './components/Home.tsx',
  './components/InfertilityPage.tsx',
  './components/Footer.tsx',
  './components/HomeVisit.tsx',
  './components/TrafficAccidentPage.tsx',
  './components/StaffList.tsx',
  './components/Hero.tsx',
  './components/Access.tsx',
  './src/components/HomeVisitPage.tsx',
  './constants.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace extensions for github URLs
    let newContent = content.replace(/(https:\/\/github\.com\/ebisuhoumon-collab\/ebisuhoumon-collab-ebisu-website\/blob\/main\/[^?]+?)(?:\.jpg\.jpg|\.jpg\.png|\.jpg|\.png|\.jpg\.webp)\?raw=true/g, '$1.webp?raw=true');
    
    if (content !== newContent) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});
