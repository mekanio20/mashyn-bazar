# Araba Pazarı Uygulaması – Plan (v1)

## Context
Araba pazarında yüzlerce araç var. Satıcı/alıcı "şu araba nerede?" sorusuna saniyeler içinde cevap bulmak istiyor. Uygulama arabaları kaydeder, arama/filtre ile hızlı bulur ve arabanın pazardaki yerini matris (ızgara) üzerinde gösterir.

Mevcut proje: Vue 3 + Vite + Tailwind 4 + `idb` (IndexedDB) + Capacitor Android, tek ekranlı CRUD (`src/App.vue`, `src/db.ts`). Bu iskelet üzerine kurulacak; veriler cihazda (offline).

**v1 kapsamı:** fotoğraf YOK, diller: Türkmençe (tm) + Rusça (ru), arayüz mümkün olduğunca basit.

## Arayüz Yapısı
Üstte header, altta 3 butonlu navigasyon:

| Tab | İçerik | Header |
|---|---|---|
| 1 – Arabalar (sol) | Arama, filtre, liste | Başlık + **[+ Araba]** |
| 2 – Harita | Matris, hücrelerdeki arabalar | Başlık + **[+ Araba]** |
| 3 – Menü | Dil, Ayarlar, Hakkında, İletişim | Sadece başlık |

Basitlik kuralları: büyük dokunma alanları, tek sütun, az renk (ana renk + yeşil/gri), her butonda ikon + kısa yazı, boş ekranlarda "Henüz araba yok – [+ Araba]" yönlendirmesi.

## Araba Parametreleri (veri modeli)

**Zorunlu:**
- `brand` – Marka (BaseSelect, listeden seç)
- `model` – Model (BaseSelect; seçili markaya bağlı)
- `year` – Yıl (BaseSelect)
- `slot` – Yer: matris hücresi (`cellId`)

**Önemli (filtre için):**
- `mileage` – Kilometre
- `transmission` – Vites: manuel / otomatik
- `bodyType` – Kasa: sedan, hatchback, SUV, pikap, minivan…
- `condition` – Durum: yeni / ikinci el / hasarlı
- `status` – Satışta / Rezerve / Satıldı

**İsteğe bağlı:**
- `plate` – Plaka (girilirse benzersiz olmalı, aramada hızlı anahtar)
- `color` – Renk
- `ownerName`, `ownerPhone` – Satıcı adı, telefon (tek dokunuşla arama)
- `note` – Not
- `createdAt`, `updatedAt`

## BaseSelect Bileşeni (`src/components/BaseSelect.vue`)
Marka, model, yıl için ortak, yeniden kullanılabilir seçim bileşeni.
- Tıklayınca alttan açılan liste (bottom sheet); üstte **arama kutusu**, yazdıkça liste süzülür.
- Bir öğeye dokunma → seçilir, sheet kapanır.
- Sağında **[+]** butonu: **hızlı oluşturma**. Arama kutusuna yazılan metin yeni kayıt olarak eklenir (veya küçük bir giriş penceresi açılır), eklenince otomatik seçilir.
- Props: `modelValue`, `options` (`{id, label}[]`), `placeholder`, `label`, `allowCreate`, `disabled`; olaylar: `update:modelValue`, `create(text)`.
- Model seçimi, marka seçilmeden kapalı; marka değişince model sıfırlanır; **[+]** ile model eklerken seçili markaya bağlanır.
- Yıl için de aynı bileşen kullanılır (varsayılan liste: bu yıldan geriye 40 yıl; [+] ile ek yıl eklenebilir).
- Filtre panelinde de aynı bileşen kullanılır ([+] kapalı).

## Ekran Detayları

### 1. Arabalar (liste)
- Üstte **arama kutusu**: marka, model, plaka, telefon, yer adı üzerinde anlık arama.
- **Filtre** butonu → alttan açılan panel: marka, model, yıl aralığı, km aralığı, vites, kasa, durum, status. Aktif filtreler chip olarak görünür, tek dokunuşla silinir.
- **Sıralama**: yeni eklenen, yıl, km.
- Kart: marka model yıl, km, yer adı rozeti, status rozeti.
- Karta dokunma → detay (düzenle, sil, ara, "haritada göster").

### 2. Harita (matris)
- Kullanıcının kendi tanımladığı ızgara (satır × sütun). Hücre adı: `A1`, `B3`… (satır harfi + sütun numarası; adı kullanıcı değiştirebilir).
- **Bir hücrede çok sayıda araba olabilir.** Hücrede araba sayısı rozeti gösterilir; boş hücre gri, dolu hücre yeşil.
- Hücreye dokunma → alttan açılan sheet: o hücredeki arabaların listesi (dokun → detay) + **[+ Buraya araba ekle]** (yer önceden seçili).
- Arama kutusu: eşleşen arabaların hücreleri vurgulanır, diğerleri soluklaşır.
- Listeden "Haritada göster" ile gelince ilgili hücre vurgulanır.
- Büyük alanlar için kaydırma ve yakınlaştırma.

### 3. Menü
- **Dil**: Türkmençe (tm), Rusça (ru). Vue i18n; seçim kaydedilir.
- **Ayarlar** (tüm yönetim işleri burada):
  - **Pazar haritası düzenleme**: satır/sütun ekle-sil, satır ve sütun adlarını değiştir, istenen hücreyi gizle/kapat (pazarda olmayan boşluklar). İçinde araba olan hücre/satır/sütun silinmeye çalışılırsa uyarı verilir (arabalar "yer atanmamış" olur veya silme engellenir).
  - **Marka / Model / Yıl yönetimi**: listele, ekle, düzenle, sil (BaseSelect'teki hızlı ekleme ile aynı veri).
  - Tema (açık/koyu).
  - **Veri**: dışa aktar / içe aktar (JSON), tüm veriyi sil.
- **Hakkında**: sürüm.
- **İletişim**: telefon numarası, e-posta.

### Araba ekle/düzenle formu
Tam ekran, tek sütun. Üstte zorunlu alanlar: **Marka, Model, Yıl** (BaseSelect), **Yer** (hücre seçici – mini matris, dokunup seç). Altında "Daha fazla" açılır bölümü: km, vites, kasa, durum, status, plaka, renk, satıcı, telefon, not. Kaydet butonu altta sabit.

## Teknik Plan
- **Veritabanı** (`src/db.ts`, şema v2; eski `items` silinir):
  - `cars`: indeksler `brandId`, `modelId`, `year`, `cellId`, `status`, `plate` (benzersiz kontrolü kodda, boşsa atla). **`cellId` benzersiz DEĞİL** (hücrede çok araba).
  - `brands`, `models` (`brandId` ile bağlı), `years`
  - `grid`: `{ rows: [{id,name}], cols: [{id,name}], disabledCells: [] }`; hücre id'si `rowId-colId`.
  - `settings`: dil, tema.
- **Mimari**: `src/App.vue` ince kabuk (header + aktif view + alt nav), router yok, tab state ile geçiş.
  - `src/views/CarsView.vue`, `MapView.vue`, `MenuView.vue`
  - `src/components/`: `BaseSelect`, `CarCard`, `CarForm`, `FilterSheet`, `CellPicker`, `BottomSheet`, `BottomNav`, `AppHeader`
  - `src/stores/`: `cars.ts` (arama+filtre `computed`), `catalog.ts` (marka/model/yıl), `grid.ts`, `settings.ts`
  - `src/i18n/` (`tm.json`, `ru.json`), `src/types.ts`
- **Bağımlılıklar**: yalnızca `vue-i18n` eklenir. Telefon araması `tel:` linki. (Kamera/fotoğraf paketi yok.)
- **Performans**: bellekte `computed` filtre, aramada 150 ms debounce.
- **Android**: `yarn build && npx cap sync android`; APK mevcut GitHub Action ile.

## Uygulama Aşamaları
1. Tipler + `db.ts` (cars, brands, models, years, grid, settings)
2. Kabuk: header + alt nav + 3 boş view + i18n (tm/ru)
3. `BaseSelect` + `BottomSheet` + hızlı oluşturma
4. Araba formu + liste (CRUD)
5. Arama + filtre + sıralama
6. Harita: matris, çok araba/hücre, hücre sheet'i, liste↔harita bağlantısı
7. Menü: harita düzenleme, marka/model/yıl yönetimi, veri yedeği, tema, iletişim
8. Cilalama + test + APK build

## Doğrulama
- `yarn dev`: Araba ekle → BaseSelect'te marka ara, olmayan markayı [+] ile ekle → model (markaya bağlı) → yıl → hücre seç → kaydet → listede çıkar.
- Aynı hücreye 3+ araba ekle → haritada sayı rozeti doğru, hücre sheet'inde hepsi listelenir.
- Ayarlar'da satır/sütun ekle-sil, adlarını değiştir → harita ve hücre seçici güncellenir; dolu hücreyi silmede uyarı çıkar.
- Aynı plaka ikinci kez girilince uyarı; plakasız kayıt serbest.
- Arama ve filtre doğru sonuç verir; haritada eşleşen hücreler vurgulanır.
- Dil tm ↔ ru değişince tüm metinler değişir, yeniden açılışta korunur.
- Uygulamayı kapat/aç: veriler duruyor.
- `yarn build && npx cap sync android` → emülatörde 3 tab, `tel:` çalışıyor.
- 1000+ sahte araçla arama akıcı.

## Açık Sorular
- Pazarda birden çok bölge/blok olacak mı (v1'de tek ızgara varsayıldı)?
- Fiyat, yakıt gibi alanlar v1'e eklenmedi; sonra eklenecek mi?

# Erishim

Uygulamaya ilk girdigim zaman kod sorsun, bu kod uygulamaya 1 ay erishim verecek, 1 ay bitdikden sonra erishim kapanacak yine parol ekrani gelecek, kodu uygulama icinde gomecegiz ve sadece ben bilecegim