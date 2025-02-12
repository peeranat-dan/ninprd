interface ImportMetaEnv {
  readonly WORDPRESS_URL: string;
  readonly WORDDPRESS_USERNAME: string;
  readonly WORDPRESS_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
