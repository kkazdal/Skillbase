# Docker Quick Start Guide

## Docker ile Migration Kullanımı

### 1. PostgreSQL'i Başlat

```bash
npm run docker:up
```

veya

```bash
docker-compose up -d
```

### 2. Veritabanını Oluştur (İlk Seferinde)

```bash
# .env.docker dosyasını kullanarak veritabanını oluştur
DB_HOST=skillbase-postgres npm run db:create
```

veya `.env.docker` dosyasını geçici olarak `.env` olarak kopyalayın:

```bash
cp .env.docker .env
npm run db:create
```

### 3. Migration'ları Çalıştır

```bash
# .env.docker kullanarak migration çalıştır
DB_HOST=skillbase-postgres npm run migration:run
```

veya `.env.docker` dosyasını kullanarak:

```bash
# .env.docker'ı .env olarak kopyala (geçici)
cp .env.docker .env
npm run migration:run
```

### 4. Uygulamayı Başlat

```bash
npm run start:dev
```

## Tam Docker Workflow

### Senaryo 1: Host'tan Docker PostgreSQL'e Bağlanma

1. **PostgreSQL'i başlat:**
   ```bash
   npm run docker:up
   ```

2. **Environment'i ayarla:**
   ```bash
   # .env.docker dosyasını .env olarak kopyala
   cp .env.docker .env
   ```

3. **Veritabanını oluştur:**
   ```bash
   npm run db:create
   ```

4. **Migration'ları çalıştır:**
   ```bash
   npm run migration:run
   ```

5. **Uygulamayı başlat:**
   ```bash
   npm run start:dev
   ```

### Senaryo 2: Environment Variable ile

```bash
# PostgreSQL'i başlat
npm run docker:up

# Environment variable'ları set ederek çalıştır
DB_HOST=skillbase-postgres \
DB_PORT=5432 \
DB_USERNAME=postgres \
DB_PASSWORD=postgres \
DB_DATABASE=skillbase \
npm run db:create

DB_HOST=skillbase-postgres \
DB_PORT=5432 \
DB_USERNAME=postgres \
DB_PASSWORD=postgres \
DB_DATABASE=skillbase \
npm run migration:run
```

## Migration Komutları (Docker ile)

### Migration Çalıştır
```bash
# .env.docker kullanarak
cp .env.docker .env
npm run migration:run
```

### Migration Durumunu Göster
```bash
cp .env.docker .env
npm run migration:show
```

### Yeni Migration Oluştur
```bash
cp .env.docker .env
npm run migration:generate api/src/database/migrations/MigrationName
```

### Son Migration'ı Geri Al
```bash
cp .env.docker .env
npm run migration:revert
```

## Docker Container Komutları

### PostgreSQL Container'ına Bağlan
```bash
docker exec -it skillbase-postgres psql -U postgres -d skillbase
```

### Logları Görüntüle
```bash
npm run docker:logs
```

### Container'ı Durdur
```bash
npm run docker:down
```

### Container'ı Yeniden Başlat
```bash
npm run docker:restart
```

### Her Şeyi Temizle (Veriler Dahil)
```bash
npm run docker:clean
```

## Önemli Notlar

1. **Environment Dosyaları:**
   - `.env` → Local development için (DB_HOST=localhost)
   - `.env.docker` → Docker için (DB_HOST=skillbase-postgres)

2. **Migration Çalıştırırken:**
   - Docker kullanıyorsanız `.env.docker` dosyasını kullanın
   - Veya environment variable'ları manuel set edin

3. **Veri Kalıcılığı:**
   - PostgreSQL verileri Docker volume'de saklanır
   - Container'ı durdursanız bile veriler korunur
   - Tamamen temizlemek için: `npm run docker:clean`

4. **Health Check:**
   - PostgreSQL container'ı health check ile başlatılır
   - Container hazır olana kadar bekleyin

## Troubleshooting

### "Connection refused" Hatası
```bash
# Container'ın çalıştığından emin olun
docker ps

# Container'ı başlatın
npm run docker:up

# Health check'i kontrol edin
docker ps
```

### "Database does not exist" Hatası
```bash
# Veritabanını oluşturun
cp .env.docker .env
npm run db:create
```

### Migration Çalışmıyor
```bash
# Environment dosyasını kontrol edin
cat .env

# .env.docker'ı kullanın
cp .env.docker .env

# Tekrar deneyin
npm run migration:run
```

