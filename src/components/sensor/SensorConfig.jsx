import { Button, Tooltip } from 'antd';
import { LoginOutlined, LogoutOutlined } from '@ant-design/icons';
import { open, save, message } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api/tauri';
import { updateSensor } from '../../store/SensorStore';
import { findDangling } from '../../utils/handleDampling';
import toast, { Toaster } from 'react-hot-toast';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import { withTranslation } from 'react-i18next';
import { useTranslation } from 'react-i18next';
import { Trans } from 'react-i18next';

const ajv = new Ajv();

const schemaE = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'array',
    items: {
        type: 'object',
        properties: {
            frame_id: {
                type: 'string',
            },
            reference_frame_id: {
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
                            yaw: {
                                type: 'number',
                            },
                            pitch: {
                                type: 'number',
                            },
                            roll: {
                                type: 'number',
                            },
                        },
                        required: ['yaw', 'pitch', 'roll'],
                    },
                },
                required: ['translation', 'rotation'],
            },
        },
        required: ['frame_id', 'reference_frame_id', 'transform'],
    },
};

const schemaQ = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'array',
    items: {
        type: 'object',
        properties: {
            frame_id: {
                type: 'string',
            },
            reference_frame_id: {
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
        required: ['frame_id', 'reference_frame_id', 'transform'],
    },
};

const SensorConfig = () => {
    const { t, i18n } = useTranslation();
    const danglingMsg = <Trans i18nKey="card_ref_error" />;
    const yamlErrorMsg = <Trans i18nKey="yaml_error" />;
    const yamlSchemaErrorMsg = <Trans i18nKey="yaml_schema_error" />;

    const sensorShowError = sensor => {
        const danglingList = sensor.toString();
        toast.error(`${danglingList} ${danglingMsg}`, {
            position: 'top-right',
            duration: 6000,
        });
    };

    const openFile = async () => {
        const selected = await open({
            multiple: false,
            filters: [
                {
                    name: 'Yaml',
                    extensions: ['yaml', 'yml'],
                },
            ],
        });
        invoke('read_yaml', { yaml_path: String(selected) }).then(v => {
            try {
                const data = yaml.load(v);
                const validateE = ajv.compile(schemaE);
                const validE = validateE(data);
                const validateQ = ajv.compile(schemaQ);
                const validQ = validateQ(data);
                if (validE || validQ) {
                    let sensors = [];
                    data.forEach((v, i) => {
                        let tmp = {};
                        tmp['name'] = v.frame_id;
                        tmp['sensor_type'] = v.sensor_type;
                        tmp['ref_point'] = v.reference_frame_id;
                        tmp['x'] = v['transform']['translation'].x;
                        tmp['y'] = v['transform']['translation'].y;
                        tmp['z'] = v['transform']['translation'].z;
                        if ('yaw' in v['transform']['rotation']) {
                            tmp['rotation_type'] = 'euler';
                            tmp['yaw'] = v['transform']['rotation'].yaw;
                            tmp['pitch'] = v['transform']['rotation'].pitch;
                            tmp['roll'] = v['transform']['rotation'].roll;
                        } else {
                            tmp['rotation_type'] = 'quaternion';
                            tmp['q_x'] = v['transform']['rotation'].x;
                            tmp['q_y'] = v['transform']['rotation'].y;
                            tmp['q_z'] = v['transform']['rotation'].z;
                            tmp['q_w'] = v['transform']['rotation'].w;
                        }
                        sensors.push(tmp);
                    });
                    const danglingList = findDangling(sensors);
                    if (danglingList.length > 0) {
                        sensorShowError(danglingList);
                    }
                    updateSensor(sensors);
                } else {
                    toast.error(yamlSchemaErrorMsg, {
                        position: 'top-right',
                        duration: 6000,
                    });
                }
            } catch (e) {
                toast.error(yamlErrorMsg, {
                    position: 'top-right',
                    duration: 6000,
                });
            }
        });
    };

    const saveYaml = async () => {
        const filePath = await save({
            filters: [
                {
                    name: 'Yaml',
                    extensions: ['yaml'],
                },
            ],
        });

        if (filePath) {
            const fileNameWithExtension = filePath.endsWith('.yaml')
                ? filePath
                : `${filePath}.yaml`;

            const msg = t('card_save_yaml_error');
            invoke('save_yaml', { file_path: fileNameWithExtension }).catch(err =>
                message(msg, { title: 'Sensor-Viewer', type: 'warning' })
            );
        }
    };

    return (
        <div>
            <Toaster />
            <Tooltip title={<Trans i18nKey="btn_import_yaml" />}>
                <Button type="text" onClick={openFile} icon={<LoginOutlined />}></Button>
            </Tooltip>
            <Tooltip title={<Trans i18nKey="btn_export_yaml" />}>
                <Button type="text" onClick={saveYaml} icon={<LogoutOutlined />}></Button>
            </Tooltip>
        </div>
    );
};

export default withTranslation()(SensorConfig);
