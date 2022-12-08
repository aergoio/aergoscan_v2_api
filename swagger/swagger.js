const swaggerUi = require("swagger-ui-express")
const swaggerJsDoc = require("swagger-jsdoc")

const options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "aergoscan API",
            description: "aergoscan API document",
        },
        servers: [
            {
                url: "http://localhost:3000/api-docs",

            },
        ],
    },
    apis: [__dirname+'/../src/api/v2/*.js', __dirname+'/../src/api/v1/*.js'],
}

const specs = swaggerJsDoc(options)

module.exports = { swaggerUi, specs}