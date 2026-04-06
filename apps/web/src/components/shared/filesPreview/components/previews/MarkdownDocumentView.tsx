import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import styled from "styled-components";

const DocRoot = styled.article`
  width: 100%;
  max-width: 42rem;
  margin: 0 auto;
  padding: 1rem 1.25rem 1.5rem;
  text-align: left;
  color: #0d1b2a;
  font-size: 0.9375rem;
  line-height: 1.65;
  box-sizing: border-box;
  max-height: min(70vh, 520px);
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  background: #fafbfd;
  border: 1px solid #e4edf7;
  border-radius: 12px;

  h1,
  h2,
  h3,
  h4 {
    font-family: "Forma DJR Display", "Poppins", sans-serif;
    color: #0d1b2a;
    letter-spacing: -0.02em;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
    line-height: 1.25;
    font-weight: 700;
  }

  h1 {
    font-size: 1.35rem;
    margin-top: 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e4edf7;
  }

  h2 {
    font-size: 1.15rem;
  }

  h3 {
    font-size: 1.05rem;
  }

  p {
    margin: 0.65rem 0;
    color: #102033;
  }

  a {
    color: #1286fe;
    text-decoration: none;
    font-weight: 500;
  }

  a:hover {
    text-decoration: underline;
  }

  ul,
  ol {
    margin: 0.5rem 0 0.75rem 1.1rem;
    padding: 0;
    color: #243a52;
  }

  li {
    margin: 0.25rem 0;
  }

  blockquote {
    margin: 0.75rem 0;
    padding: 0.5rem 0.75rem;
    border-left: 3px solid #c5d9f5;
    background: rgba(18, 134, 254, 0.06);
    color: #3d4f5f;
  }

  code {
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 0.84em;
    background: #eef2f8;
    padding: 0.12em 0.35em;
    border-radius: 4px;
    color: #14314c;
  }

  pre {
    margin: 0.75rem 0;
    padding: 0.75rem 1rem;
    background: #0d1b2a;
    color: #e8eef4;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.8125rem;
    line-height: 1.5;
  }

  pre code {
    background: transparent;
    padding: 0;
    color: inherit;
    font-size: inherit;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0.75rem 0;
    font-size: 0.875rem;
  }

  th,
  td {
    border: 1px solid #dbe7f4;
    padding: 0.4rem 0.55rem;
    text-align: left;
  }

  th {
    background: #eef5fc;
    font-weight: 600;
    color: #14314c;
  }

  hr {
    border: none;
    border-top: 1px solid #e4edf7;
    margin: 1rem 0;
  }
`;

export interface MarkdownDocumentViewProps {
  markdown: string;
  className?: string;
}

const MarkdownDocumentView: React.FC<MarkdownDocumentViewProps> = ({
  markdown,
  className,
}) => {
  return (
    <DocRoot className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
        {markdown}
      </ReactMarkdown>
    </DocRoot>
  );
};

export default MarkdownDocumentView;
