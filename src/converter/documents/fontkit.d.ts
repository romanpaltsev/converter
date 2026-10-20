// Типы @pdf-lib/fontkit 1.1.1 (MIT): в пакете их нет. pdf-lib принимает объект целиком (registerFontkit).
declare module '@pdf-lib/fontkit' {
  import type { Fontkit } from 'pdf-lib/cjs/types/fontkit';
  const fontkit: Fontkit;
  export default fontkit;
}
