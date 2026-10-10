import { joinPatterns, REGEX_CHAR_LIMIT } from "./buildRegex";

/**
 * PoE2 Stash Ctrl+F: Quoted blocks are combined with AND, `|` inside a block is OR.
 * `"!exclude1|exclude2" "type" "option1|option2"` — Highlights tablets that have none of the excluded options (and match the type) while having at least one of the selected options.
 */
export function buildStashSearchQuery(
  includePatterns: string[],
  excludePatterns: string[],
  typePattern?: string,
): {
  query: string;
  length: number;
  overLimit: boolean;
} {
  const blocks: string[] = [];
  const excludeBlock = joinPatterns(excludePatterns, "or");
  if (excludeBlock) blocks.push(`"!${excludeBlock}"`);
  if (typePattern?.trim()) blocks.push(`"${typePattern.trim()}"`);
  const includeBlock = joinPatterns([...new Set(includePatterns)], "or");
  if (includeBlock) blocks.push(`"${includeBlock}"`);

  const query = blocks.join(" ");
  const length = [...query].length;
  return {
    query,
    length,
    overLimit: length > REGEX_CHAR_LIMIT,
  };
}
