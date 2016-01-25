/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import nls = require('vs/nls');
import {CommonEditorRegistry, ContextKey, EditorActionDescriptor} from 'vs/editor/common/editorCommonExtensions';
import {TPromise} from 'vs/base/common/winjs.base';
import {EditorAction, HandlerEditorAction} from 'vs/editor/common/editorAction';
import EditorCommon = require('vs/editor/common/editorCommon');
import {INullService} from 'vs/platform/instantiation/common/instantiation';
import {KeyMod, KeyCode} from 'vs/base/common/keyCodes';

class InsertCursorAbove extends HandlerEditorAction {
	static ID = 'editor.action.insertCursorAbove';

	constructor(descriptor:EditorCommon.IEditorActionDescriptorData, editor:EditorCommon.ICommonCodeEditor, @INullService ns) {
		super(descriptor, editor, EditorCommon.Handler.AddCursorUp);
	}
}

class InsertCursorBelow extends HandlerEditorAction {
	static ID = 'editor.action.insertCursorBelow';

	constructor(descriptor:EditorCommon.IEditorActionDescriptorData, editor:EditorCommon.ICommonCodeEditor, @INullService ns) {
		super(descriptor, editor, EditorCommon.Handler.AddCursorDown);
	}
}

class InsertCursorAtEndOfEachLineSelected extends EditorAction {
	static ID = 'editor.action.insertCursorAtEndOfEachLineSelected';

	constructor(descriptor:EditorCommon.IEditorActionDescriptorData, editor:EditorCommon.ICommonCodeEditor, @INullService ns) {
		super(descriptor, editor);
	}

	public run(): TPromise<boolean> {
		let selection = this.editor.getSelection();
		if(!selection.isEmpty()) {
			let model = this.editor.getModel();
			let newSelections = new Array<EditorCommon.ISelection>();
			let selectionStart = selection.getStartPosition();
			let selectionEnd = selection.getEndPosition();
			for (var i = selectionStart.lineNumber; i <= selectionEnd.lineNumber; i++) {
				if(i !== selectionEnd.lineNumber) {
					let currentLineMaxColumn = model.getLineMaxColumn(i);
					newSelections.push({
						selectionStartLineNumber: i,
						selectionStartColumn: currentLineMaxColumn,
						positionLineNumber: i,
						positionColumn: currentLineMaxColumn
					});
				} else if( selectionEnd.column > 0 ) {
					newSelections.push({
						selectionStartLineNumber: selectionEnd.lineNumber,
						selectionStartColumn: selectionEnd.column,
						positionLineNumber: selectionEnd.lineNumber,
						positionColumn: selectionEnd.column
					});
				}
			}
			this.editor.setSelections(newSelections);
		}
		return TPromise.as(true);
	}
}


// register actions
CommonEditorRegistry.registerEditorAction(new EditorActionDescriptor(InsertCursorAbove, InsertCursorAbove.ID, nls.localize('mutlicursor.insertAbove', "Add Cursor Above"), {
	context: ContextKey.EditorTextFocus,
	primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.UpArrow,
	linux: {
		primary: KeyMod.Shift | KeyMod.Alt | KeyCode.UpArrow,
		secondary: [KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.UpArrow]
	}
}));
CommonEditorRegistry.registerEditorAction(new EditorActionDescriptor(InsertCursorBelow, InsertCursorBelow.ID, nls.localize('mutlicursor.insertBelow', "Add Cursor Below"), {
	context: ContextKey.EditorTextFocus,
	primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.DownArrow,
	linux: {
		primary: KeyMod.Shift | KeyMod.Alt | KeyCode.DownArrow,
		secondary: [KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.DownArrow]
	}
}));
CommonEditorRegistry.registerEditorAction(new EditorActionDescriptor(InsertCursorAtEndOfEachLineSelected, InsertCursorAtEndOfEachLineSelected.ID, nls.localize('mutlicursor.insertAtEndOfEachLineSelected', "Create multiple cursors from selected lines"), {
	context: ContextKey.EditorTextFocus,
	primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KEY_I
}));
