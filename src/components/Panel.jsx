import 'mac-scrollbar/dist/mac-scrollbar.css';
import { MacScrollbar } from 'mac-scrollbar';
import SensorTabs from './sensor/SensorTabs';

const Panel = () => {
    return (
        <div className="flex flex-col h-screen">
            <div className="bg-gray-500 text-center text-lg mb-5">传感器配置</div>
            <MacScrollbar className="h-full">
                <div className="mx-2" id="scroll">
                    <SensorTabs />
                </div>
            </MacScrollbar>
        </div>
    );
};

export default Panel;
