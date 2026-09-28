# 护生之约 · A Promise to Protect Life

一个关于丰子恺《护生画集》的课堂小游戏。学生翻开一本空白画册，在六个小场景里练习“倘使我是它”——扫地不伤蚂蚁、清理池塘、给油灯罩上纱罩、送雏鸟回巢、打开笼门、学会读丰子恺的画——最后画一幅自己的护生画，盖上刻着自己名字的印章。

A classroom game built around Feng Zikai's *Paintings for the Preservation of Life* (护生画集). Students fill a blank album by caring for six small lives, learn to "read" Feng's paintings, then paint and mount one of their own. Bilingual: 中文 and English.

## 怎么打开 · How to open it

- **直接打开 · Open directly:** double-click `index.html`. No installation, no internet needed except for the web fonts (the game falls back to system fonts offline).
- **一个文件 · One file:** `dist/husheng-zhiyue.html` is the whole game in a single file, easy to copy to a classroom computer or send to students. Rebuild it with `node tools/build.mjs` after any change.
- **网页 · On the web:** any static host works, e.g. GitHub Pages pointed at this repository.
- **直接进入某一页 · Deep links:** add `#ants`, `#pond`, `#moths`, `#nest`, `#cage`, `#reading`, `#studio`, `#quiz` or `#teacher` to the address.

Progress, the student's name and their painting draft are kept in the browser's local storage on that device only.

## 游戏内容 · What's inside

| 页 · Page | 生命 · Life | 玩法 · Play | 学到什么 · Learning | 诗句 / 原画 · Verse / original |
| --- | --- | --- | --- | --- |
| 序 · 一个约定 Prologue | — | Picture book; tap the six volumes on the shelf | Feng Zikai, Li Shutong / Master Hongyi, the 50→100 promise, 450 paintings over 40+ years | 世寿所许，定当遵嘱 |
| 一 · 扫地 Sweeping Gently | 蚂蚁 Ants | Sweep leaves without startling a line of ants | Mindfulness toward the smallest lives | 扫地恐伤蝼蚁命（古语） |
| 二 · 清池 A Clear Pond | 鱼 Fish | Net the rubbish, free a fish tangled in line, don't scare the fish | Protect habitats; why random "fish release" can harm | 细雨鱼儿出，微风燕子斜（杜甫） |
| 三 · 纱灯 The Gauze Lamp | 飞蛾 Moths | Guide moths away, drag a gauze shade over the lamp, blow it out | Prevention over rescue; light pollution science | 为鼠常留饭，怜蛾不点灯（苏轼） |
| 四 · 望母归 Waiting for Mother | 雏鸟 Chicks | Persuade a boy with a slingshot; carry a fallen chick home slowly | Persuading with empathy, not threats; fledgling facts | 劝君莫打枝头鸟，子在巢中望母归（白居易） |
| 五 · 笼门 The Cage Door | 画眉 Thrush | Fly as the caged bird; then choose what it really needs | Freedom vs. comfort; wild birds are protected, pets shouldn't be released | 《囚徒之歌》 (Vol. 1) · 笼鸡有食汤锅近，野鹤无粮天地宽 |
| 六 · 读画 Reading Paintings | 丰子恺的画 | Three picture riddles on real works | Few strokes, faceless figures, poem + picture | 《阿宝两只脚，凳子四只脚》《母之羽》《生的扶持》 |
| 末页 · 我的护生画 My Own Painting | — | Brush, pale washes, stickers, title, poem, name seal; save as an image | Creating a 护生画 of one's own | — |
| 护生小博士 The Kindness Quiz | — | 8 questions from a pool of 16; certificate at 6/8 | Review | 护生者，护心也（丰子恺） |

Each page ends with 倘使我是它 ("If I were it…"), an illustrated moment from the creature's point of view plus a discussion question, and an album leaf stamped with 1–3 red kindness seals (awarded for gentleness, not speed). **给老师 / For teachers** inside the game has learning goals, a 40-minute lesson plan, all discussion questions and a gentle mode for younger players.

## 丰子恺的原画 · Feng Zikai's original paintings

The game is built to show the real paintings. Put scans in `images/paintings/` using the file names listed in [`images/paintings/README.md`](images/paintings/README.md); the game uses them automatically, and `node tools/build.mjs` embeds them in the single-file version. Until a scan is present, the game shows a redrawn sketch that follows the original's composition and labels it **示意图 · Sketch**. The in-game teacher page shows which scans were found.

Everything else in the game — the interactive scenes, the cat Baixiang, the stickers — is original artwork drawn in the spirit of Feng's style (a few brush strokes, faceless figures, pale washes). It is not presented as his work.

**Rights.** Feng Zikai died in 1975; under China's life+50 copyright term his work entered the public domain on 1 January 2026. Volume 1 of 护生画集 (1929) and the 1920s Zikai Manhua are also public domain in the United States. Later volumes may still be protected in life+70 countries, so the game's originals are all from Volume 1 and the 1920s.

## 内容核对 · Facts used

- 护生画集: six volumes, 50/60/70/80/90/100 paintings = 450, made for Master Hongyi's 50th to 100th birthdays. Volume 1 (1929) and Volume 2 (1940) inscribed by 弘一法师; Volume 3 (1949) by 叶恭绰; Volumes 4 (1960) and 6 (1973, published 1979) by 朱幼兰; Volume 5 (1965) by 虞愚.
- 《生的扶持》: 一蟹失足，二蟹持扶。物知慈悲，人何不如。
- 《囚徒之歌》: 人在牢狱，终日愁欷；鸟在樊笼，终日悲啼。聆此哀音，凄入心脾；何如放舍，任彼高飞。 (Hongyi later renamed it 《凄音》.)
- 《母之羽》: 雏儿依残羽，殷殷恋慈母。母亡儿不知，犹复相环守。 (The game quotes the first four lines; editions differ slightly in the last line.)
- Moths circling lamps: insects keep their backs toward the brightest light (Fabian et al., *Nature Communications*, 2024).
- 画眉 (hwamei) is a national second-class protected species in China since the 2021 list.

Inscriptions can vary between editions; please check against the edition used in class.

## 开发 · For developers

Plain HTML, CSS and JavaScript with no dependencies or build step.

```
index.html              page shell
css/style.css           the single paper-and-ink theme
js/strings.js           every word, in zh and en, plus the quiz pool
js/paintings.js         Feng Zikai's originals: files, inscriptions, translations
js/art.js               brush-and-wash SVG drawing kit (tools/gallery.html previews it)
js/sound.js             Web Audio sounds on the pentatonic scale
js/core.js              state, router, cat guide, cards, album leaf, saving images
js/screens/*.js         cover, album, prologue, studio, quiz, teacher page
js/chapters/*.js        the six pages
tools/build.mjs         bundles everything into dist/husheng-zhiyue.html
```

To add a page: create `js/chapters/<name>.js` calling `HS.chapter({ id, key, no, painting, pov, play(ctx) })`, add its words to `js/strings.js` under the same key, and list the script in `index.html`.
