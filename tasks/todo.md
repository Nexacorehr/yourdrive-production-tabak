# Plan — Mobile navigacija, Settings, README sustav, Markdown prikaz

**Status:** Implementirano (Sustavi 1–4). **Migracija baze:** pokrenuti `npx prisma migrate deploy` (ili `migrate dev`) na okruženju; ako `prisma generate` na Windowsu baci EPERM, zatvoriti proces koji drži `query_engine` i ponoviti.

**Stack (detektirano):** React 19 + Vite 7, **styled-components** + **framer-motion**, TanStack Router, Zustand (`sidebarStore` **bez persist-a za `isOpen`**). API: Express + Prisma + PostgreSQL + S3/B2, agregacija pohrane kroz `StorageService` / `user_files`.

**Princip:** proširiti postojeće obrasce; bez zamjene dizajn sustava; mobile-first; UI smiren, strukturiran, SaaS — bez teških sjena, nasumičnih gradijenata i „Dribbble” estetike.

---

## Faza 0 — Priprema (nakon odobrenja)

- [x] Ponovno pročitati relevantne skillove (`frontend-design`) prije UI promjena.
- [x] Za nove npm ovisnosti (markdown): Context7 + `react-markdown` / `remark-gfm` / `rehype-sanitize`.
- [x] Verifikacija: `npm run build -w web` i `-w api` prolaze.

---

## Sustav 1 — Mobile Navigation (kritično)

**Analiza (sažetak):**

- `Sidebar` se renderira samo kad `isOpen` (`Application.tsx`) — dobro za potpuno skrivanje.
- `SidebarWrapper` u [`sidebar.ts`](apps/web/src/components/dashboard/styles/sidebar.ts) ima **`min-width: 100px`** uz animaciju širine — potencijalni konflikt s „0px” širinom i izvor „peek”/layout pomaka na nekim breakpointima.
- `sidebarStore` **persist** — korisnik može na mobitelu dobiti `isOpen: true` s desktop sesije → sidebar se otvara neželjeno.
- Toggler: [`SidebarToggle.tsx`](apps/web/src/components/dashboard/component/sidebar/SidebarToggle.tsx) — treba provjeriti **min. 44×44px** tap cilj i konzistentan razmak s `QuickSearch` layoutom.

**Plan implementacije:**

1. [x] **Mobilni drawer model:** fiksni panel ispod navbar visine, `min(280px, 88vw)`, **`x: -100%` → `0`** (framer-motion); uklonjen problematični `min-width: 100px`; backdrop `z-index` 15, panel 30.
2. [x] **Persist ponašanje:** `isOpen` više nije u persist storageu (nema desktop→mobile „otvorenog” sidebara).
3. [x] **Spacing tokeni:** `--dashboard-space-*`, `--dashboard-tap-min` u `application.ts`.
4. [ ] **Verifikacija:** 375px / 430px — ručno ili Playwright (sidebar izvan ekrana kad zatvoren; nema horizontalnog pomaka).

**Review (kriterij):** senior review — konzistentno s ostatkom dashboarda; osjećaj nativnog mobilnog overlaya.

---

## Sustav 2 — Settings UX (kritično) — [x] gotovo


**Analiza (sažetak):**

- [`Settings.tsx`](apps/web/src/components/settings/Settings.tsx) + [`settings.styles.ts`](apps/web/src/components/settings/styles/settings.styles.ts): horizontalni tabovi (`TabsList` + `overflow-x: auto`) — na uskom ekranu teško za korištenje.
- Fontovi (Poppins / Forma DJR) već definirani — zadržati, ne uvođenje novog vizualnog jezika.

**Plan implementacije:**

1. **Mobile-first:** ispod `md` (npr. 768px): **vertikalni popis sekcija** (gumbi puna širina, ikona + labela, jasna aktivna stanja) — slično „settings list” obrascu u iOS/Settings.
2. **Desktop:** zadržati ili blago prilagoditi horizontalne tabove (jedan red, bez obveznog scrolla).
3. **Implementacija:** `matchMedia` ili styled-components `@media` — jedan izvor istine za `activeTab`, bez duplog rendera sadržaja.
4. **Verifikacija:** svi tabovi dostupni bez horizontalnog pomicanja na 375px; dovoljno veliki tap targeti.

**Review:** čitljivost, konzistentnost s `Main` pozadinom i postojećim `Section` blokovima.

---

## Sustav 3 — README sustav (nova značajka) — [x] gotovo


**Analiza (sažetak):**

- Datoteke su u `user_files` s `size`; pohrana se računa u [`StorageService.getStorageInfo`](apps/web/../apps/api/src/services/storage.service.ts) kroz **sum(size)**.
- Nema trenutno „sistemskog” zapisa — potrebna **API + DB** podrška.

**Plan implementacije:**

1. **Prisma:** novo polje npr. `user_files.is_excluded_from_quota` (boolean, default false) **ili** `is_system_readme` — README redak označiti; migracija.
2. **Logika pohrane:** agregacija `used` **isključuje** redove s tim flagom (i/ili fiksno `size = 0` za README ako je jednostavnije — prednost eksplicitnom flagu radi audit traila).
3. **Idempotencija:** endpoint ili servis `ensureWelcomeReadme(userId)` — ako ne postoji `README.md` u root folderu (`folder_path = ''`), kreirati S3 objekt + DB red s predloškom sadržaja (što aplikacija radi, ključne značajke, kratki „how to”).
4. **Zaštita od brisanja:** u [`fileActionsHandlers`](apps/api/src/routes/fileActionsHandlers.ts) / delete ruti — odbiti brisanje ako `is_system_readme` (ili ekvivalent); opcionalno i rename.
5. **Okidač:** nakon **prvog uspješnog logina** ili pri prvom učitavanju dashboarda s auth — jedan poziv `ensureWelcomeReadme` (idempotentno).
6. **Dokumentacija (HR, pasiv):** kratki odlomak u `README` repozitorija ili interni docs — što je sistemska datoteka.

**Review:** ponovni poziv ne duplicira; pohrana korisnika ne uključuje README u limit.

---

## Sustav 4 — Markdown vizualizator (dokumentacijski prikaz) — [x] gotovo


**Analiza (sažetak):**

- [`DefaultPreview.tsx`](apps/web/src/components/shared/filesPreview/components/previews/DefaultPreview.tsx) za `.md` vjerojatno prikazuje tekst / jednostavan fallback — treba **dokumentacijski** prikaz (hijerarhija naslova, liste, kod, razmaci).
- Postoji Prism u [`CodePreview.tsx`](apps/web/src/components/shared/filesPreview/components/previews/CodePreview.tsx) — za MD preview mogu se dijeliti tipografski tokeni, ne nužno cijeli editor.

**Plan implementacije:**

1. Novi modul npr. `MarkdownDocumentView` — **minimalna, čista tipografija** (naslovi, paragrafi, `ul`/`ol`, `blockquote`, `pre`/`code`), boje iz postojeće palete (`#0d1b2a`, `#5c6b7d`, plavi akcent već u appu).
2. **Biblioteka:** predložak — `react-markdown` + `remark-gfm` **ili** lagani parser + sanitizacija (`rehype-sanitize` / DOMPurify) — odluka nakon Context7 i veličine bundla.
3. Integracija: u granu pregleda za `mime` text/markdown ili ekstenziju `.md` — zamjena „plain” teksta ovim prikazom (zadržati download / error handling iz `DefaultPreview`).
4. **Verifikacija:** veliki MD ne blokira UI (lazy ili limit); nema XSS (samo siguran pipeline).

**Review:** izgleda kao interna dokumentacija, ne kao generički blog.

---

## Redoslijed izvršavanja (iteracije)

1. Mobile Navigation → verifikacija  
2. Settings UX → verifikacija  
3. README sustav (API + web okidač) → verifikacija  
4. Markdown vizualizator → verifikacija  
5. Završni pregled + ažuriranje [`tasks/lessons.md`](tasks/lessons.md) po potrebi

---

## Odobrenje

Plan je odobren; implementacija ide po redoslijedu izvršavanja.
