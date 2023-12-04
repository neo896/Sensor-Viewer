import yaml from 'js-yaml';
import Ajv from 'ajv';

const ajv = new Ajv();

let v = `
- sensor_name: CAM_INSIDE_DRIVER
  reference_sensor_name: LDR_FRONT_RIGHT
  transform:
    translation:
      x: -1.64141841467
      y: -0.445115868544
      z: -1.44456005613
    rotation:
      x: -0.617790534391
      y: 0.341020163922
      z: -0.339632090994
      w: 0.621844149431
- sensor_name: CAM_PBQ_FRONT_LEFT
  reference_sensor_name: LDR_FRONT_LEFT
  transform:
    translation:
      x: -0.00939999649542
      y: 0.0980000132531
      z: -0.0106999663806
    rotation:
      x: -0.662252442078
      y: 0.434908515513
      z: -0.345898927788
      w: 0.50262333596
`;
const data = yaml.load(v);
const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'array',
    items: {
        type: 'object',
        properties: {
            sensor_name: {
                type: 'string',
            },
            reference_sensor_name: {
                type: 'string',
            },
            transform: {
                type: 'object',
                properties: {
                    translation: {
                        type: 'object',
                        properties: {
                            x: {
                                type: 'number',
                            },
                            y: {
                                type: 'number',
                            },
                            z: {
                                type: 'number',
                            },
                        },
                        required: ['x', 'y', 'z'],
                    },
                    rotation: {
                        type: 'object',
                        properties: {
                            x: {
                                type: 'number',
                            },
                            y: {
                                type: 'number',
                            },
                            z: {
                                type: 'number',
                            },
                            w: {
                                type: 'number',
                            },
                        },
                        required: ['x', 'y', 'z', 'w'],
                    },
                },
                required: ['translation', 'rotation'],
            },
        },
        required: ['sensor_name', 'reference_sensor_name', 'transform'],
    },
};

const validate = ajv.compile(schema);
const valid = validate(data);

if (!valid) console.log(validate.errors);
