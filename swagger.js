const swaggerJSDoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Todo API",
            version: "1.0.0",
            description: "La To Do app de la Team NOBLE!",
        },
        servers: [
            { url: `http://localhost:${process.env.PORT || 3000}`, },
        ],
    },
    apis: ["./routes/*.js", "./app.js"],
};

module.exports = swaggerJSDoc(options);