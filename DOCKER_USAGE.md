# Docker ile Kullanım - Özet

## ✅ Evet, Docker ile kullanılabilir!

Migration altyapısı Docker ile tam uyumlu çalışıyor.

## Hızlı Başlangıç

```bash
# 1. PostgreSQL'i başlat
npm run docker:up

# 2. Environment'i ayarla (Docker için)
cp .env.docker .env

# 3. Veritabanını oluştur (ilk seferinde)
npm run db:create

# 4. Migration'ları çalıştır
npm run migration:run

# 5. Uygulamayı başlat
npm run start:dev
```

## Migration Komutları (Docker ile)

Tüm migration komutları Docker ile çalışır:

```bash
# Migration çalıştır
npm run migration:run

# Migration durumunu göster
npm run migration:show

# Yeni migration oluştur
npm run migration:generate src/database/migrations/MigrationName

# Son migration'ı geri al
npm run migration:revert
```

## Environment Dosyaları

- **`.env`** → Local PostgreSQL için (DB_HOST=localhost)
- **`.env.docker`** → Docker PostgreSQL için (DB_HOST=skillbase-postgres)

Docker kullanırken `.env.docker` dosyasını `.env` olarak kopyalayın.

## Detaylı Rehber

Tam detaylı rehber için: `DOCKER_QUICKSTART.md`

