# Образ для генерации синтетических HEIC-фикстур (запускается вручную: npm run fixtures).
# Debian forky (testing) — в нём libheif 1.23.x, как в libheif-js 1.23.5.
FROM debian:forky-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      libheif-examples libheif-plugin-x265 libheif-plugin-aomenc \
      libimage-exiftool-perl imagemagick fonts-dejavu-core ca-certificates \
      libjpeg-turbo-progs webp apngasm libtiff-tools libjxl-tools qpdf \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /work
