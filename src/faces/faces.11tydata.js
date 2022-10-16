const fs = require('fs');
const attributesMapping = require('./../../build/arc69gen/attributes.json')

module.exports = {
    eleventyComputed: {
        titleTag: (data) => (data.adoptionName ? `${data.adoptionName} - ${data.title}` : data.title),
        id: (data) => data.page.fileSlug.split('-')[2],
        meta: (data) => {
            const arc69metaFilePath = `${module.path}/arc69/${data.asaId}.json`;
            const metaArray = [];
            if (fs.existsSync(arc69metaFilePath)) {
                const metaJson = JSON.parse(fs.readFileSync(arc69metaFilePath))['properties'];

                Object.keys(metaJson).forEach((key) => {
                    const metaObject = {
                        name: key,
                        value: metaJson[key],
                        rarity: getRarity(key, metaJson[key])
                    };
                    if (key !== 'Name') {
                        metaArray.push(metaObject);
                    }
                })
            }

            return metaArray
        },
        pagination: (data) => {
            const thisFileSlug = data.page.fileSlug;

            const pagination = {
                next: null,
                previous: null,
                this: thisFileSlug
            }

            const thisId = parseInt(thisFileSlug.split('-')[2]);
            const nextId = (thisId + 1).toString();
            const previousId = (thisId - 1).toString();

            for (faceData of data.collections.faces) {
                const fileSlugArray = faceData.fileSlug.split('-');

                if (fileSlugArray[2] == nextId) {
                    pagination.next = faceData.fileSlug;
                }
                if (fileSlugArray[2] == previousId) {
                    pagination.previous = faceData.fileSlug;
                }
            }

            return pagination;
        }
    },
};


function getRarity(name, value) {
    const valueWithPlaceholder = value.replace(/#\d*/, '%randomFace%');

    for (let attribute of attributesMapping) {
        if (attribute.name === name) {
            for (let rarity of Object.keys(attribute)) {
                for (let possibleValue of attribute[rarity]) {
                    if (valueWithPlaceholder === possibleValue) {
                        return rarity;
                    }
                }
            }
        }
    }
    return '';
}