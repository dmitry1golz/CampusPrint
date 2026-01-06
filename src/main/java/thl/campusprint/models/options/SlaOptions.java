package thl.campusprint.models.options;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class SlaOptions extends DeviceOptions {
    
    private Dimensions dimensions;
    private List<ResinProfile> available_materials; // Harze statt Filament
    private List<Double> supported_layer_heights;
    // Wichtig: KEINE nozzle_sizes, da SLA Laser/LCD nutzt

    @Data
    public static class Dimensions {
        private int x;
        private int y;
        private int z;
    }

    @Data
    public static class ResinProfile {
        private String name;      // z.B. "Tough Resin"
        private String color_hex; // Farbe für die UI
        // Keine Temperaturen nötig bei Resin!
    }
}