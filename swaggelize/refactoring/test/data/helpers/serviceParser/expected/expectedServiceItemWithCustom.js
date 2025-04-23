const serviceItemWithCustomExpectedResult = {
    "default": {
        "/tests/{id}": {
            "get": {
                "summary": "Test by id",
                "description": "Test by id",
                "tags": "Test"
            },
            "put": {
                "summary": "Update a test by id",
                "description": "Update a test by id",
                "tags": "Test"
            }
        }
    },
    "custom": {
        "/test/{id}/custom": {
            "get": {
                "summary": "Custom path",
                "description": "Custom path",
                "tags": "Custom path"
            }
        }
    }
}

module.exports = serviceItemWithCustomExpectedResult;