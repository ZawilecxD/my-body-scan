# Glossary

## Injury update

A timestamped, user-authored record on one injury. It stores an optional severity (integer 0–10) and an optional note. At least one of those is present. This is the only place new severity and injury notes are written.

Do not call a new row a comment or a severity reading. Those names are legacy sources that were copied into injury updates.

An injury update is not an injury event. Events are lifecycle rows (`created`, `archived`, `reopened`, `solution_added`, `solution_removed`). Do not present events as updates.

## Note

The optional free-text field on an injury update. User-authored. The app stores it; it does not interpret it. Empty input is stored as no note, not as an empty string.
