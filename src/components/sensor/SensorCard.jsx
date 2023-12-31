import { useEffect, useState, useRef } from 'react';
import {
    ProCard,
    ProForm,
    ProFormList,
    ProFormSelect,
    ProFormText,
} from '@ant-design/pro-components';
import { Radio } from 'antd';

import toast, { Toaster } from 'react-hot-toast';
import SensorStore, { updateSensor } from '../../store/SensorStore';
import { useSnapshot } from 'valtio';
import { findDangling } from '../../utils/handleDampling';
import { invoke } from '@tauri-apps/api/tauri';
import { withTranslation } from 'react-i18next';
import { useTranslation } from 'react-i18next';
import { Trans } from 'react-i18next';
import SensorConfig from './SensorConfig';

const SensorCard = () => {
    const [eulerDisplay, setEulerDisplay] = useState('');
    const [quaternionDisplay, setQuaternionDisplay] = useState('hidden');

    const { sensorList } = useSnapshot(SensorStore);

    const eulerFormRef = useRef();
    const quaternionFormRef = useRef();

    const { t, i18n } = useTranslation();

    const sensorShowError = sensor => {
        const danglingList = sensor.toString();
        const msg = t('card_ref_error');
        toast.error(`${danglingList} ${msg}`, {
            position: 'top-right',
            duration: 6000,
        });
    };

    const handleChange = e => {
        if (e.target.value == 'euler') {
            setEulerDisplay('');
            setQuaternionDisplay('hidden');
        } else {
            setEulerDisplay('hidden');
            setQuaternionDisplay('');
        }
    };

    useEffect(() => {
        if (sensorList.length > 0) {
            if (sensorList[0].hasOwnProperty('yaw')) {
                eulerFormRef.current.setFieldsValue({ eulerAttributes: sensorList });
            } else if (sensorList[0].hasOwnProperty('q_x')) {
                quaternionFormRef.current.setFieldsValue({ quaternionAttributes: sensorList });
            }
        }
    }, [sensorList]);

    return (
        <>
            <Toaster />
            <div className="flex justify-center items-center mb-4">
                <Radio.Group defaultValue={'euler'} onChange={handleChange}>
                    <Radio value={'euler'}>{t('card_euler')}</Radio>
                    <Radio value={'quaternion'}>{t('card_quaternion')}</Radio>
                </Radio.Group>
                <SensorConfig />
            </div>

            <ProForm
                formRef={eulerFormRef}
                className={eulerDisplay}
                layout="horizontal"
                onFinish={async values => {
                    let sensorList = values.eulerAttributes;
                    sensorList[0]['rotation_type'] = 'euler';
                    updateSensor(sensorList);
                    const danglingList = findDangling(sensorList);
                    if (danglingList.length > 0) {
                        sensorShowError(danglingList);
                    }
                    invoke('save_sensor_state', {
                        sensor_list: JSON.stringify(values.eulerAttributes),
                        rotation_type: 'euler',
                    });
                }}
                submitter={{
                    searchConfig: {
                        submitText: t('card_save'),
                    },
                    submitButtonProps: {
                        style: {
                            marginBottom: 5,
                        },
                    },
                    resetButtonProps: {
                        style: {
                            display: 'none',
                        },
                    },
                }}
            >
                <ProFormList
                    name="eulerAttributes"
                    label={t('card_sensor_lable')}
                    creatorButtonProps={{
                        creatorButtonText: t('card_create_sensor'),
                    }}
                    min={1}
                    itemRender={({ listDom, action }, { index }) => (
                        <ProCard
                            style={{ marginBlockEnd: 8 }}
                            title={`sensor${index + 1}`}
                            extra={action}
                            bodyStyle={{ paddingBlockEnd: 0 }}
                        >
                            {listDom}
                        </ProCard>
                    )}
                    creatorRecord={{
                        name: null,
                        sensor_type: null,
                        ref_point: 'chassis',
                        x: null,
                        y: null,
                        z: null,
                        yaw: null,
                        pitch: null,
                        roll: null,
                    }}
                    initialValue={[
                        {
                            name: null,
                            sensor_type: null,
                            ref_point: 'chassis',
                            x: null,
                            y: null,
                            z: null,
                            yaw: null,
                            pitch: null,
                            roll: null,
                        },
                    ]}
                >
                    <ProFormText
                        labelCol={{ span: 9 }}
                        name="name"
                        placeholder=""
                        label={t('card_sensor_name')}
                        rules={[
                            { required: true, message: <Trans i18nKey="card_sensor_name_rule" /> },
                        ]}
                    />
                    <ProFormSelect
                        labelCol={{ span: 9 }}
                        name="sensor_type"
                        placeholder=""
                        label={t('card_sensor_type')}
                        options={['camera', 'lidar', 'radar', 'imu']}
                        rules={[
                            { required: true, message: <Trans i18nKey="card_sensor_type_rule" /> },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 9 }}
                        name="ref_point"
                        label={t('card_ref_name')}
                        rules={[
                            { required: true, message: <Trans i18nKey="card_ref_name_rule" /> },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 9 }}
                        name="x"
                        placeholder=""
                        label={t('card_x')}
                        rules={[
                            {
                                required: true,
                                pattern: /[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?/,
                                message: <Trans i18nKey="card_numeric_rule" />,
                            },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 9 }}
                        name="y"
                        placeholder=""
                        label={t('card_y')}
                        rules={[
                            {
                                required: true,
                                pattern: /[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?/,
                                message: <Trans i18nKey="card_numeric_rule" />,
                            },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 9 }}
                        name="z"
                        placeholder=""
                        label={t('card_z')}
                        rules={[
                            {
                                required: true,
                                pattern: /[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?/,
                                message: <Trans i18nKey="card_numeric_rule" />,
                            },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 9 }}
                        name="yaw"
                        placeholder=""
                        label={t('card_yaw')}
                        rules={[
                            {
                                required: true,
                                pattern: /[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?/,
                                message: <Trans i18nKey="card_numeric_rule" />,
                            },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 9 }}
                        name="pitch"
                        placeholder=""
                        label={t('card_pitch')}
                        rules={[
                            {
                                required: true,
                                pattern: /[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?/,
                                message: <Trans i18nKey="card_numeric_rule" />,
                            },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 9 }}
                        name="roll"
                        placeholder=""
                        label={t('card_roll')}
                        rules={[
                            {
                                required: true,
                                pattern: /[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?/,
                                message: <Trans i18nKey="card_numeric_rule" />,
                            },
                        ]}
                    />
                </ProFormList>
            </ProForm>

            <ProForm
                formRef={quaternionFormRef}
                className={quaternionDisplay}
                layout="horizontal"
                onFinish={async values => {
                    let sensorList = values.quaternionAttributes;
                    sensorList[0]['rotation_type'] = 'quaternion';
                    updateSensor(sensorList);
                    invoke('save_sensor_state', {
                        sensor_list: JSON.stringify(values.quaternionAttributes),
                        rotation_type: 'quaternion',
                    });
                    const danglingList = findDangling(sensorList);
                    if (danglingList.length > 0) {
                        sensorShowError(danglingList);
                    }
                }}
                submitter={{
                    searchConfig: {
                        submitText: t('card_save'),
                    },
                    submitButtonProps: {
                        style: {
                            marginBottom: 5,
                        },
                    },
                    resetButtonProps: {
                        style: {
                            display: 'none',
                        },
                    },
                }}
            >
                <ProFormList
                    name="quaternionAttributes"
                    label={t('card_sensor_lable')}
                    creatorButtonProps={{
                        creatorButtonText: t('card_create_sensor'),
                    }}
                    min={1}
                    itemRender={({ listDom, action }, { index }) => (
                        <ProCard
                            style={{ marginBlockEnd: 8 }}
                            title={`sensor${index + 1}`}
                            extra={action}
                            bodyStyle={{ paddingBlockEnd: 0 }}
                        >
                            {listDom}
                        </ProCard>
                    )}
                    creatorRecord={{
                        name: null,
                        sensor_type: null,
                        ref_point: 'chassis',
                        x: null,
                        y: null,
                        z: null,
                        q_x: null,
                        q_y: null,
                        q_z: null,
                        q_w: null,
                    }}
                    initialValue={[
                        {
                            name: null,
                            sensor_type: null,
                            ref_point: 'chassis',
                            x: null,
                            y: null,
                            z: null,
                            q_x: null,
                            q_y: null,
                            q_z: null,
                            q_w: null,
                        },
                    ]}
                >
                    <ProFormText
                        labelCol={{ span: 9 }}
                        name="name"
                        placeholder=""
                        label={t('card_sensor_name')}
                        rules={[
                            { required: true, message: <Trans i18nKey="card_sensor_name_rule" /> },
                        ]}
                    />
                    <ProFormSelect
                        labelCol={{ span: 9 }}
                        name="sensor_type"
                        placeholder=""
                        label={t('card_sensor_type')}
                        options={['camera', 'lidar', 'radar', 'imu']}
                        rules={[
                            { required: true, message: <Trans i18nKey="card_sensor_type_rule" /> },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 9 }}
                        name="ref_point"
                        label={t('card_ref_name')}
                        rules={[
                            { required: true, message: <Trans i18nKey="card_ref_name_rule" /> },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 9 }}
                        name="x"
                        placeholder=""
                        label={t('card_x')}
                        rules={[
                            {
                                required: true,
                                pattern: /[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?/,
                                message: <Trans i18nKey="card_numeric_rule" />,
                            },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 9 }}
                        name="y"
                        placeholder=""
                        label={t('card_y')}
                        rules={[
                            {
                                required: true,
                                pattern: /[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?/,
                                message: <Trans i18nKey="card_numeric_rule" />,
                            },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 9 }}
                        name="z"
                        placeholder=""
                        label={t('card_z')}
                        rules={[
                            {
                                required: true,
                                pattern: /[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?/,
                                message: <Trans i18nKey="card_numeric_rule" />,
                            },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 9 }}
                        name="q_x"
                        placeholder=""
                        label={t('card_q_x')}
                        rules={[
                            {
                                required: true,
                                pattern: /[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?/,
                                message: <Trans i18nKey="card_numeric_rule" />,
                            },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 9 }}
                        name="q_y"
                        placeholder=""
                        label={t('card_q_y')}
                        rules={[
                            {
                                required: true,
                                pattern: /[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?/,
                                message: <Trans i18nKey="card_numeric_rule" />,
                            },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 9 }}
                        name="q_z"
                        placeholder=""
                        label={t('card_q_z')}
                        rules={[
                            {
                                required: true,
                                pattern: /[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?/,
                                message: <Trans i18nKey="card_numeric_rule" />,
                            },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 9 }}
                        name="q_w"
                        placeholder=""
                        label={t('card_q_w')}
                        rules={[
                            {
                                required: true,
                                pattern: /[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?/,
                                message: <Trans i18nKey="card_numeric_rule" />,
                            },
                        ]}
                    />
                </ProFormList>
            </ProForm>
        </>
    );
};

export default withTranslation()(SensorCard);
