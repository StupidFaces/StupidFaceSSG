/* eslint-disable */
const glob = require('glob');
const fs = require('fs');
const path = require('path');
const attributes = require('./attributes.json')

const RARITIES = [
    { "epic": 1 },
    { "rare": 20 },
    { "uncommon": 30 },
    { "common": 35 }
]

const faceFiles = glob.sync(`${module.path}/../../src/faces/stupid-face-*`);
const faceMetaPath = `${module.path}/../../src/faces/arc69/`;

//console.log('ATTRIBUTES: ', attributes);
//console.log('faceFiles: ', faceFiles);

for (let facePath of faceFiles) {
    generateMetaData(facePath)
}

function generateMetaData(facePath) {
    //getfacename
    const faceName = getFaceName(facePath);

    //randomAttributes
    const randomAttributes = getRandomAttributes()

    const faceMetaData = {
        "Name": faceName,
        ...randomAttributes
    }

    console.log('PATH: ', facePath)
    console.log('META: ', faceMetaData)
        //writeMetaFile
    writeMetaToFile(faceMetaData, facePath)
}

function writeMetaToFile(metaData, facePath) {
    const outputFileName = facePath.split('/').slice(-1)[0].split('.')[0] + '.json';
    const outputPath = faceMetaPath + outputFileName;

    //console.log(outputPath)

    if (!fs.existsSync(outputPath)) {
        ensureDirectoryExistence(outputPath)
        fs.writeFileSync(outputPath, JSON.stringify(metaData))
    }
}

function getFaceName(path) {
    let faceName = 'None';
    const faceContentLines = fs.readFileSync(path).toString().split('\n');

    for (let line of faceContentLines) {
        if (line.includes('adoptionName')) {
            faceName = line.split(':')[1].trim()
        }
    }
    return faceName;
}

function getRandomAttributes() {
    const returnAttribues = {};
    for (let attribute of attributes) {
        const randomRarity = getRandomRarity();
        const attributeName = attribute.name;

        const randomAttributeValue = shuffle(attribute[randomRarity])[0];
        returnAttribues[attributeName] = randomAttributeValue;
    }

    return returnAttribues;
}

function getRandomRarity() {
    const weightedRarities = []
    for (rarity of RARITIES) {
        let index = 0
        const rarityName = Object.keys(rarity)[0];
        const rarityPercentage = rarity[rarityName]
        for (index; index < rarityPercentage; index++) {
            weightedRarities.push(rarityName)
        }
    }
    const shuffledRarities = shuffle(weightedRarities)

    return shuffledRarities[0];
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}