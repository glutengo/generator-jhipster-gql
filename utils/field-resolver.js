const JSON5 = require('json5');

function parseFieldResolverOptions(entityConfig) {
    entityConfig.gqlFields = [];
    entityConfig.fields.forEach(f => {
        if (f.options && f.options.gqlField) {
            try {
                const gqlField = JSON5.parse(f.options.gqlField);
                if (!gqlField.name) {
                    gqlField.name = f.fieldName;
                }
                gqlField.target = {
                    name: f.fieldName,
                    type: f.fieldType
                };
                if (!gqlField.transform) {
                    gqlField.transform = [];
                }
                if (!gqlField.args) {
                    gqlField.args = [];
                }

                gqlField.args = gqlField.args.map(a => ({ ...a, required: !!a.required, defaultValue: a.defaultValue }));
                gqlField.transform = gqlField.transform.filter(t => !!t.operation).map(t => ({ ...t, args: t.args || [] }));
                entityConfig.gqlFields.push(gqlField);
            } catch (e) {
                console.warn('Error parsing gqlField option value. Please make sure that the provided value satisfies the JSON5 format');
                console.warn(f.options.gqlField);
            }
        }
    });
}

module.exports = {
    parseFieldResolverOptions
};
