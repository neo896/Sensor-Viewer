import React, { useState, useEffect, useRef } from 'react';
import { OrbitControls, GizmoHelper, GizmoViewport, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useControls, button } from 'leva';
import { useSnapshot } from 'valtio';
import SensorStore from '../store/SensorStore';
import { findPathToTarget } from '../utils/findPathToTarget';

const basicMesh = (
    <>
        <mesh position={[0.25, 0, 0]} rotation-z={-Math.PI / 2}>
            <cylinderGeometry args={[0.025, 0.025, 0.5]} />
            <meshBasicMaterial color="red" />
        </mesh>

        <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.5]} />
            <meshBasicMaterial color="green" />
        </mesh>

        <mesh position={[0, 0, 0.25]} rotation-x={-Math.PI / 2}>
            <cylinderGeometry args={[0.025, 0.025, 0.5]} />
            <meshBasicMaterial color="blue" />
        </mesh>
    </>
);

const Viewer = () => {
    const { sensorList } = useSnapshot(SensorStore);

    const meshRefs = useRef({});
    const chassisRef = useRef();
    const [sensorViewer, setSensorViwer] = useState([]);
    const [sensorMatrix, setSensorMatrix] = useState({});

    const [{ tf }, set] = useControls(
        () => ({
            传感器: {
                options: Object.keys(sensorMatrix),
            },
            参考点: {
                options: Object.keys(sensorMatrix),
            },
            计算: button(get => {
                let sensor = get('传感器');
                let rer = get('参考点');
                if (sensor && ref) {
                    let tfRes = sensorMatrix[rer].clone().invert().multiply(sensorMatrix[sensor]);
                    let p = new THREE.Vector3();
                    let q = new THREE.Quaternion();
                    let s = new THREE.Vector3();
                    tfRes.decompose(p, q, s);
                    set({
                        transform: `Translation\nx: ${p.x} y: ${p.y} z: ${p.z}\n\nQuaternion\nx: ${q.x} y: ${q.y} z: ${q.z} w: ${q.w}`,
                    });
                }
            }),
            transform: {
                value: '',
                editable: false,
            },
        }),
        [sensorMatrix]
    );

    useEffect(() => {
        const chassisMatrix = chassisRef.current.matrix;
        let sensorViewerMatrix = {};
        let newM4;
        let sensorFilter = findPathToTarget(sensorList, 'chassis');
        sensorFilter.forEach(item => {
            let matrix4 = new THREE.Matrix4().compose(
                new THREE.Vector3(parseFloat(item.x), parseFloat(item.y), parseFloat(item.z)),
                sensorList[0]['rotation_type'] === 'euler'
                    ? new THREE.Quaternion().setFromEuler(
                          new THREE.Euler(
                              parseFloat(item.roll),
                              parseFloat(item.pitch),
                              parseFloat(item.yaw)
                          )
                      )
                    : new THREE.Quaternion(
                          parseFloat(item.q_x),
                          parseFloat(item.q_y),
                          parseFloat(item.q_z),
                          parseFloat(item.q_w)
                      ),
                new THREE.Vector3(1, 1, 1)
            );
            if (item.ref_point === 'chassis') {
                newM4 = matrix4.premultiply(chassisMatrix);
            } else {
                newM4 = matrix4.premultiply(sensorViewerMatrix[item.ref_point]);
            }
            sensorViewerMatrix[item.name] = newM4;
        });

        let sensorViewerMatrix_ = Object.assign({}, sensorViewerMatrix);
        sensorViewerMatrix_['chassis'] = chassisRef.current.matrix;
        setSensorMatrix(sensorViewerMatrix_);

        let meshGroupList = [];
        for (let prop in sensorViewerMatrix) {
            let meshGroup = (
                <group
                    rotation-z={Math.PI / 2}
                    scale={[0.1, 0.1, 0.1]}
                    matrixAutoUpdate={false}
                    matrix={sensorViewerMatrix[prop]}
                    key={prop}
                    ref={ref => (meshRefs.current[prop] = ref)}
                >
                    {basicMesh}
                    <Html position={[0, 0, 0]} center>
                        <div
                            className="text-white text-sm"
                            onClick={() =>
                                (meshRefs.current[prop].visible = !meshRefs.current[prop].visible)
                            }
                            onPointerEnter={() => {
                                document.body.style.cursor = 'pointer';
                            }}
                            onPointerLeave={() => {
                                document.body.style.cursor = 'default';
                            }}
                        >
                            {prop}
                        </div>
                    </Html>
                </group>
            );
            meshGroupList.push(meshGroup);
            setSensorViwer(meshGroupList);
        }
    }, [sensorList]);

    return (
        <>
            <OrbitControls makeDefault />
            <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                <GizmoViewport rotation={new THREE.Euler(0, 0, Math.PI / 2)} />
            </GizmoHelper>
            <gridHelper args={[1, 50]} rotation={new THREE.Euler(Math.PI / 2, 0, 0)} />

            <group ref={chassisRef} rotation-z={Math.PI / 2} scale={[0.1, 0.1, 0.1]}>
                {basicMesh}
                <Html position={[0, 0.25, 0.25]} center>
                    <div
                        className="text-white text-sm"
                        onClick={() => (chassisRef.current.visible = !chassisRef.current.visible)}
                        onPointerEnter={() => {
                            document.body.style.cursor = 'pointer';
                        }}
                        onPointerLeave={() => {
                            document.body.style.cursor = 'default';
                        }}
                    >
                        chassis
                    </div>
                </Html>
            </group>

            {sensorViewer.map(item => item)}
        </>
    );
};

export default Viewer;
