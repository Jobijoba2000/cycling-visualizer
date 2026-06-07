const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const earcut = require('earcut');

// Maps GPX folder names to known race IDs
const FOLDER_TO_RACE_ID = {
    'tour-de-france-2026': 'tdf',
    'giro-d-italia-2026': 'giro',
    'vuelta-a-espana-2026': 'vuelta',
    'tour-d-auvergne-rhone-alpes-2026': 'tour-d-auvergne-rhone-alpes-2026'
};

const KNOWN_RACES = {
    tdf: {
        id: "tdf",
        name: "Tour de France 2026",
        color: [1.0, 0.85, 0.0, 1.0],
        globalLat: 46.5,
        globalLon: 2.5,
        geojsonPath: path.join(__dirname, '../data/geojson/gadm41_FRA_0.geojson'),
        gpxMode: 'multi',
        gpxDir: path.join(__dirname, '../data/gpx/tour-de-france-2026'),
        gpxPrefix: 'etappe-',
        stages: [
            { num: 1,  name: 'Étape 1',  start: 'Barcelona',                  finish: 'Barcelona',                  date: '04/07/2026' },
            { num: 2,  name: 'Étape 2',  start: 'Tarragona',                  finish: 'Barcelona',                  date: '05/07/2026' },
            { num: 3,  name: 'Étape 3',  start: 'Granollers',                 finish: 'Les Angles',                 date: '06/07/2026' },
            { num: 4,  name: 'Étape 4',  start: 'Carcassonne',                finish: 'Foix',                       date: '07/07/2026' },
            { num: 5,  name: 'Étape 5',  start: 'Lannemezan',                 finish: 'Pau',                        date: '08/07/2026' },
            { num: 6,  name: 'Étape 6',  start: 'Pau',                        finish: 'Gavarnie-Cèdre',             date: '09/07/2026' },
            { num: 7,  name: 'Étape 7',  start: 'Hagetmau',                   finish: 'Bordeaux',                   date: '10/07/2026' },
            { num: 8,  name: 'Étape 8',  start: 'Périgueux',                  finish: 'Bergerac',                   date: '11/07/2026' },
            { num: 9,  name: 'Étape 9',  start: 'Malemort',                   finish: 'Ussel',                      date: '12/07/2026' },
            { num: 10, name: 'Étape 10', start: 'Aurillac',                   finish: 'Le Lioran',                  date: '14/07/2026' },
            { num: 11, name: 'Étape 11', start: 'Vichy',                      finish: 'Nevers',                     date: '15/07/2026' },
            { num: 12, name: 'Étape 12', start: 'Magny-Cours',                finish: 'Chalon-sur-Saône',           date: '16/07/2026' },
            { num: 13, name: 'Étape 13', start: 'Dole',                       finish: 'Belfort',                    date: '17/07/2026' },
            { num: 14, name: 'Étape 14', start: 'Mulhouse',                   finish: 'Le Markstein',               date: '18/07/2026' },
            { num: 15, name: 'Étape 15', start: 'Champagnole',                finish: 'Plateau de Solaison',        date: '19/07/2026' },
            { num: 16, name: 'Étape 16', start: 'Évian-les-Bains',             finish: 'Thonon-les-Bains',           date: '21/07/2026' },
            { num: 17, name: 'Étape 17', start: 'Chambéry',                   finish: 'Voiron',                     date: '22/07/2026' },
            { num: 18, name: 'Étape 18', start: 'Voiron',                     finish: 'Orcières-Merlette',          date: '23/07/2026' },
            { num: 19, name: 'Étape 19', start: 'Gap',                        finish: "Alpe d'Huez",                date: '24/07/2026' },
            { num: 20, name: 'Étape 20', start: "Bourg-d'Oisans",             finish: "Alpe d'Huez",                date: '25/07/2026' },
            { num: 21, name: 'Étape 21', start: 'Thoiry',                     finish: 'Paris',                      date: '26/07/2026' }
        ]
    },
    giro: {
        id: "giro",
        name: "Giro d'Italia 2026",
        color: [1.0, 0.6, 0.72, 1.0],
        globalLat: 42.5,
        globalLon: 12.5,
        geojsonPath: path.join(__dirname, '../data/geojson/gadm41_ITA_0.json'),
        gpxMode: 'multi',
        gpxDir: path.join(__dirname, '../data/gpx/giro-d-italia-2026'),
        gpxPrefix: 'etappe-',
        stages: [
            { num: 1,  name: 'Étape 1',  start: 'Nesebăr',            finish: 'Burgas',           date: '08/05/2026' },
            { num: 2,  name: 'Étape 2',  start: 'Burgas',             finish: 'Veliko Tarnovo',   date: '09/05/2026' },
            { num: 3,  name: 'Étape 3',  start: 'Plovdiv',            finish: 'Sofia',            date: '10/05/2026' },
            { num: 4,  name: 'Étape 4',  start: 'Catanzaro',          finish: 'Cosenza',          date: '12/05/2026' },
            { num: 5,  name: 'Étape 5',  start: 'Praia a Mare',       finish: 'Potenza',          date: '13/05/2026' },
            { num: 6,  name: 'Étape 6',  start: 'Paestum',            finish: 'Naples',           date: '14/05/2026' },
            { num: 7,  name: 'Étape 7',  start: 'Formia',             finish: 'Blockhaus',        date: '15/05/2026' },
            { num: 8,  name: 'Étape 8',  start: 'Chieti',             finish: 'Fermo',            date: '16/05/2026' },
            { num: 9,  name: 'Étape 9',  start: 'Cervia',             finish: 'Corno alle Scale', date: '17/05/2026' },
            { num: 10, name: 'Étape 10', start: 'Viareggio',          finish: 'Massa',            date: '19/05/2026' },
            { num: 11, name: 'Étape 11', start: 'Porcari',            finish: 'Chiavari',         date: '20/05/2026' },
            { num: 12, name: 'Étape 12', start: 'Imperia',            finish: 'Novi Ligure',      date: '21/05/2026' },
            { num: 13, name: 'Étape 13', start: 'Alessandria',        finish: 'Verbania',         date: '22/05/2026' },
            { num: 14, name: 'Étape 14', start: 'Aosta',              finish: 'Pila',             date: '23/05/2026' },
            { num: 15, name: 'Étape 15', start: 'Voghera',            finish: 'Milan',            date: '24/05/2026' },
            { num: 16, name: 'Étape 16', start: 'Bellinzona',         finish: 'Carì',             date: '26/05/2026' },
            { num: 17, name: 'Étape 17', start: "Cassano d'Adda",     finish: 'Andalo',           date: '27/05/2026' },
            { num: 18, name: 'Étape 18', start: 'Fai della Paganella',finish: 'Pieve di Soligo',  date: '28/05/2026' },
            { num: 19, name: 'Étape 19', start: 'Feltre',             finish: 'Piani di Pezzè',   date: '29/05/2026' },
            { num: 20, name: 'Étape 20', start: 'Gemona del Friuli',  finish: 'Piancavallo',      date: '30/05/2026' },
            { num: 21, name: 'Étape 21', start: 'Rome',               finish: 'Rome',             date: '31/05/2026' }
        ]
    },
    vuelta: {
        id: "vuelta",
        name: "Vuelta a España 2026",
        color: [1.0, 0.0, 0.0, 1.0],
        globalLat: 40.0,
        globalLon: -3.5,
        geojsonPath: path.join(__dirname, '../data/geojson/gadm41_ESP_0.json'),
        gpxMode: 'multi',
        gpxDir: path.join(__dirname, '../data/gpx/vuelta-a-espana-2026'),
        gpxPrefix: 'stage-',
        stages: [
            { num: 1,  name: 'Étape 1',  start: 'Monaco',            finish: 'Monaco',            date: '22/08/2026' },
            { num: 2,  name: 'Étape 2',  start: 'Monaco',            finish: 'Manosque',          date: '23/08/2026' },
            { num: 3,  name: 'Étape 3',  start: 'Gruisan',           finish: 'Font Romeu',        date: '24/08/2026' },
            { num: 4,  name: 'Étape 4',  start: 'Andorra La Vella',  finish: 'Andorra La Vella',  date: '25/08/2026' },
            { num: 5,  name: 'Étape 5',  start: 'Falset',            finish: 'Roquetes',          date: '26/08/2026' },
            { num: 6,  name: 'Étape 6',  start: 'Alcossebre',        finish: 'Castellón',         date: '27/08/2026' },
            { num: 7,  name: 'Étape 7',  start: "Vall d'Alba",       finish: 'Valdelinares',      date: '28/08/2026' },
            { num: 8,  name: 'Étape 8',  start: 'Puçol',             finish: 'Xeraco',            date: '29/08/2026' },
            { num: 9,  name: 'Étape 9',  start: 'La Villa Joiosa',   finish: 'Alto de Aitana',    date: '30/08/2026' },
            { num: 10, name: 'Étape 10', start: 'Alcaraz',           finish: 'Elche de la Sierra',date: '01/09/2026' },
            { num: 11, name: 'Étape 11', start: 'Cartagena',         finish: 'Lorca',             date: '02/09/2026' },
            { num: 12, name: 'Étape 12', start: 'Vera',              finish: 'Calar Alto',        date: '03/09/2026' },
            { num: 13, name: 'Étape 13', start: 'Almuñécar',         finish: 'Loja',              date: '04/09/2026' },
            { num: 14, name: 'Étape 14', start: 'Jaén',              finish: 'Sierra de la Pandera',date: '05/09/2026' },
            { num: 15, name: 'Étape 15', start: 'Palma del Río',     finish: 'Córdoba',           date: '06/09/2026' },
            { num: 16, name: 'Étape 16', start: 'Cortegana',         finish: 'La Rábida',         date: '08/09/2026' },
            { num: 17, name: 'Étape 17', start: 'Dos Hermanas',      finish: 'Sevilla',           date: '09/09/2026' },
            { num: 18, name: 'Étape 18', start: 'El Puerto de Santa Maria', finish: 'Jerez de la Frontera', date: '10/09/2026' },
            { num: 19, name: 'Étape 19', start: 'Vélez-Málaga',      finish: 'Peñas Blancas',     date: '11/09/2026' },
            { num: 20, name: 'Étape 20', start: 'La Calahorra',      finish: 'Collada de Alguacil',date: '12/09/2026' },
            { num: 21, name: 'Étape 21', start: 'Granada',           finish: 'Granada',           date: '13/09/2026' }
        ]
    },
    'tour-d-auvergne-rhone-alpes-2026': {
        id: "tour-d-auvergne-rhone-alpes-2026",
        name: "Tour d'Auvergne Rhône Alpes 2026",
        color: [0.0, 0.6, 0.1, 1.0],
        globalLat: 45.4,
        globalLon: 5.8,
        geojsonPath: path.join(__dirname, '../data/geojson/gadm41_FRA_0.geojson'),
        gpxMode: 'multi',
        gpxDir: path.join(__dirname, '../data/gpx/tour-d-auvergne-rhone-alpes-2026'),
        gpxPrefix: 'stage-',
        stages: [
            { num: 1,  name: 'Étape 1',  start: 'Vizille',                   finish: 'Saint-Ismier',                  date: '07/06/2026' },
            { num: 2,  name: 'Étape 2',  start: 'Saint-Martin-le-Vinoux',    finish: 'Le Puy-en-Velay',               date: '08/06/2026' },
            { num: 3,  name: 'Étape 3',  start: 'Perreux',                   finish: 'Perreux',                       date: '09/06/2026' },
            { num: 4,  name: 'Étape 4',  start: 'Le Puy-en-Velay',           finish: 'Montrond-les-Bains',            date: '10/06/2026' },
            { num: 5,  name: 'Étape 5',  start: 'Saint-Chamond',             finish: 'Villars-les-Dombes',            date: '11/06/2026' },
            { num: 6,  name: 'Étape 6',  start: 'Saint-Vulbas',              finish: 'Crest-Voland',                  date: '12/06/2026' },
            { num: 7,  name: 'Étape 7',  start: 'La Bridoire',               finish: 'Grand Colombier',               date: '13/06/2026' },
            { num: 8,  name: 'Étape 8',  start: 'Beaufort',                  finish: 'Plateau de Solaison',           date: '14/06/2026' }
        ]
    }
};

const MANIFEST_PATH = path.join(__dirname, '../data/races/build_manifest.json');
const gpxRoot = path.join(__dirname, '../data/gpx');
const racesRoot = path.join(__dirname, '../data/races');

// Ensure directories exist
if (!fs.existsSync(racesRoot)) {
    fs.mkdirSync(racesRoot, { recursive: true });
}

// Haversine formula
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000.0;
    const rad = Math.PI / 180;
    const phi1 = lat1 * rad, phi2 = lat2 * rad;
    const deltaPhi = (lat2 - lat1) * rad;
    const deltaLambda = (lon2 - lon1) * rad;
    const a = Math.sin(deltaPhi / 2) ** 2 +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Regex points parser
function parsePoints(gpxContent) {
    const ptRegex = /<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)">[\s\S]*?<ele>([^<]+)<\/ele>[\s\S]*?<\/trkpt>/g;
    let ptMatch;
    const points = [];
    while ((ptMatch = ptRegex.exec(gpxContent)) !== null) {
        const lat = parseFloat(ptMatch[1]);
        const lon = parseFloat(ptMatch[2]);
        const ele = parseFloat(ptMatch[3]);
        if (!isNaN(lat) && !isNaN(lon) && !isNaN(ele)) {
            points.push({ lat, lon, ele });
        }
    }
    return points;
}

// Loads GPX tracks and formats stages metadata
function loadGpxFileStages(gpxPath, defaultName, defaultNum) {
    const gpxContent = fs.readFileSync(gpxPath, 'utf-8');
    const trkRegex = /<trk>[\s\S]*?<\/trk>/g;
    const fileStages = [];
    
    const matches = [...gpxContent.matchAll(trkRegex)];
    if (matches.length > 0) {
        let trkNum = 1;
        for (const m of matches) {
            const trkContent = m[0];
            const nameMatch = trkContent.match(/<name>(.*?)<\/name>/);
            let name = nameMatch ? nameMatch[1].replace('<![CDATA[', '').replace(']]>', '').trim() : `${defaultName} - Trk ${trkNum}`;
            name = name.replace(/&amp;/g, '&');
            
            const descMatch = trkContent.match(/<desc>([\s\S]*?)<\/desc>/);
            let start = "Départ", finish = "Arrivée", date = "01/06/2026";
            if (descMatch) {
                const desc = descMatch[1].replace('<![CDATA[', '').replace(']]>', '');
                const lines = desc.split('\n').map(l => l.trim()).filter(Boolean);
                if (lines[0]) {
                    const cities = lines[0].split(/\s*[>-]\s*/);
                    start = cities[0]?.trim() || "Départ";
                    finish = cities[1]?.trim() || "Arrivée";
                }
                if (lines[1]) date = lines[1].trim();
            }
            
            const timeMatch = trkContent.match(/<time>([^<]+)<\/time>/);
            if (timeMatch) {
                const d = new Date(timeMatch[1]);
                if (!isNaN(d.getTime())) {
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    date = `${day}/${month}/${year}`;
                }
            }
            
            const points = parsePoints(trkContent);
            if (points.length > 0) {
                fileStages.push({
                    name,
                    start,
                    finish,
                    date,
                    points
                });
            }
            trkNum++;
        }
    } else {
        const points = parsePoints(gpxContent);
        if (points.length > 0) {
            fileStages.push({
                name: defaultName,
                start: "Départ",
                finish: "Arrivée",
                date: "01/06/2026",
                points
            });
        }
    }
    return fileStages;
}

// Generate file metadata hash for change detection
function getGpxFilesHash(gpxDirPath) {
    if (!fs.existsSync(gpxDirPath)) return null;
    const files = fs.readdirSync(gpxDirPath)
        .filter(f => f.toLowerCase().endsWith('.gpx'))
        .sort();
    
    let hashStr = '';
    for (const file of files) {
        const filePath = path.join(gpxDirPath, file);
        const stat = fs.statSync(filePath);
        hashStr += `${file}:${stat.size}:${stat.mtimeMs};`;
    }
    return hashStr;
}

// Reads manifest
let manifest = {};
if (fs.existsSync(MANIFEST_PATH)) {
    try {
        manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    } catch (e) {
        console.error("Failed to parse manifest, rebuilding all:", e);
    }
}

// Scan directories in data/gpx/
if (!fs.existsSync(gpxRoot)) {
    console.error(`GPX root directory not found at ${gpxRoot}`);
    process.exit(1);
}

const gpxDirs = fs.readdirSync(gpxRoot).filter(f => {
    const fullPath = path.join(gpxRoot, f);
    return fs.statSync(fullPath).isDirectory();
});

let manifestUpdated = false;

for (const dirName of gpxDirs) {
    const raceId = FOLDER_TO_RACE_ID[dirName] || dirName;
    const gpxDirPath = path.join(gpxRoot, dirName);
    const currentHash = getGpxFilesHash(gpxDirPath);
    
    if (!currentHash) {
        console.log(`Skipping empty or GPX-less directory: ${dirName}`);
        continue;
    }
    
    const raceOutDir = path.join(racesRoot, raceId);
    const profileBinPath = path.join(raceOutDir, 'profile.bin');
    const globalBinPath = path.join(raceOutDir, 'global.bin');
    const metaJsonPath = path.join(raceOutDir, 'meta.json');
    
    const manifestMatch = manifest[raceId] === currentHash;
    const outputsExist = fs.existsSync(profileBinPath) && fs.existsSync(globalBinPath) && fs.existsSync(metaJsonPath);
    
    if (manifestMatch && outputsExist) {
        // Up to date!
        continue;
    }
    
    try {
        rebuildRace(raceId, dirName, currentHash);
        manifestUpdated = true;
    } catch (err) {
        console.error(`Error rebuilding race ${raceId}:`, err);
    }
}

// Save manifest if changed
if (manifestUpdated) {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
    console.log("Manifest saved.");
} else {
    console.log("All GPX bins are up to date.");
}

function rebuildRace(raceId, dirName, currentHash) {
    console.log(`Rebuilding race: "${raceId}" from folder: "${dirName}"...`);
    const gpxDirPath = path.join(gpxRoot, dirName);
    const raceOutDir = path.join(racesRoot, raceId);
    if (!fs.existsSync(raceOutDir)) {
        fs.mkdirSync(raceOutDir, { recursive: true });
    }

    // 1. Get/Compute config
    let config = KNOWN_RACES[raceId];
    let isDynamic = false;
    if (!config) {
        isDynamic = true;
        config = {
            id: raceId,
            name: dirName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            color: [0.0, 0.47, 1.0, 1.0], // default blue
            gpxMode: 'multi',
            gpxDir: gpxDirPath,
            gpxPrefix: ''
        };
        const lowerName = raceId.toLowerCase();
        if (lowerName.includes('france')) {
            config.color = [0.0, 0.35, 1.0, 1.0];
        } else if (lowerName.includes('giro') || lowerName.includes('italia')) {
            config.color = [1.0, 0.6, 0.72, 1.0];
        } else if (lowerName.includes('vuelta') || lowerName.includes('espana')) {
            config.color = [1.0, 0.0, 0.0, 1.0];
        }
    } else {
        config.gpxDir = path.resolve(__dirname, config.gpxDir);
        if (config.geojsonPath) {
            config.geojsonPath = path.resolve(__dirname, config.geojsonPath);
        }
    }

    // 2. Load stages GPX data
    const files = fs.readdirSync(config.gpxDir)
        .filter(f => f.toLowerCase().endsWith('.gpx'))
        .sort();

    let parsedStages = [];
    if (config.gpxMode === 'single') {
        const gpxPath = config.gpxPath ? path.resolve(__dirname, config.gpxPath) : path.join(config.gpxDir, files[0]);
        parsedStages = loadGpxFileStages(gpxPath, config.name, 1);
    } else {
        if (isDynamic) {
            let stageNum = 1;
            for (const file of files) {
                const filePath = path.join(config.gpxDir, file);
                const fileStages = loadGpxFileStages(filePath, `Étape ${stageNum}`, stageNum);
                parsedStages.push(...fileStages);
                stageNum += fileStages.length;
            }
        } else {
            for (const stageInfo of config.stages) {
                const prefix = config.gpxPrefix || 'stage-';
                let gpxFile = path.join(config.gpxDir, `${prefix}${stageInfo.num}-route.gpx`);
                if (!fs.existsSync(gpxFile)) {
                    gpxFile = path.join(config.gpxDir, `${prefix}${stageInfo.num}.gpx`);
                }
                if (!fs.existsSync(gpxFile)) {
                    console.warn(`  [WARN] Missing GPX: ${gpxFile}`);
                    continue;
                }
                const fileStages = loadGpxFileStages(gpxFile, stageInfo.name, stageInfo.num);
                if (fileStages.length > 0) {
                    fileStages[0].name = stageInfo.name;
                    fileStages[0].start = stageInfo.start;
                    fileStages[0].finish = stageInfo.finish;
                    fileStages[0].date = stageInfo.date;
                    parsedStages.push(fileStages[0]);
                }
            }
        }
    }

    if (parsedStages.length === 0) {
        console.error(`No stages found for race ${raceId}`);
        return;
    }

    // 3. Center computation
    let globalLat = config.globalLat;
    let globalLon = config.globalLon;
    
    if (globalLat === undefined || globalLon === undefined) {
        let totalLat = 0, totalLon = 0, totalPts = 0;
        for (const stage of parsedStages) {
            for (const pt of stage.points) {
                totalLat += pt.lat;
                totalLon += pt.lon;
                totalPts++;
            }
        }
        if (totalPts > 0) {
            globalLat = totalLat / totalPts;
            globalLon = totalLon / totalPts;
        } else {
            globalLat = 46.5;
            globalLon = 2.5;
        }
        console.log(`  Auto-detected center: Lat ${globalLat.toFixed(4)}, Lon ${globalLon.toFixed(4)}`);
    }

    // Dynamic country border geojson mapping
    let geojsonPath = config.geojsonPath;
    if (isDynamic || !geojsonPath) {
        if (globalLat >= 41 && globalLat <= 51 && globalLon >= -5 && globalLon <= 10) {
            geojsonPath = path.join(__dirname, '../data/geojson/gadm41_FRA_0.geojson');
        } else if (globalLat >= 35 && globalLat <= 48 && globalLon >= 6 && globalLon <= 19) {
            geojsonPath = path.join(__dirname, '../data/geojson/gadm41_ITA_0.json');
        } else if (globalLat >= 35 && globalLat <= 44 && globalLon >= -10 && globalLon <= 4) {
            geojsonPath = path.join(__dirname, '../data/geojson/gadm41_ESP_0.json');
        }
        if (geojsonPath && fs.existsSync(geojsonPath)) {
            console.log(`  Map boundary: ${path.basename(geojsonPath)}`);
        } else {
            geojsonPath = null;
        }
    }

    // 4. Build Profile Binary Data
    const rad = Math.PI / 180;
    const m_per_lat = 111320.0;
    const m_per_lon = 111320.0 * Math.cos(globalLat * rad);

    const allStagesData = [];
    for (const stage of parsedStages) {
        let sumLat = 0, sumLon = 0;
        for (const pt of stage.points) { sumLat += pt.lat; sumLon += pt.lon; }
        const latCenter = sumLat / stage.points.length;
        const lonCenter = sumLon / stage.points.length;

        const global_lx = (lonCenter - globalLon) * m_per_lon;
        const global_ly = (latCenter - globalLat) * m_per_lat;

        let totalDist = 0;
        let lastCoord = null;
        let profilePoints = [];
        for (const pt of stage.points) {
            if (lastCoord) totalDist += haversineDistance(lastCoord.lat, lastCoord.lon, pt.lat, pt.lon);
            const lx = (pt.lon - lonCenter) * m_per_lon;
            const ly = (pt.lat - latCenter) * m_per_lat;
            profilePoints.push({ dist: totalDist, ele: pt.ele, lx, ly });
            lastCoord = pt;
        }

        const maxEle = profilePoints.reduce((max, p) => Math.max(max, p.ele), 0);
        const minEle = profilePoints.reduce((min, p) => Math.min(min, p.ele), 9999);

        const sparkline = new Float32Array(60);
        for (let i = 0; i < 60; i++) {
            const targetDist = (i / 59) * totalDist;
            let p = profilePoints[0];
            for (let j = 0; j < profilePoints.length; j++) {
                if (profilePoints[j].dist >= targetDist) { p = profilePoints[j]; break; }
            }
            sparkline[i] = p.ele;
        }

        const vertices = [];
        const indices = [];
        let r_v_offset = 0;
        const n = profilePoints.length;
        for (let j = 0; j < n; j++) {
            const p = profilePoints[j];
            const pr = j > 0 ? profilePoints[j - 1] : p;
            const nx = j < n - 1 ? profilePoints[j + 1] : p;

            const pushV = (side) => {
                vertices.push(p.dist, p.ele, p.lx, p.ly);
                vertices.push(pr.dist, pr.ele, pr.lx, pr.ly);
                vertices.push(nx.dist, nx.ele, nx.lx, nx.ly);
                vertices.push(side);
            };
            pushV(1.0);
            pushV(-1.0);

            if (j < n - 1) {
                const b = r_v_offset;
                indices.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
            }
            r_v_offset += 2;
        }

        allStagesData.push({
            name: stage.name, start: stage.start, finish: stage.finish, date: stage.date,
            totalDist, maxEle, minEle, global_lx, global_ly,
            sparkline,
            vertices: new Float32Array(vertices),
            indices: new Uint32Array(indices),
        });
    }

    let totalSize = 4;
    for (const s of allStagesData) {
        totalSize += 4 + Buffer.from(s.name, 'utf8').length;
        totalSize += 4 + Buffer.from(s.start, 'utf8').length;
        totalSize += 4 + Buffer.from(s.finish, 'utf8').length;
        totalSize += 4 + Buffer.from(s.date, 'utf8').length;
        totalSize += 4 + 4 + 4 + (60 * 4);
        totalSize += 4 + 4;
        totalSize += 4 + 4 + s.vertices.byteLength + s.indices.byteLength;
    }

    const finalBuf = Buffer.alloc(totalSize);
    let offset = 0;
    finalBuf.writeUInt32LE(allStagesData.length, offset); offset += 4;

    for (const s of allStagesData) {
        const writeStr = (str) => {
            const b = Buffer.from(str, 'utf8');
            finalBuf.writeUInt32LE(b.length, offset); offset += 4;
            b.copy(finalBuf, offset); offset += b.length;
        };
        writeStr(s.name);
        writeStr(s.start);
        writeStr(s.finish);
        writeStr(s.date);

        finalBuf.writeFloatLE(s.totalDist, offset); offset += 4;
        finalBuf.writeFloatLE(s.maxEle, offset); offset += 4;
        finalBuf.writeFloatLE(s.minEle, offset); offset += 4;
        finalBuf.writeFloatLE(s.global_lx, offset); offset += 4;
        finalBuf.writeFloatLE(s.global_ly, offset); offset += 4;

        for (let i = 0; i < 60; i++) { finalBuf.writeFloatLE(s.sparkline[i], offset); offset += 4; }

        finalBuf.writeUInt32LE(s.vertices.length, offset); offset += 4;
        finalBuf.writeUInt32LE(s.indices.length, offset); offset += 4;
        
        Buffer.from(s.vertices.buffer, s.vertices.byteOffset, s.vertices.byteLength).copy(finalBuf, offset); 
        offset += s.vertices.byteLength;
        
        Buffer.from(s.indices.buffer, s.indices.byteOffset, s.indices.byteLength).copy(finalBuf, offset); 
        offset += s.indices.byteLength;
    }

    const profileBinPath = path.join(raceOutDir, 'profile.bin');
    const compressedBuf = zlib.gzipSync(finalBuf);
    fs.writeFileSync(profileBinPath, compressedBuf);
    console.log(`  Written profile.bin`);

    // 5. Build Global View Binary Data
    function project(lat, lon) {
        return [(lon - globalLon) * m_per_lon, (lat - globalLat) * m_per_lat];
    }

    let fillVertices = [], fillIndices = [], fillVertexOffset = 0;
    let lineVertices = [], lineIndices = [], lineVertexOffset = 0;

    function addFillPolygon(polygon) {
        let data = [], holeIndices = [], currentOffset = 0;
        polygon.forEach((ring, i) => {
            if (i > 0) holeIndices.push(currentOffset);
            ring.forEach(coord => {
                const p = project(coord[1], coord[0]);
                data.push(p[0], p[1]);
                currentOffset++;
            });
        });
        const triangles = (typeof earcut === 'function' ? earcut : earcut.default)(data, holeIndices, 2);
        const base = fillVertexOffset;
        for (let i = 0; i < data.length; i += 2) fillVertices.push(data[i], data[i + 1]);
        for (let i = 0; i < triangles.length; i++) fillIndices.push(base + triangles[i]);
        fillVertexOffset += data.length / 2;
    }

    function addLineStrip(points, color) {
        if (points.length < 2) return;
        let n = points.length;
        let baseOffset = lineVertexOffset;
        for (let j = 0; j < n; j++) {
            const p = points[j];
            const pr = j > 0 ? points[j - 1] : p;
            const nx = j < n - 1 ? points[j + 1] : p;
            lineVertices.push(p[0], p[1], pr[0], pr[1], nx[0], nx[1], 1.0, color);
            lineVertices.push(p[0], p[1], pr[0], pr[1], nx[0], nx[1], -1.0, color);
            if (j < n - 1) {
                let b = baseOffset + j * 2;
                lineIndices.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
            }
        }
        lineVertexOffset += n * 2;
    }

    if (geojsonPath && fs.existsSync(geojsonPath)) {
        try {
            const rawGeo = fs.readFileSync(geojsonPath, 'utf8');
            const parsed = JSON.parse(rawGeo);
            parsed.features.forEach(feature => {
                const geometry = feature.geometry;
                const polygons = geometry.type === 'MultiPolygon' ? geometry.coordinates : [geometry.coordinates];
                polygons.forEach(polygon => {
                    addFillPolygon(polygon);
                    polygon.forEach(ring => {
                        let pts = ring.map(coord => project(coord[1], coord[0]));
                        addLineStrip(pts, 0.5);
                    });
                });
            });
        } catch (e) {
            console.error("  [ERROR] Failed parsing geojson map boundaries:", e);
        }
    }

    // GPX Tracks
    for (const stage of parsedStages) {
        let pts = stage.points.map(pt => project(pt.lat, pt.lon));
        if (pts.length > 0) addLineStrip(pts, 1.0);
    }

    const globalBinPath = path.join(raceOutDir, 'global.bin');
    const totalGlobalSize = 16
        + (fillVertices.length * 4) + (fillIndices.length * 4)
        + (lineVertices.length * 4) + (lineIndices.length * 4);
    const globalBuf = Buffer.alloc(totalGlobalSize);

    globalBuf.writeUInt32LE(fillVertices.length / 2, 0);
    globalBuf.writeUInt32LE(fillIndices.length, 4);
    globalBuf.writeUInt32LE(lineVertices.length / 8, 8);
    globalBuf.writeUInt32LE(lineIndices.length, 12);

    let gOffset = 16;
    for (let v of fillVertices) { globalBuf.writeFloatLE(v, gOffset); gOffset += 4; }
    for (let i of fillIndices) { globalBuf.writeUInt32LE(i, gOffset); gOffset += 4; }
    for (let v of lineVertices) { globalBuf.writeFloatLE(v, gOffset); gOffset += 4; }
    for (let i of lineIndices) { globalBuf.writeUInt32LE(i, gOffset); gOffset += 4; }

    fs.writeFileSync(globalBinPath, globalBuf);
    console.log(`  Written global.bin`);

    // 6. Generate meta.json
    const metaObj = {
        id: config.id,
        name: config.name,
        color: config.color,
        map_center_lat: globalLat,
        map_center_lon: globalLon
    };
    const metaJsonPath = path.join(raceOutDir, 'meta.json');
    fs.writeFileSync(metaJsonPath, JSON.stringify(metaObj, null, 2), 'utf8');
    console.log(`  Written meta.json`);

    manifest[raceId] = currentHash;
}
