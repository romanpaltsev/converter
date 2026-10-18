# Сборка libwebp в WebAssembly (npm run codecs). Версии закреплены: образ emsdk и тег libwebp с sha256 архива.
FROM emscripten/emsdk:6.0.12
ARG LIBWEBP_VERSION=1.6.0
ARG LIBWEBP_SHA256=93a852c2b3efafee3723efd4636de855b46f9fe1efddd607e1f42f60fc8f2136
RUN curl -fsSL -o /tmp/libwebp.tar.gz "https://github.com/webmproject/libwebp/archive/refs/tags/v${LIBWEBP_VERSION}.tar.gz" \
 && echo "${LIBWEBP_SHA256}  /tmp/libwebp.tar.gz" | sha256sum -c - \
 && mkdir -p /src/libwebp && tar -xzf /tmp/libwebp.tar.gz -C /src/libwebp --strip-components=1 \
 && rm /tmp/libwebp.tar.gz
ENV LIBWEBP_VERSION=${LIBWEBP_VERSION}
WORKDIR /src
