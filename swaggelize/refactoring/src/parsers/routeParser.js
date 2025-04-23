const {getVariablesFromPath} = require("../utils/utils");

function parseRouteParams(fullPath) {
    const paths = getVariablesFromPath(fullPath);
    if (!paths) return null; // Handle case where no params exist
    return paths.map(path => ({
        in: "path",
        name: path.param,
        schema: {
            type: "string"
        },
        required: true,
        description: `${path.lastStaticSegment} ${path.param}`
    }));
}

module.exports = parseRouteParams