import { useState } from 'react';
import { open } from '@tauri-apps/api/dialog';
import { readDir, BaseDirectory } from '@tauri-apps/api/fs';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { invoke } from '@tauri-apps/api/tauri';
import { message } from '@tauri-apps/api/dialog';
import { Button, Select, Table, ColorPicker, Space } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useSnapshot } from 'valtio';
import SensorStore, { updatePcd } from '../../store/SensorStore';
import { v4 as uuidv4 } from 'uuid';
import { withTranslation } from 'react-i18next';
import { Trans } from 'react-i18next';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

const PcdConfig = () => {
    const { t, i18n } = useTranslation();
    const { sensorList } = useSnapshot(SensorStore);
    const [pcdViewer, setPcdViewer] = useState([]);
    const [pcdTableData, setPcdTableData] = useState([]);
    const [pcdList, setPcdList] = useState({});

    let sensors = [];
    sensorList.map(item => {
        sensors.push(item.name);
    });

    const selectPcd = async (v, record) => {
        const promises = pcdViewer.map(async obj => {
            if (obj.key === record['key']) {
                let pcdPath = '';
                if (obj.path_.includes('/')) {
                    pcdPath = [obj.path_, v].join('/');
                } else {
                    pcdPath = [obj.path_, v].join('\\');
                }
                return invoke('check_pcd', { pcd_path: pcdPath })
                    .then(() => {
                        pcdPath = convertFileSrc(pcdPath);
                        return { ...obj, path: pcdPath };
                    })
                    .catch(() => {
                        const msg = t('pcd_load_error');
                        message(msg, { title: 'Sensor-Viewer', type: 'error' });
                        return obj;
                    });
            }

            return Promise.resolve(obj);
        });

        const newState = await Promise.all(promises);
        setPcdViewer(newState);
    };

    const selectPcdName = (v, record) => {
        const newState = pcdViewer.map(obj => {
            if (obj.key === record['key']) {
                return { ...obj, name: v };
            }

            return obj;
        });
        setPcdViewer(newState);
    };

    const selectColor = (v, record) => {
        const newState = pcdViewer.map(obj => {
            if (obj.key === record['key']) {
                return { ...obj, color: v.toRgbString() };
            }
            return obj;
        });
        setPcdViewer(newState);
    };

    const removePcd = id => {
        const a = pcdTableData.filter(item => item.id !== id);
        setPcdTableData(pcdTableData.filter(item => item.key !== id));
    };

    const columns = [
        {
            title: <Trans i18nKey="name" />,
            dataIndex: 'pcdName',
            render: (text, record, index) => (
                <Select
                    className="w-full"
                    showSearch
                    onChange={value => selectPcdName(value, record)}
                >
                    {sensors.map(option => (
                        <Select.Option key={option} value={option}>
                            {option}
                        </Select.Option>
                    ))}
                </Select>
            ),
        },
        {
            title: <Trans i18nKey="pcd_choose" />,
            dataIndex: 'pcdSelect',
            render: (text, record, index) => (
                <Select className="w-full" showSearch onChange={value => selectPcd(value, record)}>
                    {pcdList[record['key']]?.map(option => (
                        <Option key={option.name} value={option.name}>
                            {option.name}
                        </Option>
                    ))}
                </Select>
            ),
        },
        {
            title: <Trans i18nKey="color_choose" />,
            dataIndex: 'colorSelect',
            width: 70,
            render: (text, record, index) => (
                <ColorPicker
                    defaultValue={'#FFFFFF'}
                    onChangeComplete={value => selectColor(value, record)}
                />
            ),
        },
        {
            title: <Trans i18nKey="action" />,
            dataIndex: 'colorSelect',
            width: 90,
            fixed: 'right',
            render: (text, record, index) => (
                <Button
                    type="text"
                    icon={<CloseOutlined style={{ color: 'red' }} />}
                    onClick={() => removePcd(record.key)}
                />
            ),
        },
    ];

    const selectPcdPath = async () => {
        const folderPath = await open({
            multiple: true,
            directory: true,
        });
        if (folderPath) {
            let dataTmp = [];
            let pcdViewerTmp = [];
            let pcd = {};
            for (let i = 0; i < folderPath.length; i++) {
                const key = uuidv4();
                dataTmp.push({
                    key: key,
                    pcdName: '',
                    pcdSelect: '',
                    colorSelect: '',
                });
                pcdViewerTmp.push({
                    key: key,
                    name: '',
                    path: '',
                    path_: folderPath[i],
                    color: '',
                });
                const entries = await readDir(folderPath[i], {
                    dir: BaseDirectory.AppData,
                    recursive: true,
                });
                pcd[key] = entries;
            }
            setPcdTableData([...pcdTableData, ...dataTmp]);
            setPcdViewer([...pcdViewer, ...pcdViewerTmp]);
            setPcdList(pre => ({ ...pre, ...pcd }));
        }
    };

    const reset = () => {
        setPcdViewer([]);
        setPcdTableData([]);
        updatePcd([]);
    };

    return (
        <>
            <div className="flex justify-end mb-2">
                <Space>
                    <Button type="primary" onClick={selectPcdPath}>
                        <Trans i18nKey="add_pcd" />
                    </Button>
                    <Button onClick={() => updatePcd(pcdViewer)}>
                        <Trans i18nKey="show_pcd" />
                    </Button>
                    <Button onClick={reset}>
                        <Trans i18nKey="reset_pcd" />
                    </Button>
                </Space>
            </div>
            <Table
                columns={columns}
                dataSource={pcdTableData}
                scroll={{ x: 130, y: 600 }}
                pagination={false}
            />
        </>
    );
};
export default withTranslation()(PcdConfig);
