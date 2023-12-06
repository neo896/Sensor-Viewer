import { Canvas } from '@react-three/fiber';
import { Leva } from 'leva';
import Viewer from './components/Viewer';
import Panel from './components/Panel';
import SensorTree from './components/sensor/SensorTree';
import { Trans } from 'react-i18next';
import { withTranslation } from 'react-i18next';

const App = () => {
    return (
        <div className="flex">
            <div className="h-screen w-1/6 my-0">
                <SensorTree />
            </div>
            <div className="h-screen flex-1 overflow-hidden bg-black my-0">
                <Leva
                    titleBar={{
                        title: <Trans i18nKey="leva_toolbox" />,
                        position: { x: -500, y: 30 },
                    }}
                />
                <Canvas camera={{ position: [0, 0, 0.5] }}>
                    <Viewer />
                </Canvas>
            </div>
            <div className="h-screen w-1/4 bg-gray-300 my-0">
                <Panel />
            </div>
        </div>
    );
};

export default withTranslation()(App);
