import AdmZip from 'adm-zip';
const zip = new AdmZip('public/ebisu-hp05-v2-source.zip');
zip.extractAllTo('dist/', true);
