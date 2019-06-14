module.exports = {
    opts: {
        access: 'all',
        destination: 'dist/docs/internal',
        tutorials: 'tutorials',
        recurse: true
    },
    source: {
        include: ['src'],
        exclude: ['src/vendor']
    },
    templates: {
        default: {
            outputSourceFiles: false
        }
    }
};
