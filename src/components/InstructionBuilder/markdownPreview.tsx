import React from 'react';

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let index = 0;

  while (remaining.length > 0) {
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    const italicMatch = remaining.match(/^\*([^*]+)\*/);
    const codeMatch = remaining.match(/^`([^`]+)`/);

    if (linkMatch) {
      nodes.push(
        <a key={`${keyPrefix}-${index++}`} href={linkMatch[2]} target="_blank" rel="noreferrer">
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    if (boldMatch) {
      nodes.push(<strong key={`${keyPrefix}-${index++}`}>{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    if (italicMatch) {
      nodes.push(<em key={`${keyPrefix}-${index++}`}>{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    if (codeMatch) {
      nodes.push(<code key={`${keyPrefix}-${index++}`}>{codeMatch[1]}</code>);
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    const nextSpecial = remaining.search(/[\[*`]/);
    if (nextSpecial === -1) {
      nodes.push(remaining);
      break;
    }
    if (nextSpecial > 0) {
      nodes.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
      continue;
    }

    nodes.push(remaining[0]);
    remaining = remaining.slice(1);
  }

  return nodes;
}

function isBulletLine(line: string) {
  return /^[-*]\s+/.test(line);
}

function isOrderedLine(line: string) {
  return /^\d+\.\s+/.test(line);
}

function bulletContent(line: string) {
  return line.replace(/^[-*]\s+/, '');
}

function orderedContent(line: string) {
  return line.replace(/^\d+\.\s+/, '');
}

export function MarkdownPreview({ content }: { content: string }) {
  if (!content.trim()) {
    return <p className="step-instruction-preview-empty">Nothing to preview yet.</p>;
  }

  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let lineIndex = 0;
  let blockIndex = 0;

  while (lineIndex < lines.length) {
    const line = lines[lineIndex];

    if (!line.trim()) {
      lineIndex += 1;
      continue;
    }

    if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={`block-${blockIndex++}`}>{renderInline(line.slice(4), `h3-${lineIndex}`)}</h3>
      );
      lineIndex += 1;
      continue;
    }

    if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={`block-${blockIndex++}`}>{renderInline(line.slice(3), `h2-${lineIndex}`)}</h2>
      );
      lineIndex += 1;
      continue;
    }

    if (line.startsWith('# ')) {
      blocks.push(
        <h1 key={`block-${blockIndex++}`}>{renderInline(line.slice(2), `h1-${lineIndex}`)}</h1>
      );
      lineIndex += 1;
      continue;
    }

    if (isBulletLine(line)) {
      const items: React.ReactNode[] = [];
      while (lineIndex < lines.length && isBulletLine(lines[lineIndex])) {
        items.push(
          <li key={`ul-${lineIndex}`}>
            {renderInline(bulletContent(lines[lineIndex]), `ul-${lineIndex}`)}
          </li>
        );
        lineIndex += 1;
      }
      blocks.push(<ul key={`block-${blockIndex++}`}>{items}</ul>);
      continue;
    }

    if (isOrderedLine(line)) {
      const items: React.ReactNode[] = [];
      while (lineIndex < lines.length && isOrderedLine(lines[lineIndex])) {
        items.push(
          <li key={`ol-${lineIndex}`}>
            {renderInline(orderedContent(lines[lineIndex]), `ol-${lineIndex}`)}
          </li>
        );
        lineIndex += 1;
      }
      blocks.push(<ol key={`block-${blockIndex++}`}>{items}</ol>);
      continue;
    }

    blocks.push(
      <p key={`block-${blockIndex++}`}>{renderInline(line, `p-${lineIndex}`)}</p>
    );
    lineIndex += 1;
  }

  return <>{blocks}</>;
}
