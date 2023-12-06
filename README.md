# Sensor-Viewer

[中文](./README.zh_CN.md)

![screenshoot](./screenshot.jpg)

## Feature

-   Supports adding, editing, checking, position previewing, hiding/showing of in-vehicle sensors
-   Support for arbitrary sensors and reference points for transform calculations
-   Support for Eulerian rotations and quaternion expressions
-   Support sensor configuration file import, export
-   Support for GLTF model file export

## Download

### Download via [release](https://github.com/neo896/Sensor-Viewer/releases)

### Build from source

1. Prerequisites

-   [nodejs](https://nodejs.org/en)
-   [tauri](https://tauri.app/v1/guides/getting-started/prerequisites)

1. Clone source code

```bash
git clone https://github.com/neo896/Sensor-Viewer.git
```

2. Installation dependencies

```bash
npm install
```

3. Run

```bash
npm run tauri dev
```

4. Build

```bash
npm run tauri build
```
