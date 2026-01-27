const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const swaggerDocument = YAML.load(path.join(__dirname, 'openapi.yaml'));

const options = {
  swaggerOptions: {
    displayRequestDuration: true
  }
};

module.exports = (app) => {
  // Passe 'options' como segundo argumento no setup
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
};