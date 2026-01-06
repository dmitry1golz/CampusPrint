package thl.campusprint.models.options;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class PaperOptions extends DeviceOptions {
    private List<Integer> paper_weights;
    private List<String> formats;
}