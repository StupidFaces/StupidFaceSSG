const fs = require('fs');

function getFaceNameById(id, fallbackName) {
    const path = `${module.path}/../src/faces/stupid-face-${id}.md`;
    return getFaceName(path, fallbackName)
}

function getFaceName(path, fallbackName='None') {
    let faceName = fallbackName;
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

module.exports = {
    getFaceName,
    getFaceNameById,
    getFaceUrl,
    getFaceAsaId
}