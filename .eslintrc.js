module.exports = {
    extends: "google",
    env: {
        node: true,
    },
    parserOptions: {
        ecmaVersion: 2017,
        sourceType: 'module'
    },
    rules: {
        'max-len': ["error", { "code": 120 }]
    }
};