export interface PrintBooking {
    id: string;
    printerName: string; // Name des Geräts zur Anzeige
    startDate: string;
    endDate: string;
    
    // Optionale Zusatzinfos
    notes?: string;
    message?: string; // Grund für Ablehnung
    videoUrl?: string; // Für Livestream (optional)

    status: 'pending' | 'confirmed' | 'running' | 'completed' | 'rejected';
}

// Interface für das Erstellen (wird später im User-Bereich wichtig)
export interface NewPrintBooking {
    printerId: string;
    startDate: string;
    endDate: string;
    notes?: string;
}