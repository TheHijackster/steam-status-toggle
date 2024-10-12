
@echo off
set LOGFILE=setup_log.txt
echo Running setup script... > %LOGFILE%

REM Ensure Node.js is installed
where node >nul 2>>%LOGFILE%
IF %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js to proceed. >> %LOGFILE%
    echo Node.js is not installed. Please install Node.js to proceed.
    exit /b
)

REM Ensure npm is installed
where npm >nul 2>>%LOGFILE%
IF %ERRORLEVEL% NEQ 0 (
    echo npm is not installed. Please install npm to proceed. >> %LOGFILE%
    echo npm is not installed. Please install npm to proceed.
    exit /b
)

REM Install dependencies
echo Installing dependencies... >> %LOGFILE%
npm install >> %LOGFILE% 2>&1
npm install archiver >> %LOGFILE% 2>&1

echo Running Node.js script to generate plugin package... >> %LOGFILE%
node index.js >> %LOGFILE% 2>&1
echo Node script completed. >> %LOGFILE%

REM Clean up unnecessary files
echo Cleaning up unnecessary files... >> %LOGFILE%
del package-lock.json >> %LOGFILE% 2>&1

echo Setup completed. Look for the .streamDeckPlugin file in the current directory. >> %LOGFILE%
echo Setup completed. Look for the .streamDeckPlugin file in the current directory.
pause
