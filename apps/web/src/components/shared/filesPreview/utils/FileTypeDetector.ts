export const codeExtensions = [
  // Web technologies
  "js",
  "jsx",
  "ts",
  "tsx",
  "vue",
  "svelte",
  "php",
  "asp",
  "aspx",
  "jsp",

  // Compiled languages
  "java",
  "c",
  "cpp",
  "cc",
  "cxx",
  "h",
  "hpp",
  "cs",
  "vb",
  "swift",
  "kt",
  "kts",
  "go",
  "rs",
  "scala",
  "dart",

  // Scripting languages
  "py",
  "rb",
  "pl",
  "lua",
  "tcl",
  "r",
  "sh",
  "bash",
  "zsh",
  "fish",
  "ps1",
  "bat",
  "cmd",

  // Functional languages
  "ml",
  "fs",
  "fsx",
  "clj",
  "cljs",
  "edn",
  "hs",
  "elm",
  "erl",
  "ex",
  "exs",

  // Database & query
  "sql",
  "plsql",
  "psql",
  "graphql",
  "gql",

  // Build & config
  "gradle",
  "sbt",
  "make",
  "cmake",
  "rake",
  "dockerfile",
  "containerfile",

  // Assembly & low-level
  "asm",
  "s",

  // Other languages
  "vbs",
  "pas",
  "d",
  "nim",
  "cr",
  "v",
  "zig",
  "odin",
  "ada",
  "f",
  "f90",
  "f95",
  "cob",
  "cobol",
  "forth",
  "lisp",
  "scm",
];

export const documentExtensions = [
  // PDF
  "pdf",

  // Microsoft Office
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",

  // OpenDocument
  "odt",
  "ods",
  "odp",
  "odg",
  "odf",
  "ott",
  "ots",
  "otp",

  // Rich text
  "rtf",
  "pages",
  "numbers",
  "key",

  // Text formats
  "txt",
  "text",
  "md",
  "markdown",
  "rst",
  "asciidoc",
  "textile",

  // Data formats
  "json",
  "xml",
  "yaml",
  "yml",
  "toml",
  "ini",
  "cfg",
  "conf",

  // Web formats
  "html",
  "htm",
  "xhtml",
  "mhtml",

  // Documentation
  "log",
  "csv",
  "tsv",

  // E-books
  "epub",
  "mobi",
  "azw",
  "azw3",
  "fb2",
  "djvu",
  "cbr",
  "cbz",

  // Config files
  "env",
  "properties",
  "plist",
];

export const styleExtensions = [
  "css",
  "scss",
  "sass",
  "less",
  "styl",
  "stylus",
];

export const imageExtensions = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "webp",
  "ico",
  "tiff",
  "tif",

  // Vector
  "svg",
  "eps",
  "ai",

  // Raw camera formats
  "raw",
  "cr2",
  "nef",
  "arw",
  "dng",

  // Other
  "psd",
  "xcf",
  "sketch",
];

export const videoExtensions = [
  "mp4",
  "webm",
  "ogg",
  "ogv",
  "avi",
  "mov",
  "wmv",
  "flv",
  "mkv",
  "m4v",
  "mpg",
  "mpeg",
  "3gp",
  "3g2",
  "mts",
  "m2ts",
  "vob",
  "f4v",
  "swf",
  "avchd",
];

export const audioExtensions = [
  "mp3",
  "wav",
  "ogg",
  "oga",
  "m4a",
  "flac",
  "aac",
  "wma",
  "opus",
  "webm",
  "amr",
  "aiff",
  "ape",
  "au",
  "mid",
  "midi",
  "mka",
  "ra",
  "rm",
  "wv",
];

export const archiveExtensions = [
  "zip",
  "rar",
  "7z",
  "tar",
  "gz",
  "bz2",
  "xz",
  "lz",
  "lzma",
  "cab",
  "iso",
  "dmg",
  "pkg",
  "deb",
  "rpm",
  "apk",
  "jar",
  "war",
  "ear",
  "tgz",
  "tbz2",
  "txz",
  "zipx",
  "sit",
  "sitx",
];

export const fontExtensions = ["ttf", "otf", "woff", "woff2", "eot"];

export const modelExtensions = [
  "obj",
  "fbx",
  "dae",
  "3ds",
  "blend",
  "stl",
  "ply",
  "gltf",
  "glb",
  "usdz",
];

// Database fomats
export const databaseExtensions = [
  "db",
  "sqlite",
  "sqlite3",
  "mdb",
  "accdb",
  "dbf",
];

// Executable and binary
export const executableExtensions = [
  "exe",
  "dll",
  "so",
  "dylib",
  "app",
  "deb",
  "rpm",
  "msi",
  "bin",
  "bat",
  "cmd",
  "sh",
  "run",
  "elf",
];

export function detectFileType(fileName: string, mimeType?: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  // Check categories
  if (codeExtensions.includes(ext) || styleExtensions.includes(ext)) {
    return "code";
  }

  if (documentExtensions.includes(ext)) {
    return "document";
  }

  if (imageExtensions.includes(ext)) {
    return "image";
  }

  if (videoExtensions.includes(ext)) {
    return "video";
  }

  if (audioExtensions.includes(ext)) {
    return "audio";
  }

  if (archiveExtensions.includes(ext)) {
    return "archive";
  }

  if (fontExtensions.includes(ext)) {
    return "font";
  }

  if (modelExtensions.includes(ext)) {
    return "3d";
  }

  if (databaseExtensions.includes(ext)) {
    return "database";
  }

  if (executableExtensions.includes(ext)) {
    return "executable";
  }

  if (mimeType) {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.startsWith("text/")) return "code";
    if (mimeType.includes("pdf")) return "document";
    if (
      mimeType.includes("officedocument") ||
      mimeType.includes("opendocument")
    ) {
      return "document";
    }
  }

  return "unknown";
}

export function isPreviewable(fileType: string): boolean {
  return ["code", "document", "image", "video", "audio"].includes(fileType);
}

export function getFileTypeName(fileType: string): string {
  const typeNames: Record<string, string> = {
    code: "Code File",
    document: "Document",
    image: "Image",
    video: "Video",
    audio: "Audio",
    archive: "Archive",
    font: "Font File",
    "3d": "3D Model",
    database: "Database",
    executable: "Executable",
    unknown: "File",
  };

  return typeNames[fileType] || "File";
}
