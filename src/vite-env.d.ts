interface ImportMetaEnv {
  readonly VITE_KAKAO_REST_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.svg" {
  const content: import("react").FC<import("react").SVGProps<SVGElement>>;
  export default content;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.css";
