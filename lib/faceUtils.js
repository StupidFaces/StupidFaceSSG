const fs = require('fs');

function getFaceNameById(id, fallbackName) {
    let path = `${module.path}/../src/faces/stupid-face-${id}.md`;
    if (id == '75') {
        path = `${module.path}/../src/faces/stupid-nalgo-${id}.md`
    }
    
    return getFaceName(path, fallbackName)
}

function getFaceName(path, fallbackName = 'None') {
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
    const facePathArray = path.split('/');
    const faceSlug = facePathArray[facePathArray.length - 1].split('.')[0];
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