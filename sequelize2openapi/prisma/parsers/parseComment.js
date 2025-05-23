function parseComment(text) {
    if (!text.includes("@swag")) return null;

    const result = {};
    const parts = text.replace("// @swag", "").split("|");

    for (const part of parts) {
        const [key, val] = part.split(":").map(s => s.trim());
        if (key && val) {
            result[key] = key === "methods"
                ? val.split(",").map(s => s.trim())
                : val;
        }
    }

    return result;
}

module.exports = { parseComment };
