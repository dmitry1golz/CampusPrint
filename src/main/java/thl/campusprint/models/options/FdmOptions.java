package thl.campusprint.models.options;

import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class FdmOptions extends DeviceOptions {
  private Dimensions dimensions;
  private List<MaterialProfile> available_materials;
  private List<Double> supported_layer_heights;
  private List<Double> nozzle_sizes;

  // Innere Klassen für Struktur
  @Data
  public static class Dimensions {
    private int x;
    private int y;
    private int z;
  }

  @Data
  public static class MaterialProfile {
    private String name; // Vom Admin festgelegt
    private int temp_nozzle; // Vom Admin festgelegt (User darf das nicht ändern!)
    private int temp_bed; // Vom Admin festgelegt
    private String color_hex;
  }
}
