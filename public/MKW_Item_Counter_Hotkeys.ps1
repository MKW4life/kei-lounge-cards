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
  Write-Host "MKW Item Counter の「接続キー」を貼り付けてください。" -ForegroundColor Cyan
  Write-Host "接続キーは /item-counter ページ上部に表示されています。"
  $key = (Read-Host "接続キー").Trim()
  if ($key -notmatch '^[A-Za-z0-9_-]{24,160}$') {
    throw "接続キーの形式が正しくありません。"
  }

  New-Item -ItemType Directory -Force -Path $ConfigDir | Out-Null
  @{ key = $key } | ConvertTo-Json | Set-Content -Encoding UTF8 $ConfigPath
  return $key
}

$key = Read-ConnectionKey
$escapedKey = [Uri]::EscapeDataString($key)
$apiUrl = "$BaseUrl/api/item-counter?key=$escapedKey"

Add-Type @"
using System;
using System.Runtime.InteropServices;

public static class MKWGlobalHotkeys {
    [StructLayout(LayoutKind.Sequential)]
    public struct POINT {
        public int X;
        public int Y;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct MSG {
        public IntPtr hwnd;
        public uint message;
        public UIntPtr wParam;
        public IntPtr lParam;
        public uint time;
        public POINT pt;
    }

    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, uint vk);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool UnregisterHotKey(IntPtr hWnd, int id);

    [DllImport("user32.dll")]
    public static extern int GetMessage(out MSG lpMsg, IntPtr hWnd, uint wMsgFilterMin, uint wMsgFilterMax);
}
"@

$MOD_SHIFT = 0x0004
$MOD_NOREPEAT = 0x4000
$WM_HOTKEY = 0x0312
$registered = @()

try {
  for ($i = 1; $i -le 7; $i++) {
    $vk = 0x30 + $i
    $ok = [MKWGlobalHotkeys]::RegisterHotKey([IntPtr]::Zero, $i, ($MOD_SHIFT -bor $MOD_NOREPEAT), $vk)

    if (-not $ok) {
      $win32 = [Runtime.InteropServices.Marshal]::GetLastWin32Error()
      throw "Shift+$i を登録できませんでした。別のアプリが使用している可能性があります。(Win32: $win32)"
    }
    $registered += $i
  }

  Write-Host ""
  Write-Host "MKW Item Counter Global Hotkeys" -ForegroundColor Green
  Write-Host "--------------------------------"
  Write-Host "Shift + 1 ～ Shift + 7 : 現在の並び順の 1～7 番目を +1"
  Write-Host "1 ～ 7 単独             : 何もしません"
  Write-Host "キーボードリセット      : ありません"
  Write-Host ""
  Write-Host "Mario Kart / OBS / 他のアプリが最前面でも動作します。"
  Write-Host "終了するには、このウィンドウを閉じてください。"
  Write-Host ""

  while ($true) {
    $msg = New-Object MKWGlobalHotkeys+MSG
    $result = [MKWGlobalHotkeys]::GetMessage([ref]$msg, [IntPtr]::Zero, 0, 0)
    if ($result -le 0) { break }

    if ($msg.message -eq $WM_HOTKEY) {
      $index = [int]$msg.wParam.ToUInt64()
      if ($index -ge 1 -and $index -le 7) {
        try {
          $body = @{ action = "hotkeyIncrement"; index = $index } | ConvertTo-Json -Compress
          Invoke-RestMethod -Uri $apiUrl -Method Post -ContentType "application/json" -Body $body -TimeoutSec 5 | Out-Null
          Write-Host ("Shift+{0}  ->  +1" -f $index)
        } catch {
          Write-Host ("Shift+{0} の送信に失敗: {1}" -f $index, $_.Exception.Message) -ForegroundColor Yellow
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
