// Temporary Local Data while frontend only
var MOCK_GERAETE : ThreeDPrinter[] = [
    {
        id: 'b856dff6-f4f8-4af1-bb44-888561eb584d',
        name: 'Ultimaker S5',
        type: 'SLA_Drucker',
        status: 'Verfügbar',
        description: "Der Ultimaker S5 ist ein professioneller 3D-Drucker mit großer Baufläche und Dual-Extrusion für präzise, hochwertige Drucke.",
        volume: '330 x 240 x 300 mm',
        image: "https://ultimaker.com/wp-content/uploads/2023/05/The_Ultimaker_S5.jpg",
        nozzle: "TODO?",
        layer: "TODO?",
    },
];

export function getGeraetById(id: String) : Geraet | undefined {
    return MOCK_GERAETE.find(geraet => geraet.id === id);
}