/* 护生之约 · paintings.js
 * 游戏里用到的丰子恺原画。
 *
 * 把每幅画的扫描图放到 `file` 写的位置（JPEG 或 PNG，宽约 1000 像素即可）。
 * 找到文件时游戏展示原画；找不到时显示重绘的示意图，并标明“示意图”。
 *
 * 版权：丰子恺于1975年去世，他的作品已于2026年1月1日在中国大陆进入公有领域；
 * 《护生画集》第一集（1929）和1920年代的子恺漫画在美国也已进入公有领域。 */
window.PAINTINGS = {
  qiutu: {
    file: 'images/paintings/qiutu-zhi-ge.jpg',
    title: '囚徒之歌',
    source: '《护生画集》第一集 · 1929',
    poem: '人在牢狱，终日愁欷；鸟在樊笼，终日悲啼。聆此哀音，凄入心脾；何如放舍，任彼高飞。',
    poemBy: '弘一法师题',
    note: '弘一法师后来把这幅画改名为《凄音》，免得和另一幅《平和之歌》重复。',
  },
  muzhiyu: {
    file: 'images/paintings/mu-zhi-yu.jpg',
    title: '母之羽',
    source: '《护生画集》第一集 · 1929',
    poem: '雏儿依残羽，殷殷恋慈母。母亡儿不知，犹复相环守。',
    poemBy: '题诗（节选）',
    note: '据画集里的说明，这幅画取意于一个古老的故事：有人把一只蝙蝠碾成了药末，几只还没睁眼的小蝙蝠循着妈妈的气味，围聚在药末旁边。丰子恺把它画成了小鸡和母鸡的羽毛。',
  },
  fuchi: {
    file: 'images/paintings/sheng-de-fuchi.jpg',
    title: '生的扶持',
    source: '《护生画集》第一集 · 1929',
    poem: '一蟹失足，二蟹持扶。物知慈悲，人何不如。',
    poemBy: '弘一法师题',
  },
  abao: {
    file: 'images/paintings/abao.jpg',
    title: '阿宝两只脚，凳子四只脚',
    source: '子恺漫画 · 1920年代',
  },
};
