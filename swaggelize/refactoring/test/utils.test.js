const {
    readFileContent,
    getFileInDirectory,
    getMethodsFromComment,
    getDescriptionFromComment, capitalizeFirstLetter, transformStr
} = require("../src/utils/utils");

const swagComment = `
/**
 * @swag
 * methods: item, list, post, put
 * description: Id of the user
 */
`

describe('utils functions', () => {
    it('read content of a file', () => {
        expect(readFileContent('refactoring/test/contentTest.txt')).toBe('test content');
    })

    it('get files in a directory', () => {
        expect(getFileInDirectory('refactoring/src/utils')).toStrictEqual(["constants.js", "utils.js"]);
    })

    it('get methods from comment', () => {
        expect(getMethodsFromComment(swagComment)).toStrictEqual(["item", "list", "post", "put"])
    })

    it('get description from comment', () => {
        expect(getDescriptionFromComment(swagComment)).toBe("Id of the user")
    })

    it('captialize first letter', () => {
        expect(capitalizeFirstLetter('test')).toBe('Test')
    })

    it('pascal case, get prefix and suffix', () => {
        expect(transformStr('user:item')).toStrictEqual({pascalCase: 'UserItem', prefix: 'user', suffix: 'item'})
    })
})