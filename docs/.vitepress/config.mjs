import { defineConfig } from 'vitepress'
import AutoSidebar from 'vite-plugin-vitepress-auto-sidebar';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  // base : "/markdown/", //如果域名后面有地址，这里就需要填写，例如2822132073.github.io/markdown 这里就需要填markdown
  title: "Fsl's Markdown site",
  description: "我的markdown笔记网站",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
    ],

    sidebar: [
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  },
  vite: {
    plugins: [
      AutoSidebar({
        path: '/',
        ignoreList: ['.git', 'node_modules']
      })
    ]
  },
})
