@echo off
setlocal
cd /d "%~dp0"

if not exist "%~dp0sanity_check.ps1" (
    echo.
    echo   ERROR: No se encuentra sanity_check.ps1
    echo.
    echo   Buscado en:
    echo     %~dp0sanity_check.ps1
    echo.
    echo   Asegurese de que ambos archivos esten en la MISMA carpeta:
    echo     sanity_check.bat
    echo     sanity_check.ps1
    echo.
    pause
    endlocal
    exit /b 2
)

echo.
echo Ejecutando verificacion de integridad del REA...
echo   Script: %~dp0sanity_check.ps1
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0sanity_check.ps1"
set EXIT_CODE=%ERRORLEVEL%

echo.
if %EXIT_CODE% EQU 0 (
    echo Resultado: TODO OK.
) else if %EXIT_CODE% EQU 1 (
    echo Resultado: HAY ADVERTENCIAS O FALLOS.
) else (
    echo Resultado: ERROR DE EJECUCION.
)

echo.
echo Presione cualquier tecla para cerrar...
pause >nul

endlocal
exit /b %EXIT_CODE%