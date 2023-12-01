// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use lazy_static::lazy_static;
use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::Manager;
use tauri::{CustomMenuItem, Menu, Submenu};
use serde_json::Value;
use maplit::hashmap;
use std::fs::{self, File};


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
    let sensors: Value = serde_json::from_str(SENSORS.lock().unwrap().as_str()).map_err(|err| err.to_string())?;
    let rotation_type = ROTATION_TYPE.lock().unwrap();
    let mut transforms = vec![];
    for item in sensors.as_array().unwrap() {
        if *rotation_type == String::from("euler") {
            transforms.push(Transform{
                frame_id: item["name"].as_str().unwrap().to_string(),
                reference_frame_id: item["ref_point"].as_str().unwrap().to_string(),
                sensor_type: item["sensor_type"].as_str().unwrap().to_string(),
                transform: hashmap! {
                    "translation".to_string() => hashmap! {
                        "x".to_string() => item["x"].as_str().unwrap().parse::<f64>().unwrap(),
                        "y".to_string() => item["y"].as_str().unwrap().parse::<f64>().unwrap(),
                        "z".to_string() => item["z"].as_str().unwrap().parse::<f64>().unwrap(),
                     },
                     "rotation".to_string() => hashmap! {
                        "yaw".to_string() => item["yaw"].as_str().unwrap().parse::<f64>().unwrap(),
                        "pitch".to_string() => item["pitch"].as_str().unwrap().parse::<f64>().unwrap(),
                        "roll".to_string() => item["roll"].as_str().unwrap().parse::<f64>().unwrap(),
                     },
                }
            })
        } else if *rotation_type == String::from("quaternion") {
            transforms.push(Transform{
                frame_id: item["name"].as_str().unwrap().to_string(),
                reference_frame_id: item["ref_point"].as_str().unwrap().to_string(),
                sensor_type: item["sensor_type"].as_str().unwrap().to_string(),
                transform: hashmap! {
                    "translation".to_string() => hashmap! {
                        "x".to_string() => item["x"].as_str().unwrap().parse::<f64>().unwrap(),
                        "y".to_string() => item["y"].as_str().unwrap().parse::<f64>().unwrap(),
                        "z".to_string() => item["z"].as_str().unwrap().parse::<f64>().unwrap(),
                     },
                     "rotation".to_string() => hashmap! {
                        "q_x".to_string() => item["q_x"].as_str().unwrap().parse::<f64>().unwrap(),
                        "q_y".to_string() => item["q_y"].as_str().unwrap().parse::<f64>().unwrap(),
                        "q_z".to_string() => item["q_z"].as_str().unwrap().parse::<f64>().unwrap(),
                        "q_w".to_string() => item["q_w"].as_str().unwrap().parse::<f64>().unwrap(),
                     },
                }
            })
        }
    }   
    // let transforms = Transforms {transforms};
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
fn read_yaml(yaml_path: String) -> String {
    let f_string = fs::read_to_string(yaml_path).unwrap();
    f_string
}

fn main() {
    let save_as: CustomMenuItem = CustomMenuItem::new("save_as".to_string(), "另存为...");
    let file_menu = Submenu::new("文件", Menu::new().add_item(save_as));
    let menu = Menu::new().add_submenu(file_menu);

    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();
            app.get_window("main").unwrap().on_menu_event(move |event| {
                match event.menu_item_id() {
                    "save_as" => {
                        handle.emit_all("save_yaml", ()).unwrap();
                    }
                    _ => {}
                }
            });
            Ok(())
        })
        .menu(menu)
        .invoke_handler(tauri::generate_handler![save_sensor_state, save_yaml, read_yaml])
        .run(tauri::generate_context!())
        .expect("failed to run app");
}
