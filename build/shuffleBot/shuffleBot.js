/* eslint-disable */
const glob = require('glob');
const fs = require('fs');

let filesToShuffle = [];
const shuffleInputFiles = glob.sync(`${module.path}/../../src/shuffles/stupidfaces-shuffle-*`);
const shuffleResultIds = glob
    .sync(`${module.path}/../../src/shuffles/shuffleResult-*`)
    .map((shuffleResult) => shuffleResult.split('-')[1].split('.')[0]);

filesToShuffle = shuffleInputFiles.filter((inputFile) => !shuffleResultIds.includes(getShuffleIdByFilePath(inputFile)));

for (const csvFilePath of filesToShuffle) {
    const shuffleId = getShuffleIdByFilePath(csvFilePath);
    let fileLines = fs.readFileSync(csvFilePath).toString().split('\n');

    fileLines = fileLines.slice(1);

    const walletsInorder = [];

    for (const line of fileLines) {
        const lineArray = line.split(',');
        if (lineArray && lineArray.length > 1) {
            walletsInorder.push(lineArray[1].replace('"', '').slice(0, 15));
        }
    }
    console.log('walletsInorder: ', walletsInorder);
    const walletsShuffled = shuffle(walletsInorder);

    const json = JSON.stringify(walletsShuffled);
    fs.writeFileSync(`${module.path}/../../src/shuffles/shuffleResult-${shuffleId}.json`, json);

    console.log('walletsShuffled: ', walletsShuffled);
}

function getShuffleIdByFilePath(fileName) {
    return fileName.split('-')[2].split('.')[0];
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
