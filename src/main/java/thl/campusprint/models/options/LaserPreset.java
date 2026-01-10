package thl.campusprint.models.options;

import lombok.Data;

@Data
public class LaserPreset {
    private String material;
    private double thickness;
    private int power;
    private int speed;
}
