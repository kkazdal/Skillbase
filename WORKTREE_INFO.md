# Git Worktree Durumu

## Mevcut Durum

Bu dizin bir **Git worktree** içinde çalışıyor:

- **Ana Repository:** `/Users/kadirkazdal/Desktop/Skillbase`
- **Worktree Konumu:** `/Users/kadirkazdal/.cursor/worktrees/Skillbase/tvg`
- **Durum:** Detached HEAD (branch'e bağlı değil)

## Değişiklikleri Görmek İçin

### 1. Git Status Kontrolü

```bash
git status
```

### 2. Değişiklikleri Bir Branch'e Bağlamak

**Seçenek A: Yeni Branch Oluştur**
```bash
git checkout -b docker-setup
```

**Seçenek B: Mevcut Branch'e Geç**
```bash
git checkout main
```

### 3. Değişiklikleri Commit Et

```bash
# Değişiklikleri stage'e ekle
git add .

# Commit et
git commit -m "feat: Add Docker support for NestJS API"

# Ana branch'e push et (eğer main'deyseniz)
git push origin main
```

## Worktree Hakkında

Git worktree, aynı repository'nin birden fazla working directory'sinde çalışmanıza izin verir:

- ✅ Aynı repo'da farklı branch'lerde paralel çalışma
- ✅ Değişiklikler birbirinden izole
- ✅ Git history paylaşılır

## Önemli Notlar

1. **Detached HEAD:** Şu anda bir branch'e bağlı değilsiniz
2. **Değişiklikler:** Mevcut, ancak bir branch'e bağlı değil
3. **Commit:** Değişiklikleri commit etmeden branch değiştirmeyin

## Hızlı Çözüm

```bash
# 1. Yeni branch oluştur
git checkout -b docker-setup

# 2. Değişiklikleri ekle
git add .

# 3. Commit et
git commit -m "feat: Add Docker support"

# 4. Push et (isteğe bağlı)
git push origin docker-setup
```

