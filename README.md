# 武周逆转录

《武周逆转录》是一个基于《武则天正传》材料改编的宫廷法庭推理网页游戏。项目目标不是做资料陈列页，而是做一个接近《逆转裁判》节奏的可玩作品：玩家在庭前调查中移动、查看、交谈、出示证物，在庭审中追问证词、选择证物、举出矛盾，并通过案件推进逐步理解武周权力结构。

[![Deploy static game to GitHub Pages](https://github.com/oubeichen/wu-zhou-turnabout/actions/workflows/pages.yml/badge.svg)](https://github.com/oubeichen/wu-zhou-turnabout/actions/workflows/pages.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-在线游玩-2ea44f?logo=github)](https://oubeichen.github.io/wu-zhou-turnabout/)
![Static Game](https://img.shields.io/badge/static%20game-no%20build%20step-8b5cf6)
![JavaScript](https://img.shields.io/badge/runtime-vanilla%20JS-f7df1e?logo=javascript&logoColor=222)

**在线游玩：** [https://oubeichen.github.io/wu-zhou-turnabout/](https://oubeichen.github.io/wu-zhou-turnabout/)

## 背景

项目素材来自仓库中的 `武则天正传.epub`，John 工作流已将章节内容拆解为案件、证词、人物关系和证物线索。游戏目前围绕武则天进入权力中心后的关键事件组织为多个案件，每个案件都包含：

- 案件开场：用短对白引入冲突，而不是直接把史料条目丢给玩家。
- 庭前调查：玩家需要在不同地点查看现场、询问人物、出示已取得证物。
- 法庭记录：证物和人物资料以玩家能理解的方式重写，避免只出现“卷宗”“动机背景”等专业抽象词。
- 庭审攻防：证词逐句展开，玩家通过追问和举证推动反转。
- 结案反馈：根据错误次数、追问和举证表现给出评价。

## 当前玩法

打开游戏后会进入主菜单。推荐流程：

1. 选择“开始新案”。
2. 阅读案件开场，点击“开始调查”。
3. 在调查页用“移动 / 查看 / 交谈 / 出示”收集关键证物。
4. 证物未收齐时不能开庭，避免玩家进入庭审后卡关。
5. 开庭后先追问证词，再从法庭记录中选中证物，最后在主操作区点击“举证”正式提交。
6. 错误举证会扣除信誉，但不会把玩家困在错误状态；回到主操作区即可继续判断。

桌面端按单屏游戏窗口设计，主要操作不应依赖上下滚动。移动端保留必要滚动，以保证较窄屏幕仍能完整操作。

## 技术细节

这是一个无构建步骤的静态网页游戏：

- `game/index.html`：游戏入口。
- `game/app.js`：游戏状态机、主菜单、调查、庭审、存档、音频与自动化测试状态输出。
- `game/game-data.js`：案件、证词、证物、人物与关卡数据。
- `game/styles.css`：主菜单、调查页、庭审页、抽屉菜单和响应式布局。
- `game/assets/`：背景、人物、证物、近景和章节视觉资源。
- `scripts/build_game_content.py`：从项目知识内容生成或刷新游戏数据的辅助脚本。
- `scripts/generate_evidence_item_sheet.py`：用 Pillow 从当前案件证物数据重生成 `game/assets/evidence-item-sheet-v3.png`，复杂证物会绘制为组合物件位图。
- `scripts/generate_location_backgrounds.py`：为每个案件地点重生成独立调查背景图。
- `progress.md`：持续开发记录，记录每轮目标、验证结果和下一步缺口。
- `PLAN.md`：John 项目的阶段计划与当前迭代状态。

游戏暴露了 `window.render_game_to_text()`，用于浏览器自动化测试读取当前画面、案件、证物、证词、调查反馈、信誉和菜单状态。这个接口是后续持续回归测试的主要观察点。

## 本地运行

仓库根目录启动一个静态服务器：

```bash
python3 -m http.server 8788
```

然后访问：

```text
http://127.0.0.1:8788/game/
```

如果只想快速检查语法：

```bash
npm install
npm run check:js
npm run check:py
```

浏览器自动化验证依赖 Playwright。首次安装依赖后如果本机没有 Chromium，可运行：

```bash
npx playwright install chromium
npm run qa:web-game
```

`qa:web-game` 会调用 Codex 的 `develop-web-game` 客户端访问本地 `http://127.0.0.1:8788/game/`，因此运行前需要保持上面的静态服务器开启。

## 自动发布

仓库包含 GitHub Actions workflow：`.github/workflows/pages.yml`。

当代码推送到 `main` 分支时，CI 会：

1. 检出仓库。
2. 运行 JavaScript 与 Python 静态检查。
3. 将 `game/` 目录作为静态站点 artifact 上传。
4. 部署到 GitHub Pages。

第一次使用时，需要在 GitHub 仓库页面进入 `Settings -> Pages`，把发布来源设置为 `GitHub Actions`。之后每次 push 到 `origin main` 都会自动刷新在线版本。

## 继续开发的质量线

每一轮改动都应继续对照《逆转裁判》的实际体验差距：

- 调查阶段要有地点、人物、物品和短对白反馈，而不是静态说明页。
- 庭审阶段必须区分“选中证物”和“正式举证”，避免误触自动提交。
- 关键对白和证词要比按钮、状态标签更显眼，界面层级要有主次。
- 新手提示、设置、记录、证物等辅助信息应该可打开、可关闭，不应长期挤占主画面。
- PC 端以单屏游戏窗口为约束，移动端再做窄屏适配。
- 每轮完成后提交详细中文 commit，并推送到 `origin main`。
