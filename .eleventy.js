const htmlmin = require('html-minifier');
const dateFns = require('date-fns');
const lazyImagesPlugin = require('eleventy-plugin-lazyimages');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

module.exports = function (eleventyConfig) {
    eleventyConfig.addPlugin(syntaxHighlight);

    eleventyConfig.addPlugin(lazyImagesPlugin, {
        transformImgPath: (imgPath) => {
            if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
                // Handle remote file
                return imgPath;
            } else {
                return `./src/${imgPath}`;
            }
        },
    });

    eleventyConfig.setEjsOptions({
        rmWhitespace: true,
        context: {
            dateFns,
        },
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

    eleventyConfig.addFilter("getFaceOfTheMonth", function(faces) {
        const currentYearMonth = new Date().toISOString().slice(0,7);
        let faceOfTheMonth = '';

        for (const face of faces) {
            if (!face.data.faceOfTheMonth) {
                continue
            }
            for (const yearMonth of face.data.faceOfTheMonth) {
                if (yearMonth === currentYearMonth) {
                    faceOfTheMonth = face;
                }
            }
        }
        return faceOfTheMonth;
    });

    eleventyConfig.addFilter("getFaceOfTheMonthCount", function(faceOfTheMonth) {
        const currentYearMonth = new Date().toISOString().slice(0,7);
        let count = 0;
        try {
            for (const yearMonth of faceOfTheMonth) {
                if (yearMonth.toString() <= currentYearMonth) {
                    count += 1;
                }
            }
        } catch (e){}
        return count;
    });

    eleventyConfig.addFilter("isNew", function(face) {
        const faceBlockDate = new Date(face.data.date);
        let date7daysPast = new Date();
        date7daysPast.setDate(date7daysPast.getDate() - 7);
        return faceBlockDate.getTime() > date7daysPast.getTime();
    });

    eleventyConfig.addFilter("isFaceOfTheMonth", function(face) {
        if (!face.data.faceOfTheMonth) return false;
        const currentYearMonth = new Date().toISOString().slice(0,7);
        for (const yearMonth of face.data.faceOfTheMonth) {
            if (yearMonth === currentYearMonth) {
                return true;
            }
        }
        return false;
    });

    eleventyConfig.addFilter("dateToIso", function(date) {
        return date.toISOString().slice(0,10);
    });

    return {
        dir: {
            input: 'src',
            output: '_site',
            data: '_data'
        },
    };
};
