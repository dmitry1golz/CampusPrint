package thl.campusprint.models.options;

import lombok.Data;

@Data
public class FdmMaterial {
    private String name;
    private int temp_nozzle;
    private int temp_bed;
    private String color_hex;   
}
