interface Geraet {
    id: string;
    name: string; // In class diagram "modelName"
    description: string;
    image: string;

    type: 'FDM_Drucker' | 'SLA_Drucker' | 'Lasercutter' | 'CNC_Fräse' | 'Papierdrucker';
    status: 'Verfügbar' | 'Wartung' | 'Defekt';

    // TODO 3D Druck spezifische sachen eventuell in ThreeDPrinter Object auslagern
    volume: string;
    // TODO unklar was damit gemeint ist? Layer hight und Nottel Temperature könnte man eventeull nur pro buchung festlegen?
    layer: string;
    nozzle: string;
}

interface ThreeDPrinter extends Geraet {
    type: 'FDM_Drucker' | 'SLA_Drucker';
}