const fs = require('fs');
const attributesMapping = require('./../../build/arc69gen/attributes.json')

module.exports = {
    eleventyComputed: {
        titleTag: (data) => (data.adoptionName ? `${data.adoptionName} - ${data.title}` : data.title),
        id: (data) => data.page.fileSlug.split('-')[2],
        meta: (data) => {
            const arc69metaFilePath = `${module.path}/arc69/${data.page.fileSlug}.json`;
            const metaArray = [];
            if (fs.existsSync(arc69metaFilePath)) {
                const metaJson = JSON.parse(fs.readFileSync(arc69metaFilePath));

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
            const pagination = {
                next: null,
                previous: null,
                this: data.page.fileSlug
            }

            const thisFileSlug = data.page.fileSlug;

            const thisId = parseInt(thisFileSlug.split('-')[2]);

            const nextId = (thisId + 1).toString();
            const previousId = (thisId - 1).toString();

            const nextIdSlug = thisFileSlug.replace(thisId, nextId)
            const previousIdSlug = thisFileSlug.replace(thisId, previousId)

            if (fs.existsSync(`${module.path}/${nextIdSlug}.md`)) {
                pagination.next = nextIdSlug;
            }

            if (fs.existsSync(`${module.path}/${previousIdSlug}.md`)) {
                pagination.previous = previousIdSlug;
            }

            return pagination;

        }
    },
};


function getRarity(name, value) {
    for (let attribute of attributesMapping) {
        if (attribute.name === name) {
            for (let rarity of Object.keys(attribute)) {
                for (let possibleValue of attribute[rarity]) {
                    if (value === possibleValue) {
                        return rarity;
                    }
                }
            }
        }
    }
    return '';
}