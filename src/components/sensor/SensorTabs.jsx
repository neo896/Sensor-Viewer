import { Tabs, FloatButton } from 'antd';
import SensorCard from './SensorCard';
import { withTranslation } from 'react-i18next';
import { useTranslation } from 'react-i18next';
import {
    QuestionCircleOutlined,
    ReadOutlined,
    YoutubeOutlined,
    TranslationOutlined,
    GithubOutlined,
} from '@ant-design/icons';
import { open } from '@tauri-apps/api/shell';
import PcdConfig from './PcdConfig';

const SensorTabs = () => {
    const { t, i18n } = useTranslation();

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
            label: t('tabs_pcd'),
            children: <PcdConfig />,
        },
    ];

    return (
        <>
            <Tabs defaultActiveKey="1" items={items} centered />
            <FloatButton
                style={{ right: 94 }}
                icon={<TranslationOutlined />}
                tooltip={<div>{t('float_bt_switch_lan')}</div>}
                onClick={changeLanguage}
            />
            <FloatButton.Group
                trigger="hover"
                icon={<QuestionCircleOutlined />}
                type="primary"
                tooltip={<div>{t('float_bt_links')}</div>}
            >
                <FloatButton
                    icon={<ReadOutlined />}
                    tooltip={<div>{t('float_bt_doc')}</div>}
                    onClick={() => open('https://neo896.github.io/Sensor-Viewer-Doc')}
                />
                <FloatButton
                    icon={<YoutubeOutlined />}
                    tooltip={<div>{t('float_bt_vedio')}</div>}
                    onClick={() =>
                        open(
                            'https://www.bilibili.com/video/BV1vC4y1F7iQ/?vd_source=f768335decb84d12fd31da8d3a1fc160'
                        )
                    }
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
