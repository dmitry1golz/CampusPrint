package thl.campusprint.models.options;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class FdmSelectedOptions extends PrintJobSlectedOptions {
    private FdmMaterial selected_material;
    private Double selected_layer_height;
    private Double selected_nozzle_size;

    @JsonDeserialize(using = SupportTypeDeserializer.class)
    private SupportType selected_support_type;

    private Double selected_infill_percentage;
}
