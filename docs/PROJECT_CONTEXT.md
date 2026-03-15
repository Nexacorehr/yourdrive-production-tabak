# PROJECT_CONTEXT

## 1. Pregled projekta (Project Overview)

YourDrive je self-hosted platforma za pohranu i upravljanje datotekama koja kombinira osobni cloud storage, dijeljenje sadržaja i osnovnu kolaboraciju (komentari, uređivanje tekstualnih datoteka, granularne dozvole).  
Arhitektura je organizirana kao monorepo s odvojenim frontend (`apps/web`) i backend (`apps/api`) aplikacijama, gdje backend upravlja autentikacijom, autorizacijom, metapodacima i poslovnom logikom, dok se binarni sadržaj datoteka pohranjuje u S3-kompatibilni objektni storage.

Primarni poslovni cilj aplikacije je omogućiti korisniku:

- siguran pristup vlastitim datotekama,
- kontrolirano dijeljenje sadržaja prema drugim korisnicima ili putem javnih linkova,
- upravljanje uređajima i korisničkim postavkama,
- skalabilnu pohranu odvojenu od relacijske baze podataka.

---

## 2. Tehnološki stog (Tech Stack)

### Frontend

- React 19 + TypeScript + Vite 7
  - Zasto u ovom projektu:
    - React i TypeScript omogucuju komponentnu arhitekturu i staticku provjeru tipova za slozene UI tokove (dashboard, tablice datoteka, preglednici, editor).
    - Vite ubrzava razvoj (brz HMR) i pojednostavljuje build/publish pipeline SPA aplikacije.
  - Prednosti:
    - visoka produktivnost i odrzivost UI-a,
    - dobra ekosustav podrska za bogate klijentske funkcionalnosti (preview, upload, editor),
    - laka integracija s REST API slojem.
  - Nedostaci:
    - veci bundle i slozeniji lifecycle kod velikog broja feature komponenti,
    - veca odgovornost na klijentu za konzistentnost state-a i error recovery.

- TanStack Router
  - Zasto u ovom projektu:
    - omogucuje eksplicitnu, kodom definiranu routing shemu i route-level guardove.
  - Prednosti:
    - jasna kontrola auth redirecta (`beforeLoad`),
    - predvidljivo hijerarhijsko gnijezdenje ruta (dashboard + child views).
  - Nedostaci:
    - route tree je verbose i zahtijeva disciplinu kod sirenja aplikacije.

- Zustand
  - Zasto u ovom projektu:
    - lagan global state sloj za auth, storage, UI i akcije nad datotekama bez kompleksnosti Redux-a.
  - Prednosti:
    - jednostavan API, dobra ergonomija za feature-store pristup,
    - lako perzistiranje dijela state-a (`persist` middleware).
  - Nedostaci:
    - slabije formaliziran tok promjena u odnosu na event-driven storeove,
    - moguci rizik nekonzistentnosti kad logika ode u mnogo odvojenih storeova/hookova.

- Axios (centralizirani klijent + interceptori)
  - Zasto u ovom projektu:
    - robustan HTTP sloj s automatskim ubacivanjem Bearer tokena i queue mehanizmom za token refresh.
  - Prednosti:
    - centralno rjesavanje 401 stanja i retry politike,
    - konzistentna konfiguracija (`withCredentials`, base URL strategija).
  - Nedostaci:
    - veca kompleksnost interceptor logike i edge-caseova.

### Backend

- Node.js + Express + TypeScript
  - Zasto u ovom projektu:
    - brz razvoj REST API-ja i middleware-driven arhitekture.
  - Prednosti:
    - modularna organizacija domena (`auth`, `files`, `sharing`, `settings`, `devices`, `storage`, `file-actions`, `conversion`),
    - jednostavna integracija s Prisma ORM i AWS SDK/B2 servisom.
  - Nedostaci:
    - dio logike je rasprsen izmedu route handlera i servisa,
    - potreban veci oprez oko konzistentnih sigurnosnih policy-ja po svim endpointima.

- Prisma ORM + `pg` (hibridni pristup)
  - Zasto u ovom projektu:
    - Prisma za relacije/modeliranje i tip-sigurnije upite, `pg` za fleksibilne SQL upite gdje su potrebni custom aggregate/reporting tokovi.
  - Prednosti:
    - balans produktivnosti i kontrole,
    - jasna shema migracija i relacija.
  - Nedostaci:
    - povecana kognitivna slozenost zbog dualnog data-access pristupa,
    - razliciti stilovi upita mogu otezakti standardizaciju sigurnosnih pravila.

- Zod + express-rate-limit + Helmet + bcrypt/bcryptjs + JWT + Passport + TOTP/WebAuthn
  - Zasto u ovom projektu:
    - pokriva validaciju ulaza, osnovnu hardening razinu, autentikacijske tokove (klasicni i moderni), i zastitu lozinki/tokena.
  - Prednosti:
    - viseslojna auth platforma (email/password, OAuth, TOTP, passkeys),
    - dobra osnova za produkcijsku sigurnost.
  - Nedostaci:
    - trenutno postoje implementacijske nekonzistentnosti (detaljno u Security poglavlju).

### Baza podataka i pohrana

- PostgreSQL
  - Zasto u ovom projektu:
    - transakcijski pouzdana relacijska baza za korisnike, sesije, metapodatke datoteka, dijeljenje i audit tragove.
  - Prednosti:
    - jaki relacijski integritet i indeksiranje,
    - prikladna za poslovna pravila i izvjestavanje.
  - Nedostaci:
    - nije optimalna za pohranu velikih binarnih blobova (zato je ovdje BLOB sloj van baze).

- S3-kompatibilni object storage (npr. Backblaze B2)
  - Zasto u ovom projektu:
    - razdvajanje metapodataka i stvarnog file sadrzaja radi skalabilnosti i smanjenja opterecenja baze.
  - Prednosti:
    - horizontalno skalabilna pohrana,
    - presigned URL obrasci za kontrolirani pristup.
  - Nedostaci:
    - potreba za dodatnom sinkronizacijom metapodataka i objektne pohrane,
    - kompleksniji lifecycle kod upload/download/edit tokova.

---

## 3. Arhitektura i Funkcionalnosti

### 3.1 Frontend arhitektura

- Arhitekturni slojevi:
  - `src/router/router.tsx`: centralni route tree i auth guardovi.
  - `src/store/*`: globalni Zustand storeovi (`authStore`, `storageStore`, `searchStore`, `sidebarStore`, `popup.store`, `fileActions.store`).
  - `src/lib/axios.ts`: API transportni sloj s interceptorima.
  - `src/components/**`: feature-driven UI moduli (landing, auth, dashboard, settings, shared viewer, file editor).

- Routing:
  - Public rute: landing i staticke stranice.
  - Auth rute: `/login`, `/register`, `/verify-email`.
  - Protected rute: `/dashboard/*`, `/edit/$fileId`.
  - Shared ruta: `/shared/$token` (javni pristup prema share tokenu).
  - Guardovi:
    - `redirectIfAuthenticated` za login/register,
    - `requireAuthentication` za dashboard i edit tokove.

- State management:
  - `authStore` perzistira korisnika i token, upravlja login/register/logout/refresh/checkAuth tokovima i device dohvatom.
  - `storageStore` dohvaća i racuna usage (`/storage/info`) i koristi ga za prikaz kvota.
  - ostali storeovi pokrivaju UI state, popup tokove i batch akcije.

- API integracija:
  - `withCredentials: true` + Bearer header.
  - 401 refresh queue (`isRefreshing` + `failedQueue`) sprjecava stampedo paralelnih refresh poziva.
  - baza URL-a:
    - preferirano `/api` (same-origin preko Vite proxy-ja),
    - opcionalno `VITE_API_URL` za override.

### 3.2 Backend arhitektura

- Ulazna tocka:
  - `src/index.ts` inicijalizira middleware, CORS/headers, route mount tocke i globalni error handler.

- API modularizacija po domenama:
  - `/api/auth`: registracija, login, refresh, logout, `/me`, reset lozinke, TOTP, WebAuthn, social account operacije.
  - `/api/files`: upload (single/multi/chunked), listing, folder operacije, preview/content/download, edit, recent/shared/recycle tokovi.
  - `/api/file-actions`: batch i napredne operacije (star, move, rename, lock, compress, optimize, watermark, generate PDF).
  - `/api/sharing`: kreiranje i upravljanje share linkovima, javni pristup, komentari, stream/content po tokenu.
  - `/api/settings`: profil, sigurnost, appearance, language, storage, sharing, sessions, avatar, account lifecycle.
  - `/api/devices`: pregled i upravljanje uredajima, grupama i remote akcijama (lock/logout/wipe).
  - `/api/storage`: storage info/stats i utility operacije.
  - `/api/conversion`: priprema i spremanje konvertiranih datoteka.

- Middleware i poslovna logika:
  - `authMiddleware`: provjera Bearer access tokena i injektiranje `req.userId`.
  - Validacija:
    - `zod` sheme u auth/settings/sharing domenama.
    - multer limite i MIME filteri za upload tokove.
  - Servisni sloj:
    - `AuthService`, `SettingsService`, `StorageService`, `DeviceService`, pomocni S3/B2 i email servisi.

- Integracijski obrazac:
  - metapodaci i korisnicki odnosi u PostgreSQL,
  - datoteke u object storage-u,
  - potpisani URL-ovi i/ili server-proxy endpointi za dohvat sadrzaja.

### 3.3 Baza podataka (shema, relacije, tipovi podataka)

Temeljni entiteti:

- `User`
  - identitet i auth atributi (email, password hash, email verification, lockout, TOTP, reset tokeni).

- `Session`
  - refresh token sesije po korisniku, expiry i device info.

- `UserDevice`
  - inventar uredaja, sigurnosni statusi (`isLocked`, `forceLogout`, `wipedAt`) i telemetrija aktivnosti.

- `UserFile`
  - metapodaci datoteka i foldera (`s3Key`, `folderPath`, `size` kao `BigInt`, `mimeType`, `fileHash`, soft-delete polja).

- `FileShare`, `ShareRecipient`, `ShareComment`, `ShareActivity`
  - share model s tokenom, dozvolama, expiry/max download politikom, komentarima i audit aktivnostima.

- `UserSettings`
  - JSONB konfiguracija korisnika (`profile`, `security`, `appearance`, `language`, `storage`, `sharing`, `preferences`, `privacy`).

- dodatni auth modeli:
  - `WebAuthnCredential`, `SocialAccount`, `TotpRecoveryCode`.

- korisnicke organizacijske tablice:
  - `FavoritedFile`, `RecycleBin`.

Relacijski obrasci:

- `User 1:N Session`, `User 1:N UserDevice`, `User 1:N UserFile`.
- `UserFile 1:N FileShare`.
- `FileShare 1:N ShareComment`, `FileShare 1:N ShareActivity`, `FileShare N:M User` preko `ShareRecipient`.
- soft-delete i lifecycle su modelirani kroz `deletedAt` i recycle bin tablice.

Tipovi podataka:

- veliki kapaciteti koriste `BigInt` (`size`, `storageLimit`, signCount),
- korisnicke preference i konfiguracije koriste `Json`,
- relacijski integritet osiguran je foreign key i unique constraint pravilima.

### 3.4 Ključni workflow-i (tokovi rada)

1. Auth/session workflow

- Registracija (`/auth/register`) -> validacija -> hash lozinke -> korisnicki zapis.
- Login (`/auth/login`) -> provjera lockout stanja -> izdavanje access + refresh tokena.
- Refresh (`/auth/refresh`) koristi refresh cookie za novi access token.
- Frontend interceptor automatski obnavlja access token i ponavlja originalni request.

2. Upload i upravljanje datotekama

- Standard upload: frontend multipart -> `/files/upload` -> objekt u S3/B2 -> metadata u `user_files`.
- Veliki upload: multipart inicijalizacija, part URL-ovi, chunk upload, complete/abort.
- Post-upload: listing, preview (`/files/blob/:id`), signed download URL, folder i recycle operacije.

3. Share i kolaboracija

- Vlasnik kreira share (`/sharing/create`) s dozvolama, optional lozinkom, expiry/max download pravilima.
- Javni korisnik dohvaća metapodatke sharea (`/sharing/public/:token`) i/ili pristupa sadrzaju.
- Komentari i shared-edit tokovi ovise o `permission` modelu.

4. Settings i lifecycle korisnika

- PATCH endpointi upravljaju granularnim preference domenama.
- Avatar upload optimizira sliku (`sharp`) i pohranjuje u object storage ili base64 fallback.
- Account deletion kaskadno uklanja datoteke, sesije i povezane identitete.

5. Device management

- Evidencija aktivnih uredaja, grupiranje uredaja (ako tablice postoje), remote sigurnosne akcije (logout/lock/wipe).

---

## 4. Sigurnost (Security)

### 4.1 Implementirani sigurnosni mehanizmi

- Autentikacija:
  - JWT access + refresh model.
  - refresh token pohranjen kao HttpOnly cookie.
  - hashiranje lozinki (`bcrypt`/`bcryptjs`).
  - opcionalni 2FA (TOTP + recovery kodovi).
  - WebAuthn/passkey i OAuth integracije (Google/GitHub/Facebook).

- Autorizacija:
  - `authMiddleware` stiti vecinu privatnih endpointa.
  - ownership provjere postoje u nizu file/settings/device operacija.

- Zastita unosa:
  - `zod` validacija za osjetljive domene (auth, sharing, settings).
  - multer limiti velicine datoteka + MIME filter za avatar upload.
  - input validation za pojedine query parametre (`recent` endpoint).

- Zastita podataka:
  - osjetljivi podaci (lozinke, reset kodovi, refresh token hash) nisu u plaintext obliku u bazi.
  - database schema koristi unique i FK ogranicenja za integritet.

- Operativna sigurnost:
  - `helmet` i rate limit (registracija/login/password reset).
  - audit-like tablice i logovi aktivnosti za share/device tokove.

### 4.2 Uoceni rizici i tehnicki dug (prema trenutnoj implementaciji)

1. CORS konfiguracija je pre-permisivna

- dinamicno reflektira origin i dopusta credentialed zahtjeve bez striktne allow liste.
- rizik: povecana povrsina za cross-site abuse scenarije.

2. Nekonzistentna auth/autorizacija u sharing domeni

- pojedini endpointi za dohvat ili izmjenu share zapisa nisu strogo auth-guardani/ownership-gardani.
- rizik: neovlasteni uvid ili mutacije share resursa.

3. Password-protected share nije end-to-end proveden

- validacija lozinke postoji u `access` endpointu, ali nije dosljedno vezana uz sve content/comment/edit rute.
- rizik: zaobilazenje password gate-a.

4. WebAuthn challenge lifecycle nije potpuno robustan

- challenge rukovanje ne koristi klasicni server-session mehanizam na dosljedan nacin.
- rizik: slabija kriptografska vezanost challenge-responesa.

5. Sigurnosne default vrijednosti za JWT tajne

- fallback na hardcoded default stringove je prisutan.
- rizik: kriticna ranjivost u slucaju pogresne env konfiguracije.

6. SSRF-like povrsina u conversion workflowu

- backend fetch-a URL koji dolazi iz request body-ja bez stroge hostname allow liste.
- rizik: pristup internim mreznim resursima.

7. Dodatni rizici

- osjetljiviji debug logovi u auth tokovima,
- mjestimicna uporaba raw SQL konstrukata i unsafe helpera,
- nedostatak centralne CSRF strategije za cookie-based endpointe.

### 4.3 Preporuceni smjer hardeninga

- Uvesti centraliziranu CORS allow-list politiku (po okolinama).
- Uvesti jedinstveni authorization policy layer za ownership i permission checkove.
- Uvesti explicit share-access session/proof mehanizam nakon uspjesne lozinke.
- Ukloniti insecure JWT fallback i fail-fast boot ako tajne nisu postavljene.
- Uvesti SSRF zastitu (allow-list domena/protokola + DNS/IP filtriranje) za conversion fetch.
- Dodati CSRF obranu za cookie auth tokove (token/same-site strategija).

---

## 5. Kontekst za zavrsni rad (Thesis Context)

YourDrive predstavlja primjer hibridne cloud arhitekture koja razdvaja odgovornosti izmedu relacijskog podatkovnog sloja i objektne pohrane, pri cemu PostgreSQL sluzi kao sustav zapisa metapodataka i sigurnosno relevantnih entiteta, a S3-kompatibilni storage kao skalabilni repozitorij binarnih objekata. Takva separacija smanjuje opterecenje transakcijske baze, pojednostavljuje horizontalno skaliranje pohrane i omogucuje precizno upravljanje zivotnim ciklusom datoteka putem metapodatkovnih operacija.

Na klijentskoj strani, aplikacija je implementirana kao SPA sustav temeljen na React-u i TypeScript-u, s eksplicitnim rutiranjem (TanStack Router) i laganim globalnim state slojem (Zustand). Ovaj pristup osigurava jasnu separaciju izmedu prikaznog sloja, navigacijske logike i podataka sesije, dok centralizirani Axios klijent s interceptorima implementira robusni token-refresh mehanizam i smanjuje propagaciju autentikacijskih detalja po komponentama. Frontend time preuzima znacajan dio orkestracije UX tokova (npr. auth rehydration, route guardovi, sinkronizacija storage usage podataka), sto je tipicno za moderne rich-client sustave.

Backend je organiziran kao modularni REST sustav u kojem svaka domena (autentikacija, datoteke, dijeljenje, postavke, uredaji, storage, konverzija) ima vlastite route handlere i djelomicno izdvojeni servisni sloj. Kombinacija Prisma ORM-a i nativnih SQL upita preko `pg` biblioteke omogucuje kompromis izmedu tip-sigurnosti i fleksibilnosti kompleksnih upita. Iako ovaj dualni pristup povecava mogucnosti optimizacije i fine kontrole, istovremeno uvodi arhitekturni zahtjev za strogu standardizaciju data-access uzoraka, posebno u kontekstu sigurnosnih i autorizacijskih politika.

Podatkovni model obuhvaca cjelovit skup entiteta potrebnih za sustav datoteka u oblaku: korisnicki identitet (`User`), sesije (`Session`), uredaji (`UserDevice`), datoteke (`UserFile`), favoriti i recikla (lifecycle upravljanje), kao i kolaboracijski sloj (`FileShare`, `ShareRecipient`, `ShareComment`, `ShareActivity`). Uporaba `BigInt` tipova za velicine i limite opravdana je zbog skalabilnosti i tocnog racunanja kapaciteta, dok su korisnicke preference i konfiguracije modelirane JSON strukturama (`UserSettings`) radi semanticke fleksibilnosti i smanjenja potrebe za cestim migracijama sheme.

Sigurnosno gledano, sustav implementira vise autenticacijskih paradigmi (JWT, OAuth, TOTP, WebAuthn), sto ga cini prikladnim studijskim primjerom evolucije od klasicne lozinka-based autentikacije prema phishing-resistentnim metodama identifikacije. Istovremeno, analiza implementacije pokazuje tipicne izazove produkcijskih sustava: potrebu za konzistentnim authorization pravilima kroz sve endpointe, centraliziranom CORS/CSRF strategijom, eliminacijom insecure konfiguracijskih fallbackova i formalizacijom sigurnosnih granica u javnim share workflowima. Upravo taj kontrast izmedu bogatog feature seta i operativnog sigurnosnog duga cini projekt relevantnim za akademsku obradu, jer omogucuje argumentiranu raspravu o kompromisima izmedu brzine razvoja, funkcionalnog opsega i sigurnosne rigoroznosti.

Zakljucno, YourDrive je reprezentativan full-stack artefakt za zavrsni rad iz podrucja web arhitektura i sigurnosti: demonstrira suvremene obrasce razvoja (SPA + REST + ORM + object storage), kompleksne korisnicke tokove i realne probleme integracije sigurnosnih mehanizama u rastuci proizvodni kod. Kao takav, pruza stabilnu i tehnicki bogatu osnovu za daljnju znanstveno-strucnu elaboraciju arhitekturnih odluka, performansnih implikacija i sigurnosnih poboljsanja.
