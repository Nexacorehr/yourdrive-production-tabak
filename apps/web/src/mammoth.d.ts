declare module "mammoth" {
  interface MammothInput {
    arrayBuffer?: ArrayBuffer;
    path?: string;
  }
  interface MammothResult {
    value: string;
    messages: unknown[];
  }
  function convertToHtml(
    input: MammothInput,
    options?: Record<string, unknown>
  ): Promise<MammothResult>;
  function extractRawText(input: MammothInput): Promise<MammothResult>;
  const mammoth: {
    convertToHtml: typeof convertToHtml;
    extractRawText: typeof extractRawText;
  };
  export default mammoth;
}
