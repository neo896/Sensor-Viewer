import { Tabs, FloatButton } from 'antd';
import SensorCard from './SensorCard';
import SensorConfig from './SensorConfig';
import { withTranslation } from 'react-i18next';
import { useTranslation } from 'react-i18next';
import {
    SettingOutlined,
    ExportOutlined,
    TranslationOutlined,
    GithubOutlined,
} from '@ant-design/icons';
import { save, message } from '@tauri-apps/api/dialog';
import { open } from '@tauri-apps/api/shell';
import Pcd from './Pcd';

const SensorTabs = () => {
    const { t, i18n } = useTranslation();

    const saveYaml = async () => {
        const filePath = await save({
            filters: [
                {
                    name: 'Yaml',
                    extensions: ['yaml'],
                },
            ],
        });

        const fileNameWithExtension = filePath.endsWith('.yaml') ? filePath : `${filePath}.yaml`;

        const msg = t('card_save_yaml_error');
        invoke('save_yaml', { file_path: fileNameWithExtension }).catch(err =>
            message(msg, { title: 'Sensor-Viewer', type: 'warning' })
        );
    };

    const changeLanguage = () => {
        i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en');
    };

    const items = [
        {
            key: '1',
            label: t('tabs_manual'),
            children: <SensorCard />,
        },
        {
            key: '2',
            label: t('tabs_config'),
            children: <SensorConfig />,
        },
        {
            key: '3',
            label: t('tabs_pcd'),
            children: <Pcd />,
        },
    ];

    return (
        <>
            <Tabs defaultActiveKey="1" items={items} centered />
            <FloatButton.Group
                trigger="hover"
                icon={<SettingOutlined />}
                type="primary"
                tooltip={<div>{t('float_bt_settings')}</div>}
            >
                <FloatButton
                    icon={<ExportOutlined />}
                    tooltip={<div>{t('float_bt_save_as')}</div>}
                    onClick={saveYaml}
                />
                <FloatButton
                    icon={<TranslationOutlined />}
                    tooltip={<div>{t('float_bt_switch_lan')}</div>}
                    onClick={changeLanguage}
                />
                <FloatButton
                    icon={<GithubOutlined />}
                    tooltip={<div>{t('float_bt_github')}</div>}
                    onClick={() => open('https://github.com/neo896/Sensor-Viewer/')}
                />
            </FloatButton.Group>
        </>
    );
};

export default withTranslation()(SensorTabs);
