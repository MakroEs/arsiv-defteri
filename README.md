# Arşiv Defteri 📚🎬🎮

**Arşiv Defteri**, izlediğiniz dizileri, filmleri, okuduğunuz kitapları ve oynadığınız oyunları şık bir arayüzle kayıt altına almanızı sağlayan kişisel bir medya kütüphanesi ve günlüktür. Sinematik ve edebi bir dergi estetiği ile tasarlanmıştır.

## ✨ Özellikler

- **Çok Yönlü Arşiv**: Dizi, Film, Kitap, Oyun, Manga, Podcast ve Belgesel desteği.
- **Dinamik Dashboard**: Size özel öneriler, yarım kalan hikayeler (Devam Et) ve son eklemeler.
- **Detaylı Notlar**: Her içerik için "Spoiler", "Analiz" veya "Alıntı" türünde zengin notlar tutun.
- **Akıllı Durum Takibi**: Planlandı, Devam Ediyor, Bitti, Bırakıldı ve Tekrar gibi durumlarla ajandanızı yönetin.
- **Gerçek Zamanlı Senkronizasyon**: Yapılan tüm değişiklikler (not ekleme, silme, düzenleme) anında tüm sayfalarda güncellenir.
- **Premium Tasarım**: Karanlık mod odaklı, cam (glassmorphism) efektli, serif tipografisiyle zenginleştirilmiş kullanıcı deneyimi.
- **Favoriler**: En sevdiğiniz içerikleri tek tıkla işaretleyin ve kolayca erişin.

## 🚀 Teknolojiler

- **Frontend**: Next.js 16 (App Router), React, Tailwind CSS
- **Backend/Database**: Supabase (Auth & PostgreSQL)
- **State Management**: React Query (TanStack Query)
- **Components**: Shadcn/ui & Radix UI
- **İkonlar**: Lucide React
- **Form Yönetimi**: React Hook Form & Zod

## 🛠️ Kurulum

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/username/arsiv-defteri.git
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. `.env.local` dosyasını oluşturun ve Supabase bilgilerinizi ekleyin:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Uygulamayı başlatın:
   ```bash
   npm run dev
   ```

## 📜 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---
*Arşiv Defteri ile kendi hikayeni yazmaya başla.*
