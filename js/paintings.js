/* 护生之约 · paintings.js
 * Feng Zikai's original paintings used in the game.
 *
 * Put a scan of each painting at the path in `file` (JPEG or PNG, about
 * 1000px wide is plenty). When a file is present the game shows the original;
 * when it is missing the game shows a redrawn sketch and says so.
 *
 * Copyright: Feng Zikai died in 1975, so his work entered the public domain in
 * mainland China on 1 January 2026. Volume 1 of 护生画集 (1929) and the
 * 1920s Zikai Manhua drawings are also public domain in the United States. */
window.PAINTINGS = {
  qiutu: {
    file: 'images/paintings/qiutu-zhi-ge.jpg',
    title: '囚徒之歌',
    titleEn: 'Song of the Prisoners',
    source: '《护生画集》第一集 · 1929',
    sourceEn: 'Paintings for the Preservation of Life, Volume 1 · 1929',
    poem: '人在牢狱，终日愁欷；鸟在樊笼，终日悲啼。聆此哀音，凄入心脾；何如放舍，任彼高飞。',
    poemBy: '弘一法师题',
    poemEn: 'A person in prison grieves all day long; a bird in a cage cries all day long. Hearing such mournful sounds, sorrow pierces the heart. Why not let it go, and let it fly high?',
    poemByEn: 'Inscription by Master Hongyi',
    note: '弘一法师后来把这幅画改名为《凄音》，免得和另一幅《平和之歌》重复。',
    noteEn: 'Master Hongyi later renamed this painting “Mournful Sounds” (凄音), so it would not repeat the title of another painting, “Song of Peace.”',
  },
  muzhiyu: {
    file: 'images/paintings/mu-zhi-yu.jpg',
    title: '母之羽',
    titleEn: 'Mother’s Feathers',
    source: '《护生画集》第一集 · 1929',
    sourceEn: 'Paintings for the Preservation of Life, Volume 1 · 1929',
    poem: '雏儿依残羽，殷殷恋慈母。母亡儿不知，犹复相环守。',
    poemBy: '题诗（节选）',
    poemEn: 'The chicks cling to the fallen feathers, longing for their loving mother. She has died, and they do not know; still they gather round and keep watch.',
    poemByEn: 'From the inscription',
    note: '据画集里的说明，这幅画取意于一个古老的故事：有人把一只蝙蝠碾成了药末，几只还没睁眼的小蝙蝠循着妈妈的气味，围聚在药末旁边。丰子恺把它画成了小鸡和母鸡的羽毛。',
    noteEn: 'According to a note in the collection, the painting adapts an old story: someone ground a bat into medicine powder, and its baby bats, eyes not yet open, gathered round the powder because they knew their mother’s scent. Feng retold it with chicks and a hen’s feathers.',
  },
  fuchi: {
    file: 'images/paintings/sheng-de-fuchi.jpg',
    title: '生的扶持',
    titleEn: 'Helping Each Other Live',
    source: '《护生画集》第一集 · 1929',
    sourceEn: 'Paintings for the Preservation of Life, Volume 1 · 1929',
    poem: '一蟹失足，二蟹持扶。物知慈悲，人何不如。',
    poemBy: '弘一法师题',
    poemEn: 'One crab loses its footing; two crabs hold it up. If creatures know compassion, how can people do less?',
    poemByEn: 'Inscription by Master Hongyi',
  },
  abao: {
    file: 'images/paintings/abao.jpg',
    title: '阿宝两只脚，凳子四只脚',
    titleEn: 'Abao Has Two Feet, the Stool Has Four',
    source: '子恺漫画 · 1920年代',
    sourceEn: 'Zikai Manhua · 1920s',
  },
};
