@echo off
setlocal EnableDelayedExpansion
title REA Estructuras de Datos y Algoritmos

cd /d "%~dp0"

if not exist "index.html" goto no_project

set HAS_PY=0
set PY_CMD=

where py >nul 2>&1
if not errorlevel 1 (
    set HAS_PY=1
    set PY_CMD=py
)

if "!HAS_PY!"=="0" (
    where python >nul 2>&1
    if not errorlevel 1 (
        set HAS_PY=1
        set PY_CMD=python
    )
)

if "!HAS_PY!"=="0" (
    where python3 >nul 2>&1
    if not errorlevel 1 (
        set HAS_PY=1
        set PY_CMD=python3
    )
)

set HAS_NODE=0
where node >nul 2>&1
if not errorlevel 1 set HAS_NODE=1

set HAS_SERVE_JS=0
if exist "%~dp0scripts\serve.js" set HAS_SERVE_JS=1

set HAS_SANITY=0
if exist "%~dp0scripts\verificador.bat" set HAS_SANITY=1

:menu
cls
echo.
echo  ================================================================
echo     Laboratorio Visual de Estructuras de Datos y Algoritmos
echo     Recurso Educativo Abierto (REA) - CC BY-NC 4.0
echo  ================================================================
echo.
echo     ¿Cómo desea iniciar la aplicación?
echo.
echo       [1]  Abrir directo con el navegador    (file://)
echo       [2]  Servidor local Python             (http://localhost:8000)
echo       [3]  Servidor local Node.js            (http://localhost:8080)
echo       [4]  Verificación de integridad del proyecto
echo       [5]  Abrir carpeta del proyecto
echo       [0]  Salir
echo.
echo     --------------------------------------------------------------

if "!HAS_PY!"=="1" (
    echo     Python:     SI   [!PY_CMD!]
) else (
    echo     Python:     NO
)
if "!HAS_NODE!"=="1" (
    echo     Node.js:    SI
) else (
    echo     Node.js:    NO
)
if "!HAS_SERVE_JS!"=="1" (
    echo     serve.js:   presente
) else (
    echo     serve.js:   ausente    [opción 3 deshabilitada]
)
if "!HAS_SANITY!"=="1" (
    echo     Sanity:     presente
) else (
    echo     Sanity:     ausente    [opción 4 deshabilitada]
)
echo     --------------------------------------------------------------
echo.

set "CHOICE="
set /p CHOICE="     Elija una opción [0-5]: "

if "!CHOICE!"=="1" goto open_browser
if "!CHOICE!"=="2" goto serve_python
if "!CHOICE!"=="3" goto serve_node
if "!CHOICE!"=="4" goto run_sanity
if "!CHOICE!"=="5" goto open_folder
if "!CHOICE!"=="0" goto end

echo.
echo     Opcion invalida. Intente de nuevo.
timeout /t 5 /nobreak >nul
goto menu

:open_browser
cls
echo.
echo     Abriendo la aplicacion con el navegador predeterminado...
echo.
echo     Modo file:// - los presets se cargan embebidos en file_loader.js.
echo     La lectura de autor.txt puede fallar por CORS del navegador;
echo     si ocurre, use la opcion [2] o [3] para servidor local.
echo.
start "" "index.html"
timeout /t 5 /nobreak >nul
goto end

:serve_python
if "!HAS_PY!"=="0" goto no_python
cls
echo.
echo     Iniciando servidor Python en http://localhost:8000
echo.
echo     Se abrira una NUEVA VENTANA con el servidor HTTP.
echo     Para detenerlo: cierre esa ventana o presione Ctrl+C en ella.
echo.
start "REA - Servidor Python [8000]" cmd /k "!PY_CMD! -m http.server 8000 --bind 127.0.0.1"
echo     Esperando 3 segundos a que el servidor arranque...
timeout /t 3 /nobreak >nul
echo     Abriendo el navegador...
start "" "http://localhost:8000"
echo.
echo     Servidor corriendo en segundo plano.
echo     Esta ventana se cerrara en 5 segundos.
timeout /t 5 /nobreak >nul
goto end

:no_python
cls
echo.
echo     Python no esta instalado o no esta en el PATH del sistema.
echo.
echo     Para instalarlo:
echo       1. Visite https://www.python.org/downloads/
echo       2. Descargue el instalador para Windows.
echo       3. Durante la instalacion, MARQUE la casilla:
echo             [X] Add python.exe to PATH
echo.
echo     Alternativas sin Python:
echo       - Use la opcion [1] (abrir directo con el navegador).
echo       - O instale Node.js y use la opcion [3].
echo.
echo     Presione una tecla para volver al menu...
pause >nul
goto menu

:serve_node
if "!HAS_NODE!"=="0" goto no_node
if "!HAS_SERVE_JS!"=="0" goto no_serve_js
cls
echo.
echo     Iniciando servidor Node.js en http://localhost:8080
echo.
echo     Se abrira una NUEVA VENTANA con el servidor HTTP.
echo     Para detenerlo: cierre esa ventana o presione Ctrl+C en ella.
echo.
start "REA - Servidor Node [8080]" cmd /k "node "%~dp0scripts\serve.js" 8080"
echo     Esperando 3 segundos a que el servidor arranque...
timeout /t 3 /nobreak >nul
echo     Abriendo el navegador...
start "" "http://localhost:8080"
echo.
echo     Servidor corriendo en segundo plano.
echo     Esta ventana se cerrara en 5 segundos.
timeout /t 5 /nobreak >nul
goto end

:no_node
cls
echo.
echo     Node.js no esta instalado o no esta en el PATH del sistema.
echo.
echo     Para instalarlo:
echo       1. Visite https://nodejs.org/
echo       2. Descargue la version LTS para Windows.
echo       3. Ejecute el instalador (marca el PATH automaticamente).
echo.
echo     Alternativas sin Node.js:
echo       - Use la opcion [1] (abrir directo con el navegador).
echo       - O instale Python y use la opcion [2].
echo.
echo     Presione una tecla para volver al menu...
pause >nul
goto menu

:no_serve_js
cls
echo.
echo     El archivo "scripts\serve.js" no esta presente en el proyecto.
echo.
echo     Restaurelo desde la distribucion original del REA, o use
echo     la opcion [2] (servidor Python) o [1] (abrir directo).
echo.
echo     Presione una tecla para volver al menu...
pause >nul
goto menu

:run_sanity
cls
if "!HAS_SANITY!"=="0" goto no_sanity
echo.
echo     Ejecutando verificacion de integridad del proyecto...
echo.
call "%~dp0scripts\verificador.bat"
goto menu

:no_sanity
cls
echo.
echo     El archivo "scripts\verificador.bat" no esta presente.
echo.
echo     Ubicacion esperada:
echo       %~dp0scripts\verificador.bat
echo.
echo     Presione una tecla para volver al menu...
pause >nul
goto menu

:open_folder
cls
echo.
echo     Abriendo la carpeta del proyecto en el Explorador...
start "" explorer.exe "%~dp0"
timeout /t 2 /nobreak >nul
goto end

:no_project
cls
echo.
echo     ERROR: No se encontro "index.html" en este directorio.
echo.
echo     Asegurese de que este lanzador este en la carpeta raiz del
echo     proyecto, junto a index.html, css\, js\, datos\, scripts\, etc.
echo.
echo     Directorio actual: %CD%
echo.
echo     Presione una tecla para salir...
pause >nul
endlocal
exit /b 1

:end
endlocal
exit /b 0