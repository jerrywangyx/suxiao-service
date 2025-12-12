$processIds = @(7400, 22136, 6968, 21168, 22172, 14356, 1436, 9684, 2804, 11724, 16984, 944, 856, 1588, 1884, 2944, 3596, 4428, 15948, 3316, 16904, 7528, 4304, 2344, 13324, 14872, 9544, 2764, 17548, 17540, 4464)

foreach ($procId in $processIds) {
    try {
        Stop-Process -Id $procId -Force -ErrorAction Stop
        Write-Host "Killed PID $procId successfully"
    } catch {
        Write-Host "Failed to kill PID $procId : $_"
    }
}
