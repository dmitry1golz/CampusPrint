package thl.campusprint.models.options;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class PaperSelectedOptions extends PrintJobSlectedOptions {
    private Integer selected_paper_weights;
    private String selected_format;
}
