package thl.campusprint.models.options;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class SlaSelectedOptions extends PrintJobSlectedOptions {
    private SlaMaterial selected_material;
    private Double selected_layer_height;

    @JsonDeserialize(using = SupportTypeDeserializer.class)
    private SupportType selected_support_type;

    private Double selected_infill_percentage;
}
