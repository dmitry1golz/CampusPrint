package thl.campusprint.models.options;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class SlaOptions extends DeviceOptions {
    
    private Dimensions3D work_area;
    private List<SlaMaterial> available_materials;
    private List<Double> supported_layer_heights;

    // SlaMertials sind Resins (Harze)
    @Data
    public static class SlaMaterial {
        private String name;      // z.B. "Tough Resin"
        private String color_hex; // Farbe für die UI
    }
}