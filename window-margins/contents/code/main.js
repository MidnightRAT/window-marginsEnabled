// Нові звичайні вікна відкриваються з відступом 5 px від країв екрана
// і від видимої панелі (зокрема плаваючої).
var MARGIN = 5;

function place(win) {
    if (!win || !win.normalWindow) {
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
