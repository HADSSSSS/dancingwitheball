   @echo off
   cd /d "%~dp0"
   python tools/build.py || py tools/build.py
   pause