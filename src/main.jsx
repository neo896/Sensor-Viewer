import React from 'react';
import ReactDOM from 'react-dom/client';
import { window } from '@tauri-apps/api';
import { confirm, save, message } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api/tauri';
import { register } from '@tauri-apps/api/globalShortcut';
import App from './App';
import i18n from './i18n/i18n';

import './styles.scss';

let emptyData = i18n.t('globle_empty_data');
let closeInfo = i18n.t('globle_close_info');
let closeInfoYes = i18n.t('globle_close_yes');
let closeInfoNo = i18n.t('globle_close_no');

i18n.on('languageChanged', lng => {
    emptyData = i18n.t('globle_empty_data');
    closeInfo = i18n.t('globle_close_info');
    closeInfoYes = i18n.t('globle_close_yes');
    closeInfoNo = i18n.t('globle_close_no');
});

register('Shift+Control+S', async () => {
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
        message(emptyData, { title: 'Sensor-Viewer', type: 'warning' })
    );
});

window.getCurrent().listen('tauri://close-requested', async function (event) {
    const confirmed = await confirm(closeInfo, {
        okLabel: closeInfoYes,
        cancelLabel: closeInfoNo,
    });
    if (confirmed) {
        window.getCurrent().close();
    }
});

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
