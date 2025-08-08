import { visit } from 'unist-util-visit';
import type { Root } from 'hast';

type Options = {
  slug: string;
  mod: string;
  base?: string;              // default: '/assets'
  implicitImgDir?: boolean;   // default: true -> 'logo.png' vira 'img/logo.png'
};

function isAbsoluteUrl(u: string) {
  return /^([a-z]+:)?\/\//i.test(u) || u.startsWith('data:') || u.startsWith('blob:');
}
function isAbsolutePath(u: string) {
  return u.startsWith('/');
}

function rewriteOne(src: string, { slug, mod, base, implicitImgDir }: Required<Omit<Options,'slug'|'mod'>> & { slug: string; mod: string }) {
  if (!src || isAbsoluteUrl(src) || isAbsolutePath(src)) return src;

  // remove './'
  let rel = src.replace(/^\.\//, '');

  // Se não tem subpasta e não começa com 'img/', prefixe 'img/'
  if (implicitImgDir && !rel.includes('/') && !rel.startsWith('img/')) {
    rel = `img/${rel}`;
  }

  // normaliza barras duplicadas
  const joined = `${base}/${slug}/${mod}/${rel}`.replace(/\/{2,}/g, '/');
  return joined;
}

export default function rehypeRelativeImages(opts: Options) {
  const base = opts.base ?? '/assets';
  const implicitImgDir = opts.implicitImgDir ?? true;
  const slug = opts.slug;
  const mod = opts.mod;

  return function transformer(tree: Root) {
    visit(tree, 'element', (node: any) => {
      if (node.tagName !== 'img') return;
      const props = node.properties ?? {};
      if (props.src) {
        props.src = rewriteOne(String(props.src), { slug, mod, base, implicitImgDir });
      }
      // opcional: tratar srcset
      if (props.srcset) {
        const mapped = String(props.srcset)
          .split(',')
          .map((part) => {
            const [url, descriptor] = part.trim().split(/\s+/, 2);
            const newUrl = rewriteOne(url, { slug, mod, base, implicitImgDir });
            return descriptor ? `${newUrl} ${descriptor}` : newUrl;
          })
          .join(', ');
        props.srcset = mapped;
      }
      node.properties = props;
    });
  };
}