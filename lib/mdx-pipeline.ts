/* Shared MDX processing helpers to keep plugin configuration DRY.
 * Provides a base remark processor and utilities for extracting metadata.
 */
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import GithubSlugger from 'github-slugger';
import remarkDirectiveToMdx from '../mdx-plugins/remark-directive-to-mdx';

export interface Heading { id: string; text: string }

/** Build a base unified processor with shared remark plugins (no side effects plugins). */
export function buildRemarkBase() {
  return unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkDirective)
    .use(remarkDirectiveToMdx);
}

/** Extract level-2 headings (##) with GitHub-style slug IDs from MDX source. */
export function extractHeadingsFromSource(source: string): Heading[] {
  const headings: Heading[] = [];
  const slugger = new GithubSlugger();
  const collectHeadings = () => (tree: any) => {
    visit(tree, 'heading', (node: any) => {
      if (node.depth === 2) {
        const text = toString(node).trim();
        if (!text) return;
        const id = slugger.slug(text);
        headings.push({ id, text });
      }
    });
  };
  const processor = buildRemarkBase().use(collectHeadings);
  const ast = processor.parse(source);
  // run to ensure any transformers execute (some plugins mutate tree)
  // We ignore the returned tree because we already collected during traversal
  processor.runSync(ast);
  return headings;
}
