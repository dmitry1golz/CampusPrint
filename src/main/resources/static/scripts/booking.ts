import { createNewBooking, getBookingAvailabilityForDevice } from "./services/bookingService.js";
import { BaseNewBooking, Booking, BookingAvailability, NewBooking, supportOptions, SupportType } from "./models/booking.js";
import { getDeviceById } from "./services/deviceService.js";
import { setCookie } from "./services/authService.js";
import { Device } from "./models/device.js";

type BookingPageState = 'loading' | 'error' | 'ready';

interface DateSelectorOption {
    value: string;
    selectable: boolean;
    isSelected: boolean;
    status: 'invalid-date' | 'availible' | 'unavailible' | 'booked' | 'partially-booked';
    date: Date;
}

const invalidDate: DateSelectorOption = {
    value: "", selectable: false, isSelected: false, status: 'invalid-date', date: new Date(0)
};

let currentlySelectedDate: Date | undefined;
let currentDateSelectorYear: number = new Date().getFullYear();
let currentDateSelectorMonth: number = new Date().getMonth();

let device: Device;
let bookingAvailability: BookingAvailability;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const deviceIdStr = urlParams.get('device_id');

    if (!deviceIdStr) {
        updateState('error');
        return;
    }

    // Fetch real device data from Backend via Service
    const foundDevice = await getDeviceById(deviceIdStr);

    if (!foundDevice) {
        console.error(`Device with ID ${deviceIdStr} not found.`);
        updateState('error');
        return;
    }

    device = foundDevice;
    
    const foundBookingAvailability = await getBookingAvailabilityForDevice(device);
    if (!foundBookingAvailability) {
        console.error(`BookingAvailability not found.`);
        updateState('error');
        return;
    }
    bookingAvailability = foundBookingAvailability;

    // Populate UI
    document.getElementById('printerInfo-Name')!.innerText = device.name;
    switch (device.type) {
        case "FDM_Printer":
        case "SLA_Printer":
            document.getElementById('printerInfo-Dimensions')!.innerText = device.print_options.work_area.x + "cm x " + device.print_options.work_area.y  + "cm x " + device.print_options.work_area.z + "cm";
            break;
        case "Laser_Cutter":
            document.getElementById('printerInfo-Dimensions')!.innerText = device.print_options.work_area.x + "cm x " + device.print_options.work_area.y  + "cm";
            break;
        default:
            document.getElementById('printerInfo-Dimensions')!.classList.add("hidden");
            break;
    }
    document.getElementById('printerInfo-Description')!.innerText = device.description;
    switch (device.type) {
        case "FDM_Printer":
            document.getElementById("device-config-fdm")!.classList.remove("hidden");

            const fdmSelectContainer = document.getElementById("fdm-mat-select")!;
            const fdmOptionsUl = fdmSelectContainer.querySelector('.custom-select-options')! as HTMLUListElement;
            const fdmValueDiv = fdmSelectContainer.querySelector('.custom-select-value')! as HTMLDivElement;
            const fdmHiddenInput = document.getElementById("fdm-mat-value")! as HTMLInputElement;

            fdmOptionsUl.innerHTML = '';
            device.print_options.available_materials.forEach(mat => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="color-dot" style="background-color: ${mat.color_hex};"></span>${mat.name} - (${mat.temp_nozzle}°C / ${mat.temp_bed}°C)`;
                li.dataset.value = mat.name;
                li.addEventListener('click', () => {
                    fdmValueDiv.innerHTML = `<span class="color-dot" style="background-color: ${mat.color_hex};"></span>${mat.name} - (${mat.temp_nozzle}°C / ${mat.temp_bed}°C)`;
                    fdmHiddenInput.value = mat.name;
                    fdmOptionsUl.classList.add('hidden');
                });
                fdmOptionsUl.appendChild(li);
            });

            fdmValueDiv.addEventListener('click', () => {
                fdmOptionsUl.classList.toggle('hidden');
            });

            // Layer
            const fdmLayerSelectContainer = document.getElementById("fdm-layer-select")!;
            const fdmLayerOptionsUl = fdmLayerSelectContainer.querySelector('.custom-select-options')! as HTMLUListElement;
            const fdmLayerValueDiv = fdmLayerSelectContainer.querySelector('.custom-select-value')! as HTMLDivElement;
            const fdmLayerHiddenInput = document.getElementById("fdm-layer-value")! as HTMLInputElement;

            fdmLayerOptionsUl.innerHTML = '';
            device.print_options.supported_layer_heights.forEach(layer => {
                const li = document.createElement('li');
                li.innerHTML = `${layer}`;
                li.dataset.value = layer.toString();
                li.addEventListener('click', () => {
                    fdmLayerValueDiv.innerHTML = `${layer}`;
                    fdmLayerHiddenInput.value = layer.toString();
                    fdmLayerOptionsUl.classList.add('hidden');
                });
                fdmLayerOptionsUl.appendChild(li);
            });

            fdmLayerValueDiv.addEventListener('click', () => {
                fdmLayerOptionsUl.classList.toggle('hidden');
            });

            // Nozzle
            const fdmNozzleSelectContainer = document.getElementById("fdm-nozzle-select")!;
            const fdmNozzleOptionsUl = fdmNozzleSelectContainer.querySelector('.custom-select-options')! as HTMLUListElement;
            const fdmNozzleValueDiv = fdmNozzleSelectContainer.querySelector('.custom-select-value')! as HTMLDivElement;
            const fdmNozzleHiddenInput = document.getElementById("fdm-nozzle-value")! as HTMLInputElement;

            fdmNozzleOptionsUl.innerHTML = '';
            device.print_options.nozzle_sizes.forEach(nozzle => {
                const li = document.createElement('li');
                li.innerHTML = `${nozzle}`;
                li.dataset.value = nozzle.toString();
                li.addEventListener('click', () => {
                    fdmNozzleValueDiv.innerHTML = `${nozzle}`;
                    fdmNozzleHiddenInput.value = nozzle.toString();
                    fdmNozzleOptionsUl.classList.add('hidden');
                });
                fdmNozzleOptionsUl.appendChild(li);
            });

            fdmNozzleValueDiv.addEventListener('click', () => {
                fdmNozzleOptionsUl.classList.toggle('hidden');
            });

            // Support
            const fdmSupportSelectContainer = document.getElementById("fdm-support-select")!;
            const fdmSupportOptionsUl = fdmSupportSelectContainer.querySelector('.custom-select-options')! as HTMLUListElement;
            const fdmSupportValueDiv = fdmSupportSelectContainer.querySelector('.custom-select-value')! as HTMLDivElement;
            const fdmSupportHiddenInput = document.getElementById("fdm-support-value")! as HTMLInputElement;

            fdmSupportOptionsUl.innerHTML = '';
            supportOptions.forEach(support => {
                const li = document.createElement('li');
                li.innerHTML = `${support}`;
                li.dataset.value = support;
                li.addEventListener('click', () => {
                    fdmSupportValueDiv.innerHTML = `${support}`;
                    fdmSupportHiddenInput.value = support;
                    fdmSupportOptionsUl.classList.add('hidden');
                });
                fdmSupportOptionsUl.appendChild(li);
            });

            fdmSupportValueDiv.addEventListener('click', () => {
                fdmSupportOptionsUl.classList.toggle('hidden');
            });
            break;
        case "SLA_Printer":
            document.getElementById("device-config-sla")?.classList.remove("hidden");

            const slaSelectContainer = document.getElementById("sla-mat-select")!;
            const slaOptionsUl = slaSelectContainer.querySelector('.custom-select-options')! as HTMLUListElement;
            const slaValueDiv = slaSelectContainer.querySelector('.custom-select-value')! as HTMLDivElement;
            const slaHiddenInput = document.getElementById("sla-mat-value")! as HTMLInputElement;

            slaOptionsUl.innerHTML = '';
            device.print_options.available_materials.forEach(mat => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="color-dot" style="background-color: ${mat.color_hex};"></span>${mat.name}`;
                li.dataset.value = mat.name;
                li.addEventListener('click', () => {
                    slaValueDiv.innerHTML = `<span class="color-dot" style="background-color: ${mat.color_hex};"></span>${mat.name}`;
                    slaHiddenInput.value = mat.name;
                    slaOptionsUl.classList.add('hidden');
                });
                slaOptionsUl.appendChild(li);
            });

            slaValueDiv.addEventListener('click', () => {
                slaOptionsUl.classList.toggle('hidden');
            });

            // Layer
            const slaLayerSelectContainer = document.getElementById("sla-layer-select")!;
            const slaLayerOptionsUl = slaLayerSelectContainer.querySelector('.custom-select-options')! as HTMLUListElement;
            const slaLayerValueDiv = slaLayerSelectContainer.querySelector('.custom-select-value')! as HTMLDivElement;
            const slaLayerHiddenInput = document.getElementById("sla-layer-value")! as HTMLInputElement;

            slaLayerOptionsUl.innerHTML = '';
            device.print_options.supported_layer_heights.forEach(layer => {
                const li = document.createElement('li');
                li.innerHTML = `${layer}`;
                li.dataset.value = layer.toString();
                li.addEventListener('click', () => {
                    slaLayerValueDiv.innerHTML = `${layer}`;
                    slaLayerHiddenInput.value = layer.toString();
                    slaLayerOptionsUl.classList.add('hidden');
                });
                slaLayerOptionsUl.appendChild(li);
            });

            slaLayerValueDiv.addEventListener('click', () => {
                slaLayerOptionsUl.classList.toggle('hidden');
            });

            // Support
            const slaSupportSelectContainer = document.getElementById("sla-support-select")!;
            const slaSupportOptionsUl = slaSupportSelectContainer.querySelector('.custom-select-options')! as HTMLUListElement;
            const slaSupportValueDiv = slaSupportSelectContainer.querySelector('.custom-select-value')! as HTMLDivElement;
            const slaSupportHiddenInput = document.getElementById("sla-support-value")! as HTMLInputElement;

            slaSupportOptionsUl.innerHTML = '';
            
            supportOptions.forEach(support => {
                const li = document.createElement('li');
                li.innerHTML = `${support}`;
                li.dataset.value = support;
                li.addEventListener('click', () => {
                    slaSupportValueDiv.innerHTML = `${support}`;
                    slaSupportHiddenInput.value = support;
                    slaSupportOptionsUl.classList.add('hidden');
                });
                slaSupportOptionsUl.appendChild(li);
            });

            slaSupportValueDiv.addEventListener('click', () => {
                slaSupportOptionsUl.classList.toggle('hidden');
            });
            break;
        case "Laser_Cutter":
            document.getElementById("device-config-laser")?.classList.remove("hidden");

            const laserSelectContainer = document.getElementById("laser-preset-select")!;
            const laserOptionsUl = laserSelectContainer.querySelector('.custom-select-options')! as HTMLUListElement;
            const laserValueDiv = laserSelectContainer.querySelector('.custom-select-value')! as HTMLDivElement;
            const laserHiddenInput = document.getElementById("laser-preset-value")! as HTMLInputElement;

            laserOptionsUl.innerHTML = '';
            device.print_options.presets.forEach(preset => {
                const li = document.createElement('li');
                li.innerHTML = `${preset.material} - ${preset.thickness}mm - ${preset.power}W - ${preset.speed}mm/min`;
                li.dataset.value = preset.toString();
                li.addEventListener('click', () => {
                    laserValueDiv.innerHTML = `${preset.material} - ${preset.thickness}mm - ${preset.power}W - ${preset.speed}mm/min`;
                    laserHiddenInput.value = preset.toString();
                    laserOptionsUl.classList.add('hidden');
                });
                laserOptionsUl.appendChild(li);
            });

            laserValueDiv.addEventListener('click', () => {
                laserOptionsUl.classList.toggle('hidden');
            });
            break;
        case "Printer":
            document.getElementById("device-config-paper")?.classList.remove("hidden");

            // Weight
            const paperWeightSelectContainer = document.getElementById("paper-weight-select")!;
            const paperWeightOptionsUl = paperWeightSelectContainer.querySelector('.custom-select-options')! as HTMLUListElement;
            const paperWeightValueDiv = paperWeightSelectContainer.querySelector('.custom-select-value')! as HTMLDivElement;
            const paperWeightHiddenInput = document.getElementById("paper-weight-value")! as HTMLInputElement;

            paperWeightOptionsUl.innerHTML = '';
            device.print_options.paper_weights.forEach(weight => {
                const li = document.createElement('li');
                li.innerHTML = `${weight}`;
                li.dataset.value = weight.toString();
                li.addEventListener('click', () => {
                    paperWeightValueDiv.innerHTML = `${weight}`;
                    paperWeightHiddenInput.value = weight.toString();
                    paperWeightOptionsUl.classList.add('hidden');
                });
                paperWeightOptionsUl.appendChild(li);
            });

            paperWeightValueDiv.addEventListener('click', () => {
                paperWeightOptionsUl.classList.toggle('hidden');
            });

            // Format
            const paperFormatSelectContainer = document.getElementById("paper-format-select")!;
            const paperFormatOptionsUl = paperFormatSelectContainer.querySelector('.custom-select-options')! as HTMLUListElement;
            const paperFormatValueDiv = paperFormatSelectContainer.querySelector('.custom-select-value')! as HTMLDivElement;
            const paperFormatHiddenInput = document.getElementById("paper-format-value")! as HTMLInputElement;

            paperFormatOptionsUl.innerHTML = '';
            device.print_options.formats.forEach(format => {
                const li = document.createElement('li');
                li.innerHTML = `${format}`;
                li.dataset.value = format;
                li.addEventListener('click', () => {
                    paperFormatValueDiv.innerHTML = `${format}`;
                    paperFormatHiddenInput.value = format;
                    paperFormatOptionsUl.classList.add('hidden');
                });
                paperFormatOptionsUl.appendChild(li);
            });

            paperFormatValueDiv.addEventListener('click', () => {
                paperFormatOptionsUl.classList.toggle('hidden');
            });
            break;
    }

    const form = document.getElementById('bookingForm') as HTMLFormElement;
    form.addEventListener('submit', handleFormSubmit);

    document.getElementById('dateSelectorPreviousMonth')?.addEventListener('click', () => changeMonth(-1));
    document.getElementById('dateSelectorNextMonth')?.addEventListener('click', () => changeMonth(1));

    renderDateSelector(currentlySelectedDate, currentDateSelectorYear, currentDateSelectorMonth);
    updateState('ready');
});

// Made async to await the booking creation
async function handleFormSubmit(e: Event) {
    e.preventDefault();
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const start = (document.getElementById('start') as HTMLInputElement).value;
    const end = (document.getElementById('end') as HTMLInputElement).value;
    const notes = (document.getElementById('notes') as HTMLTextAreaElement).value;

    if (!currentlySelectedDate || start >= end) {
        alert("Please check date and time.");
        return;
    }

    // printerId must be number now
    const bookingBase: BaseNewBooking = {
        printerId: device.id,
        userEmail: email,
        startDate: createDateTime(currentlySelectedDate, start),
        endDate: createDateTime(currentlySelectedDate, end),
        notes: notes
    };

    let booking: NewBooking;
    switch (device.type) {
        case "FDM_Printer":
            booking = {
                ...bookingBase,
                type: "FDM_Printer",
                print_options: {
                    tech_type: "FDM",
                    selected_material: device.print_options.available_materials.find(mat => mat.name === (document.getElementById('fdm-mat-value') as HTMLInputElement).value)!,
                    selected_layer_height: device.print_options.supported_layer_heights.find(layer => layer.toString() === (document.getElementById('fdm-layer-value') as HTMLInputElement).value)!,
                    selected_nozzle_size: device.print_options.nozzle_sizes.find(nozzle => nozzle.toString() === (document.getElementById('fdm-nozzle-value') as HTMLInputElement).value)!,
                    selected_support_type: (document.getElementById('fdm-support-value') as HTMLInputElement).value as SupportType,
                    selected_infill_percentage: +(document.getElementById('fdm-infill-input') as HTMLInputElement).value!,
                }
            };
            break;
        case "SLA_Printer":
            booking = {
                ...bookingBase,
                type: "SLA_Printer",
                print_options: {
                    tech_type: "SLA",
                    selected_material: device.print_options.available_materials.find(mat => mat.name === (document.getElementById('sla-mat-value') as HTMLInputElement).value)!,
                    selected_layer_height: device.print_options.supported_layer_heights.find(layer => layer.toString() === (document.getElementById('sla-layer-value') as HTMLInputElement).value)!,
                    selected_support_type: (document.getElementById('sla-support-value') as HTMLInputElement).value as SupportType,
                    selected_infill_percentage: +(document.getElementById('sla-infill-input') as HTMLInputElement).value!,
                }
            };
            break;
        case "Laser_Cutter":
            booking = {
                ...bookingBase,
                type: "Laser_Cutter",
                print_options: {
                    tech_type: "LASER",
                    selected_preset: device.print_options.presets.find(preset => preset.toString() === (document.getElementById('laser-preset-value') as HTMLInputElement).value)!,
                }
            };
            break;
        case "Printer":
            booking = {
                ...bookingBase,
                type: "Printer",
                print_options: {
                    tech_type: "PAPER",
                    selected_paper_weights: device.print_options.paper_weights.find(weight => weight.toString() === (document.getElementById('paper-weight-value') as HTMLInputElement).value)!,
                    selected_format: device.print_options.formats.find(format => format.toString() === (document.getElementById('paper-format-value') as HTMLInputElement).value)!,
                }
            };
            break;
    }

    const createdBooking: Booking | undefined = await createNewBooking(booking);
    if (createdBooking === undefined) {
        updateState('error');
    } else {
        setCookie('userEmail', email, 30);
        window.location.href = "myPrints.html";
    }
    
}

function renderDateSelector(selectedDate: Date | undefined, year: number, month: number) {
    const grid = document.getElementById('dateSelectorGrid')!;
    const header = document.getElementById('dateSelectorHeaderValue')!;
    
    header.innerText = new Date(year, month).toLocaleString('de-DE', { month: 'long', year: 'numeric' });

    while (grid.children.length > 1) grid.removeChild(grid.lastElementChild!);

    const firstWeekDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const days: DateSelectorOption[] = [];

    for (let i = 0; i < firstWeekDay; i++) days.push(invalidDate);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        let status: DateSelectorOption['status'] = 'availible';
        let selectable = true;

        if (date < today || bookingAvailability.blockedWeekDays.includes((date.getDay() + 6) % 7)) {
            status = 'unavailible'; selectable = false;
        } else if (bookingAvailability.fullyBookedDays.some(d => d.getTime() === date.getTime())) {
            status = 'booked'; selectable = false;
        } else if (bookingAvailability.partialyBookedDays.some(d => d.getTime() === date.getTime())) {
            status = 'partially-booked';
        }

        days.push({ value: i.toString(), selectable, isSelected: date.getTime() === selectedDate?.getTime(), status, date });
    }

    const rowCount = Math.ceil(days.length / 7);
    for (let r = 0; r < rowCount; r++) {
        const row = document.createElement('div');
        row.className = 'dateSelectorRow';
        for (let d = 0; d < 7; d++) {
            const dayObj = days[r * 7 + d] || invalidDate;
            const cell = document.createElement('div');
            cell.innerText = dayObj.value;
            
            if (dayObj.status !== 'invalid-date') {
                cell.classList.add(`date-${dayObj.status.split('-')[0]}`);
                if (dayObj.isSelected) cell.classList.add('selected');
                if (dayObj.selectable) {
                    cell.classList.add('selectable');
                    cell.onclick = () => { currentlySelectedDate = dayObj.date; renderDateSelector(currentlySelectedDate, year, month); };
                }
            } else {
                cell.style.visibility = 'hidden';
            }
            row.appendChild(cell);
        }
        grid.appendChild(row);
    }
}

function changeMonth(offset: number) {
    currentDateSelectorMonth += offset;
    if (currentDateSelectorMonth < 0) { currentDateSelectorMonth = 11; currentDateSelectorYear--; }
    else if (currentDateSelectorMonth > 11) { currentDateSelectorMonth = 0; currentDateSelectorYear++; }
    renderDateSelector(currentlySelectedDate, currentDateSelectorYear, currentDateSelectorMonth);
}

function updateState(newState: BookingPageState) {
    ['loading', 'error', 'ready'].forEach(s => {
        const el = document.getElementById(`pageState-${s}`);
        if (el) el.classList.toggle('hidden', s !== newState);
    });
}

function createDateTime(date: Date, timeStr: string): Date {
    const [h, m] = timeStr.split(':').map(Number);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m);
}