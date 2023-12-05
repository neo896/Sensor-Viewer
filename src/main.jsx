import React from 'react';
import ReactDOM from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { Leva } from 'leva';

import Viewer from './components/Viewer';
import Panel from './components/Panel';
import SensorTree from './components/sensor/SensorTree';
import { window } from '@tauri-apps/api';
import { confirm, save, message } from '@tauri-apps/api/dialog';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/tauri';
import { register } from '@tauri-apps/api/globalShortcut';

import './styles.scss';

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

    invoke('save_yaml', { file_path: fileNameWithExtension }).catch(err =>
        message('无数据可保存', { title: 'Sensor-Viewer', type: 'warning' })
    );
};

listen('save_yaml', event => {
    saveYaml();
});

register('Shift+Control+S', () => {
    saveYaml();
});

window.getCurrent().listen('tauri://close-requested', async function (event) {
    const confirmed = await confirm('传感器配置是否保存？如未保存，请点击另存为进行配置保存', {
        okLabel: '是',
        cancelLabel: '否',
    });
    if (confirmed) {
        window.getCurrent().close();
    }
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <div className="flex">
        <div className="h-screen w-1/6 my-0">
            <SensorTree />
        </div>
        <div className="h-screen flex-1 overflow-hidden bg-black my-0">
            <Leva titleBar={{ title: '工具箱', position: { x: -400, y: 30 } }} />
            <Canvas camera={{ position: [0, 0, 0.5] }}>
                <Viewer />
            </Canvas>
        </div>
        <div className="h-screen w-1/5 bg-gray-300 my-0">
            <Panel />
        </div>
    </div>
);
