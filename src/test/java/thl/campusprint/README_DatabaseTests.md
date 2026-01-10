
# CampusPrint Database Integration Tests

### Was macht dieser Test?

Dieser Test stellt sicher, dass unsere Start-Daten (`data.sql`) und das Datenbankschema korrekt funktionieren, **bevor** der Code in Produktion geht.

1. **Echte Umgebung:** Startet einen isolierten **MySQL 8 Container** (via Testcontainers/Docker/Podman).
2. **Schema Check:** Lässt Hibernate die Tabellen basierend auf den Java-Entities erstellen.
3. **Data Check:** Lädt die `src/main/resources/data.sql` in den Container.
4. **Verifikation:** Prüft per SQL, ob:
* Alle User, Geräte und Buchungen geladen wurden, wie in der **data.sql** vorgegeben.
* Komplexe Datentypen (JSON in `print_options`) lesbar sind.
* Beziehungen (Foreign Keys) zwischen Tabellen stimmen.

### Dieser Test muss nur ausgeführt werden, wenn etwas an der Datenbank bzw. der data.sql verändert wurde.
Dafür der commit Message einfach [DatabaseTest] hinzufügen.

### Test anpassen?

Wenn du die `data.sql` änderst, wird dieser Test wahrscheinlich fehlschlagen. So reparierst du ihn:

#### 1. Ich habe neue Daten hinzugefügt (z. B. einen neuen Drucker)

* **Fehler:** `Expecting actual: 8 to be equal to: 7`
* **Lösung:** Suche im Test nach `verifyDevicesAndJson`.
* **Anpassung:** Erhöhe den erwarteten Wert:
```java
// Alt
assertThat(rs.getInt(1)).isEqualTo(7);
// Neu
assertThat(rs.getInt(1)).isEqualTo(8);

```



#### 2. Daten gelöscht oder IDs geändert

* **Fehler:** `Admin User muss existieren` (AssertionError)
* **Lösung:** Prüfe in `verifyUsersLoaded`, ob die Email-Adresse im Test noch mit der in der `data.sql` übereinstimmt.

#### 3.Entities oder Tabellen umbenannt

* **Fehler:** `Table 'CampusPrint.users' doesn't exist`
* **Lösung:** MySQL auf Linux (Container) ist **Case-Sensitive**!
* Prüfe die SQL-Queries im Test (`SELECT ... FROM tabelle`).
* Passen die Namen exakt zu dem, was Hibernate generiert (meistens *lowercase*)?



#### 4. JSON-Struktur geändert

* **Fehler:** `AssertionError` in `verifyDevicesAndJson`
* **Lösung:** Wenn du z. B. `color_hex` in `color` umbenannt hast, update den String-Check im Test:
```java
assertThat(jsonOptions).contains("\"color\": \"#FFFFFF\"");

```
