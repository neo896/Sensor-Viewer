import { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { MacScrollbar } from 'mac-scrollbar';
import { Button } from 'antd';
import { open } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api/tauri';
import { updateSensor } from '../../store/SensorStore';
import toast, { Toaster } from 'react-hot-toast';
import yaml from 'js-yaml';
import Ajv from 'ajv';

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
    const [code, setCode] = useState('');
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
            setCode(v);
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
                    updateSensor(sensors);
                } else {
                    toast.error('配置文件字段不符合格式要求', {
                        position: 'top-right',
                        duration: 6000,
                    });
                }
            } catch (e) {
                toast.error('配置文件不符合yaml语法', {
                    position: 'top-right',
                    duration: 6000,
                });
            }
        });
    };

    return (
        <div className="flex flex-col">
            <Toaster />
            <Button className="mb-2" onClick={openFile}>
                导入配置文件
            </Button>
            <MacScrollbar className="h-96">
                <SyntaxHighlighter language="yaml" style={docco}>
                    {code}
                </SyntaxHighlighter>
            </MacScrollbar>
        </div>
    );
};

export default SensorConfig;
