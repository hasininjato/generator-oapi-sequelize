module.exports = (model) => ({
    [model]: {  // Dynamic key based on --model
        collectionOperations: {
            get: {
                openapi_context: {
                    summary: `List all ${model.toLowerCase()}s`, // Dynamic summary
                    description: `Returns a list of ${model.toLowerCase()}s`
                },
                output: [`${model.toLowerCase()}:list`]
            },
            post: {
                openapi_context: {
                    summary: `Create a ${model.toLowerCase()}`,
                    description: `Creates a new ${model.toLowerCase()}`
                },
                input: [`${model.toLowerCase()}:post`],
                output: [`${model.toLowerCase()}:item`]
            }
        },
        itemOperations: {
            get: {
                openapi_context: {
                    summary: `Get a ${model.toLowerCase()} by ID`,
                    description: `Returns a ${model.toLowerCase()} by ID`
                },
                output: [`${model.toLowerCase()}:item`]
            },
            put: {
                openapi_context: {
                    summary: `Update a ${model.toLowerCase()} by ID`,
                    description: `Updates a ${model.toLowerCase()} by ID`
                },
                input: [`${model.toLowerCase()}:put`],
                output: [`${model.toLowerCase()}:item`]
            },
            delete: {
                openapi_context: {
                    summary: `Delete a ${model.toLowerCase()} by ID`,
                    description: `Deletes a ${model.toLowerCase()} by ID`
                }
            }
        }
    }
});