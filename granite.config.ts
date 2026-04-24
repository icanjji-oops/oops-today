import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'oops-today',
  brand: {
    displayName: '오늘의 앗차', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: '#3182F6', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: 'https://github.com/icanjji-oops/oops-today/blob/main/public/opps-logo-512.png', // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite dev',
      build: 'vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
});
