import 'mac-scrollbar/dist/mac-scrollbar.css';
import { MacScrollbar } from 'mac-scrollbar';
import SensorTabs from './sensor/SensorTabs';
import { withTranslation } from 'react-i18next';
import { Trans } from 'react-i18next';

const Panel = () => {
    return (
        <div className="flex flex-col h-screen">
            <div className="bg-gray-400 text-center text-lg mb-5">
                <Trans i18nKey="panel_sensor_config" />
            </div>
            <MacScrollbar className="h-full">
                <div className="mx-2 mb-2">
                    <SensorTabs />
                </div>
            </MacScrollbar>
        </div>
    );
};

export default withTranslation()(Panel);
