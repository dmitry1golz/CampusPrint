package thl.campusprint.models.options;

import lombok.Data;

// SlaMertials sind Resins (Harze)
@Data
public class SlaMaterial {
    private String name; // z.B. "Tough Resin"
    private String color_hex; // Farbe für die UI
}
