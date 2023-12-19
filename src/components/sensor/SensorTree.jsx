import { Tree } from 'antd';
import { useSnapshot } from 'valtio';
import SensorStore from '../../store/SensorStore';
import { findDangling } from '../../utils/handleDampling';
import { CameraSvg, LidarSvg, RadarSvg, IMUSvg } from '../svg/Sensor';
import { withTranslation } from 'react-i18next';
import { useTranslation } from 'react-i18next';

const sensorIcon = {
    Camera: <CameraSvg />,
    Lidar: <LidarSvg />,
    Radar: <RadarSvg />,
    'IMU/GNSS': <IMUSvg />,
};

const SensorTree = () => {
    const { t, i18n } = useTranslation();

    const { sensorList } = useSnapshot(SensorStore);
    let treeData = [];
    let keyIndex = [];
    const damgling = findDangling(sensorList);

    sensorList.map((item, index) => {
        let tmp = {};
        tmp['title'] = (
            <span
                style={{
                    color: damgling.includes(item.name) ? 'red' : null,
                }}
            >
                {item.name}
            </span>
        );
        tmp['key'] = `0-${index}`;
        tmp['icon'] = sensorIcon[item.sensor_type];
        if (sensorList[0]['rotation_type'] == 'euler') {
            tmp['children'] = [
                {
                    title: `${t('card_ref_name')}: ${item.ref_point}`,
                    key: `0-${index}-0`,
                    disableCheckbox: true,
                },
                {
                    title: `${t('card_x')}: ${item.x}`,
                    key: `0-${index}-1`,
                    disableCheckbox: true,
                },
                {
                    title: `${t('card_y')}: ${item.y}`,
                    key: `0-${index}-2`,
                    disableCheckbox: true,
                },
                {
                    title: `${t('card_z')}: ${item.z}`,
                    key: `0-${index}-3`,
                    disableCheckbox: true,
                },
                {
                    title: `${t('card_yaw')}: ${item.yaw}`,
                    key: `0-${index}-4`,
                    disableCheckbox: true,
                },
                {
                    title: `${t('card_pitch')}: ${item.pitch}`,
                    key: `0-${index}-5`,
                    disableCheckbox: true,
                },
                {
                    title: `${t('card_roll')}: ${item.roll}`,
                    key: `0-${index}-6`,
                    disableCheckbox: true,
                },
            ];
        } else {
            tmp['children'] = [
                {
                    title: `${t('card_ref_name')}: ${item.ref_point}`,
                    key: `0-${index}-0`,
                    disableCheckbox: true,
                },
                {
                    title: `${t('card_x')}: ${item.x}`,
                    key: `0-${index}-1`,
                    disableCheckbox: true,
                },
                {
                    title: `${t('card_y')}: ${item.y}`,
                    key: `0-${index}-2`,
                    disableCheckbox: true,
                },
                {
                    title: `${t('card_z')}: ${item.z}`,
                    key: `0-${index}-3`,
                    disableCheckbox: true,
                },
                {
                    title: `${t('card_q_x')}: ${item.q_x}`,
                    key: `0-${index}-4`,
                    disableCheckbox: true,
                },
                {
                    title: `${t('card_q_y')}: ${item.q_y}`,
                    key: `0-${index}-5`,
                    disableCheckbox: true,
                },
                {
                    title: `${t('card_q_z')}: ${item.q_z}`,
                    key: `0-${index}-6`,
                    disableCheckbox: true,
                },
                {
                    title: `${t('card_q_w')}: ${item.q_w}`,
                    key: `0-${index}-7`,
                    disableCheckbox: true,
                },
            ];
        }
        treeData.push(tmp);
        keyIndex.push(`0-${index}`);
    });

    return (
        <div className="flex flex-col h-screen">
            <div className="bg-gray-400 text-center text-lg mb-5">{t('tree_sensor_list')}</div>
            {treeData.length > 0 && (
                <Tree
                    showIcon
                    defaultCheckedKeys={keyIndex}
                    showLine
                    treeData={treeData}
                    height={(window.innerHeight * 4) / 5}
                />
            )}
        </div>
    );
};

export default withTranslation()(SensorTree);
