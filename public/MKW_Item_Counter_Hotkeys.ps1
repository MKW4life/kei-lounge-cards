param(
  [string]$BaseUrl = "https://kei-lounge-cards.vercel.app"
)

$ErrorActionPreference = "Stop"
$Host.UI.RawUI.WindowTitle = "MKW Item Counter - Global Hotkeys"

$ConfigDir = Join-Path $env:APPDATA "KeiProjects\MKWItemCounter"
$ConfigPath = Join-Path $ConfigDir "config.json"

function Read-ConnectionKey {
  if (Test-Path $ConfigPath) {
    try {
      $cfg = Get-Content $ConfigPath -Raw | ConvertFrom-Json
      if ($cfg.key -match '^[A-Za-z0-9_-]{24,160}$') {
        return [string]$cfg.key
      }
    } catch {}
  }

  Write-Host ""
  Write-Host "Paste the Connection Key shown on the MKW Item Counter page." -ForegroundColor Cyan
  $key = (Read-Host "Connection Key").Trim()

  if ($key -notmatch '^[A-Za-z0-9_-]{24,160}$') {
    throw "Invalid Connection Key."
  }

  New-Item -ItemType Directory -Force -Path $ConfigDir | Out-Null
  @{ key = $key } | ConvertTo-Json | Set-Content -Encoding ASCII $ConfigPath
  return $key
}

$key = Read-ConnectionKey
$escapedKey = [System.Uri]::EscapeDataString($key)
$apiUrl = $BaseUrl + "/api/item-counter?key=" + $escapedKey

$csharp = @(
  "using System;"
  "using System.Runtime.InteropServices;"
  "public static class MKWGlobalHotkeys {"
  "  [StructLayout(LayoutKind.Sequential)]"
  "  public struct POINT { public int X; public int Y; }"
  "  [StructLayout(LayoutKind.Sequential)]"
  "  public struct MSG {"
  "    public IntPtr hwnd;"
  "    public uint message;"
  "    public UIntPtr wParam;"
  "    public IntPtr lParam;"
  "    public uint time;"
  "    public POINT pt;"
  "  }"
  "  [DllImport(\"user32.dll\", SetLastError = true)]"
  "  public static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, uint vk);"
  "  [DllImport(\"user32.dll\", SetLastError = true)]"
  "  public static extern bool UnregisterHotKey(IntPtr hWnd, int id);"
  "  [DllImport(\"user32.dll\")]"
  "  public static extern int GetMessage(out MSG lpMsg, IntPtr hWnd, uint wMsgFilterMin, uint wMsgFilterMax);"
  "}"
) -join [Environment]::NewLine

Add-Type -TypeDefinition $csharp -Language CSharp

$MOD_SHIFT = 0x0004
$MOD_NOREPEAT = 0x4000
$WM_HOTKEY = 0x0312
$registered = @()

try {
  for ($i = 1; $i -le 7; $i++) {
    $vk = 0x30 + $i
    $ok = [MKWGlobalHotkeys]::RegisterHotKey(
      [IntPtr]::Zero,
      $i,
      ($MOD_SHIFT -bor $MOD_NOREPEAT),
      $vk
    )

    if (-not $ok) {
      $win32 = [Runtime.InteropServices.Marshal]::GetLastWin32Error()
      throw ("Could not register Shift+{0}. Another app may be using it. Win32={1}" -f $i, $win32)
    }

    $registered += $i
  }

  Write-Host ""
  Write-Host "MKW Item Counter Global Hotkeys" -ForegroundColor Green
  Write-Host "--------------------------------"
  Write-Host "Shift + 1 through Shift + 7 : increment item 1 through 7"
  Write-Host "1 through 7 without Shift   : not registered"
  Write-Host "Keyboard reset              : not registered"
  Write-Host ""
  Write-Host "This works while Mario Kart or OBS is in the foreground."
  Write-Host "Close this window to stop the hotkeys."
  Write-Host ""

  while ($true) {
    $msg = New-Object MKWGlobalHotkeys+MSG
    $result = [MKWGlobalHotkeys]::GetMessage(
      [ref]$msg,
      [IntPtr]::Zero,
      0,
      0
    )

    if ($result -le 0) {
      break
    }

    if ($msg.message -eq $WM_HOTKEY) {
      $index = [int]$msg.wParam.ToUInt64()

      if ($index -ge 1 -and $index -le 7) {
        try {
          $body = @{
            action = "hotkeyIncrement"
            index = $index
          } | ConvertTo-Json -Compress

          Invoke-RestMethod -Uri $apiUrl -Method Post -ContentType "application/json" -Body $body -TimeoutSec 5 | Out-Null
          Write-Host ("Shift+{0} -> +1" -f $index)
        } catch {
          Write-Host ("Shift+{0} failed: {1}" -f $index, $_.Exception.Message) -ForegroundColor Yellow
        }
      }
    }
  }
}
finally {
  foreach ($id in $registered) {
    [void][MKWGlobalHotkeys]::UnregisterHotKey([IntPtr]::Zero, $id)
  }
}
