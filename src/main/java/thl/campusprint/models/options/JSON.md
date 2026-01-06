Hier ist die ausführliche Dokumentation (**README_DEVICE_ARCHITECTURE.md**), die genau beschreibt, was wir gebaut haben, warum es sicher ist und wie man es erweitert.

Du kannst diese Datei direkt in dein Projekt legen (z.B. im Ordner `docs/` oder im Root-Verzeichnis), damit jeder Entwickler (und du in Zukunft) genau weiß, wie das JSON-Magie-System funktioniert.

---

# Dokumentation: Geräte-Architektur & JSON-Handling

## Einführung

Dieses Projekt nutzt einen **Hybrid-Ansatz** für die Speicherung von Gerätedaten. Während Stammdaten (Name, ID, Status) in klassischen relationalen Spalten liegen, werden die **technischen Details** (Druckbett-Temperatur, Bauraum, Laser-Presets) als **JSON** in einer einzigen Text-Spalte (`print_options`) gespeichert.

Um **Typensicherheit** zu gewährleisten und Datenchaos zu vermeiden, nutzen wir **Polymorphie** in Java (Spring Boot) und **Discriminated Unions** in TypeScript.

---

## 1. Das Problem & Die Lösung

### Das Problem

Verschiedene Geräte haben völlig unterschiedliche Eigenschaften:

* Ein **FDM-Drucker** hat Düsentemperaturen und Filamente.
* Ein **SLA-Drucker** hat Harze und Belichtungszeiten (keine Düse).
* Ein **Lasercutter** hat Laser-Power und Geschwindigkeits-Presets.
* Ein **Plotter** hat Papierformate.

Würden wir das rein relational (SQL) lösen, hätten wir eine Tabelle mit 50 Spalten, von denen 40 immer `NULL` sind (`temp_nozzle` bei einem Lasercutter macht keinen Sinn).

### Die Lösung: Typisiertes JSON

Wir speichern diese Daten als JSON Blob. Aber anstatt einer chaotischen `Map<String, Object>` nutzen wir **strenge Java-Klassen**.

---

## 2. Backend (Java / Spring Boot)

Das Herzstück ist die abstrakte Klasse `DeviceOptions`. Wir nutzen die Bibliothek **Jackson**, um das JSON automatisch in die richtige Java-Unterklasse zu wandeln.

### Die Magie: `@JsonTypeInfo`

Das Feld `"tech_type"` im JSON entscheidet, welche Java-Klasse instanziiert wird.

```java
// Datei: src/main/java/thl/campusprint/models/options/DeviceOptions.java

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "tech_type" // <--- Das ist der Schlüssel!
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = FdmOptions.class, name = "FDM"),
    @JsonSubTypes.Type(value = SlaOptions.class, name = "SLA"),
    @JsonSubTypes.Type(value = LaserOptions.class, name = "LASER"),
    @JsonSubTypes.Type(value = PaperOptions.class, name = "PAPER")
})
public abstract class DeviceOptions { }

```

### Die Entity (`Device.java`)

In der Datenbank-Entity mappen wir das JSON-Feld auf diese abstrakte Klasse.

```java
@Entity
public class Device {
    // ...
    
    // CamelCase in Java, aber snake_case im JSON durch @JsonProperty
    @JsonProperty("print_options") 
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "print_options", columnDefinition = "TEXT")
    private DeviceOptions printOptions;
}

```

### Die konkreten Klassen (Beispiel: FDM)

Hier definieren wir strikt, welche Felder erlaubt sind.

```java
@Data
public class FdmOptions extends DeviceOptions {
    // Diese Struktur wird 1:1 im JSON erwartet
    private Dimensions dimensions; 
    private List<MaterialProfile> available_materials; // Enthält temp_nozzle, temp_bed
    private List<Double> supported_layer_heights;
    private List<Double> nozzle_sizes;
}

```

---

## 3. Datenbank (Raw JSON)

In der Datenbank (Tabelle `devices`, Spalte `print_options`) sieht ein Eintrag so aus.
**WICHTIG:** Das Feld `"tech_type"` ist zwingend erforderlich!

**Beispiel FDM Drucker:**

```json
{
  "tech_type": "FDM",
  "dimensions": { "x": 256, "y": 256, "z": 256 },
  "available_materials": [
    { 
      "name": "PLA Basic", 
      "temp_nozzle": 220, 
      "temp_bed": 55, 
      "color_hex": "#ff0000" 
    }
  ],
  "supported_layer_heights": [0.1, 0.2]
}

```

**Beispiel Lasercutter:**

```json
{
  "tech_type": "LASER",
  "work_area": { "x": 600, "y": 400 },
  "presets": [...]
}

```

---

## 4. Frontend (TypeScript)

Damit das Frontend nicht abstürzt, wenn es auf `dimensions.z` bei einem Lasercutter zugreift, nutzen wir **Discriminated Unions**.

### Die Interfaces (`models/geraet.ts`)

```typescript
// Basis-Interface
interface BaseGeraet {
    id: number;
    // ...
    print_options?: ThreeDOptions | LaserOptions | PaperOptions;
}

// Spezifische Optionen mit Kennung
export interface ThreeDOptions {
    tech_type: 'FDM' | 'SLA'; // <--- Matcht das Java @JsonSubTypes name
    dimensions: { x: number; y: number; z: number };
    available_materials: MaterialProfile[];
    // ...
}

export interface LaserOptions {
    tech_type: 'LASER';
    work_area: { x: number; y: number };
    // ...
}

```

### Admin Dashboard (`admin.ts`)

Im Admin-Bereich passiert Folgendes:

1. **Laden (GET):** Wir prüfen `type` und casten `print_options` sicher.
* *Defensive Coding:* Wir prüfen immer `if (eq.print_options)`, bevor wir darauf zugreifen, um Abstürze bei fehlerhaften DB-Daten zu verhindern.


2. **Bearbeiten (Material Manager):**
* Für FDM-Drucker gibt es einen UI-Bereich, um Filamente (Name, Temp, Farbe) hinzuzufügen.
* Diese werden in einer temporären Liste (`tempMaterialList`) gespeichert.


3. **Speichern (PUT):**
* Wir bauen das JSON-Objekt zusammen.
* **WICHTIG:** Wir fügen manuell `tech_type: 'FDM'` (bzw. SLA/LASER) hinzu, bevor wir es an das Backend senden. Ohne dieses Feld würde das Backend das JSON verwerfen (`null`).
* Wir achten darauf, Felder wie `model`, die nicht im Formular sind, aus dem alten Objekt zu kopieren, damit sie nicht gelöscht werden.



---

## 5. How-To: Wie benutze ich das?

### Szenario A: Ein neues Filament hinzufügen (Admin)

1. Gehe auf das Admin Dashboard -> Tab "Geräte".
2. Klicke bei einem FDM-Drucker auf "Edit".
3. Unten im Bereich "Material Profile" Namen (z.B. "PETG"), Temperaturen und Farbe eingeben.
4. Auf `+` klicken.
5. Auf "Gerät Speichern" klicken.
* *Backend:* Speichert das neue Array in die DB.
* *Nutzer:* Sieht bei der Buchung nun "PETG" zur Auswahl (ohne Temperaturen sehen zu müssen).



### Szenario B: Einen neuen Gerätetyp hinzufügen (Developer)

Wenn du z.B. eine **Nähmaschine** hinzufügen willst:

1. **Backend (Java):**
* Erstelle `SewingOptions.java extends DeviceOptions`.
* Definiere Felder (z.B. `boolean canEmbroidery`).
* Registriere die Klasse in `DeviceOptions.java`: `@JsonSubTypes.Type(value = SewingOptions.class, name = "SEWING")`.


2. **Frontend (TypeScript):**
* Erstelle Interface `SewingOptions` mit `tech_type: 'SEWING'`.
* Erweitere `Geraet` Union Type.


3. **Admin UI (`admin.html` / `admin.ts`):**
* Füge Option im `<select>` hinzu.
* Erweitere den `switch`-Case beim Speichern (`handleSaveEquipment`), um das richtige JSON mit `tech_type: 'SEWING'` zu bauen.

