package thl.campusprint.models.options;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class LaserOptions extends DeviceOptions {
    private Dimensions2D work_area;
    private List<LaserPreset> presets;
}