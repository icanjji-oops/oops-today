import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'oops-today',
  brand: {
    displayName: '오늘의 앗차',
    primaryColor: '#3182F6',
    // ⬇️ 깃허브 원본 이미지(Raw) 주소로 수정되었습니다.
    icon: 'https://raw.githubusercontent.com/icanjji-oops/oops-today/main/public/opps-logo-512.png',
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