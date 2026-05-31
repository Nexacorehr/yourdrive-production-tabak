/**
 * Extension → MIME map aligned with web FileTypeDetector FILE_TYPE_MAP.
 * Used for blob Content-Type, extract uploads, and edit validation fallbacks.
 */
const EXTENSION_MIME: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  tiff: "image/tiff",
  tif: "image/tiff",
  ico: "image/x-icon",
  heic: "image/heic",
  heif: "image/heif",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  m4v: "video/x-m4v",
  avi: "video/x-msvideo",
  wmv: "video/x-ms-wmv",
  flv: "video/x-flv",
  mkv: "video/x-matroska",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  flac: "audio/flac",
  aac: "audio/aac",
  m4a: "audio/mp4",
  opus: "audio/opus",
  oga: "audio/ogg",
  xls: "application/vnd.ms-excel",
  xlsx:
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xlsm: "application/vnd.ms-excel.sheet.macroEnabled.12",
  csv: "text/csv",
  tsv: "text/tab-separated-values",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  doc: "application/msword",
  docx:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  odt: "application/vnd.oasis.opendocument.text",
  rtf: "application/rtf",
  ppt: "application/vnd.ms-powerpoint",
  pptx:
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain",
  md: "text/markdown",
  json: "application/json",
  xml: "application/xml",
  yaml: "application/x-yaml",
  yml: "application/x-yaml",
  js: "application/javascript",
  jsx: "application/javascript",
  ts: "application/typescript",
  tsx: "application/typescript",
  py: "text/x-python",
  java: "text/x-java",
  html: "text/html",
  css: "text/css",
  scss: "text/x-scss",
  php: "application/x-httpd-php",
  rb: "application/x-ruby",
  go: "text/x-go",
  rs: "text/rust",
  cpp: "text/x-c++",
  c: "text/x-c",
  cs: "text/x-csharp",
  sql: "application/sql",
  sh: "application/x-sh",
  bat: "application/x-bat",
  ps1: "application/x-powershell",
  zip: "application/zip",
  rar: "application/vnd.rar",
  "7z": "application/x-7z-compressed",
  tar: "application/x-tar",
  gz: "application/gzip",
  bz2: "application/x-bzip2",
  ini: "text/plain",
  conf: "text/plain",
  env: "text/plain",
  log: "text/plain",
  lock: "text/plain",
};

const CHARSET_SUFFIX_EXTS = new Set([
  "txt",
  "md",
  "json",
  "csv",
  "tsv",
  "html",
  "css",
  "xml",
  "yaml",
  "yml",
]);

export function mimeFromExtension(ext: string): string | undefined {
  const key = ext.toLowerCase().replace(/^\./, "");
  return EXTENSION_MIME[key];
}

export function mimeFromFileName(fileName: string): string | undefined {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (!ext) return undefined;
  const base = mimeFromExtension(ext);
  if (!base) return undefined;
  if (CHARSET_SUFFIX_EXTS.has(ext) && !base.includes("charset")) {
    return `${base}; charset=utf-8`;
  }
  return base;
}

export function mimeFromExtensionOrDefault(ext: string): string {
  return mimeFromExtension(ext) || "application/octet-stream";
}

/** MIME types accepted by POST /edit and text content endpoints */
export function isEditableMime(mimeType: string): boolean {
  const m = mimeType.toLowerCase();
  return (
    m.startsWith("text/") ||
    m === "application/json" ||
    m === "application/xml" ||
    m === "application/javascript" ||
    m === "application/typescript" ||
    m === "application/x-yaml" ||
    m === "application/sql" ||
    m === "application/x-sh" ||
    m === "application/x-bat" ||
    m === "application/x-powershell" ||
    m === "application/x-httpd-php" ||
    m === "application/x-ruby" ||
    m === "text/x-python" ||
    m === "text/x-java" ||
    m === "text/x-go" ||
    m === "text/rust" ||
    m === "text/x-c++" ||
    m === "text/x-c" ||
    m === "text/x-csharp" ||
    m === "text/x-scss"
  );
}
