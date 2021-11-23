module.exports = {
    eleventyComputed: {
        titleTag: (data) => (data.adoptionName ? `${data.adoptionName} - ${data.title}` : data.title),
    },
};
