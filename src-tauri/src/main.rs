// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use lazy_static::lazy_static;
use maplit::hashmap;
use pcd_rs::DynReader;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::fs::{self, File};
use std::sync::Mutex;

#[derive(Serialize, Deserialize, Debug)]
struct Transform {
    frame_id: String,
    reference_frame_id: String,
    sensor_type: String,
    transform: HashMap<String, HashMap<String, f64>>,
}

#[derive(Serialize, Deserialize, Debug)]
struct Transforms {
    transforms: Vec<Transform>,
}

lazy_static! {
    static ref SENSORS: Mutex<String> = Mutex::new(String::from(""));
    static ref ROTATION_TYPE: Mutex<String> = Mutex::new(String::from(""));
}

#[tauri::command(rename_all = "snake_case")]
fn save_yaml(file_path: String) -> Result<(), String> {
    let sensors: Value =
        serde_json::from_str(SENSORS.lock().unwrap().as_str()).map_err(|err| err.to_string())?;
    let rotation_type = ROTATION_TYPE.lock().unwrap();
    let mut transforms = vec![];
    for item in sensors.as_array().unwrap() {
        if *rotation_type == String::from("euler") {
            transforms.push(Transform {
                frame_id: item["name"].as_str().unwrap().to_string(),
                reference_frame_id: item["ref_point"].as_str().unwrap().to_string(),
                sensor_type: item["sensor_type"].as_str().unwrap().to_string(),
                transform: hashmap! {
                    "translation".to_string() => hashmap! {
                        "x".to_string() => item["x"].as_f64().unwrap(),
                        "y".to_string() => item["y"].as_f64().unwrap(),
                        "z".to_string() => item["z"].as_f64().unwrap(),
                     },
                     "rotation".to_string() => hashmap! {
                        "yaw".to_string() => item["yaw"].as_f64().unwrap(),
                        "pitch".to_string() => item["pitch"].as_f64().unwrap(),
                        "roll".to_string() => item["roll"].as_f64().unwrap(),
                     },
                },
            })
        } else if *rotation_type == String::from("quaternion") {
            transforms.push(Transform {
                frame_id: item["name"].as_str().unwrap().to_string(),
                reference_frame_id: item["ref_point"].as_str().unwrap().to_string(),
                sensor_type: item["sensor_type"].as_str().unwrap().to_string(),
                transform: hashmap! {
                    "translation".to_string() => hashmap! {
                        "x".to_string() => item["x"].as_f64().unwrap(),
                        "y".to_string() => item["y"].as_f64().unwrap(),
                        "z".to_string() => item["z"].as_f64().unwrap(),
                     },
                     "rotation".to_string() => hashmap! {
                        "q_x".to_string() => item["q_x"].as_f64().unwrap(),
                        "q_y".to_string() => item["q_y"].as_f64().unwrap(),
                        "q_z".to_string() => item["q_z"].as_f64().unwrap(),
                        "q_w".to_string() => item["q_w"].as_f64().unwrap(),
                     },
                },
            })
        }
    }
    let file = File::create(file_path).unwrap();
    serde_yaml::to_writer(file, &transforms).unwrap();
    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
fn save_sensor_state(sensor_list: String, rotation_type: String) -> () {
    let mut sensors = SENSORS.lock().unwrap();
    let mut rotation = ROTATION_TYPE.lock().unwrap();
    *sensors = sensor_list;
    *rotation = rotation_type;
}

#[tauri::command(rename_all = "snake_case")]
fn read_yaml(yaml_path: String) -> Result<String, ()> {
    let f_string = fs::read_to_string(yaml_path).map_err(|_| ())?;
    Ok(f_string)
}

#[tauri::command(rename_all = "snake_case")]
fn check_pcd(pcd_path: String) -> Result<(), ()> {
    println!("{:?}", pcd_path);
    let _ = DynReader::open(pcd_path).map_err(|_| false);
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            save_sensor_state,
            save_yaml,
            read_yaml,
            check_pcd
        ])
        .run(tauri::generate_context!())
        .expect("failed to run app");
}
