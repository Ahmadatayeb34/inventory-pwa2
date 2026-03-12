const STORAGE_KEY_VEHICLES = 'ims_vehicles';

function getVehicles() {
    const data = localStorage.getItem(STORAGE_KEY_VEHICLES);
    return data ? JSON.parse(data) : [];
}

function saveVehicles(vehicles) {
    localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(vehicles));
}

function saveVehicle(vehicle) {
    const vehicles = getVehicles();
    if (vehicle.id) {
        const index = vehicles.findIndex(v => v.id === vehicle.id);
        if (index > -1) {
            vehicles[index] = vehicle;
        } else {
            vehicles.push(vehicle);
        }
    } else {
        vehicle.id = 'VH-' + Date.now();
        vehicles.push(vehicle);
    }
    saveVehicles(vehicles);
    return vehicle;
}

function removeVehicle(id) {
    let vehicles = getVehicles();
    vehicles = vehicles.filter(v => v.id !== id);
    saveVehicles(vehicles);
}
