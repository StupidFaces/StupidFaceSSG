const htmlmin = require('html-minifier');
const dateFns = require('date-fns');
const lazyImagesPlugin = require('eleventy-plugin-lazyimages');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const faceUtils = require('./lib/faceUtils')
const inspect = require("util").inspect;

module.exports = function (eleventyConfig) {
    eleventyConfig.addPlugin(syntaxHighlight);

    eleventyConfig.setEjsOptions({
        rmWhitespace: true,
        context: {
            dateFns,
        },
    });

    eleventyConfig.addPassthroughCopy({
        "./node_modules/algosdk/dist/browser/algosdk.min.js": "/assets/js/algosdk.min.js",
        "./node_modules/algosdk/dist/browser/algosdk.min.js.map": "/assets/js/algosdk.min.js.map",
    });

    eleventyConfig.setBrowserSyncConfig({
        files: './_site/assets/styles/main.css',
    });

    eleventyConfig.addTransform('htmlmin', (content, outputPath) => {
        if (outputPath.endsWith('.html')) {
            const minified = htmlmin.minify(content, {
                useShortDoctype: true,
                removeComments: true,
                collapseWhitespace: true,
                minifyJS: true,
            });
            return minified;
        }

        return content;
    });

    eleventyConfig.addFilter('getFaceOfTheMonth', function (faces) {
        const currentYearMonth = new Date().toISOString().slice(0, 7);
        let faceOfTheMonth = '';

        for (const face of faces) {
            if (!face.data.faceOfTheMonth) {
                continue;
            }
            for (const yearMonth of face.data.faceOfTheMonth) {
                if (yearMonth === currentYearMonth) {
                    faceOfTheMonth = face;
                }
            }
        }
        return faceOfTheMonth;
    });

    eleventyConfig.addFilter('getFaceOfTheMonthCount', function (faceOfTheMonth) {
        const currentYearMonth = new Date().toISOString().slice(0, 7);
        let count = 0;
        try {
            for (const yearMonth of faceOfTheMonth) {
                if (yearMonth.toString() <= currentYearMonth) {
                    count += 1;
                }
            }
        } catch (e) {}
        return count;
    });

    eleventyConfig.addFilter('isNew', function (face) {
        const faceBlockDate = new Date(face.data.date);
        let date6daysPast = new Date();
        date6daysPast.setDate(date6daysPast.getDate() - 6);
        return faceBlockDate.getTime() > date6daysPast.getTime();
    });

    eleventyConfig.addFilter('isFaceOfTheMonth', function (face) {
        if (!face.data.faceOfTheMonth) return false;
        const currentYearMonth = new Date().toISOString().slice(0, 7);
        for (const yearMonth of face.data.faceOfTheMonth) {
            if (yearMonth === currentYearMonth) {
                return true;
            }
        }
        return false;
    });

    eleventyConfig.addFilter('getLogoUrl', function (hodler) {
        let logoUrl = '';
        if (hodler['logoIpfs']) {
            //logoUrl = `https://gateway.pinata.cloud/ipfs/${hodler.logoIpfs}`
            logoUrl = `https://cloudflare-ipfs.com/ipfs/${hodler.logoIpfs}`;
        } else if (hodler['logoLocal']) {
            logoUrl = hodler['logoLocal'];
        } else if (hodler['profileImage']) {
            logoUrl = hodler['profileImage']
        }
        return logoUrl;
    });

    eleventyConfig.addFilter('getSortedHodlers', function (hodlers) {
        let adjustedHodlers = hodlers.filter((hodler) => parseInt(hodler.hodleCount) > 0);

        adjustedHodlers = adjustedHodlers.sort(function (hodlerA, hodlerB) {
            return parseInt(hodlerB.hodleCount) - parseInt(hodlerA.hodleCount);
        });

        return adjustedHodlers;
    });

    eleventyConfig.addFilter('dateToIso', function (date) {
        return date.toISOString().slice(0, 10);
    });

    eleventyConfig.addFilter('getFacesByPhysicalIds', function (faces, physicalFaceIds) {
        let returnFaces = [];
        const physicalFaceIdsArray = physicalFaceIds.split(',');

        for (let face of faces) {
            const facePhysicalNumber = face.data.title.split('#')[1];
            if (physicalFaceIdsArray.includes(facePhysicalNumber)) {
                returnFaces.push(face);
            }
        }
        return returnFaces;
    });

    eleventyConfig.addFilter('replaceFaceIdWithLink', function (text) {
        let returnText = text;
        const regexp = new RegExp(/#\d*/, 'ig');
        const match = text.match(regexp);

        if (match && match[0]) {
            const faceId = match[0].replace('#','');
            const faceDisplayName = faceUtils.getFaceNameById(faceId, match[0]);

            returnText = text.replace(match[0], `<a href="/stupid-face-${faceId}" class="text-link">${faceDisplayName}</a>`)

            if (faceId == '75') {
                returnText = text.replace(match[0], `<a href="/stupid-nalgo-${faceId}" class="text-link">${faceDisplayName}</a>`)
            }
        }
        return returnText;
    });

    

    eleventyConfig.addFilter("debug", (content) => `${inspect(content)}`);
    
    return {
        dir: {
            input: 'src',
            output: '_site',
            data: '_data',
        },
    };
};
