import { useState } from 'react';
import {
    ProCard,
    ProForm,
    ProFormList,
    ProFormSelect,
    ProFormText,
} from '@ant-design/pro-components';
import { Radio, FloatButton } from 'antd';
import toast, { Toaster } from 'react-hot-toast';
import { updateSensor } from '../../store/SensorStore';
import { findDangling } from '../../utils/handleDampling';
import { invoke } from '@tauri-apps/api/tauri';

const SensorCard = () => {
    const [eulerDisplay, setEulerDisplay] = useState('');
    const [quaternionDisplay, setQuaternionDisplay] = useState('hidden');

    const sensorShowError = sensor => {
        const danglingList = sensor.toString();
        toast.error(`${danglingList}无法预览，请检查参考点是否匹配正确`, {
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

    return (
        <>
            <Toaster />
            <div className="text-center mb-4">
                <Radio.Group defaultValue={'euler'} onChange={handleChange}>
                    <Radio value={'euler'}>欧拉</Radio>
                    <Radio value={'quaternion'}>四元数</Radio>
                </Radio.Group>
            </div>

            <ProForm
                className={eulerDisplay}
                layout="horizontal"
                onFinish={async values => {
                    let sensorList = values.attributes;
                    sensorList[0]['rotation_type'] = 'euler';
                    updateSensor(sensorList);
                    invoke('save_sensor_state', {
                        sensor_list: JSON.stringify(values.attributes),
                        rotation_type: 'euler',
                    });
                    const danglingList = findDangling(sensorList);
                    if (danglingList.length > 0) {
                        sensorShowError(danglingList);
                    }
                }}
                submitter={{
                    searchConfig: {
                        submitText: '保存',
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
                    name="attributes"
                    label="传感器"
                    creatorButtonProps={{
                        creatorButtonText: '添加传感器',
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
                        labelCol={{ span: 8 }}
                        name="name"
                        label="传感器名称"
                        rules={[{ required: true, message: '必填，请输入传感器名称' }]}
                    />
                    <ProFormSelect
                        labelCol={{ span: 8 }}
                        name="sensor_type"
                        label="传感器类型"
                        options={['Camera', 'Lidar', 'Radar', 'IMU/GNSS']}
                        rules={[{ required: true, message: '必填，请选择传感器类型' }]}
                    />
                    <ProFormText
                        labelCol={{ span: 8 }}
                        name="ref_point"
                        label="参考点名称"
                        rules={[{ required: true }]}
                    />
                    <ProFormText
                        labelCol={{ span: 8 }}
                        name="x"
                        label="平移x"
                        rules={[
                            {
                                required: true,
                                pattern: '[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?',
                                message: '必填，且为数字类型',
                            },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 8 }}
                        name="y"
                        label="平移y"
                        rules={[
                            {
                                required: true,
                                pattern: '[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?',
                                message: '必填，且为数字类型',
                            },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 8 }}
                        name="z"
                        label="平移z"
                        rules={[
                            {
                                required: true,
                                pattern: '[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?',
                                message: '必填，且为数字类型',
                            },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 8 }}
                        name="yaw"
                        label="yaw"
                        rules={[
                            {
                                required: true,
                                pattern: '[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?',
                                message: '必填，且为数字类型',
                            },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 8 }}
                        name="pitch"
                        label="pitch"
                        rules={[
                            {
                                required: true,
                                pattern: '[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?',
                                message: '必填，且为数字类型',
                            },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 8 }}
                        name="roll"
                        label="roll"
                        rules={[
                            {
                                required: true,
                                pattern: '[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?',
                                message: '必填，且为数字类型',
                            },
                        ]}
                    />
                </ProFormList>
            </ProForm>

            <ProForm
                className={quaternionDisplay}
                layout="horizontal"
                onFinish={async values => {
                    let sensorList = values.attributes;
                    sensorList[0]['rotation_type'] = 'quaternion';
                    updateSensor(sensorList);
                    invoke('save_sensor_state', {
                        sensor_list: JSON.stringify(values.attributes),
                        rotation_type: 'quaternion',
                    });
                    const danglingList = findDangling(sensorList);
                    if (danglingList.length > 0) {
                        sensorShowError(danglingList);
                    }
                }}
                submitter={{
                    searchConfig: {
                        submitText: '保存',
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
                    name="attributes"
                    label="传感器"
                    creatorButtonProps={{
                        creatorButtonText: '添加传感器',
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
                        labelCol={{ span: 8 }}
                        name="name"
                        label="传感器名称"
                        rules={[{ required: true, message: '必填，请输入传感器名称' }]}
                    />
                    <ProFormSelect
                        labelCol={{ span: 8 }}
                        name="sensor_type"
                        label="传感器类型"
                        options={['Camera', 'Lidar', 'Radar', 'GNSS/IMU']}
                        rules={[{ required: true, message: '必填，请选择传感器类型' }]}
                    />
                    <ProFormText
                        labelCol={{ span: 8 }}
                        name="ref_point"
                        label="参考点名称"
                        rules={[{ required: true }]}
                    />
                    <ProFormText
                        labelCol={{ span: 8 }}
                        name="x"
                        label="平移x"
                        rules={[
                            {
                                required: true,
                                pattern: '[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?',
                                message: '必填，且为数字类型',
                            },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 8 }}
                        name="y"
                        label="平移y"
                        rules={[
                            {
                                required: true,
                                pattern: '[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?',
                                message: '必填，且为数字类型',
                            },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 8 }}
                        name="z"
                        label="平移z"
                        rules={[
                            {
                                required: true,
                                pattern: '[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?',
                                message: '必填，且为数字类型',
                            },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 8 }}
                        name="q_x"
                        label="四元数x"
                        rules={[
                            {
                                required: true,
                                pattern: '[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?',
                                message: '必填，且为数字类型',
                            },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 8 }}
                        name="q_y"
                        label="四元数y"
                        rules={[
                            {
                                required: true,
                                pattern: '[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?',
                                message: '必填，且为数字类型',
                            },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 8 }}
                        name="q_z"
                        label="四元数z"
                        rules={[
                            {
                                required: true,
                                pattern: '[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?',
                                message: '必填，且为数字类型',
                            },
                        ]}
                    />
                    <ProFormText
                        labelCol={{ span: 8 }}
                        name="q_w"
                        label="四元数w"
                        rules={[
                            {
                                required: true,
                                pattern: '[+-]?(?:0|[1-9]d*)(?:.d*)?(?:[eE][+-]?d+)?',
                                message: '必填，且为数字类型',
                            },
                        ]}
                    />
                </ProFormList>
            </ProForm>
            <FloatButton type="primary" onClick={() => console.log('onClick')} />
        </>
    );
};

export default SensorCard;
