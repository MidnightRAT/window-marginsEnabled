# window-marginsEnabled

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/redeyesnightrat)

## Опис / Description

**УК:** KWin-скрипт для KDE Plasma 6: кожне нове звичайне вікно відкривається з відступом **8 px** від країв екрана і від видимої панелі (зокрема плаваючої).

**EN:** KWin script for KDE Plasma 6: every new normal window opens with an **8 px** margin from screen edges and from the visible panel (including floating panels).

---

## 🇺🇦 Українська

### Що робить

- 8 px від лівого, правого та верхнього краю екрана.
- 8 px від видимого краю панелі знизу (або з боку, де вона розташована).
- Працює на кількох екранах: для кожного екрана область обчислюється окремо.
- Не чіпає діалоги, панелі та службові вікна — лише звичайні вікна програм.

### Як це працює

1. `workspace.clientArea(KWin.MaximizeArea, win)` — область екрана за виключенням зарезервованої панеллю смуги.
2. Додатково читається реальна геометрія dock-вікна панелі (`win.dock`, `win.frameGeometry`), бо у плаваючої панелі видима область більша за зарезервовану (смуга + плаваючі відступи).
3. Від області віднімається `MARGIN` з усіх боків і додатково від видимого краю панелі.
4. Результат присвоюється `win.frameGeometry`.

### Вимоги

- KDE Plasma 6 / KWin 6 (Wayland або X11).
- Панель має резервувати місце (режим Normal) або бути плаваючою; скрипт ураховує фактичну геометрію dock-вікна.

### Встановлення

#### Через install.sh

```bash
cd /home/chirik/Projects/window-marginsEnabled
./install.sh
```

Скрипт копіює пакет у `~/.local/share/kwin/scripts/window-margins/`, додає
`[Plugins] window-marginsEnabled=true` у `~/.config/kwinrc` і перезапускає
конфігурацію KWin.

#### Вручну

```bash
mkdir -p ~/.local/share/kwin/scripts
cp -a window-margins ~/.local/share/kwin/scripts/

kwriteconfig6 --file kwinrc --group Plugins --key window-marginsEnabled true
qdbus org.kde.KWin /KWin reconfigure
```

> **Примітка для Fedora:** у Fedora 45 команда називається `qdbus` (або `qdbus-qt6`), а не `qdbus6`. Скрипти `install.sh`/`uninstall.sh` автоматично шукають `qdbus-qt6`, `qdbus` та `qdbus6`.

Якщо `kwriteconfig6`/`qdbus` недоступні:

```bash
gdbus call --session --dest org.kde.KWin --object-path /KWin \
  --method org.kde.KWin.reconfigure
```

### Налаштування

Відступ змінюється константою `MARGIN` на початку `window-margins/contents/code/main.js`.
Після зміни перезавантажте скрипт:

```bash
kwriteconfig6 --file kwinrc --group Plugins --key window-marginsEnabled false
qdbus org.kde.KWin /KWin reconfigure
kwriteconfig6 --file kwinrc --group Plugins --key window-marginsEnabled true
qdbus org.kde.KWin /KWin reconfigure
```

### Список виключень

Константа `EXCEPTIONS` у тому ж файлі містить імена вікон, до яких правила відступів
**не** застосовуються. Порівняння відбувається за `resourceClass` і `resourceName`
вікна (без урахування регістру).

За замовчуванням у списку: `spectacle` (скріншоти / скрінсейвер), `xscreensaver`,
`kscreenlocker`.

Додайте власні імена, наприклад:

```js
var EXCEPTIONS = [
    "spectacle",
    "xscreensaver",
    "kscreenlocker",
    "my-app"
];
```

Після зміни перезавантажте скрипт (див. вище).

### Перевірка

```bash
qdbus org.kde.KWin /Scripting org.kde.kwin.Scripting.isScriptLoaded window-margins
# має повернути true
```

Потім відкрийте нове вікно програми — воно має з'явитися з відступами.

Для зняття чисел з живої сесії можна скористатися `tools/kwin_dbus_probe.py`
(потрібні `python3-dbus` та `python3-gobject`):

```bash
python3 tools/kwin_dbus_probe.py /tmp/kwinprobe.out
# з іншого термінала: завантажити тестовий KWin-скрипт, що викликає Report
```

### Видалення

```bash
./uninstall.sh
```

Або вручну:

```bash
rm -rf ~/.local/share/kwin/scripts/window-margins
kwriteconfig6 --file kwinrc --group Plugins --key window-marginsEnabled false
qdbus org.kde.KWin /KWin reconfigure
```

### Приклад на вашій сесії

- Екран DP-3: 1920×1080.
- Панель видима: `0,1032 1920×48` (32 px смуга + 8 px плаваючі відступи зверху і знизу).
- Зарезервована KWin область: `1920×1048`.
- Підраховане положення нового вікна: `x=8, y=8, width=1904, height=1016`.
- Низ вікна: `1024` — рівно 8 px від видимого краю панелі (`1032`).

### Структура

```
window-marginsEnabled/
├── README.md
├── install.sh
├── uninstall.sh
├── window-margins/
│   ├── metadata.json
│   └── contents/code/main.js
└── tools/
    └── kwin_dbus_probe.py
```

### Обмеження

- Скрипт діє лише на **нові** звичайні вікна; вже відкриті вікна не рухаються.
- Якщо панель перевести в авто-приховування, скрипт зараз все одно залишатиме зазор за її геометрією (публічний API KWin не віддає видимість панелі напряму).
- Вікна з дуже великим мінімальним розміром можуть не вміститися в обчислену область.

### Ліцензія

GPLv3 (як у `metadata.json`).

---

## 🇬🇧 English

### What it does

- 8 px from the left, right and top screen edges.
- 8 px from the visible panel edge at the bottom (or on the side where the panel is located).
- Works on multiple screens: the area is computed separately for each screen.
- Does not touch dialogs, panels and service windows — only normal application windows.

### How it works

1. `workspace.clientArea(KWin.MaximizeArea, win)` — screen area excluding the panel-reserved strip.
2. Additionally reads the real panel dock window geometry (`win.dock`, `win.frameGeometry`), because for a floating panel the visible area is larger than the reserved one (strip + floating offsets).
3. `MARGIN` is subtracted from all sides of the area and additionally from the visible panel edge.
4. The result is assigned to `win.frameGeometry`.

### Requirements

- KDE Plasma 6 / KWin 6 (Wayland or X11).
- The panel must reserve space (Normal mode) or be floating; the script accounts for the actual dock window geometry.

### Installation

#### Via install.sh

```bash
cd /home/chirik/Projects/window-marginsEnabled
./install.sh
```

The script copies the package to `~/.local/share/kwin/scripts/window-margins/`, adds
`[Plugins] window-marginsEnabled=true` to `~/.config/kwinrc` and reloads
KWin configuration.

#### Manually

```bash
mkdir -p ~/.local/share/kwin/scripts
cp -a window-margins ~/.local/share/kwin/scripts/

kwriteconfig6 --file kwinrc --group Plugins --key window-marginsEnabled true
qdbus org.kde.KWin /KWin reconfigure
```

> **Note for Fedora:** on Fedora 45 the command is `qdbus` (or `qdbus-qt6`), not `qdbus6`. The `install.sh`/`uninstall.sh` scripts automatically look for `qdbus-qt6`, `qdbus` and `qdbus6`.

If `kwriteconfig6`/`qdbus` are not available:

```bash
gdbus call --session --dest org.kde.KWin --object-path /KWin \
  --method org.kde.KWin.reconfigure
```

### Configuration

The margin is changed via the `MARGIN` constant at the beginning of `window-margins/contents/code/main.js`.
After changing, reload the script:

```bash
kwriteconfig6 --file kwinrc --group Plugins --key window-marginsEnabled false
qdbus org.kde.KWin /KWin reconfigure
kwriteconfig6 --file kwinrc --group Plugins --key window-marginsEnabled true
qdbus org.kde.KWin /KWin reconfigure
```

### Exceptions list

The `EXCEPTIONS` constant in the same file lists window names to which the margin rules
are **not** applied. Comparison is done against the window's `resourceClass` and
`resourceName` (case-insensitive).

By default the list contains: `spectacle` (screenshots/screensaver), `xscreensaver`,
`kscreenlocker`.

Add your own names, for example:

```js
var EXCEPTIONS = [
    "spectacle",
    "xscreensaver",
    "kscreenlocker",
    "my-app"
];
```

After changing, reload the script (see above).

### Verification

```bash
qdbus org.kde.KWin /Scripting org.kde.kwin.Scripting.isScriptLoaded window-margins
# should return true
```

Then open a new application window — it should appear with the margins.

To read values from a live session you can use `tools/kwin_dbus_probe.py`
(requires `python3-dbus` and `python3-gobject`):

```bash
python3 tools/kwin_dbus_probe.py /tmp/kwinprobe.out
# from another terminal: load a test KWin script that calls Report
```

### Uninstallation

```bash
./uninstall.sh
```

Or manually:

```bash
rm -rf ~/.local/share/kwin/scripts/window-margins
kwriteconfig6 --file kwinrc --group Plugins --key window-marginsEnabled false
qdbus org.kde.KWin /KWin reconfigure
```

### Example on your session

- Screen DP-3: 1920×1080.
- Panel visible: `0,1032 1920×48` (32 px strip + 8 px floating offsets top and bottom).
- KWin reserved area: `1920×1048`.
- Computed new window position: `x=8, y=8, width=1904, height=1016`.
- Window bottom: `1024` — exactly 8 px from the visible panel edge (`1032`).

### Structure

```
window-marginsEnabled/
├── README.md
├── install.sh
├── uninstall.sh
├── window-margins/
│   ├── metadata.json
│   └── contents/code/main.js
└── tools/
    └── kwin_dbus_probe.py
```

### Limitations

- The script only applies to **new** normal windows; already open windows are not moved.
- If the panel is set to auto-hide, the script still leaves a gap according to its geometry (public KWin API does not expose panel visibility directly).
- Windows with a very large minimum size may not fit into the computed area.

### License

GPLv3 (as in `metadata.json`).
