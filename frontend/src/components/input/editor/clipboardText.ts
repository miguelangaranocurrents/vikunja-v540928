import type {Fragment, Slice, Node as ProseMirrorNode} from '@tiptap/pm/model'

// Serializes a copied selection to plain text. Unlike ProseMirror's default
// (which only joins text content), this keeps list markers so that a copied
// bullet or ordered list still reads as a list outside the editor.
export function sliceToPlainText(slice: Slice): string {
	return fragmentToLines(slice.content).join('\n')
}

function fragmentToLines(fragment: Fragment): string[] {
	const lines: string[] = []
	fragment.forEach(node => {
		lines.push(...nodeToLines(node))
	})
	return lines
}

function nodeToLines(node: ProseMirrorNode): string[] {
	const name = node.type.name

	if (name === 'bulletList') {
		return listToLines(node, () => '- ')
	}

	if (name === 'orderedList') {
		let index = Number(node.attrs.start ?? 1)
		return listToLines(node, () => `${index++}. `)
	}

	if (node.isTextblock) {
		return [node.textContent]
	}

	if (node.isLeaf) {
		return node.textContent ? [node.textContent] : []
	}

	return fragmentToLines(node.content)
}

function listToLines(list: ProseMirrorNode, marker: () => string): string[] {
	const lines: string[] = []
	list.forEach(item => {
		const itemLines = fragmentToLines(item.content)
		itemLines.forEach((line, lineIndex) => {
			lines.push(lineIndex === 0 ? marker() + line : line)
		})
	})
	return lines
}
