package thl.campusprint.models.options;

import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class FdmOptions extends DeviceOptions {
    private Dimensions3D work_area;
    private List<FdmMaterial> available_materials;
    private List<Double> supported_layer_heights;
    private List<Double> nozzle_sizes;
}
