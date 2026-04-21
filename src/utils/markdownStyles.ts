import { FONTS } from '@/lib/theme';
import { Platform } from 'react-native';

/**
 * Create markdown style object with custom fonts
 * Can be used with react-native-markdown-display or similar libraries
 * @param overrides - Custom style overrides
 * @returns Markdown style object
 */
export function createMarkdownStyles(overrides?: Record<string, any>) {
  return {
    body: {
      color: '#111',
      fontSize: 16,
      lineHeight: 26,
      fontFamily: FONTS.regular,
      ...overrides?.body,
    },
    paragraph: {
      marginBottom: 12,
      fontFamily: FONTS.regular,
      ...overrides?.paragraph,
    },
    heading1: {
      color: '#111',
      fontSize: 24,
      lineHeight: 30,
      fontFamily: FONTS.semibold,
      marginTop: 10,
      marginBottom: 8,
      ...overrides?.heading1,
    },
    heading2: {
      color: '#111',
      fontSize: 20,
      lineHeight: 26,
      fontFamily: FONTS.semibold,
      marginTop: 10,
      marginBottom: 6,
      ...overrides?.heading2,
    },
    heading3: {
      color: '#111',
      fontSize: 18,
      lineHeight: 24,
      fontFamily: FONTS.semibold,
      marginTop: 8,
      marginBottom: 6,
      ...overrides?.heading3,
    },
    heading4: {
      color: '#111',
      fontSize: 16,
      lineHeight: 22,
      fontFamily: FONTS.semibold,
      marginTop: 8,
      marginBottom: 4,
      ...overrides?.heading4,
    },
    strong: {
      fontFamily: FONTS.semibold,
      color: '#111',
      ...overrides?.strong,
    },
    em: {
      fontFamily: FONTS.italic,
      color: '#111',
      ...overrides?.em,
    },
    bullet_list: {
      marginBottom: 12,
      ...overrides?.bullet_list,
    },
    ordered_list: {
      marginBottom: 12,
      ...overrides?.ordered_list,
    },
    list_item: {
      marginBottom: 6,
      fontFamily: FONTS.regular,
      ...overrides?.list_item,
    },
    code_inline: {
      backgroundColor: '#f2f2f2',
      color: '#111',
      borderRadius: 6,
      paddingHorizontal: 5,
      paddingVertical: 2,
      fontSize: 14,
      fontFamily: Platform.select({
        ios: 'Menlo',
        android: 'monospace',
        default: 'monospace',
      }),
      ...overrides?.code_inline,
    },
    code_block: {
      backgroundColor: '#f7f7f7',
      color: '#111',
      borderRadius: 12,
      padding: 14,
      marginVertical: 10,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: Platform.select({
        ios: 'Menlo',
        android: 'monospace',
        default: 'monospace',
      }),
      ...overrides?.code_block,
    },
    blockquote: {
      borderLeftColor: '#d9d9d9',
      borderLeftWidth: 3,
      paddingLeft: 12,
      color: '#666',
      fontFamily: FONTS.italic,
      ...overrides?.blockquote,
    },
    link: {
      color: '#111',
      textDecorationLine: 'underline',
      fontFamily: FONTS.regular,
      ...overrides?.link,
    },
  };
}
