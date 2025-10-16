# Screenshot Generator

Automatyczny system do robienia screenshotów wszystkich projektów z portfolio.

## 🚀 Szybki start

```bash
# Test systemu
npm run screenshots:test

# Generowanie screenshotów dla wszystkich projektów
npm run screenshots
```

## 📋 Co robi skrypt

1. **Skanuje projekty** - ładuje wszystkie pliki `.json` z `content/projects/`
2. **Filtruje live projekty** - bierze tylko te ze `status: "live"` i `liveUrl`
3. **Robi screenshoty** - używa Playwright do pełnoekranowych zrzutów
4. **Aktualizuje JSON** - dodaje ścieżki do screenshotów w sekcji `screens`
5. **Organizuje pliki** - zapisuje w `public/images/` z timestampami

## 📸 Typy screenshotów

Dla każdego projektu próbuje zrobić:

- **Main page** - główna strona (zawsze)
- **About page** - `/about` (jeśli istnieje)
- **Features page** - `/features` (jeśli istnieje)
- **Demo page** - `/demo` (jeśli istnieje)
- **Docs page** - `/docs` (jeśli istnieje)

## 📁 Struktura plików

```
usecases/
├── content/projects/           # Pliki JSON projektów
│   ├── copypal.json
│   ├── drawiodb.json
│   └── ...
├── public/images/             # Screenshoty
│   ├── copypal-main-2025-09-22T20-44-16.png
│   ├── drawiodb-main-2025-09-22T20-45-20.png
│   └── ...
├── screenshot-generator.js    # Główny skrypt
├── screenshot-test.js        # Skrypt testowy
└── SCREENSHOTS.md           # Ta dokumentacja
```

## ⚙️ Konfiguracja screenshotów

Skrypt używa następujących ustawień:

- **Rozdzielczość**: 1920x1080 (Full HD)
- **Format**: PNG z jakością 90%
- **Typ**: Full page screenshot
- **Timeout**: 30 sekund na stronę
- **Wait**: 2 sekundy na animacje

## 📝 Format nazw plików

```
{slug}-{type}-{timestamp}.png

Przykłady:
- copypal-main-2025-09-22T20-44-16.png
- drawiodb-features-2025-09-22T20-45-20.png
- imagedb-demo-2025-09-22T20-46-35.png
```

## 🔧 Wymagania

Skrypt automatycznie zainstaluje:
- `@playwright/test` - do automatyzacji przeglądarki
- `chromium` browser - do renderowania stron

## 📊 Przykładowe wyjście

```bash
🚀 Starting screenshot generation for all projects...

Installing Playwright...
Found 5 live projects to screenshot

📸 Processing: CopyPal (copypal)
🔗 URL: https://copypal.online/
Taking screenshot of: https://copypal.online/
✅ Screenshot saved: /Users/moon/usecases/public/images/copypal-main-2025-09-22T20-44-16.png
📝 Updated copypal.json with 1 screenshots
✨ Completed CopyPal: 1 screenshots

📸 Processing: DrawIO DB (drawiodb)
🔗 URL: https://drawiodb.online/
Taking screenshot of: https://drawiodb.online/
✅ Screenshot saved: /Users/moon/usecases/public/images/drawiodb-main-2025-09-22T20-45-20.png
📝 Updated drawiodb.json with 1 screenshots
✨ Completed DrawIO DB: 1 screenshots

🎉 All projects processed!
📁 Screenshots saved in: /Users/moon/usecases/public/images
📄 Project JSON files updated with screenshot references
```

## 🛠️ Troubleshooting

### Playwright installation fails
```bash
npx playwright install
```

### Screenshot fails for specific site
- Sprawdź czy strona jest dostępna
- Sprawdź czy nie ma CAPTCHA/cloudflare protection
- Zwiększ timeout w skrypcie

### Images directory missing
Skrypt automatycznie utworzy, ale możesz ręcznie:
```bash
mkdir -p public/images
```

## 🔄 Re-run screenshotów

Skrypt nie sprawdza czy screenshot już istnieje - zawsze tworzy nowe z timestampem.
Stare screenshoty NIE są automatycznie usuwane.

## 📋 Manual cleanup

Żeby usunąć stare screenshoty:
```bash
# Usuń wszystkie screenshoty starsze niż 7 dni
find public/images -name "*-20*" -mtime +7 -delete

# Usuń screenshoty konkretnego projektu
rm public/images/copypal-*
```