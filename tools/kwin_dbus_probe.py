#!/usr/bin/python3
"""D-Bus probe service for KWin script verification.

KWin scripts cannot write files or read stdout. Run this on the session bus;
a KWin script can then call:

    callDBus("org.hermes.kwinprobe", "/org/hermes/kwinprobe",
             "org.hermes.kwinprobe", "Report", "message");

and the message is appended to the output file.

Usage: kwin_dbus_probe.py [output-file]
Default output: ./kwinprobe.out

Requires: python3-dbus and GLib (gi). Fedora: sudo dnf install python3-gobject
(python3-dbus is usually already present).
"""
import os
import sys

import dbus
import dbus.service
from dbus.mainloop.glib import DBusGMainLoop
from gi.repository import GLib

DBUS_NAME = "org.hermes.kwinprobe"
DBUS_PATH = "/org/hermes/kwinprobe"
DBUS_IFACE = "org.hermes.kwinprobe"
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.getcwd(), "kwinprobe.out")


class Probe(dbus.service.Object):
    def __init__(self, bus, path):
        dbus.service.Object.__init__(self, bus, path)

    @dbus.service.method(DBUS_IFACE, in_signature="s", out_signature="")
    def Report(self, msg):
        with open(OUT, "a") as f:
            f.write(msg + "\n")


DBusGMainLoop(set_as_default=True)
bus = dbus.SessionBus()
# The BusName object MUST be kept alive: dbus-python releases the name
# when the object is garbage collected, so a bare call would lose the
# name immediately and every callDBus() from a KWin script would fail
# with ServiceUnknown.
_bus_name = dbus.service.BusName(DBUS_NAME, bus)
Probe(bus, DBUS_PATH)
print("probe service ready, writing to " + OUT, flush=True)
GLib.MainLoop().run()
