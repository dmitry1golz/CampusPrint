package thl.campusprint.models.options;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class LaserSelectedOptions extends PrintJobSlectedOptions {
    private LaserPreset selected_preset;
}
