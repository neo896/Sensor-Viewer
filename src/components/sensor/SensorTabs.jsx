import { Tabs } from "antd";
import SensorCard from "./SensorCard";
import SensorConfig from "./SensorConfig";

const items = [
    {
        key: "1",
        label: "手动配置",
        children: <SensorCard />
    },
    {
        key: "2",
        label: "配置文件导入",
        children: <SensorConfig />
    },
]

const SensorTabs = () => {
    return <Tabs defaultActiveKey="1" items={items} centered />
}

export default SensorTabs;
