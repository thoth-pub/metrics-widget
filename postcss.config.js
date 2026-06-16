import prefixWrap from 'postcss-prefixwrap';

export default {
	plugins: [
		prefixWrap('.mw-root', {
			prefixRootTags: true,
			ignoredSelectors: [
				':root',
				':host',
				/^\.core-styles-module_/,
				/^\.styles-module_/,
			],
		}),
	],
};
