import { defineConfig } from 'vitepress'
import AutoSidebar from 'vite-plugin-vitepress-auto-sidebar';


const tocRegex = /^\[toc\]$/i
const tocOptions = {
  pattern: tocRegex,
  level: [2, 3],
}
// https://vitepress.dev/reference/site-config
export default defineConfig({
  // base : "/markdown/", //如果域名后面有地址，这里就需要填写，例如2822132073.github.io/markdown 这里就需要填markdown
  title: "Fsl's Markdown site",
  description: "我的markdown笔记网站",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: '运维相关内容', 
        items: [
          {text: 'Docker', link: '/Docker/安装docker.html'},
          {text: 'Elasticsearch', link: '/Elasticsearch/节点类型.html'},
          {text: 'Linux命令', link: '/Linux命令/nmcli.html'},
          {text: 'ceph', link: '/ceph/ceph.html'},
          {text: '数据库', link: '/databases/mysql/mysql.html'},
          {text: 'jenkins', link: '/jenkins/k8s安装jenkins.html'},
          {text: 'kubernetes', link: '/kubernetes/配置containerd加速.html'},
          {text: 'minio', link: '/minio/安装minio.html'},
          {text: 'nginx', link: '/nginx/编译安装nginx与添加模块.html'},
          {text: '网络相关', link: '/交换机和路由器基本操作/交换机.html'},
        ] 
      },
      { text: '开发相关内容', 
        items: [
          {text: 'golang', link: '/golang/golang基础.html'},
          {text: 'java', link: '/java学习/Spring.html'},
          {text: '前端', link: '/前端/echarts/dataset.html'},
      ] 
    },
      { text: '开发相关内容', 
        items: [
        {text: 'golang', link: '/golang/golang基础.html'},
        {text: 'java', link: '/java学习/Spring.html'},
        {text: '前端', link: '/前端/echarts/dataset.html'},
      ] 
    },
    { text: '其他',  link: '/other/Linux磁盘分区.html'},
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
    markdown: {
    toc: tocOptions
  },
})
