const serviceCollectionNoCustomExpectedResult = {
    "default": {
        "/tags": {
            "get": {
                "summary": "List of all tags",
                "description": "List of all tags",
                "tags": "Tag"
            },
            "post": {
                "summary": "Create a tag",
                "description": "Create a tag",
                "tags": "Tag"
            }
        }
    },
    "custom": {}
}

module.exports = serviceCollectionNoCustomExpectedResult;