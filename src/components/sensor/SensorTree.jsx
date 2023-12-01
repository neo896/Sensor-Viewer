import { Tree } from "antd";
import { useSnapshot } from "valtio";
import SensorStore from "../../store/SensorStore";
import { findDangling } from "../../utils/handleDampling";
import { CameraSvg, LidarSvg, RadarSvg, IMUSvg } from "../svg/Sensor";

const sensorIcon = {
  "Camera": <CameraSvg />,
  "Lidar": <LidarSvg />,
  "Radar": <RadarSvg />,
  "IMU/GNSS": <IMUSvg />
}


const SensorTree = () => {
  const { sensorList } = useSnapshot(SensorStore);
  let treeData = [];
  let keyIndex = [];
  const damgling = findDangling(sensorList)

  sensorList.map((item, index) => {
    let tmp = {};
    tmp["title"] = (
      <span
        style={{
          color: damgling.includes(item.name) ? 'red' : null,
        }}
      >
        {item.name}
      </span>
    );
    tmp["key"] = `0-${index}`;
    tmp["icon"] = sensorIcon[item.sensor_type]
    if (sensorList[0]["rotation_type"] == "euler") {
      tmp["children"] = [
        {
          title: `参考点: ${item.ref_point}`,
          key: `0-${index}-0`,
          disableCheckbox: true,
        },
        {
          title: `平移x: ${item.x}`,
          key: `0-${index}-1`,
          disableCheckbox: true,
        },
        {
          title: `平移y: ${item.y}`,
          key: `0-${index}-2`,
          disableCheckbox: true,
        },
        {
          title: `平移z: ${item.z}`,
          key: `0-${index}-3`,
          disableCheckbox: true,
        },
        {
          title: `yaw: ${item.yaw}`,
          key: `0-${index}-4`,
          disableCheckbox: true,
        },
        {
          title: `pitch: ${item.pitch}`,
          key: `0-${index}-5`,
          disableCheckbox: true,
        },
        {
          title: `roll: ${item.roll}`,
          key: `0-${index}-6`,
          disableCheckbox: true,
        },
      ];
    } else {
      tmp["children"] = [
        {
          title: `参考点: ${item.ref_point}`,
          key: `0-${index}-0`,
          disableCheckbox: true,
        },
        {
          title: `平移x: ${item.x}`,
          key: `0-${index}-1`,
          disableCheckbox: true,
        },
        {
          title: `平移y: ${item.y}`,
          key: `0-${index}-2`,
          disableCheckbox: true,
        },
        {
          title: `平移z: ${item.z}`,
          key: `0-${index}-3`,
          disableCheckbox: true,
        },
        {
          title: `四元数x: ${item.q_x}`,
          key: `0-${index}-4`,
          disableCheckbox: true,
        },
        {
          title: `四元数y: ${item.q_y}`,
          key: `0-${index}-5`,
          disableCheckbox: true,
        },
        {
          title: `四元数z: ${item.q_z}`,
          key: `0-${index}-6`,
          disableCheckbox: true,
        },
        {
          title: `四元数w: ${item.q_w}`,
          key: `0-${index}-7`,
          disableCheckbox: true,
        },
      ];
    }
    treeData.push(tmp);
    keyIndex.push(`0-${index}`);
  });

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-gray-500 text-center text-lg mb-5">传感器列表</div>
      {treeData.length > 0 && (
        <Tree
          showIcon
          defaultExpandAll
          defaultCheckedKeys={keyIndex}
          showLine
          treeData={treeData}
          height={(window.innerHeight * 4) / 5}
        />
      )}
    </div>
  );
};

export default SensorTree;
