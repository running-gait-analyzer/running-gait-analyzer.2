# 跑步動作生物力學分析器（PWA）

## 1. 專案結構
```text
running-gait-analyzer/
├── index.html
├── manifest.json
├── sw.js
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

## 2. 固定版本
- `@mediapipe/tasks-vision@0.10.14`：固定 JS/WASM API，避免 CDN `latest` 造成版本漂移。
- Pose Landmarker Heavy：`pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task`，優先精度但較耗效能。
- `Chart.js@4.4.7`：固定圖表 API。
- 本專案不需 Python、不需 npm 套件安裝；只需現代瀏覽器與靜態 HTTP/HTTPS 主機。

HTML 已包含完整載入標籤：
```html
<script type="module">
import { FilesetResolver, PoseLandmarker } from
 "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";
window.MP = { FilesetResolver, PoseLandmarker };
</script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
```
WASM 路徑：
`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm`
模型：
`https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task`

## 3. Windows 初次建置（不裝 Python）
1. 到 https://code.visualstudio.com/ 下載 Visual Studio Code，安裝時可勾選「加入 PATH」。
2. 開啟 VS Code →「檔案」→「開啟資料夾」→ 選擇解壓縮後的 `running-gait-analyzer`。
3. 點左側「擴充功能」圖示，搜尋 `Live Server`，選擇 Ritwick Dey 發布的 Live Server，按「Install」。
4. 在 `index.html` 按右鍵 → `Open with Live Server`。
5. 瀏覽器會開啟類似 `http://127.0.0.1:5500`。網址不是 `file://`，頁面可載入 ES module 與 WASM。
6. 選影片 →「載入姿態模型」→ 等待模型載入成功 →「開始分析」。

替代方案（需安裝 Node.js LTS）：在專案資料夾開啟 PowerShell，輸入 `npx serve .`，看到 Local 網址後用瀏覽器開啟。

## 4. Android 使用
1. 從 Google Play 安裝「Acode」或其他可編輯 HTML 的程式，將專案資料夾放到手機。
2. Android Chrome 不會因為直接開啟本機 HTML 就提供完整的 PWA/Service Worker 能力；`file://` 也不適合載入 ES module/WASM。
3. 建議在 Windows 完成專案後部署到 HTTPS（第 5 節），再用 Android Chrome 開網址。
4. Chrome 開啟網址 → 右上角「⋮」→「安裝應用程式」或「加到主畫面」。
5. 第一次開啟請保持網路，讓 WASM、模型與程式快取完成。

## 5. 部署 HTTPS（GitHub Pages）
1. 建立 GitHub 帳號並登入 https://github.com/ 。
2. 建立新 repository，例如 `running-gait-analyzer`。
3. 上傳 `index.html`、`manifest.json`、`sw.js`、`icons/`（保留資料夾結構）。
4. Repository → Settings → Pages。
5. 在「Build and deployment」選 `Deploy from a branch`，Branch 選 `main`、資料夾選 `/ (root)`，按 Save。
6. 等待部署完成，取得 `https://你的帳號.github.io/running-gait-analyzer/` 網址。
7. 手機與電腦都用此 HTTPS 網址。不要用同 Wi-Fi 的 `http://電腦IP` 測相機/PWA；非 localhost 的 HTTP 通常不是 secure context，瀏覽器會封鎖相機及部分功能。
8. 更新程式後，把 `sw.js` 的 `CACHE_NAME` 改成新版本，例如 `running-gait-v1.0.1`，重新部署，再關閉並重開 PWA。

## 6. PWA 與離線
`manifest.json` 已設定 name、short_name、start_url、display、theme_color 與 192/512 PNG 圖示。圖示由本專案打包提供；若要自行換圖，製作正方形 PNG 192×192 與 512×512，放在 `icons/` 並維持檔名。
HTML 以 `<link rel="manifest" href="./manifest.json">` 連結。
`sw.js` 快取 HTML、manifest、圖示，以及成功請求過的 MediaPipe/Chart.js CDN 與模型資源。首次載入模型仍需要網路；快取成功後可嘗試離線使用。瀏覽器儲存空間政策可能清除快取，因此離線不保證。

## 7. 手機除錯
- Android：手機開啟「設定 → 關於手機 → 連點版本號啟用開發人員選項」；進入開發人員選項啟用 USB 偵錯。USB 連接電腦並允許偵錯，在電腦 Chrome 開 `chrome://inspect/#devices`，找到手機分頁按 Inspect。
- iPhone：設定 → Safari → 進階 → 開啟「網頁檢閱器」。Mac Safari → 設定 → 進階 → 顯示「開發」選單；USB 連接 iPhone 後由 Safari「開發」選單檢查頁面。此專案主要以 Windows/Android 為目標，iOS 僅供除錯參考。

## 8. 生物力學公式與符號
影像座標先轉為生物力學座標：x 向前、y 向上；地板水平。原點取第一幀左右腳跟中點。校正比例 `s = 身高(cm) / 影像中頭頂至踝部像素距離`（cm/px）。鉛垂線角度用於旋轉校正。
- 關節角：三點夾角 `θ = acos((u·v)/(|u||v|))`；屈曲角以 `180° - 夾角` 表示，伸直約 0°。髖角目前以肩—髖—膝三點的簡化投影角計算。
- 軀幹前傾：`atan2(肩中點_x - 髖中點_x, 髖中點_y - 肩中點_y)`，相對垂直線；向前傾為正（需確認影片人物朝向與 x 軸方向）。
- 節段角：`atan2(Δx, -Δy)` 相對垂直方向；本版保留關鍵點供後續擴充，未把所有節段角獨立輸出。
- COM：`COM = Σ(m_i × r_i) / Σm_i`。程式用軀幹、頭頸、上肢、下肢、足部的簡化節段質量比例與節段 COM 位置係數作 2D 近似。de Leva (1996) 參數需依生理性別、節段定義與表格版本選取；本版用近似係數，不可視為完整 de Leva 實作。
- 位移：`Δx, Δy`，cm；速度：`v = dx/dt`，m/s；加速度：`a = dv/dt`，m/s²。微分採中央差分，端點採單側差分。
- 濾波：四階 Butterworth 低通，截止 6 Hz，兩個二階 section 前向與反向處理以近似零相位。
- COM 淨垂直合力：`F_net,y = m a_COM,y`，N；`F_net,y/BW = a_COM,y/g`。由 COM 加速度反推。
- 垂直地面反作用力估計：`vGRF_est = m(a_COM,y + g)`，N；`vGRF_est/BW = vGRF_est/(m g)`。這是全身垂直外力平衡的估計，不等於測力板量測，也不能分離左右腳各自的 GRF。
- 功率：`P = F·v`，W；動量：`p = m v`，kg·m/s；衝量：`J = ∫F dt = Δp`，N·s（可對匯出資料數值積分）。
- 支撐點相對 COM：`x_foot - x_COM`，cm；接近 0 只代表 2D 水平投影接近，不等同壓力中心。
- 著地/離地：以足部高度、足部速度和地板線作候選判定；需要人工檢查，並非力板事件判定。
- 角速度：`ω = dθ/dt`，°/s；ROM：`θ_max - θ_min`，°。

## 9. 重要限制與驗證
1. 2D 投影誤差：身體不完全位於矢狀面、左右肢重疊時，角度會偏差。
2. 遮擋與模型偏差：寬鬆衣物、快速動作、低光、腳被遮住會使點位跳動。
3. 身高比例校正誤差：頭頂與腳踝未同時入鏡、透視深度不同會使比例失準。
4. 鏡頭畸變與透視：廣角、鏡頭傾斜、相機不水平會改變量測。
5. de Leva 參數：需依性別與身體節段定義選取原始表格；此版是教育用近似。
6. GRF/功率：由 COM 加速度推估的淨力不是地面反作用力板直接量測，不能拿來做精密動力學結論。
7. 驗證：在受試者所在平面放置已知長度標尺；以 Kinovea 同影片逐點比較角度/位移；計算平均絕對誤差、RMSE、ICC；事件時間與高速度攝影或測力板同步比較。
8. 120 FPS：若來源影片是慢動作，輸入拍攝/播放的實際時間基準 FPS；不可把播放器顯示 FPS 當成原始拍攝 FPS。

## 10. 常見問題
| 問題 | 解法 |
|---|---|
| 用 `file://` 開啟模型失敗 | 用 Live Server 或 HTTPS 網址 |
| 相機權限被拒/沒有 HTTPS | 本版以影片檔為輸入；相機功能若擴充，需 HTTPS 或 localhost 並允許權限 |
| CDN 或版本錯誤 | 檢查網路與固定版本網址，避免改成 `latest` |
| 手機太慢 | 改用 Lite 模型、降低影片解析度/抽幀頻率 |
| iPhone 影片黑畫面 | 保留 `playsinline`，使用 Safari 支援的 MP4/H.264 影片 |
| 更新後仍是舊版 | 修改 `CACHE_NAME`，重新部署，關閉舊分頁再開 |
| 找不到人體 | 全身入鏡、改善光線、避免背景雜亂 |
| 角度跳動 | 確認側拍、降低遮擋，人工檢查原始點位；濾波不能修復錯誤辨識 |
| 離線模型載入失敗 | 首次需連網完整載入並快取；確認儲存空間未被清除 |

## 11. 學術參考
- MediaPipe Pose Landmarker Web guide: https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js
- Chart.js documentation: https://www.chartjs.org/docs/latest/
- de Leva, P. (1996). Adjustments to Zatsiorsky-Seluyanov's segment inertia parameters. Journal of Biomechanics, 29(9), 1223–1230.
