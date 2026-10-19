# Сборка декодера AVIF в WebAssembly (npm run codecs): libheif + dav1d. Версии закреплены: образ emsdk,
# архивы libheif и dav1d с sha256, meson и ninja — точными версиями из PyPI.
FROM emscripten/emsdk:6.0.12
ARG LIBHEIF_VERSION=1.23.6
ARG LIBHEIF_SHA256=4484346dc5995319dbc11e3a1c35d0a2ec46511ce370900869337fd2c7033125
ARG DAV1D_VERSION=1.5.4
ARG DAV1D_SHA256=686616b7c69eb88d44459391ab25cac13b6647a3b288835c5784e71c1514a5c5
RUN python3 -m pip install --break-system-packages --no-cache-dir meson==1.12.1 ninja==1.13.2
RUN curl -fsSL -o /tmp/libheif.tar.gz "https://github.com/strukturag/libheif/releases/download/v${LIBHEIF_VERSION}/libheif-${LIBHEIF_VERSION}.tar.gz" \
 && echo "${LIBHEIF_SHA256}  /tmp/libheif.tar.gz" | sha256sum -c - \
 && mkdir -p /src/libheif && tar -xzf /tmp/libheif.tar.gz -C /src/libheif --strip-components=1 \
 && curl -fsSL -o /tmp/dav1d.tar.xz "https://downloads.videolan.org/pub/videolan/dav1d/${DAV1D_VERSION}/dav1d-${DAV1D_VERSION}.tar.xz" \
 && echo "${DAV1D_SHA256}  /tmp/dav1d.tar.xz" | sha256sum -c - \
 && mkdir -p /src/dav1d && tar -xJf /tmp/dav1d.tar.xz -C /src/dav1d --strip-components=1 \
 && rm /tmp/libheif.tar.gz /tmp/dav1d.tar.xz
ENV LIBHEIF_VERSION=${LIBHEIF_VERSION} DAV1D_VERSION=${DAV1D_VERSION}
WORKDIR /src
