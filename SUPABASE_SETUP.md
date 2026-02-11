# Supabase Kurulum Kılavuzu (Güncellendi)

Bu kılavuz, projenizin veritabanı yapısını projedeki veri tipleriyle (TypeScript) %100 uyumlu hale getirmek için güncellenmiştir.

## 1. SQL Editörü Kullanarak Tabloları Oluşturun

Supabase dashboard'unuzda **SQL Editor** sekmesine gidin, **New Query** deyin ve aşağıdaki SQL komutlarını yapıştırıp **Run** butonuna basın.

```sql
-- UUID uzantısını etkinleştir
create extension if not exists "uuid-ossp";

-- ENUMS (Veri Tipleri)
create type public.item_type as enum ('series', 'movie', 'book', 'manga', 'game', 'podcast', 'documentary');
create type public.item_status as enum ('planned', 'in_progress', 'completed', 'dropped', 'rewatch');
create type public.note_type as enum ('quick', 'spoiler', 'quote', 'insight');

-- PROFILES TABLOSU
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile." on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

-- ITEMS (Arşiv Öğeleri) TABLOSU
create table public.items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  type public.item_type not null,
  status public.item_status default 'planned' not null,
  rating integer check (rating >= 0 and rating <= 10),
  progress_value integer,
  progress_unit text,
  started_at timestamp with time zone,
  finished_at timestamp with time zone,
  short_note text,
  review text,
  cover_url text,
  is_favorite boolean default false not null,
  visibility text default 'private' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.items enable row level security;

create policy "Users can view their own items." on public.items
  for select using (auth.uid() = user_id);

create policy "Users can insert their own items." on public.items
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own items." on public.items
  for update using (auth.uid() = user_id);

create policy "Users can delete their own items." on public.items
  for delete using (auth.uid() = user_id);

-- NOTES TABLOSU
create table public.notes (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references public.items(id) on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  type public.note_type default 'quick' not null,
  content text not null,
  is_spoiler boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notes enable row level security;

create policy "Users can view their own notes." on public.notes
  for select using (auth.uid() = user_id);

create policy "Users can insert their own notes." on public.notes
  for insert with check (auth.uid() = user_id);

-- TAGS TABLOSU
create table public.tags (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tags enable row level security;

create policy "Users can view their own tags." on public.tags
  for select using (auth.uid() = user_id);

-- STORAGE BUCKETS
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true), ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- STORAGE POLICIES (Görsel İşlemleri İçin)
create policy "Public Access" on storage.objects for select using (bucket_id in ('covers', 'avatars'));

create policy "Authenticated Users can upload covers" on storage.objects 
for insert with check (bucket_id = 'covers' and auth.role() = 'authenticated');

create policy "Authenticated Users can upload avatars" on storage.objects 
for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- OTOMATİK PROFİL OLUŞTURMA TETİKLEYİCİSİ
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## 2. Storage Ayarları

Supabase Dashboard -> **Storage** kısmında `covers` ve `avatars` klasörlerini gördüğünüzden ve **Public** olduklarından emin olun.

## 3. Önemli Not

Eğer bu SQL'i daha önce çalıştırdıysanız ve hata alıyorsanız (örn: tablo zaten var), önce mevcut tabloları silmeniz (`DROP TABLE ...`) gerekebilir. **Dikkat: Verileriniz silinecektir!** Eğer verileriniz varsa silmek yerine sadece sütun farklarını manuel eklemeniz önerilir.


-- Profiles tablosuna eksik sütunları ekle
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;