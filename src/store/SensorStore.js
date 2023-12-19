import { proxy } from 'valtio';

const SensorStore = proxy({
    sensorList: [],
    pcdList: []
});

export const updateSensor = sensor => {
    SensorStore.sensorList = [...sensor];
};

export const updatePcd = pcd => {
    SensorStore.pcdList = [...pcd];
};

export default SensorStore;
