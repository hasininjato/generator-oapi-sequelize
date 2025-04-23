const {readFileContent} = require("../src/utils/utils");
const {parseCollectionOperations, getModelName, parseItemOperations} = require("../src/parsers/serviceParser");
const yaml = require("js-yaml");

// Import input models
const serviceCollectionNoCustomContent = readFileContent("./refactoring/test/data/helpers/serviceParser/input/service.collection.nocustom.yaml");
const serviceCollectionWithCustomContent = readFileContent("./refactoring/test/data/helpers/serviceParser/input/service.collection.withcustom.yaml");
const serviceItemWithCustomContent = readFileContent("./refactoring/test/data/helpers/serviceParser/input/service.item.withcustom.yaml");

// Parse yaml content
const serviceCollectionNoCustomContentYaml = yaml.load(serviceCollectionNoCustomContent);
const serviceCollectionWithCustomContentYaml = yaml.load(serviceCollectionWithCustomContent);
const serviceItemWithCustomContentYaml = yaml.load(serviceItemWithCustomContent);

// Import expected results
const {
    serviceCollectionNoCustomExpectedResult,
    serviceCollectionWithCustomExpectedResult,
    serviceItemWithCustomExpectedResult
} = require("./data/helpers/serviceParser/expected")

describe('service parser module', () => {
    it('extract service, get model name', () => {
        expect(getModelName(serviceCollectionNoCustomContentYaml)).toStrictEqual(["Tag"]);
    })

    it('extract service, collection operation without custom', () => {
        expect(parseCollectionOperations(serviceCollectionNoCustomContentYaml)).toStrictEqual(serviceCollectionNoCustomExpectedResult);
    })

    it('extract service, collection operation with custom', () => {
        expect(parseCollectionOperations(serviceCollectionWithCustomContentYaml)).toStrictEqual(serviceCollectionWithCustomExpectedResult);
    })

    it('extract service, item operation with custom', () => {
        expect(parseItemOperations(serviceItemWithCustomContentYaml)).toStrictEqual(serviceItemWithCustomExpectedResult);
    })
})