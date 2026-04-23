const fs = require('fs');

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

const availableWebpFiles = [
  'aozora.jpg.webp',
  'aozorajosei.jpg.webp',
  'asiitai.jpg.webp',
  'asikubi.jpg.webp',
  'biyou josei.jpg.webp',
  'biyousin.jpg.webp',
  'cup-01.jpg.webp',
  'daitougaikan.jpg.webp',
  'ebisulogo-new.webp',
  'fuminnshou .jpg.webp',
  'gojuukata.jpg.webp',
  'haiboruto.jpg.webp',
  'haiboruto③.jpg.webp',
  'haikigaikan.webp',
  'harikyusenaka.jpg.webp',
  'hijinoitami.jpg.webp',
  'hirase-new.jpg.webp',
  'hokao.webp',
  'kawahara.jpg.webp',
  'kazokudanran.jpg.webp',
  'kazokudanran②.jpg.webp',
  'kinntore.jpg.webp',
  'kosinoitami josei.jpg.webp',
  'kotubannkyousei .jpg.webp',
  'koureisha nayami.jpg.webp',
  'koutujiko josei.jpg.webp',
  'koutujiko.jpg.webp',
  'kubinoitami.jpg.webp',
  'kyujin.jpg.webp',
  'massa-ji josei.jpg.webp',
  'massajiotoko.jpg.webp',
  'medicell.jpg.webp',
  'nagaoka.webp',
  'ninpu.jpg.webp',
  'o2room.jpg.webp',
  'okyaku.jpg.webp',
  'roujin.jpg.webp',
  'utiumi.jpg.webp',
  'yamagutihayato.webp',
  'yaminegaikan.jpg.webp',
  'zutuu.jpg.webp',
  'koureisha kazoku.jpg.webp'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let updated = false;

    // We look for https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/XXXX.webp?raw=true
    content = content.replace(/https:\/\/github\.com\/ebisuhoumon-collab\/ebisuhoumon-collab-ebisu-website\/blob\/main\/([^?]+)\.webp\?raw=true/g, (match, baseName) => {
      // baseName is URL encoded, so decode it first
      const decodedBase = decodeURIComponent(baseName);
      
      // Find the matching webp file in availableWebpFiles
      // It could be exactly decodedBase + '.webp'
      // Or decodedBase + '.jpg.webp'
      // Or decodedBase + '.png.webp'
      
      let matchedFile = availableWebpFiles.find(f => f === decodedBase + '.webp');
      if (!matchedFile) {
        matchedFile = availableWebpFiles.find(f => f === decodedBase + '.jpg.webp');
      }
      if (!matchedFile) {
        matchedFile = availableWebpFiles.find(f => f === decodedBase + '.png.webp');
      }
      
      // Special cases
      if (!matchedFile && decodedBase === 'haiboruto②') {
         matchedFile = 'haiboruto.jpg.webp'; // fallback or check if there's a specific one
      }

      if (matchedFile) {
        updated = true;
        // Re-encode the matched file name for the URL
        const encodedFile = encodeURIComponent(matchedFile).replace(/%20/g, '%20');
        return `https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/${encodedFile}?raw=true`;
      }
      
      // If no match found, return original
      return match;
    });

    if (updated) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});
