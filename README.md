# window-marginsEnabled

KWin-скрипт для KDE Plasma 6: кожне нове звичайне вікно відкривається з відступом **8 px** від країв екрана і від видимої панелі (зокрема плаваючої).

## Що робить

- 8 px від лівого, правого та верхнього краю екрана.
- 8 px від видимого краю панелі знизу (або з боку, де вона розташована).
- Працює на кількох екранах: для кожного екрана область обчислюється окремо.
- Не чіпає діалоги, панелі та службові вікна — лише звичайні вікна програм.

## Як це працює

1. `workspace.clientArea(KWin.MaximizeArea, win)` — область екрана за виключенням зарезервованої панеллю смуги.
2. Додатково читається реальна геометрія dock-вікна панелі (`win.dock`, `win.frameGeometry`), бо у плаваючої панелі видима область більша за зарезервовану (смуга + плаваючі відступи).
3. Від області віднімається `MARGIN` з усіх боків і додатково від видимого краю панелі.
4. Результат присвоюється `win.frameGeometry`.

## Вимоги

- KDE Plasma 6 / KWin 6 (Wayland або X11).
- Панель має резервувати місце (режим Normal) або бути плаваючою; скрипт ураховує фактичну геометрію dock-вікна.

## Встановлення

### Через install.sh

```bash
cd /home/chirik/Projects/window-marginsEnabled
./install.sh
```

Скрипт копіює пакет у `~/.local/share/kwin/scripts/window-margins/`, додає
`[Plugins] window-marginsEnabled=true` у `~/.config/kwinrc` і перезапускає
конфігурацію KWin.

### Вручну

```bash
mkdir -p ~/.local/share/kwin/scripts
cp -a window-margins ~/.local/share/kwin/scripts/

kwriteconfig6 --file kwinrc --group Plugins --key window-marginsEnabled true
qdbus6 org.kde.KWin /KWin reconfigure
```

Якщо `kwriteconfig6`/`qdbus6` недоступні:

```bash
gdbus call --session --dest org.kde.KWin --object-path /KWin \
  --method org.kde.KWin.reconfigure
```

## Налаштування

Відступ змінюється константою `MARGIN` на початку `window-margins/contents/code/main.js`.
Після зміни перезавантажте скрипт:

```bash
kwriteconfig6 --file kwinrc --group Plugins --key window-marginsEnabled false
qdbus6 org.kde.KWin /KWin reconfigure
kwriteconfig6 --file kwinrc --group Plugins --key window-marginsEnabled true
qdbus6 org.kde.KWin /KWin reconfigure
```

## Перевірка

```bash
qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.isScriptLoaded window-margins
# має повернути true
```

Потім відкрийте нове вікно програми — воно має з'явитися з відступами.

Для зняття чисел з живої сесії можна скористатися `tools/kwin_dbus_probe.py`
(потрібні `python3-dbus` та `python3-gobject`):

```bash
python3 tools/kwin_dbus_probe.py /tmp/kwinprobe.out
# з іншого термінала: завантажити тестовий KWin-скрипт, що викликає Report
```

## Видалення

```bash
./uninstall.sh
```

Або вручну:

```bash
rm -rf ~/.local/share/kwin/scripts/window-margins
kwriteconfig6 --file kwinrc --group Plugins --key window-marginsEnabled false
qdbus6 org.kde.KWin /KWin reconfigure
```

## Приклад на вашій сесії

- Екран DP-3: 1920×1080.
- Панель видима: `0,1032 1920×48` (32 px смуга + 8 px плаваючі відступи зверху і знизу).
- Зарезервована KWin область: `1920×1048`.
- Підраховане положення нового вікна: `x=8, y=8, width=1904, height=1016`.
- Низ вікна: `1024` — рівно 8 px від видимого краю панелі (`1032`).

## Структура

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

## Обмеження

- Скрипт діє лише на **нові** звичайні вікна; вже відкриті вікна не рухаються.
- Якщо панель перевести в авто-приховування, скрипт зараз все одно залишатиме зазор за її геометрією (публічний API KWin не віддає видимість панелі напряму).
- Вікна з дуже великим мінімальним розміром можуть не вміститися в обчислену область.

## Ліцензія

GPLv3 (як у `metadata.json`).
