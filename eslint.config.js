import globals from "globals";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    files: ["**/*.js"], // 대상 파일: 프로젝트 내 모든 자바스크립트 파일
    languageOptions: {
      ecmaVersion: "latest", // 최신 자바스크립트 문법 허용
      sourceType: "module", // import/export(ESM) 방식 사용
      globals: {
        ...globals.node, // Node.js 전역 변수(process 등) 인식
      },
    },
    plugins: {
      prettier: prettierPlugin, // Prettier를 ESLint의 플러그인으로 등록
    },
    rules: {
      "prettier/prettier": "error", // Prettier 스타일 규칙을 위반하면 에러로 표시
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }], // 사용하지 않는 변수는 경고하되, '_'로 시작하는 매개변수는 예외 허용
      "no-console": "off",
    }, // 백엔드 개발 시 로그 확인을 위해 console.log 허용
  },
  prettierConfig, // ESLint와 Prettier 간의 설정 충돌을 방지
];
