package thl.campusprint.models.options;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import java.io.IOException;

public class SupportTypeDeserializer extends JsonDeserializer<SupportType> {
    @Override
    public SupportType deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getText();
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return SupportType.valueOf(value);
    }
}
