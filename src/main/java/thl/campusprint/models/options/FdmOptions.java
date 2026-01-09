package thl.campusprint.models.options;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class FdmOptions extends DeviceOptions {
    private Dimensions3D work_area;
    private List<FdmMaterial> available_materials;
    private List<Double> supported_layer_heights;
    private List<Double> nozzle_sizes;

    @Data
    public static class FdmMaterial {
        private String name;
        private int temp_nozzle;
        private int temp_bed;
        private String color_hex;   
    }
}