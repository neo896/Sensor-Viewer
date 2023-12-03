import { proxy } from 'valtio';

const SensorStore = proxy({
    sensorList: [],
});

export const updateSensor = sensor => {
    SensorStore.sensorList = [...sensor];
};
export default SensorStore;
