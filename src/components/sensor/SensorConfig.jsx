import { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { MacScrollbar } from "mac-scrollbar";
import { Button } from 'antd';
import { open } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api/tauri'
import YAML from 'yaml'
import { updateSensor } from "../../store/SensorStore"



const SensorConfig = () => {
  const [code, setCode] = useState("")
  const openFile = async() => {
    const selected = await open({
      multiple: false,
      filters: [{
        name: "Yaml",
        extensions: ["yaml", "yml"]
      }]
    });
    invoke("read_yaml", { yaml_path: String(selected)}).then((v) => {
      setCode(v)
      const data = YAML.parse(v)
      let sensors = []
      data.forEach((v,i)=> {
        let tmp = {}
        tmp["name"] = v.frame_id
        tmp["sensor_type"] = v.sensor_type
        tmp["ref_point"] = v.reference_frame_id
        tmp["x"] = v["transform"]["translation"].x
        tmp["y"] = v["transform"]["translation"].y
        tmp["z"] = v["transform"]["translation"].z
        if ("yaw" in v["transform"]["rotation"]) {
          tmp["rotation_type"] = "euler"
          tmp["yaw"] = v["transform"]["rotation"].yaw
          tmp["pitch"] = v["transform"]["rotation"].pitch
          tmp["roll"] = v["transform"]["rotation"].roll
        } else {
          tmp["rotation_type"] = "quaternion"
          tmp["q_x"] = v["transform"]["rotation"].x
          tmp["q_y"] = v["transform"]["rotation"].y
          tmp["q_z"] = v["transform"]["rotation"].z
          tmp["q_w"] = v["transform"]["rotation"].w
        }
        sensors.push(tmp)
      })
      updateSensor(sensors)
    })
    
    
  }
  
  return (
    <div className="flex flex-col">
      <Button className="mb-2" onClick={openFile}>导入配置文件</Button>
      <MacScrollbar className="h-96" >
          <SyntaxHighlighter language="yaml" style={docco} >
            {code}
          </SyntaxHighlighter>
      </MacScrollbar>
    </div>

  )
}

export default SensorConfig;
