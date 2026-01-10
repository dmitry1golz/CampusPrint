package thl.campusprint.models.options;

import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class SlaOptions extends DeviceOptions {
    
    private Dimensions3D work_area;
    private List<SlaMaterial> available_materials;
    private List<Double> supported_layer_heights;
}
