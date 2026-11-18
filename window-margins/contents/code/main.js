// Нові звичайні вікна відкриваються з відступом 8 px від країв екрана
// і від видимої панелі (зокрема плаваючої).
var MARGIN = 8;

// Список виключень: правила відступів не застосовуються до вікни,
// у якому resourceClass, resourceName або caption співпадає з одним із цих імен
// (порівняння без урахування регістру; для caption — по підстрокі).
// Наприклад: spectacle (скріншоти / скрінсейвер), xscreensaver, kscreenlocker тощо.
var EXCEPTIONS = [
    "spectacle",
    "xscreensaver",
    "kscreenlocker"
];

// Увімкніть true, щоб бачити дані кожного нового вікна у файлі
// /tmp/window-margins-debug.log (і в журналі KWin, якщо print там доступний).
// Це допоможе підіbraти правильні імена для EXCEPTIONS.
var DEBUG = false;

function logWindow(win) {
    if (!DEBUG || !win) {
        return;
    }
    var msg = "window-margins: added caption=" + (win.caption || "-") +
              " resourceName=" + (win.resourceName || "-") +
              " resourceClass=" + (win.resourceClass || "-") +
              " windowClass=" + (win.windowClass || "-") +
              " normalWindow=" + win.normalWindow;
    print(msg);
    // Записуємо у файл, бо print з KWin-скрипта не завжди потрапляє в journalctl
    try {
        var f = new File("/tmp/window-margins-debug.log");
        f.open(QIODevice.WriteOnly | QIODevice.Append);
        f.write(msg + "\n");
        f.close();
    } catch (e) {
        // файлове логування не обов'язкове
    }
}

function contains(haystack, needle) {
    if (!haystack) {
        return false;
    }
    return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
}

function matchesException(win) {
    if (!win) {
        return false;
    }
    var fields = [win.resourceClass, win.resourceName, win.windowClass, win.caption];
    for (var i = 0; i < fields.length; i++) {
        for (var j = 0; j < EXCEPTIONS.length; j++) {
            if (contains(fields[i], EXCEPTIONS[j])) {
                return true;
            }
        }
    }
    return false;
}

function place(win) {
    if (!win || !win.normalWindow) {
        return;
    }

    logWindow(win);

    // Не чіпаємо вікна зі списку виключень (скріншоти, скрінсейвери тощо).
    if (matchesException(win)) {
        return;
    }

    var area = workspace.clientArea(KWin.MaximizeArea, win);
    var rect = {
        x: area.x + MARGIN,
        y: area.y + MARGIN,
        width: area.width - 2 * MARGIN,
        height: area.height - 2 * MARGIN
    };

    // Уникаємо вимируних/плаваючих панелей: беремо їхню реальну геометрію,
    // а не лише зарезервовану KWin область.
    var wins = workspace.windowList();
    for (var i = 0; i < wins.length; i++) {
        var d = wins[i];
        if (!d.dock || !d.output || !win.output || d.output.name !== win.output.name) {
            continue;
        }
        var g = d.frameGeometry;
        var cx = rect.x + rect.width / 2;
        var cy = rect.y + rect.height / 2;
        var gx = g.x + g.width / 2;
        var gy = g.y + g.height / 2;
        if (gy >= cy) {
            // панель унизу
            rect.height = Math.min(rect.height, (g.y - MARGIN) - rect.y);
        } else if (gy < cy) {
            // панель зверху
            var newY = Math.max(rect.y, g.y + g.height + MARGIN);
            rect.height = Math.min(rect.height, (rect.y + rect.height) - newY);
            rect.y = newY;
        } else if (gx < cx) {
            // панель ліворуч
            var newX = Math.max(rect.x, g.x + g.width + MARGIN);
            rect.width = Math.min(rect.width, (rect.x + rect.width) - newX);
            rect.x = newX;
        } else {
            // панель праворуч
            rect.width = Math.min(rect.width, (g.x - MARGIN) - rect.x);
        }
    }

    if (rect.width < 1 || rect.height < 1) {
        return;
    }
    win.frameGeometry = rect;
}

workspace.windowAdded.connect(place);
