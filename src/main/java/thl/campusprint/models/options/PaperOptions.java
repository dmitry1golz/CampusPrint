package thl.campusprint.models.options;

import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class PaperOptions extends DeviceOptions {
  private List<Integer> paper_weights;
  private List<String> formats;
}
