/**
 * Résumé content that each papercraft scene "says".
 *
 * Replace the strings in `profile` and `chapters` with your own CV. Nothing
 * else in the code needs to change: chapter ranges are progress values along
 * the camera path (0 = the welcome wall, 1 = the closing single sheet).
 *
 * Bilingual by design: English headings match the wall copy, Chinese body text
 * carries the detail.
 */

export const profile = {
  name: "Mr. Panda",
  role: "Human Resources Executive",
  // Shown in the tab when the dialogue is collapsed.
  tab: "Résumé",
};

export const chapters = [
  {
    id: "intro",
    no: "01",
    range: [0, 0.13],
    en: "Hello, I'm Mr. Panda.",
    zh: "我把简历贴在了这面纸上。往下滚，我骑车带你看完。",
    body: [
      "五年人力资源与组织心理学的交叉经验，做招聘、做员工体验，也做让人敢说真话的团队文化。",
    ],
    meta: [
      { k: "Based in", v: "Shanghai, China" },
      { k: "Focus", v: "People Ops · Culture Design" },
    ],
  },
  {
    id: "craft",
    no: "02",
    range: [0.13, 0.31],
    en: "The tools I carry.",
    zh: "技能不必写成清单，挂在树上就好。",
    body: [
      "招聘全流程设计、组织诊断与员工关系处理；数据分析用 SQL 与 Python，可视化用 Figma 与 Tableau。",
      "英语可作为工作语言，日语 N2。",
    ],
    meta: [
      { k: "Craft", v: "Recruiting · Org Design · People Analytics" },
      { k: "Tools", v: "SQL · Python · Figma · Tableau" },
    ],
  },
  {
    id: "work",
    no: "03",
    range: [0.31, 0.53],
    en: "Work experience.",
    zh: "骆驼走过的地方，是我待过的公司。",
    body: [
      "在 Panda Corp 从招聘专员做到人力资源主管，负责 300+ 人的技术团队；把平均招聘周期从 46 天压到 28 天。",
      "现于 Ape Inc. 负责组织心理学研究，把离职率降了 12%。",
    ],
    meta: [
      { k: "2021.09 – 2025.01", v: "Human Resources Executive · Panda Corp" },
      { k: "2025.01 – Now", v: "Senior People Analyst · Ape Inc." },
    ],
  },
  {
    id: "featured",
    no: "04",
    range: [0.53, 0.73],
    en: "Featured work.",
    zh: "金字塔里放的不是宝藏，是做过的事。",
    body: [
      "主导「心理安全感」内部调研（n=120），产出 6 条管理动作，被三家事业部采纳。",
      "搭建候选人体验看板，把 offer 接受率从 61% 提到 78%。",
    ],
    meta: [
      { k: "Publication", v: "Psychological Safety in Creative Teams" },
      { k: "Award", v: "Best People Project, 2024" },
    ],
  },
  {
    id: "contact",
    no: "05",
    range: [0.73, 1.01],
    en: "Reach out anytime.",
    zh: "我不会像鬼一样突然出现——但你随时可以找我。",
    body: [
      "如果你想聊聊团队、招聘，或者只是想知道熊猫怎么骑车，邮件最快。",
    ],
    meta: [
      { k: "Email", v: "hello@example.com" },
      { k: "Links", v: "LinkedIn · GitHub · 作品集" },
    ],
  },
];

export const getChapterIndex = (progress) => {
  const p = Math.min(Math.max(progress, 0), 0.9999);
  for (let i = chapters.length - 1; i >= 0; i--) {
    const [start, end] = chapters[i].range;
    if (p >= start && p < end) return i;
  }
  return 0;
};
