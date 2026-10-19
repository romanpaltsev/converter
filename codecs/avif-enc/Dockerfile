# Сборка кодировщика AVIF в WebAssembly (npm run codecs -- avif-enc): libheif + libaom (только кодировщик).
# Версии закреплены: образ emsdk, архивы libheif и libaom с sha256.
FROM emscripten/emsdk:6.0.12
ARG LIBHEIF_VERSION=1.23.6
ARG LIBHEIF_SHA256=4484346dc5995319dbc11e3a1c35d0a2ec46511ce370900869337fd2c7033125
ARG AOM_VERSION=3.15.2
ARG AOM_SHA256=67bb54b245f33ed98600e08269e6139986e48114e14042474ddd8885801dfddc
RUN curl -fsSL -o /tmp/libheif.tar.gz "https://github.com/strukturag/libheif/releases/download/v${LIBHEIF_VERSION}/libheif-${LIBHEIF_VERSION}.tar.gz" \
 && echo "${LIBHEIF_SHA256}  /tmp/libheif.tar.gz" | sha256sum -c - \
 && mkdir -p /src/libheif && tar -xzf /tmp/libheif.tar.gz -C /src/libheif --strip-components=1 \
 && curl -fsSL -o /tmp/aom.tar.gz "https://storage.googleapis.com/aom-releases/libaom-${AOM_VERSION}.tar.gz" \
 && echo "${AOM_SHA256}  /tmp/aom.tar.gz" | sha256sum -c - \
 && mkdir -p /src/aom && tar -xzf /tmp/aom.tar.gz -C /src/aom --strip-components=1 \
 && rm /tmp/libheif.tar.gz /tmp/aom.tar.gz
ENV LIBHEIF_VERSION=${LIBHEIF_VERSION} AOM_VERSION=${AOM_VERSION}
WORKDIR /src
