const modelFieldsExpectedResult = require("./expectedModelFields");
const modelFieldsWithTimeStampsExpectedResult = require("./expectedModelFieldsWithTimeStamps");
const modelOneToOneRelationExpectedResult = require("./expectedOneToOneRelation");
const modelOneToMannyRelationExpectedResult = require("./expectedOneToManyRelation");
const modelManyToMannyRelationThroughIsStringExpectedResult = require("./expectedManyToManyRelationThroughIsString");
const manyToMannyRelationThroughIsStringExpectedResult = require("./expectedThroughIsStringRelationWithFields");
const modelParserNoAssociationOneModelExpectedResult = require("./expectedModelParserNoAssociationOneModel");
const twoModelsInOneFileExpectedResult = require("./expectedTwoModelsInOneFile");
const modelManyToManyThroughIsStringExpectedResult = require("./expectedModelManyToManyThroughIsString");

module.exports = {
    modelFieldsExpectedResult,
    modelFieldsWithTimeStampsExpectedResult,
    modelOneToOneRelationExpectedResult,
    modelOneToMannyRelationExpectedResult,
    modelManyToMannyRelationThroughIsStringExpectedResult,
    manyToMannyRelationThroughIsStringExpectedResult,
    modelParserNoAssociationOneModelExpectedResult,
    twoModelsInOneFileExpectedResult,
    modelManyToManyThroughIsStringExpectedResult
};