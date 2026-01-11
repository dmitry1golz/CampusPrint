package thl.campusprint.models.options;

import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class LaserOptions extends DeviceOptions {
    private Dimensions2D work_area;
    private List<LaserPreset> presets;
}
