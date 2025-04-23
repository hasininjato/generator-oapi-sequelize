const serviceCollectionWithCustomExpectedResult = {
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
    "custom": {
        "/custom/path": {
            "get": {
                "summary": "Custom path",
                "description": "Custom path",
                "tags": "Custom path"
            }
        }
    }
}

module.exports = serviceCollectionWithCustomExpectedResult;