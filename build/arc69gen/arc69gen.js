/* eslint-disable */
const glob = require('glob');
const fs = require('fs');
const path = require('path');
const attributes = require('./attributes.json');

const RARITIES = [{ epic: 1 }, { rare: 17 }, { uncommon: 30 }, { common: 40 }];

const faceFiles = glob.sync(`${module.path}/../../src/faces/stupid-face-*`);
const faceMetaPath = `${module.path}/../../src/faces/arc69/`;

const faceCount = faceFiles.length;

//console.log('ATTRIBUTES: ', attributes);
//console.log('faceFiles: ', faceFiles);

for (let facePath of faceFiles) {
    generateMetaData(facePath);
}

function generateMetaData(facePath) {
    //getfacename
    const faceName = getFaceName(facePath);

    //randomAttributes
    const randomAttributes = getRandomAttributes();

    const faceMetaData = {
        standard: "arc69",
        description: "Just a Stupid Face.",
        external_url: getFaceUrl(facePath),
        properties: {
            Name: faceName,
            ...randomAttributes,
        }
    };

    console.log('PATH: ', facePath);
    console.log('META: ', faceMetaData);
    //writeMetaFile
    writeMetaToFile(faceMetaData, facePath);
}

function writeMetaToFile(metaData, facePath) {
    const outputFileName = `${getFaceAsaId(facePath)}.json`;
    const outputPath = faceMetaPath + outputFileName;

    //console.log(outputPath)

    if (!fs.existsSync(outputPath)) {
        ensureDirectoryExistence(outputPath);
        fs.writeFileSync(outputPath, JSON.stringify(metaData));
    }
}

function getFaceName(path) {
    let faceName = 'None';
    const faceContentLines = fs.readFileSync(path).toString().split('\n');

    for (let line of faceContentLines) {
        if (line.includes('adoptionName')) {
            faceName = line.split(':')[1].trim();
        }
    }
    return faceName;
}

function getFaceUrl(path) {
    const faceSlug = path.split('/').at(-1).split('.')[0];
    return `https://stupidface.art/${faceSlug}/`;
}

function getFaceAsaId(path) {
    const faceContentLines = fs.readFileSync(path).toString().split('\n');

    for (let line of faceContentLines) {
        if (line.includes('asaId')) {
            return line.split(':')[1].trim();
        }
    }

    throw Error(`ASA ID not found for: ${path}`)
}

function getRandomAttributes() {
    const returnAttribues = {};
    for (let attribute of attributes) {
        const randomRarity = getRandomRarity();
        const attributeName = attribute.name;

        let randomAttributeValue = shuffle(attribute[randomRarity])[0];

        if (attributeName === 'Relation') {
            const randomFace = '#' + (Math.floor((Math.random() * faceCount) + 1)).toString();
            randomAttributeValue = randomAttributeValue.replace('%randomFace%', randomFace);
        }

        returnAttribues[attributeName] = randomAttributeValue;
    }

    return returnAttribues;
}

function getRandomRarity() {
    const weightedRarities = [];
    for (rarity of RARITIES) {
        let index = 0;
        const rarityName = Object.keys(rarity)[0];
        const rarityPercentage = rarity[rarityName];
        for (index; index < rarityPercentage; index++) {
            weightedRarities.push(rarityName);
        }
    }
    const shuffledRarities = shuffle(weightedRarities);

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
