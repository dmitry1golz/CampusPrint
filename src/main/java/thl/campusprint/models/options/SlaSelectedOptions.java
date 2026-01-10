package thl.campusprint.models.options;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class SlaSelectedOptions extends PrintJobSlectedOptions {
    private SlaMaterial selected_material;
    private Double selected_layer_height;
    private SupportType selected_support_type;
    private Double selected_infill_percentage;
}
