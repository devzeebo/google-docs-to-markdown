import parse from 'rehype-dom-parse';
import { all } from 'rehype-remark';
import stringify from 'remark-stringify';
import { unified } from 'unified';
import rehype2remarkWithSpaces from './rehype-to-remark-with-spaces';
import fixGoogleHtml from './fix-google-html';

function preserveTagAndConvertContents(h, node) {
  return [
    h(node, 'html', `<${node.tagName}>`),
    ...all(h, node),
    h(node, 'html', `</${node.tagName}>`),
  ];
}

const processor = unified()
  .use(parse)
  .use(fixGoogleHtml)
  // @ts-ignore
  .use(rehype2remarkWithSpaces, {
    handlers: {
      // Preserve sup/sub markup; most Markdowns have no markup for it.
      sub: preserveTagAndConvertContents,
      sup: preserveTagAndConvertContents,
    },
  })
  // @ts-ignore
  .use(stringify, { listItemIndent: '1' });

export default function convertToMarkdown(html) {
  return processor.process(html)
    .then((result) =>
      // Ensure double line-break before headings
      // @ts-ignore
      result.value.replace(/(\n\s+)#/g, (_, breaks) => {
        breaks = breaks.replace(/[^\n]/g, '');
        if (breaks.length < 3) {
          breaks = '\n\n\n';
        }

        return `${breaks}#`;
      }));
}
