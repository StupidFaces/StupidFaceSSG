module.exports = {
    eleventyComputed: {
        titleTag: (data) => (data.adoptionName ? `${data.adoptionName} - ${data.title}` : data.title),
        id: (data) => data.page.fileSlug.split('-')[2],
    },
};
