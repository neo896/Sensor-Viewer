import { useEffect, useState } from 'react';
import { open } from '@tauri-apps/api/dialog';
import { readDir, BaseDirectory } from '@tauri-apps/api/fs';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { Button, Select, Table, ColorPicker } from 'antd';
import { EyeTwoTone, DeleteTwoTone } from '@ant-design/icons';
import { useSnapshot } from 'valtio';
import SensorStore, { updatePcd } from '../../store/SensorStore';
import { v4 as uuidv4 } from 'uuid';
import { withTranslation } from 'react-i18next';
import { Trans } from 'react-i18next';

const { Option } = Select;

const Pcd = () => {
    const { sensorList } = useSnapshot(SensorStore);
    const [pcdViewer, setPcdViewer] = useState([]);
    const [pcdTableData, setPcdTableData] = useState([]);
    const [pcdList, setPcdList] = useState({});

    let sensors = [];
    sensorList.map(item => {
        sensors.push(item.name);
    });

    const selectPcd = (v, record) => {
        const newState = pcdViewer.map(obj => {
            if (obj.key === record['key']) {
                let pcdPath = '';
                if (obj.path_.includes('/')) {
                    pcdPath = [obj.path_, v].join('/');
                } else {
                    pcdPath = [obj.path_, v].join('\\');
                }
                pcdPath = convertFileSrc(pcdPath);
                return { ...obj, path: pcdPath };
            }

            return obj;
        });
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
                return { ...obj, color: v.toHexString() };
            }
            return obj;
        });
        setPcdViewer(newState);
    };

    const columns = [
        {
            title: <Trans i18nKey="card_sensor_name" />,
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
            width: 90,
            fixed: 'right',
            render: (text, record, index) => (
                <ColorPicker
                    defaultValue={'#FFFFFF'}
                    onChangeComplete={value => selectColor(value, record)}
                />
            ),
        },
    ];

    const selectPcdPath = async () => {
        const folderPath = await open({
            multiple: true,
            directory: true,
        });
        if (folderPath.length > 0) {
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

    // const rowSelection = {
    //     onChange: (selectedRowKeys, selectedRows) => {
    //         console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    //     },
    // };

    const reset = () => {
        setPcdViewer([]);
        setPcdTableData([]);
    };

    return (
        <>
            <div className="flex justify-end mb-2">
                <Button type="primary" onClick={selectPcdPath}>
                    <Trans i18nKey="add_pcd" />
                </Button>
                <Button icon={<EyeTwoTone />} onClick={() => updatePcd(pcdViewer)}>
                    <Trans i18nKey="show_pcd" />
                </Button>
                <Button icon={<DeleteTwoTone />} onClick={reset}>
                    <Trans i18nKey="reset_pcd" />
                </Button>
            </div>
            <Table
                // rowSelection={rowSelection}
                columns={columns}
                dataSource={pcdTableData}
                scroll={{ x: 130 }}
            />
        </>
    );
};
export default withTranslation()(Pcd);
