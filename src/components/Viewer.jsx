import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { OrbitControls, GizmoHelper, GizmoViewport, Html } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { useControls, button } from 'leva';
import { useSnapshot } from 'valtio';
import SensorStore from '../store/SensorStore';
import { findPathToTarget } from '../utils/findPathToTarget';
import { save } from '@tauri-apps/api/dialog';
import { writeFile } from '@tauri-apps/api/fs';
import { withTranslation } from 'react-i18next';
import { useTranslation } from 'react-i18next';
import { useLoader } from '@react-three/fiber';
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader';

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
    const { sensorList, pcdList } = useSnapshot(SensorStore);

    const parentGroupRef = useRef();
    const meshRefs = useRef({});
    const chassisRef = useRef();
    const [sensorViewer, setSensorViwer] = useState([]);
    const [sensorMatrix, setSensorMatrix] = useState({});

    const [pcdView, setPcdView] = useState([]);

    const { t, i18n } = useTranslation();

    const exportGLTF = async () => {
        const exporter = new GLTFExporter();
        exporter.parse(
            parentGroupRef.current,
            async result => {
                const filePath = await save({
                    filters: [
                        {
                            name: 'GLTF',
                            extensions: ['gltf'],
                        },
                    ],
                });

                const fileNameWithExtension = filePath.endsWith('.gltf')
                    ? filePath
                    : `${filePath}.gltf`;

                await writeFile({
                    path: fileNameWithExtension,
                    contents: JSON.stringify(result),
                });
            },
            { binary: true }
        );
    };

    const sensorName = t('leva_sensor');
    const refPoint = t('leva_ref');
    const tfResult = t('leva_transform_result');
    const tfCalculate = t('leva_transform_calculate');
    const modelExport = t('leva_model_export');

    const [{ tf }, set] = useControls(
        () => ({
            [sensorName]: {
                options: Object.keys(sensorMatrix),
            },
            [refPoint]: {
                options: Object.keys(sensorMatrix),
            },
            [tfResult]: {
                value: '',
                editable: false,
            },
            [tfCalculate]: button(get => {
                let sensor = get([sensorName]);
                let ref = get([refPoint]);
                if (sensor && ref) {
                    let tfRes = sensorMatrix[ref].clone().invert().multiply(sensorMatrix[sensor]);
                    let p = new THREE.Vector3();
                    let q = new THREE.Quaternion();
                    let s = new THREE.Vector3();
                    tfRes.decompose(p, q, s);
                    set({
                        [tfResult]: `Translation\nx: ${p.x} y: ${p.y} z: ${p.z}\n\nQuaternion\nx: ${q.x} y: ${q.y} z: ${q.z} w: ${q.w}`,
                    });
                }
            }),
            [modelExport]: button(() => {
                exportGLTF();
            }),
        }),
        [sensorMatrix, sensorName]
    );

    useEffect(() => {
        const chassisMatrix = chassisRef.current.matrix;
        let sensorViewerMatrix = {};
        let newM4;
        let sensorFilter = findPathToTarget(sensorList, 'chassis');
        if (sensorFilter.length > 0) {
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
                                    (meshRefs.current[prop].visible =
                                        !meshRefs.current[prop].visible)
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
        } else {
            setSensorViwer([]);
        }
    }, [sensorList]);

    useMemo(() => {
        let pcdViewTmp = [];
        for (let i = 0; i < pcdList.length; i++) {
            if (pcdList[i].path.length === 0) {
                continue;
            }
            const pcd = useLoader(PCDLoader, pcdList[i].path);
            const material = new THREE.MeshBasicMaterial({ color: pcdList[i].color });
            const pcdM4 = sensorMatrix[pcdList[i].name];
            pcdViewTmp.push(
                <primitive
                    object={pcd}
                    scale={[0.1, 0.1, 0.1]}
                    matrixAutoUpdate={false}
                    material={material}
                    matrix={pcdM4}
                    key={i}
                />
            );
            setPcdView(pcdViewTmp);
        }
    }, [pcdList]);

    return (
        <>
            <Suspense fallback={null}>{pcdView.map(item => item)}</Suspense>

            <OrbitControls makeDefault />
            <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                <GizmoViewport rotation={new THREE.Euler(0, 0, Math.PI / 2)} />
            </GizmoHelper>
            <gridHelper args={[1, 50]} rotation={new THREE.Euler(Math.PI / 2, 0, 0)} />

            <group ref={parentGroupRef}>
                <group ref={chassisRef} rotation-z={Math.PI / 2} scale={[0.1, 0.1, 0.1]}>
                    {basicMesh}
                    <Html position={[0, 0.25, 0.25]} center>
                        <div
                            className="text-white text-sm"
                            onClick={() =>
                                (chassisRef.current.visible = !chassisRef.current.visible)
                            }
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
            </group>
        </>
    );
};

export default withTranslation()(Viewer);
