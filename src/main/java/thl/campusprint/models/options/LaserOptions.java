package thl.campusprint.models.options;

import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class LaserOptions extends DeviceOptions {
  private WorkArea work_area;
  private List<Preset> presets;

  @Data
  public static class WorkArea {
    private int x;
    private int y;
  }

  @Data
  public static class Preset {
    private String material;
    private double thickness;
    private int power;
    private int speed;
  }
}
