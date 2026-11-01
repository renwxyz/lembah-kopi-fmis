FROM golang:alpine AS builder

WORKDIR /app

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code and build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/api ./cmd/api && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/seed-admin ./cmd/seed-admin

FROM alpine:3.20

# libwebp-tools menyediakan cwebp untuk kompresi foto CMS ke WebP.
RUN apk --no-cache add ca-certificates tzdata libwebp-tools \
    && addgroup -g 10001 -S appgroup \
    && adduser -u 10001 -S appuser -G appgroup

WORKDIR /app
COPY --from=builder /app/api /app/api
COPY --from=builder /app/seed-admin /app/seed-admin
COPY --from=builder /app/docs /app/docs

USER appuser:appgroup

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/healthz || exit 1

CMD ["/app/api"]
